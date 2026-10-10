import { z } from 'zod'
import { errorResponse } from '@/lib/api-response'
import { createClient } from '@/lib/supabase/server'

const analysisSchema = z.object({
  audit_id: z.string().min(1),
  title: z.string().min(1),
  mode: z.literal('live'),
  overall_assessment: z.string(),
  original_answer: z.string(),
  sources: z.array(z.object({ id: z.string(), title: z.string(), text: z.string() })).min(1),
  claims: z.array(z.object({
    id: z.string(),
    text: z.string(),
    verdict: z.enum(['supported', 'contradicted', 'insufficient_evidence', 'ambiguous']),
    evidence: z.array(z.object({
      sourceId: z.string(),
      quote: z.string().min(1),
      relation: z.enum(['supports', 'contradicts', 'contextual']),
      why: z.string(),
    })),
  }).passthrough()),
  summary: z.object({
    total_claims: z.number().int().nonnegative(),
    supported: z.number().int().nonnegative(),
    contradicted: z.number().int().nonnegative(),
    unsupported: z.number().int().nonnegative(),
    ambiguous: z.number().int().nonnegative(),
  }),
}).passthrough()

const auditSchema = z.object({
  title: z.string().trim().min(1).max(200),
  original_answer: z.string().min(1).max(500_000),
  source_text: z.string().min(1).max(8_000_000),
  source_filename: z.string().trim().max(255).nullable().optional(),
  analysis_results: analysisSchema,
}).superRefine((audit, context) => {
  const analysis = audit.analysis_results
  if (audit.title !== analysis.title || audit.original_answer !== analysis.original_answer) {
    context.addIssue({ code: 'custom', message: 'Stored audit metadata must match the analysis results.' })
  }
  if (audit.source_text !== analysis.sources.map((source) => source.text).join('\n\n')) {
    context.addIssue({ code: 'custom', message: 'Stored source text must match the analysis results.' })
  }

  const counts = { supported: 0, contradicted: 0, unsupported: 0, ambiguous: 0 }
  for (const claim of analysis.claims) {
    const summaryKey = claim.verdict === 'insufficient_evidence' ? 'unsupported' : claim.verdict
    counts[summaryKey] += 1
    for (const evidence of claim.evidence) {
      const source = analysis.sources.find((item) => item.id === evidence.sourceId)
      if (!source || !source.text.includes(evidence.quote)) {
        context.addIssue({ code: 'custom', message: `Evidence for claim ${claim.id} must exactly match its source.` })
      }
    }
  }
  if (analysis.summary.total_claims !== analysis.claims.length ||
      analysis.summary.supported !== counts.supported ||
      analysis.summary.contradicted !== counts.contradicted ||
      analysis.summary.unsupported !== counts.unsupported ||
      analysis.summary.ambiguous !== counts.ambiguous) {
    context.addIssue({ code: 'custom', message: 'Stored summary counts must match the audit claims.' })
  }
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub
  if (authError || typeof userId !== 'string') return errorResponse(401, 'AUTH_REQUIRED', 'Log in to save this audit.')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Request body must be valid JSON.')
  }

  const parsed = auditSchema.safeParse(body)
  if (!parsed.success) return errorResponse(400, 'INVALID_AUDIT', 'The audit data is incomplete or invalid.', parsed.error.flatten())

  const { data, error } = await supabase.from('audits').insert({
    user_id: userId,
    ...parsed.data,
    source_filename: parsed.data.source_filename || null,
  }).select('id').single()

  if (error) {
    console.error('Failed to save audit:', error.code)
    return errorResponse(500, 'AUDIT_SAVE_FAILED', 'The audit could not be saved. Please try again.')
  }

  return Response.json({ id: data.id }, { status: 201 })
}

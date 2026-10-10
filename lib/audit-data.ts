export type Verdict = 'supported' | 'contradicted' | 'insufficient_evidence' | 'ambiguous'
export type FindingCategory = 'factual_error' | 'unsupported_claim' | 'reasoning_inconsistency' | 'safety_concern' | 'ambiguity'

export type Evidence = { sourceId: string; quote: string; relation: 'supports' | 'contradicts' | 'contextual'; why: string }
export type Source = { id: string; title: string; text: string }
export type Claim = { id: string; text: string; verdict: Verdict; categories: FindingCategory[]; explanation: string; confidence?: number; evidence: Evidence[]; limitation?: string }
export type Audit = { audit_id: string; title: string; mode: 'demo'; overall_assessment: string; original_answer: string; sources: Source[]; claims: Claim[] }

export const verdictLabels: Record<Verdict, string> = {
  supported: 'Supported',
  contradicted: 'Contradicted',
  insufficient_evidence: 'Insufficient evidence',
  ambiguous: 'Ambiguous',
}

export const demoAudit: Audit = {
  audit_id: 'demo-audit-001', title: 'Q3 market expansion brief', mode: 'demo', overall_assessment: 'Review needed',
  original_answer: 'The report shows that revenue grew by 12% year over year. The company currently operates 20 offices across North America. It will open 50 new offices next year, making it the fastest-growing regional provider. The report recommends expanding the pilot program to every market immediately.',
  sources: [
    { id: 'source-1', title: 'Q3 performance report', text: 'Revenue increased by 12% compared with the same quarter last year. The company currently operates 20 offices across North America. The report does not include projections for next year.' },
    { id: 'source-2', title: 'Pilot program notes', text: 'The pilot showed promising early results in two markets. Further review is recommended before expanding the program to additional markets. Results may vary by market and implementation.' },
  ],
  claims: [
    { id: 'claim-1', text: 'The report shows that revenue grew by 12% year over year.', verdict: 'supported', categories: [], explanation: 'The supplied performance report directly states a 12% increase compared with the same quarter last year.', confidence: .98, evidence: [{ sourceId: 'source-1', quote: 'Revenue increased by 12% compared with the same quarter last year.', relation: 'supports', why: 'The wording and figure directly match the claim.' }] },
    { id: 'claim-2', text: 'The company currently operates 20 offices across North America.', verdict: 'supported', categories: [], explanation: 'The current office count and region are explicitly stated in the performance report.', confidence: .97, evidence: [{ sourceId: 'source-1', quote: 'The company currently operates 20 offices across North America.', relation: 'supports', why: 'This is an exact match for the claim.' }] },
    { id: 'claim-3', text: 'It will open 50 new offices next year.', verdict: 'insufficient_evidence', categories: ['unsupported_claim'], explanation: 'The sources describe the current office count but do not establish a future expansion plan or a number of new offices.', confidence: .91, evidence: [], limitation: 'A forward-looking plan, announcement, or forecast would be needed to evaluate this claim.' },
    { id: 'claim-4', text: 'Making it the fastest-growing regional provider.', verdict: 'ambiguous', categories: ['ambiguity'], explanation: 'The comparison set and definition of “fastest-growing” are not specified, so the claim cannot be assessed precisely from the supplied material.', confidence: .76, evidence: [{ sourceId: 'source-1', quote: 'Revenue increased by 12% compared with the same quarter last year.', relation: 'contextual', why: 'The source provides a growth figure, but no competitor comparison or ranking.' }], limitation: 'Define the comparison group, time period, and metric before making this comparison.' },
    { id: 'claim-5', text: 'The report recommends expanding the pilot program to every market immediately.', verdict: 'contradicted', categories: ['factual_error', 'safety_concern'], explanation: 'The pilot notes recommend further review before expansion, which conflicts with the claim that immediate expansion to every market is recommended.', confidence: .94, evidence: [{ sourceId: 'source-2', quote: 'Further review is recommended before expanding the program to additional markets.', relation: 'contradicts', why: 'The source calls for further review, not immediate expansion to every market.' }], limitation: 'This is a factual contradiction in the stated recommendation; operational safety still requires separate review.' },
  ],
}

export const exampleAudits = [
  { label: 'Numerical contradiction', answer: 'The supplied report states that revenue grew by 25%.', source: 'The report records revenue growth of 12%.' },
  { label: 'Insufficient evidence', answer: 'The company will open 50 new offices next year.', source: 'The company currently operates 20 offices.' },
]

export const getCounts = (claims: Claim[]) => claims.reduce((counts, claim) => ({ ...counts, [claim.verdict]: counts[claim.verdict] + 1 }), { supported: 0, contradicted: 0, insufficient_evidence: 0, ambiguous: 0 } as Record<Verdict, number>)

export const getHighlightParts = (answer: string, claims: Claim[]) => {
  const parts: { text: string; claim?: Claim }[] = []
  let cursor = 0
  claims.forEach((claim) => { const index = answer.indexOf(claim.text, cursor); if (index >= 0) { if (index > cursor) parts.push({ text: answer.slice(cursor, index) }); parts.push({ text: claim.text, claim }); cursor = index + claim.text.length } })
  if (cursor < answer.length) parts.push({ text: answer.slice(cursor) })
  return parts
}


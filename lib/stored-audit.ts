import type { Audit } from '@/lib/audit-data'

export type StoredAuditRow = {
  id: string
  user_id: string
  title: string
  original_answer: string
  source_text: string
  source_filename: string | null
  analysis_results: unknown
  created_at: string
}

export function isStoredAudit(value: unknown): value is Audit {
  if (!value || typeof value !== 'object') return false
  const audit = value as Partial<Audit>
  return typeof audit.audit_id === 'string' &&
    typeof audit.title === 'string' &&
    (audit.mode === 'live' || audit.mode === 'demo') &&
    typeof audit.overall_assessment === 'string' &&
    typeof audit.original_answer === 'string' &&
    Array.isArray(audit.sources) &&
    audit.sources.every((source) => typeof source?.id === 'string' && typeof source?.title === 'string' && typeof source?.text === 'string') &&
    Array.isArray(audit.claims) &&
    audit.claims.every((claim) => typeof claim?.id === 'string' && typeof claim?.text === 'string' && typeof claim?.verdict === 'string' && Array.isArray(claim?.evidence))
}

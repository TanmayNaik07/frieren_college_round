import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isStoredAudit, type StoredAuditRow } from '@/lib/stored-audit'
import { SavedAuditView } from '@/components/saved-audit-view'

export default async function SavedAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub
  if (typeof userId !== 'string') redirect(`/auth/login?next=${encodeURIComponent(`/history/${id}`)}`)

  const { data } = await supabase.from('audits').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
  const row = data as StoredAuditRow | null
  if (!row || !isStoredAudit(row.analysis_results)) notFound()
  return <SavedAuditView audit={row.analysis_results} createdAt={row.created_at} />
}

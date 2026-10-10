import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ChevronRight, ClipboardCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DeleteAuditButton } from '@/components/delete-audit-button'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub
  if (typeof userId !== 'string') redirect('/auth/login?next=/history')

  const { data: audits, error } = await supabase.from('audits').select('id,title,source_filename,created_at').eq('user_id', userId).order('created_at', { ascending: false })

  return <main className="min-h-screen bg-[#E0E5EC] px-5 py-10 text-[#3D4852] lg:px-8"><div className="mx-auto max-w-4xl"><div className="flex items-center justify-between gap-4"><Link href="/" className="inline-flex items-center gap-3 font-bold"><span className="grid size-10 place-items-center rounded-[14px] neu-extruded-sm text-[#6C63FF]"><ClipboardCheck size={19} /></span>Second Opinion</Link><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#6C63FF]"><ArrowLeft size={16} /> Back</Link></div><h1 className="mt-12 text-3xl font-extrabold">Audit history</h1><p className="mt-2 text-sm text-[#6B7280]">Your saved audits, newest first.</p>{error ? <p role="alert" className="mt-8 rounded-[16px] p-4 text-sm text-[#DC2626] neu-inset">Could not load audit history. Please try again.</p> : audits?.length ? <div className="mt-8 flex flex-col gap-4">{audits.map((audit) => <article key={audit.id} className="flex flex-col gap-4 rounded-[22px] bg-[#E0E5EC] p-5 neu-extruded sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h2 className="truncate font-bold">{audit.title}</h2><p className="mt-1 text-xs text-[#6B7280]">{new Date(audit.created_at).toLocaleString()}{audit.source_filename ? ` · ${audit.source_filename}` : ''}</p></div><div className="flex items-center gap-3"><DeleteAuditButton id={audit.id} title={audit.title} /><Link href={`/history/${audit.id}`} className="inline-flex items-center gap-1 rounded-[12px] px-4 py-2 text-xs font-bold text-[#6C63FF] neu-extruded-sm">Open <ChevronRight size={14} /></Link></div></article>)}</div> : <div className="mt-8 rounded-[24px] p-10 text-center neu-inset"><p className="font-bold">No saved audits yet.</p><p className="mt-2 text-sm text-[#6B7280]">Run an audit, then choose Save audit from the results.</p><Link href="/" className="mt-5 inline-block text-sm font-bold text-[#6C63FF]">Start an audit</Link></div>}</div></main>
}

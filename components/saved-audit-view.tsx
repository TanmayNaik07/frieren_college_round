'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, FileText } from 'lucide-react'
import type { Audit, Claim, Verdict } from '@/lib/audit-data'

const styles: Record<Verdict, string> = {
  supported: 'bg-[#ECFDF5] text-[#059669]', contradicted: 'bg-[#FEF2F2] text-[#DC2626]',
  insufficient_evidence: 'bg-[#FFFBEB] text-[#D97706]', ambiguous: 'bg-[#F1F5F9] text-[#64748B]',
}

function ClaimDetail({ claim, audit }: { claim: Claim; audit: Audit }) {
  return <section className="rounded-[24px] bg-[#E0E5EC] p-6 neu-extruded"><span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${styles[claim.verdict]}`}>{claim.verdict.replace('_', ' ')}</span><h2 className="mt-5 font-bold leading-6">{claim.text}</h2><p className="mt-4 text-sm leading-6 text-[#6B7280]">{claim.explanation}</p><div className="mt-6 flex flex-col gap-3">{claim.evidence.length ? claim.evidence.map((e, index) => { const source = audit.sources.find((item) => item.id === e.sourceId); return <blockquote key={index} className="rounded-[16px] bg-[#E0E5EC] p-4 text-sm leading-6 neu-inset"><p className="text-xs font-bold text-[#6C63FF]">{source?.title ?? 'Source'}</p><p className="mt-2">“{e.quote}”</p></blockquote> }) : <p className="rounded-[16px] p-4 text-sm text-[#6B7280] neu-inset">{claim.limitation ?? 'No exact evidence passage was stored.'}</p>}</div></section>
}

export function SavedAuditView({ audit, createdAt }: { audit: Audit; createdAt: string }) {
  const [selected, setSelected] = useState(audit.claims[0])
  return <main className="min-h-screen bg-[#E0E5EC] px-5 py-10 text-[#3D4852] lg:px-8"><div className="mx-auto max-w-6xl"><Link href="/history" className="inline-flex items-center gap-2 text-sm font-bold text-[#6C63FF]"><ArrowLeft size={16} /> Audit history</Link><div className="mt-7 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-[#6C63FF]">Saved audit</p><h1 className="mt-2 text-3xl font-extrabold">{audit.title}</h1><p className="mt-2 text-xs text-[#6B7280]">Saved {new Date(createdAt).toLocaleString()}</p></div><Link href="/" className="rounded-[14px] px-5 py-3 text-sm font-bold neu-extruded-sm">New audit</Link></div><section className="mt-8 rounded-[24px] bg-[#E0E5EC] p-6 neu-extruded"><h2 className="font-bold">Original answer</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#6B7280]">{audit.original_answer}</p></section><div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-[24px] bg-[#E0E5EC] p-6 neu-extruded"><h2 className="font-bold">Claims ({audit.claims.length})</h2><div className="mt-4 flex flex-col gap-3">{audit.claims.map((claim, index) => <button key={claim.id} onClick={() => setSelected(claim)} className={`rounded-[16px] p-4 text-left transition ${selected?.id === claim.id ? 'neu-inset' : 'neu-extruded-sm'}`}><span className="text-[11px] font-bold text-[#A0AEC0]">CLAIM {index + 1}</span><p className="mt-2 text-sm font-semibold">{claim.text}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#6C63FF]">Inspect <ChevronRight size={13} /></span></button>)}</div></section>{selected ? <ClaimDetail claim={selected} audit={audit} /> : <section className="rounded-[24px] p-6 neu-inset">No claims were stored.</section>}</div><section className="mt-6 rounded-[24px] bg-[#E0E5EC] p-6 neu-extruded"><h2 className="flex items-center gap-2 font-bold"><FileText size={17} /> Stored source</h2>{audit.sources.map((source) => <details key={source.id} className="mt-4 rounded-[16px] p-4 neu-inset"><summary className="cursor-pointer text-sm font-bold">{source.title}</summary><p className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap text-sm leading-6 text-[#6B7280]">{source.text}</p></details>)}</section></div></main>
}

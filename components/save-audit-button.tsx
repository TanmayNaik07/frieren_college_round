'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, LoaderCircle, Save } from 'lucide-react'
import type { Audit } from '@/lib/audit-data'

export function SaveAuditButton({ audit }: { audit: Audit }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState('')

  const save = async () => {
    if (state !== 'idle') return
    setState('saving')
    setError('')
    try {
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: audit.title,
          original_answer: audit.original_answer,
          source_text: audit.sources.map((source) => source.text).join('\n\n'),
          source_filename: audit.source_filename ?? null,
          analysis_results: audit,
        }),
      })
      const data = await response.json().catch(() => null) as { error?: { message?: string } } | null
      if (!response.ok) throw new Error(data?.error?.message ?? 'The audit could not be saved.')
      setState('saved')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The audit could not be saved.')
      setState('idle')
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={save} disabled={state !== 'idle'} className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#6C63FF] px-5 py-3 text-sm font-semibold text-white neu-extruded-sm disabled:opacity-60">
        {state === 'saving' ? <LoaderCircle className="animate-spin" size={16} /> : state === 'saved' ? <Check size={16} /> : <Save size={16} />}
        {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : 'Save audit'}
      </button>
      {error && <p role="alert" className="max-w-xs text-xs font-medium text-[#DC2626]">{error} {error.toLowerCase().includes('log in') && <Link className="underline" href="/auth/login">Log in</Link>}</p>}
    </div>
  )
}

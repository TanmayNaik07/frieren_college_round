'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle, Trash2 } from 'lucide-react'

export function DeleteAuditButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remove = async () => {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return
    setLoading(true)
    setError('')
    const response = await fetch(`/api/audits/${id}`, { method: 'DELETE' })
    const data = await response.json().catch(() => null) as { error?: { message?: string } } | null
    if (!response.ok) {
      setError(data?.error?.message ?? 'Could not delete this audit.')
      setLoading(false)
      return
    }
    router.refresh()
  }

  return <div><button type="button" onClick={remove} disabled={loading} className="inline-flex items-center gap-1.5 rounded-[12px] px-3 py-2 text-xs font-bold text-[#DC2626] neu-extruded-sm disabled:opacity-50">{loading ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete</button>{error && <p role="alert" className="mt-2 text-xs text-[#DC2626]">{error}</p>}</div>
}

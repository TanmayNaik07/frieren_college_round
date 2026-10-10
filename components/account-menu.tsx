'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { History, LogIn, LogOut, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AccountMenu({ light = false }: { light?: boolean }) {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data }) => { setEmail(data.user?.email ?? null); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  if (loading) return <span className="h-10 w-24 animate-pulse rounded-[12px] bg-black/5" aria-label="Loading account" />
  if (!email) return <Link href="/auth/login" className={`inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-semibold neu-extruded-sm ${light ? 'text-white' : 'text-[#3D4852]'}`}><LogIn size={15} /> Log in</Link>

  return (
    <div className="flex items-center gap-2">
      <Link href="/history" title={email} className={`inline-flex items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm font-semibold neu-extruded-sm ${light ? 'text-white' : 'text-[#3D4852]'}`}><History size={15} /><span className="hidden sm:inline">History</span></Link>
      <form action="/auth/logout" method="post"><button title={`Signed in as ${email}`} className={`inline-flex items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm font-semibold neu-extruded-sm ${light ? 'text-white' : 'text-[#3D4852]'}`}><UserRound size={15} /><span className="hidden xl:inline max-w-36 truncate">{email}</span><LogOut size={14} /></button></form>
    </div>
  )
}

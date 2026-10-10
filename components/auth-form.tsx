'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'
import { login, signup, type AuthFormState } from '@/app/auth/actions'

const initialState: AuthFormState = {}

export function AuthForm({ mode, next = '/' }: { mode: 'login' | 'signup'; next?: string }) {
  const action = mode === 'login' ? login : signup
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-2 text-sm font-bold">
        Email
        <input name="email" type="email" autoComplete="email" required disabled={pending} className="rounded-[14px] bg-[#E0E5EC] neu-inset px-4 py-3 font-normal outline-none neu-focus-ring" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-bold">
        Password
        <input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={128} required disabled={pending} className="rounded-[14px] bg-[#E0E5EC] neu-inset px-4 py-3 font-normal outline-none neu-focus-ring" />
      </label>
      {state.error && <p role="alert" className="rounded-[14px] bg-[#E0E5EC] neu-inset p-4 text-sm font-medium text-[#DC2626]">{state.error}</p>}
      {state.message && <p role="status" className="rounded-[14px] bg-[#E0E5EC] neu-inset p-4 text-sm font-medium text-[#059669]">{state.message}</p>}
      <button disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#6C63FF] px-6 py-3 text-sm font-semibold text-white neu-extruded-sm disabled:opacity-50">
        {pending && <LoaderCircle size={16} className="animate-spin" />}
        {mode === 'login' ? 'Log in' : 'Create account'}
      </button>
      <p className="text-center text-sm text-[#6B7280]">
        {mode === 'login' ? 'New to Second Opinion?' : 'Already have an account?'}{' '}
        <Link className="font-bold text-[#6C63FF]" href={mode === 'login' ? `/auth/signup?next=${encodeURIComponent(next)}` : `/auth/login?next=${encodeURIComponent(next)}`}>
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </Link>
      </p>
    </form>
  )
}

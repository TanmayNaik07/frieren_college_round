'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type AuthFormState = { error?: string; message?: string }

const credentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
})

function safeNext(value: FormDataEntryValue | null) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({ email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check your login details.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: error.message }

  await supabase.from('profiles').upsert({ id: data.user.id, updated_at: new Date().toISOString() }, { onConflict: 'id' })

  redirect(safeNext(formData.get('next')))
}

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({ email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check your sign-up details.' }

  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin') ?? `http://${requestHeaders.get('host') ?? 'localhost:3000'}`
  const next = safeNext(formData.get('next'))
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}` },
  })

  if (error) return { error: error.message }
  if (data.session && data.user) {
    await supabase.from('profiles').upsert({ id: data.user.id, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    redirect(next)
  }
  return { message: 'Check your email to confirm your account, then sign in.' }
}

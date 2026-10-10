import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function safeNext(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const supabase = await createClient()

  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error('Missing confirmation token.') }

  if (!result.error) {
    const { data } = await supabase.auth.getClaims()
    if (typeof data?.claims.sub === 'string') {
      await supabase.from('profiles').upsert({ id: data.claims.sub, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    }
    return NextResponse.redirect(new URL(safeNext(url.searchParams.get('next')), url.origin))
  }
  return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent('Confirmation link is invalid or expired.')}`, url.origin))
}

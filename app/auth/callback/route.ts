import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createSessionClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/safeNext'

// Supabase can hand a magic link back to us in three shapes:
//
//   1. ?token_hash=…&type=magiclink   — verify server-side with verifyOtp()
//   2. ?code=…                        — exchange server-side with exchangeCodeForSession()
//   3. #access_token=…&refresh_token= — hash fragment, invisible to the server
//
// Cases 1 and 2 are completed here, on the server, so the session cookies are
// written straight onto the redirect response — no client round-trip, no PKCE
// verifier that a server-generated link never had. Case 3 is the only one that
// still needs the browser, so it is forwarded to /auth/confirm.

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  // Only ever forward a same-site path — see lib/safeNext.ts
  const next = safeNext(searchParams.get('next'))

  const supabase = await createSessionClient()

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('[auth/callback] verifyOtp failed:', error.message)
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('[auth/callback] code exchange failed:', error.message)
  } else {
    // Implicit flow: tokens sit in the URL hash. Modern browsers preserve the
    // hash across a 302, so #access_token=… arrives intact at /auth/confirm,
    // where the browser client can read it.
    const confirmUrl = new URL(`${origin}/auth/confirm`)
    confirmUrl.searchParams.set('next', next)
    return NextResponse.redirect(confirmUrl.toString())
  }

  return NextResponse.redirect(`${origin}/signup?error=link-expired`)
}

import { NextRequest, NextResponse } from 'next/server'
import { safeNext } from '@/lib/safeNext'

// Supabase sends magic links in one of two formats:
//   - PKCE flow:     /auth/callback?code=xxx         (server can see the code)
//   - Implicit flow: /auth/callback#access_token=xxx (server CANNOT see the hash)
//
// We always redirect to /auth/confirm so the browser client can handle BOTH cases.
// Modern browsers preserve the URL hash fragment when following a 302 redirect,
// so #access_token=xxx will arrive intact at /auth/confirm even though this
// server-side handler cannot read it directly.

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  // Only ever forward a same-site path — see lib/safeNext.ts
  const next = safeNext(searchParams.get('next'))

  // Always go to the client-side confirm page — it handles both PKCE and implicit flow
  const confirmUrl = new URL(`${origin}/auth/confirm`)
  if (code) confirmUrl.searchParams.set('code', code)
  confirmUrl.searchParams.set('next', next)

  return NextResponse.redirect(confirmUrl.toString())
}

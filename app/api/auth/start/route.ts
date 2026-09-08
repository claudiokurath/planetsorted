import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { safeNext } from '@/lib/safeNext'

const SITE = process.env.SITE_URL ?? 'https://www.sor7ed.com'

function cleanEmail(value: unknown): string {
  const email = String(value ?? '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

function cleanName(value: unknown): string {
  return String(value ?? '').trim().slice(0, 40).replace(/[^\p{L}\p{N}\s'-]/gu, '')
}

/**
 * Email magic-link sign-in / sign-up. One field: an email address. Supabase
 * sends the link; /auth/callback completes the session.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Please complete the form.' }, { status: 400 })
  }

  const data = body as Record<string, unknown>
  const email = cleanEmail(data.email)
  const firstName = cleanName(data.firstName)
  const nextPath = safeNext(typeof data.next === 'string' ? data.next : undefined)

  if (!email) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await anon.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${SITE}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      data: firstName ? { first_name: firstName } : undefined,
    },
  })

  if (error) {
    console.error('[auth/start] signInWithOtp error:', error.message)
    return NextResponse.json(
      { error: 'We could not send your sign-in link just now. Please try again in a moment.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ sent: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Handles the magic link callback from Supabase.
// Supabase appends ?code=xxx to the emailRedirectTo URL after the user clicks their link.
// We exchange the code for a session, then redirect to the dashboard.

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    // No code — redirect to signup with a plain-English message
    return NextResponse.redirect(`${origin}/signup?error=link-expired`)
  }

  const supabase = createServerClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${origin}/signup?error=link-expired`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}

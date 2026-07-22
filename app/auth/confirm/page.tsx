'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

// This page handles BOTH Supabase auth flows:
//
// 1. PKCE flow  — URL contains ?code=xxx (set by route.ts redirect)
//    → Call exchangeCodeForSession(code) to exchange the PKCE code for a session.
//    → The code_verifier stored in localStorage during signInWithOtp is used automatically.
//
// 2. Implicit flow — URL contains #access_token=xxx&refresh_token=xxx
//    → The Supabase browser client auto-detects these on initialization via detectSessionInUrl().
//    → We just need to wait and then call getSession().

function AuthConfirm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    const supabase = createBrowserClient()

    async function handleAuth() {
      // PKCE path: exchange the code for a session
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('[auth/confirm] PKCE exchange failed:', error.message)
          setErrorMsg('Your sign-in link has expired. Please request a new one.')
          setTimeout(() => router.replace('/signup?error=link-expired'), 2500)
          return
        }
        router.replace(next)
        return
      }

      // Implicit path: session tokens came in as URL hash fragments.
      // The Supabase client detects them automatically on initialization.
      // Give it a moment to finish, then check the session.
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace(next)
      } else {
        setErrorMsg('Your sign-in link has expired. Please request a new one.')
        setTimeout(() => router.replace('/signup?error=link-expired'), 2500)
      }
    }

    handleAuth()
  }, [router, searchParams])

  if (errorMsg) {
    return (
      <p style={{ color: '#b45309', textAlign: 'center', padding: '2rem' }}>{errorMsg}</p>
    )
  }

  return (
    <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Signing you in…</p>
  )
}

export default function AuthConfirmPage() {
  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Suspense fallback={<p style={{ color: '#6b7280' }}>Loading…</p>}>
        <AuthConfirm />
      </Suspense>
    </main>
  )
}

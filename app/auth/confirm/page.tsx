'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { safeNext } from '@/lib/safeNext'

// Fallback for the implicit flow only: the magic link came back with the
// session tokens in the URL hash (#access_token=…&refresh_token=…), which the
// server-side /auth/callback route cannot read. The Supabase browser client
// picks those up automatically on init (detectSessionInUrl); we just wait a
// beat and confirm a session exists.
//
// The PKCE / ?code= path is handled entirely server-side in /auth/callback now,
// so it never reaches this page.

function AuthConfirm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const next = safeNext(searchParams.get('next'))
    const supabase = createBrowserClient()

    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace(next)
        return
      }
      setExpired(true)
      setTimeout(() => router.replace('/signup?error=link-expired'), 2000)
    }, 600)

    return () => clearTimeout(timer)
  }, [router, searchParams])

  return (
    <p style={{ color: expired ? '#b45309' : '#6b7280', textAlign: 'center', padding: '2rem' }}>
      {expired
        ? 'That sign-in link has expired — taking you back to request a new one.'
        : 'Signing you in…'}
    </p>
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

'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

type State = 'idle' | 'loading' | 'sent' | 'error'

export function SignupForm() {
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get('error') === 'link-expired'

  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    setErrorMessage('')

    const supabase = createBrowserClient()
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${site}/auth/callback`,
      },
    })

    if (error) {
      setState('error')
      setErrorMessage('Something went wrong sending your link. Please try again.')
      return
    }

    setState('sent')
  }

  if (state === 'sent') {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="mb-6 text-4xl">📬</div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="text-gray-600">
          We&apos;ve sent a sign-in link to <strong>{email}</strong>.
          Click it to access your account — no password needed.
        </p>
        <p className="mt-6 text-sm text-gray-400">
          Didn&apos;t get it? Check your spam folder, or{' '}
          <button
            onClick={() => setState('idle')}
            className="text-green-600 underline"
          >
            try again
          </button>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Get started</h1>
      <p className="mb-8 text-gray-500">
        Enter your email and we&apos;ll send you a sign-in link. No password needed.
      </p>

      {linkExpired && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          That sign-in link has expired or already been used. Enter your email below to get a fresh one.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'loading'}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:opacity-50"
        />

        {state === 'error' && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded-full bg-green-500 px-6 py-3 font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
        >
          {state === 'loading' ? 'Sending…' : 'Send my sign-in link'}
        </button>
      </form>

      <p className="mt-8 text-xs text-gray-400">
        No app. No spam. Just what works. By continuing you agree to our{' '}
        <a href="/privacy" className="underline">Privacy Policy</a> and{' '}
        <a href="/terms" className="underline">Terms</a>.
      </p>
    </div>
  )
}

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
      console.error('[Supabase OTP Signin Error]', error)
      setState('error')
      setErrorMessage('Something went wrong sending your link. Please try again.')
      return
    }

    setState('sent')
  }

  if (state === 'sent') {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="glass-card rounded-3xl p-8 border border-emerald-500/30">
          <div className="mb-4 text-4xl">📬</div>
          <h1 className="mb-2 text-2xl font-black text-white">Check your email</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            We&apos;ve sent a magic sign-in link to <strong className="text-emerald-400 font-mono">{email}</strong>.
            Click it to access your Sorted Lab account — no password needed.
          </p>
          <p className="mt-6 text-xs text-gray-500">
            Didn&apos;t get it? Check your spam folder, or{' '}
            <button
              onClick={() => setState('idle')}
              className="text-emerald-400 underline font-semibold hover:text-emerald-300"
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="mb-6">
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-400">
            Sorted Lab Access
          </span>
          <h1 className="mt-3 text-3xl font-black text-white tracking-tight">Get started</h1>
          <p className="mt-2 text-xs text-gray-400 leading-relaxed">
            Enter your email and we&apos;ll send you a magic link. No passwords required.
          </p>
        </div>

        {linkExpired && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300 leading-relaxed">
            That sign-in link has expired. Enter your email below to receive a fresh magic link.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="your.email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={state === 'loading'}
              className="w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 font-mono"
            />
          </div>

          {state === 'error' && (
            <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={state === 'loading'}
            className="glow-button w-full rounded-2xl px-6 py-3.5 text-sm font-bold text-gray-950 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {state === 'loading' ? 'Sending Magic Link…' : 'Send my sign-in link'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-gray-500">
          No spam. Just access. By signing in you agree to our{' '}
          <a href="/terms" className="underline hover:text-gray-400">Terms</a> and{' '}
          <a href="/privacy" className="underline hover:text-gray-400">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}

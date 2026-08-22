'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

type State = 'idle' | 'loading' | 'sent' | 'error'

const EMAIL_PROVIDER_INBOX_URLS: Record<string, string> = {
  'gmail.com': 'https://mail.google.com/mail/u/0/#inbox',
  'googlemail.com': 'https://mail.google.com/mail/u/0/#inbox',
  'outlook.com': 'https://outlook.live.com/mail/0/inbox',
  'hotmail.com': 'https://outlook.live.com/mail/0/inbox',
  'live.com': 'https://outlook.live.com/mail/0/inbox',
  'msn.com': 'https://outlook.live.com/mail/0/inbox',
  'yahoo.com': 'https://mail.yahoo.com/',
  'yahoo.co.uk': 'https://mail.yahoo.com/',
  'icloud.com': 'https://www.icloud.com/mail',
  'me.com': 'https://www.icloud.com/mail',
  'mac.com': 'https://www.icloud.com/mail',
  'aol.com': 'https://mail.aol.com/',
  'proton.me': 'https://mail.proton.me/',
  'protonmail.com': 'https://mail.proton.me/',
}

function getEmailInboxUrl(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return null
  return EMAIL_PROVIDER_INBOX_URLS[domain] ?? null
}

export function SignupForm() {
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get('error') === 'link-expired'
  const requestedNext = searchParams.get('next')
  const nextPath = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/dashboard'

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
        emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(nextPath)}`,
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
    const inboxUrl = getEmailInboxUrl(email)
    return (
      <div className="w-full max-w-md rounded-3xl bg-[#0a0a0a] border border-white/10 p-8 sm:p-10 text-center shadow-2xl">
        <div className="mb-4 text-4xl">📬</div>
        <h1 className="mb-2 text-2xl font-black text-white">Check your email</h1>
        <p className="text-sm text-gray-400 leading-relaxed">
          We&apos;ve sent a magic sign-in link to <strong className="text-emerald-400 font-mono">{email}</strong>.
          Click it to access your PLANET SOR7ED account — no password needed.
        </p>

        {inboxUrl && (
          <a
            href={inboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block w-full rounded-2xl bg-[#F5C518] py-3.5 text-sm font-bold uppercase tracking-wider text-black hover:bg-[#D4AC0D] transition-colors shadow-lg"
          >
            Jump to Your Email →
          </a>
        )}

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
    )
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-[#0a0a0a] border border-white/10 p-8 sm:p-10 shadow-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto h-1 w-12 rounded-full bg-[#F5C518] mb-4" />
        <h1
          className="font-bebas text-5xl sm:text-6xl font-black text-white uppercase tracking-tight leading-[0.95]"
        >
          Get Started
        </h1>
        <p className="mt-3 text-base text-gray-400">
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
            className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#F5C518] focus:outline-none focus:ring-2 focus:ring-[#F5C518]/20 disabled:opacity-50 font-mono"
          />
        </div>

        {errorMessage && (
          <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full rounded-2xl bg-[#F5C518] py-3.5 text-sm font-bold uppercase tracking-wider text-black hover:bg-[#D4AC0D] transition-colors shadow-lg disabled:opacity-50"
        >
          {state === 'loading' ? 'Sending magic link…' : 'Send Magic Link →'}
        </button>
      </form>
    </div>
  )
}

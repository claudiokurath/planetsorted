'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

type State = 'idle' | 'loading' | 'sent' | 'error'

const INBOXES: Record<string, string> = {
  'gmail.com': 'https://mail.google.com/mail/u/0/#inbox',
  'googlemail.com': 'https://mail.google.com/mail/u/0/#inbox',
  'outlook.com': 'https://outlook.live.com/mail/0/inbox',
  'hotmail.com': 'https://outlook.live.com/mail/0/inbox',
  'yahoo.com': 'https://mail.yahoo.com/',
  'yahoo.co.uk': 'https://mail.yahoo.com/',
  'icloud.com': 'https://www.icloud.com/mail',
  'proton.me': 'https://mail.proton.me/',
  'protonmail.com': 'https://mail.proton.me/',
}

export function SignupForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const bannerMessage =
    errorParam === 'link-expired'
      ? 'That sign-in link expired. Send yourself a fresh one below.'
      : errorParam === 'session-expired'
        ? 'Your session ended. Sign in again to continue.'
        : errorParam === 'signin-required'
          ? 'Please sign in to continue to your account.'
          : null

  const requestedNext = searchParams.get('next')
  const nextPath =
    requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/dashboard'

  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setState('loading')
    setErrorMessage('')

    const response = await fetch('/api/auth/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, email, next: nextPath }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      setState('error')
      setErrorMessage(body.error || 'We could not send your link. Please try again.')
      return
    }
    setState('sent')
  }

  if (state === 'sent') {
    const inboxUrl = INBOXES[email.split('@')[1]?.toLowerCase()]
    return (
      <div className="w-full max-w-lg rounded-none border border-white/10 bg-black p-7 text-center shadow-2xl sm:p-10">
        <Image
          src="/images/tangle-yellow.png"
          alt=""
          aria-hidden
          width={1024}
          height={1024}
          className="mx-auto mb-6 h-16 w-16 select-none sm:h-20 sm:w-20"
        />
        <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-[#F5C518]">Link sent</p>
        <h1 className="font-bebas mt-4 text-4xl uppercase leading-[1.15] text-white sm:text-5xl">
          Check your email.
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-neutral-400 sm:text-base">
          Your secure sign-in link is on its way. Tap it once to sign in — no password.
        </p>
        {inboxUrl ? (
          <a
            href={inboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 block min-h-14 rounded-full border border-white/15 px-6 py-4 text-sm font-medium uppercase tracking-wider text-white hover:border-[#F5C518]"
          >
            Open email →
          </a>
        ) : null}
        <button
          onClick={() => setState('idle')}
          className="mt-6 text-xs font-medium text-neutral-500 underline underline-offset-4 hover:text-white"
        >
          Send again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg rounded-none border border-white/10 bg-black p-6 shadow-2xl sm:p-10">
      <div className="mb-8">
        <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-[#F5C518]">No password</p>
        <h1 className="font-bebas mt-4 text-4xl uppercase leading-[1.15] text-white sm:text-5xl">
          Sign in to SOR7ED.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-neutral-400 sm:text-base">
          Enter your email and we&rsquo;ll send you a one-tap sign-in link.
        </p>
      </div>

      {bannerMessage ? (
        <div className="mb-6 rounded-none border border-[#F5C518]/30 bg-[#F5C518]/10 px-4 py-3 text-xs leading-relaxed text-[#F5C518]">
          {bannerMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="first-name" className="block text-xs font-medium uppercase tracking-wider text-neutral-300">
          First name <span className="font-normal normal-case tracking-normal text-neutral-600">optional</span>
        </label>
        <input
          id="first-name"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Claudio"
          className="min-h-14 w-full rounded-none border border-white/10 bg-black px-4 text-base text-white outline-none placeholder:text-neutral-600 focus:border-[#F5C518]"
        />

        <label htmlFor="signup-email" className="block text-xs font-medium uppercase tracking-wider text-neutral-300">
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-h-14 w-full rounded-none border border-white/10 bg-black px-4 text-base text-white outline-none placeholder:text-neutral-600 focus:border-[#F5C518]"
        />

        {errorMessage ? (
          <p className="text-sm text-red-400" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={state === 'loading'}
          className="min-h-14 w-full rounded-full bg-[#F5C518] px-6 text-sm font-normal uppercase tracking-wider text-black disabled:opacity-50"
        >
          {state === 'loading' ? 'Sending…' : 'Send my sign-in link →'}
        </button>
      </form>
    </div>
  )
}

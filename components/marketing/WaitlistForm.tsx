'use client'

import { useState } from 'react'

/**
 * Waitlist capture form. UI-only — you wire the endpoint.
 *
 * Wire options:
 *   1. Point `endpoint` at your existing /api/waitlist route (default).
 *   2. Or replace the fetch() body with a direct Loops / Resend / Supabase call.
 *
 * Emits a real HTML5 email validation before submit. Handles idle / sending
 * / done / error states — no toasts, no libs.
 */
export function WaitlistForm({ endpoint = '/api/waitlist' }: { endpoint?: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setErrorMsg('')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing' }),
      })
      if (!res.ok) throw new Error(`Server responded ${res.status}`)
      setState('done')
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (state === 'done') {
    return (
      <p className="mt-10 border-t border-[#F5C518]/40 pt-6 text-[15px] text-white">
        You're on the list. We'll email once — the day your slot opens.
      </p>
    )
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto] sm:gap-0 sm:border-b sm:border-white/20"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourbrain.com"
          aria-label="Your email address"
          disabled={state === 'sending'}
          className="border border-white/20 bg-transparent px-4 py-4 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F5C518] sm:border-0 sm:border-b-0 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="bg-[#F5C518] px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-black transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {state === 'sending' ? 'Sending…' : 'Join Waitlist'}
        </button>
      </form>
      {state === 'error' ? (
        <p className="mt-3 text-[13px] text-[#F5C518]">
          Couldn't sign you up ({errorMsg}). Try again or drop us an email.
        </p>
      ) : null}
    </>
  )
}

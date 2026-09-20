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
      <p className="themed-strong mt-10 border-t themed-rule-strong pt-6 text-[15px]">
        You're on the list. We'll email once — the day your slot opens.
      </p>
    )
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="themed-rule-strong mt-10 grid gap-3 sm:grid-cols-[1fr_auto] sm:gap-0 sm:border-b"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourbrain.com"
          aria-label="Your email address"
          disabled={state === 'sending'}
          className="themed-input themed-strong themed-rule-strong border bg-transparent px-4 py-4 placeholder:text-[color:var(--local-muted)] focus:outline-none sm:border-0 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="themed-btn px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
        >
          {state === 'sending' ? 'Sending…' : 'Join Waitlist'}
        </button>
      </form>
      {state === 'error' ? (
        <p className="themed-accent mt-3 text-[13px]">
          Couldn't sign you up ({errorMsg}). Try again or drop us an email.
        </p>
      ) : null}
    </>
  )
}

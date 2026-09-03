'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

type State = 'idle' | 'loading' | 'sent' | 'error'
type Mode = 'first' | 'returning'
type Channel = 'whatsapp' | 'email'

const COUNTRY_CODES = [
  ['GB', 'United Kingdom', '44'], ['US', 'United States', '1'], ['IE', 'Ireland', '353'],
  ['AU', 'Australia', '61'], ['NZ', 'New Zealand', '64'], ['CA', 'Canada', '1'],
  ['AT', 'Austria', '43'], ['BE', 'Belgium', '32'], ['CH', 'Switzerland', '41'],
  ['DE', 'Germany', '49'], ['DK', 'Denmark', '45'], ['ES', 'Spain', '34'],
  ['FI', 'Finland', '358'], ['FR', 'France', '33'], ['GR', 'Greece', '30'],
  ['IT', 'Italy', '39'], ['LU', 'Luxembourg', '352'], ['NL', 'Netherlands', '31'],
  ['NO', 'Norway', '47'], ['PL', 'Poland', '48'], ['PT', 'Portugal', '351'],
  ['SE', 'Sweden', '46'], ['ZA', 'South Africa', '27'], ['IN', 'India', '91'],
  ['SG', 'Singapore', '65'], ['AE', 'United Arab Emirates', '971'],
] as const

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
  const router = useRouter()
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
  const nextPath = requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/dashboard'
  const returningMode =
    errorParam === 'link-expired' ||
    errorParam === 'session-expired' ||
    errorParam === 'signin-required'

  const [mode, setMode] = useState<Mode>(() =>
    returningMode ? 'returning' : searchParams.get('mode') === 'returning' ? 'returning' : 'first'
  )
  const [channel, setChannel] = useState<Channel>(
    errorParam === 'link-expired' || errorParam === 'session-expired' ? 'email' : 'whatsapp'
  )

  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('44')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [emailLinkSent, setEmailLinkSent] = useState(false)

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    setState('idle')
    setErrorMessage('')
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'returning') params.set('mode', 'returning')
    else params.delete('mode')
    router.replace(`/signup?${params.toString()}`, { scroll: false })
  }

  async function handleFirstTimeSubmit(event: React.FormEvent) {
    event.preventDefault()
    setState('loading')
    setErrorMessage('')

    const response = await fetch('/api/auth/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, email, countryCode, phone, next: nextPath }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      setState('error')
      setErrorMessage(body.error || 'We could not send your links. Please try again.')
      return
    }

    setEmailLinkSent(Boolean(body.emailSent))
    setState('sent')
  }

  async function handleReturningWhatsAppSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!phone.trim()) return
    setState('loading')
    setErrorMessage('')

    const response = await fetch('/api/auth/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: '', email: '', countryCode, phone, next: nextPath, existingOnly: true }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      setState('error')
      setErrorMessage(body.error || 'We could not send your link. Please try again.')
      return
    }

    setEmailLinkSent(Boolean(body.emailSent))
    setState('sent')
  }

  async function handleReturningEmailSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    setState('loading')
    setErrorMessage('')

    const supabase = createBrowserClient()
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(nextPath)}` },
    })
    if (error) {
      setState('error')
      setErrorMessage('Something went wrong sending your link. Please try again.')
      return
    }
    setEmailLinkSent(true)
    setState('sent')
  }

  if (state === 'sent') {
    const inboxUrl = email && emailLinkSent ? INBOXES[email.split('@')[1]?.toLowerCase()] : null
    const viaEmail = emailLinkSent
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
        <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-[#F5C518]">Links sent</p>
        <h1 className="font-bebas mt-4 text-4xl uppercase leading-[1.15] text-white sm:text-5xl">
          {viaEmail ? 'Check your email.' : 'Check your phone.'}
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-neutral-400 sm:text-base">
          {mode === 'returning'
            ? viaEmail
              ? 'Your secure sign-in link is waiting in your email.'
              : 'Your WhatsApp sign-in link is on its way. Tap it once to sign in.'
            : viaEmail
              ? 'Your WhatsApp verification link and email sign-in link were sent together. Open both once and you are SOR7ED.'
              : 'Your WhatsApp verification link is ready. Tap it once to verify and sign in.'}
        </p>
        {inboxUrl ? (
          <a href={inboxUrl} target="_blank" rel="noopener noreferrer" className="mt-7 block min-h-14 rounded-full border border-white/15 px-6 py-4 text-sm font-medium uppercase tracking-wider text-white hover:border-[#F5C518]">
            Open email →
          </a>
        ) : null}
        <button onClick={() => setState('idle')} className="mt-6 text-xs font-medium text-neutral-500 underline underline-offset-4 hover:text-white">
          Send again or change details
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg rounded-none border border-white/10 bg-black p-6 shadow-2xl sm:p-10">
      <div className="mb-8 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => switchMode('first')}
          aria-pressed={mode === 'first'}
          className={`border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.24em] transition-colors ${
            mode === 'first'
              ? 'border-[#F5C518] bg-[#F5C518]/10 text-white'
              : 'border-white/10 text-neutral-500 hover:border-white/25 hover:text-white'
          }`}
        >
          First time
        </button>
        <button
          type="button"
          onClick={() => switchMode('returning')}
          aria-pressed={mode === 'returning'}
          className={`border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.24em] transition-colors ${
            mode === 'returning'
              ? 'border-[#F5C518] bg-[#F5C518]/10 text-white'
              : 'border-white/10 text-neutral-500 hover:border-white/25 hover:text-white'
          }`}
        >
          Returning member
        </button>
      </div>

      <div className="mb-8">
        <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-[#F5C518]">
          {mode === 'returning' ? 'Welcome back' : 'One form. One go.'}
        </p>
        <h1 className="font-bebas mt-4 text-4xl uppercase leading-[1.15] text-white sm:text-5xl">
          {mode === 'returning' ? 'Sign in to SOR7ED.' : 'Get SOR7ED.'}
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-neutral-400 sm:text-base">
          {mode === 'returning'
            ? 'Send a secure sign-in link to your WhatsApp or email. No password needed.'
            : 'WhatsApp is your product key. Add email if you want a backup sign-in and recovery route.'}
        </p>
      </div>

      {bannerMessage ? <div className="mb-6 rounded-none border border-[#F5C518]/30 bg-[#F5C518]/10 px-4 py-3 text-xs leading-relaxed text-[#F5C518]">{bannerMessage}</div> : null}

      {mode === 'first' ? (
        <form onSubmit={handleFirstTimeSubmit} className="space-y-4">
          <FieldLabel htmlFor="first-name">First name</FieldLabel>
          <input id="first-name" required autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Claudio" className="min-h-14 w-full rounded-none border border-white/10 bg-black px-4 text-base text-white outline-none placeholder:text-neutral-600 focus:border-[#F5C518]" />

          <FieldLabel htmlFor="signup-email">Email <span className="font-normal normal-case tracking-normal text-neutral-600">optional backup</span></FieldLabel>
          <input id="signup-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-14 w-full rounded-none border border-white/10 bg-black px-4 text-base text-white outline-none placeholder:text-neutral-600 focus:border-[#F5C518]" />

          <FieldLabel htmlFor="signup-phone">WhatsApp number</FieldLabel>
          <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-2">
            <label className="sr-only" htmlFor="country-code">Country code</label>
            <select id="country-code" value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className="min-h-14 min-w-0 rounded-none border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-[#F5C518]">
              {COUNTRY_CODES.map(([iso, country, code]) => <option key={`${iso}-${code}`} value={code}>{iso === 'GB' ? 'UK' : country} (+{code})</option>)}
            </select>
            <input id="signup-phone" type="tel" inputMode="numeric" autoComplete="tel-national" required value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))} placeholder="7591 922247" className="min-h-14 min-w-0 rounded-none border border-white/10 bg-black px-4 font-mono text-base text-white outline-none placeholder:text-neutral-600 focus:border-[#F5C518]" />
          </div>
          <p className="text-xs text-neutral-600">Choose the code, then enter the number without its first zero.</p>

          {errorMessage ? <p className="text-sm text-red-400" role="alert">{errorMessage}</p> : null}
          <button type="submit" disabled={state === 'loading'} className="min-h-14 w-full rounded-full bg-[#F5C518] px-6 text-sm font-normal uppercase tracking-wider text-black disabled:opacity-50">
            {state === 'loading' ? 'Sending…' : email ? 'Send both links →' : 'Send WhatsApp link →'}
          </button>
        </form>
      ) : (
        <>
          <div className="mb-6 flex gap-6" role="tablist" aria-label="Sign-in channel">
            <ChannelButton active={channel === 'whatsapp'} onClick={() => setChannel('whatsapp')}>WhatsApp</ChannelButton>
            <ChannelButton active={channel === 'email'} onClick={() => setChannel('email')}>Email</ChannelButton>
          </div>
          {channel === 'whatsapp' ? (
            <form onSubmit={handleReturningWhatsAppSubmit} className="space-y-4">
              <FieldLabel htmlFor="returning-phone">WhatsApp number</FieldLabel>
              <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-2">
                <label className="sr-only" htmlFor="returning-country">Country code</label>
                <select id="returning-country" value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className="min-h-14 min-w-0 rounded-none border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-[#F5C518]">
                  {COUNTRY_CODES.map(([iso, country, code]) => <option key={`${iso}-${code}`} value={code}>{iso === 'GB' ? 'UK' : country} (+{code})</option>)}
                </select>
                <input id="returning-phone" type="tel" inputMode="numeric" autoComplete="tel-national" required value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))} placeholder="7591 922247" className="min-h-14 min-w-0 rounded-none border border-white/10 bg-black px-4 font-mono text-base text-white outline-none placeholder:text-neutral-600 focus:border-[#F5C518]" />
              </div>
              <p className="text-xs text-neutral-600">Choose the code, then enter the number without its first zero.</p>

              {errorMessage ? <p className="text-sm text-red-400" role="alert">{errorMessage}</p> : null}
              <button type="submit" disabled={state === 'loading'} className="min-h-14 w-full rounded-full bg-[#F5C518] px-6 text-sm font-normal uppercase tracking-wider text-black disabled:opacity-50">
                {state === 'loading' ? 'Sending…' : 'Send WhatsApp link →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReturningEmailSubmit} className="space-y-4">
              <FieldLabel htmlFor="returning-email">Email address</FieldLabel>
              <input id="returning-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-14 w-full rounded-none border border-white/10 bg-black px-4 text-base text-white outline-none placeholder:text-neutral-600 focus:border-[#F5C518]" />
              {errorMessage ? <p className="text-sm text-red-400" role="alert">{errorMessage}</p> : null}
              <button type="submit" disabled={state === 'loading'} className="min-h-14 w-full rounded-full border border-white/15 px-6 text-sm font-normal uppercase tracking-wider text-white hover:border-[#F5C518] disabled:opacity-50">{state === 'loading' ? 'Sending…' : 'Send email sign-in link →'}</button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

function ChannelButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border-b-2 pb-1 text-[11px] font-medium uppercase tracking-[0.24em] transition-colors ${
        active ? 'border-[#F5C518] text-white' : 'border-transparent text-neutral-500 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-wider text-neutral-300">{children}</label>
}

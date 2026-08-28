'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Phase = 'phone' | 'code' | 'finishing'

interface ConnectWhatsAppFormProps {
  nextPath: string
  slug?: string
  context?: 'article' | 'tool'
}

export function ConnectWhatsAppForm({ nextPath, slug, context }: ConnectWhatsAppFormProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('phone')
  const [countryCode, setCountryCode] = useState('44')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendCode(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/whatsapp/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappNumber: `${countryCode}${phone.replace(/^0/, '')}` }),
    })
    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(body.error || 'We could not send the code. Check the number and try again.')
      setLoading(false)
      return
    }

    setPhase('code')
    setLoading(false)
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/whatsapp/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: code }),
    })
    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(body.error || 'That code did not work. Please try again.')
      setLoading(false)
      return
    }

    setPhase('finishing')

    if (slug && context) {
      const delivery = await fetch('/api/save-to-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, context, includeLink: true }),
      })

      if (delivery.ok) {
        await fetch('/api/saved-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, context }),
        })
      }
    }

    router.replace(nextPath)
    router.refresh()
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-black p-6 shadow-2xl sm:p-10">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1FD7CF]">
        One-time connection
      </p>
      <h1 className="font-bebas mt-4 text-7xl font-black uppercase leading-[0.84] text-white sm:text-8xl">
        Get the link.
      </h1>
      <p className="mt-5 max-w-md text-sm leading-6 text-neutral-400 sm:text-base">
        Your requested tools and protocols arrive as private WhatsApp links. Connect your number once; after that, the SOR7ED button does the rest.
      </p>

      {phase === 'phone' ? (
        <form onSubmit={sendCode} className="mt-8 space-y-4">
          <div>
            <label htmlFor="whatsapp-number" className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-300">
              WhatsApp number
            </label>
            <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-2">
              <label htmlFor="connect-country-code" className="sr-only">Country code</label>
              <select
                id="connect-country-code"
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                className="min-h-14 rounded-2xl border border-neutral-800 bg-black px-3 text-sm text-white outline-none focus:border-[#1FD7CF]"
              >
                <option value="44">UK (+44)</option>
                <option value="1">US / Canada (+1)</option>
                <option value="353">Ireland (+353)</option>
                <option value="61">Australia (+61)</option>
                <option value="64">New Zealand (+64)</option>
                <option value="49">Germany (+49)</option>
                <option value="33">France (+33)</option>
                <option value="34">Spain (+34)</option>
                <option value="39">Italy (+39)</option>
                <option value="31">Netherlands (+31)</option>
              </select>
              <input
                id="whatsapp-number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
                placeholder="7591 922247"
                className="min-h-14 min-w-0 rounded-2xl border border-neutral-800 bg-black px-4 font-mono text-base text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#1FD7CF]"
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">Choose the code, then enter the number without its first zero.</p>
          </div>
          {error ? <p className="text-sm text-red-400" role="alert">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="min-h-14 w-full rounded-full bg-gradient-to-r from-[#1FD7CF] via-[#5095FF] to-[#856CFF] px-6 text-sm font-black uppercase tracking-wider text-black disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send my code →'}
          </button>
        </form>
      ) : null}

      {phase === 'code' ? (
        <form onSubmit={verifyCode} className="mt-8 space-y-4">
          <div>
            <label htmlFor="whatsapp-code" className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-300">
              Six-digit code
            </label>
            <input
              id="whatsapp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="min-h-14 w-full rounded-2xl border border-neutral-800 bg-black px-4 text-center font-mono text-2xl tracking-[0.35em] text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-[#1FD7CF]"
            />
          </div>
          {error ? <p className="text-sm text-red-400" role="alert">{error}</p> : null}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="min-h-14 w-full rounded-full bg-gradient-to-r from-[#1FD7CF] via-[#5095FF] to-[#856CFF] px-6 text-sm font-black uppercase tracking-wider text-black disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Connect and send my link →'}
          </button>
          <button
            type="button"
            onClick={() => { setPhase('phone'); setCode(''); setError('') }}
            className="w-full py-2 text-xs font-bold text-neutral-500 underline underline-offset-4 hover:text-white"
          >
            Change number
          </button>
        </form>
      ) : null}

      {phase === 'finishing' ? (
        <div className="mt-8 rounded-2xl border border-[#1FD7CF]/25 bg-[#1FD7CF]/5 p-5 text-sm font-semibold text-[#1FD7CF]" role="status">
          Connected. Sending your private link…
        </div>
      ) : null}

      <Link href={nextPath} className="mt-7 block text-center text-xs text-neutral-600 hover:text-neutral-300">
        Not now — return to browsing
      </Link>
    </div>
  )
}

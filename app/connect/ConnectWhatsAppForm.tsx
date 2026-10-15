'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deliveryStatusMessage, hasSubmittedDelivery, requestWhatsAppDelivery, startNewDeliveryAction, type WhatsAppDeliveryResult } from '@/lib/whatsapp/deliveryClient'

type Phase = 'phone' | 'code' | 'confirm-send' | 'finishing' | 'delivery-status'

interface ConnectWhatsAppFormProps {
  nextPath: string
  slug?: string
  context?: 'article' | 'tool'
  alreadyConnected?: boolean
  actionId?: string
  userId: string
}

export function ConnectWhatsAppForm({ nextPath, slug, context, alreadyConnected = false, actionId, userId }: ConnectWhatsAppFormProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>(alreadyConnected && slug && context ? 'confirm-send' : 'phone')
  const [countryCode, setCountryCode] = useState('44')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [delivery, setDelivery] = useState<WhatsAppDeliveryResult | null>(null)
  const codeRequestRef = useRef(false)
  const verificationRef = useRef(false)
  const finishRef = useRef(false)
  const actionRef = useRef(actionId)
  const hasRequestedItem = Boolean(slug && context)

  useEffect(() => {
    let cancelled = false
    // Restore the action without dispatching anything on a GET or reload.
    void Promise.resolve().then(() => {
      if (!cancelled && alreadyConnected && slug && context && hasSubmittedDelivery({ slug, context }, userId, actionId)) {
        setPhase('delivery-status')
      }
    })
    return () => { cancelled = true }
  }, [alreadyConnected, slug, context, userId, actionId])

  async function sendCode(event: React.FormEvent) {
    event.preventDefault()
    if (codeRequestRef.current || verificationRef.current || finishRef.current) return
    codeRequestRef.current = true
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: `${countryCode}${phone.replace(/^0/, '')}` }),
      })
      const result = await response.json().catch(() => null) as { state?: string } | null
      if (result?.state === 'unknown') {
        setPhase('code')
        setError('We could not confirm whether your code was sent. If it arrives, enter it. Otherwise wait a minute before requesting another code.')
        return
      }
      if (!response.ok) {
        setError('We could not send the code. Check the number and try again.')
        return
      }
      if (result?.state !== 'accepted') {
        setError('We could not confirm whether your code was sent. Check your WhatsApp before requesting another code.')
        return
      }
      setPhase('code')
    } catch {
      setPhase('code')
      setError('We could not confirm whether your code was sent. If it arrives, enter it. Otherwise check your connection and wait a minute before requesting another code.')
    } finally {
      codeRequestRef.current = false
      setLoading(false)
    }
  }

  async function finishConnection(retry = false) {
    if (finishRef.current || codeRequestRef.current) return
    finishRef.current = true
    setLoading(true)
    setError('')
    setPhase('finishing')
    if (retry) setDelivery(null)

    try {
      if (slug && context) {
        const request = { slug, context, includeLink: true }
        if (retry) {
          actionRef.current = startNewDeliveryAction(request, userId)
          const currentUrl = new URL(window.location.href)
          currentUrl.searchParams.set('actionId', actionRef.current)
          window.history.replaceState(window.history.state, '', currentUrl)
        }
        const result = await requestWhatsAppDelivery(request, userId, actionRef.current)
        setDelivery(result)
        if (result.deliveryStatus !== 'accepted') {
          setPhase('delivery-status')
          return
        }
      }

      router.replace(nextPath)
      router.refresh()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Your WhatsApp is connected. Sending could not be confirmed. Check this request safely.')
      setPhase('delivery-status')
    } finally {
      finishRef.current = false
      setLoading(false)
    }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault()
    if (verificationRef.current || codeRequestRef.current || finishRef.current) return
    verificationRef.current = true
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: code }),
      })
      if (!response.ok) {
        setError('That code did not work. Check the six digits and try again.')
        return
      }
      await finishConnection()
    } catch {
      setError('We could not check the code. Check your connection and try again.')
    } finally {
      verificationRef.current = false
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg rounded-none border border-white/10 bg-black p-6 shadow-2xl sm:p-10" aria-busy={loading}>
      <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-[#FFBA2E]">
        {alreadyConnected ? 'Ready for WhatsApp' : 'One-time connection'}
      </p>
      <h1 id="connect-title" className="font-bebas mt-4 text-4xl uppercase leading-[1.15] text-white sm:text-5xl">
        {hasRequestedItem ? 'Get the link.' : 'Connect WhatsApp.'}
      </h1>
      <p className="mt-5 max-w-md text-sm leading-6 text-neutral-400 sm:text-base">
        {alreadyConnected ? 'Your WhatsApp is connected. Choose below to receive this link in your chat.' : 'Your requested tools and protocols arrive as private WhatsApp links. Connect your number once; after that, the SOR7ED button does the rest.'}
      </p>

      {phase === 'confirm-send' ? (
        <button type="button" onClick={() => void finishConnection()} disabled={loading} className="mt-8 min-h-14 w-full bg-white px-6 text-sm font-medium uppercase tracking-wider text-black disabled:opacity-50">
          {context === 'article' ? 'Get this protocol via WhatsApp →' : 'Get this tool via WhatsApp →'}
        </button>
      ) : null}

      {phase === 'phone' ? (
        <form onSubmit={sendCode} className="mt-8 space-y-4">
          <div>
            <label htmlFor="whatsapp-number" className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-300">
              WhatsApp number
            </label>
            <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-2">
              <label htmlFor="connect-country-code" className="sr-only">Country code</label>
              <select
                id="connect-country-code"
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                className="min-h-14 rounded-none border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-[#FFBA2E]"
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
                className="min-h-14 min-w-0 rounded-none border border-white/10 bg-black px-4 font-mono text-base text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#FFBA2E]"
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">Choose the code, then enter the number without its first zero.</p>
          </div>
          {error ? <p className="text-sm text-red-400" role="alert">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="min-h-14 w-full rounded-full bg-[#FFBA2E] px-6 text-sm font-normal uppercase tracking-wider text-black disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send my code →'}
          </button>
        </form>
      ) : null}

      {phase === 'code' ? (
        <form onSubmit={verifyCode} className="mt-8 space-y-4">
          <div>
            <label htmlFor="whatsapp-code" className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-300">
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
              className="min-h-14 w-full rounded-none border border-white/10 bg-black px-4 text-center font-mono text-2xl tracking-[0.35em] text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-[#FFBA2E]"
            />
          </div>
          {error ? <p className="text-sm text-red-400" role="alert">{error}</p> : null}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="min-h-14 w-full rounded-full bg-[#FFBA2E] px-6 text-sm font-normal uppercase tracking-wider text-black disabled:opacity-50"
          >
            {loading ? 'Checking…' : hasRequestedItem ? 'Connect and send my link →' : 'Connect WhatsApp →'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => { if (!verificationRef.current && !codeRequestRef.current) { setPhase('phone'); setCode(''); setError('') } }}
            className="w-full py-2 text-xs font-medium text-neutral-500 underline underline-offset-4 hover:text-white"
          >
            Change number
          </button>
        </form>
      ) : null}

      {phase === 'finishing' ? (
        <div className="mt-8 rounded-none border border-[#FFBA2E]/25 bg-[#FFBA2E]/5 p-5 text-sm font-medium text-[#FFBA2E]" role="status">
          {hasRequestedItem ? 'Connected. Sending your private link…' : 'Connected. Returning to the website…'}
        </div>
      ) : null}

      {phase === 'delivery-status' ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm leading-6 text-neutral-300" role={error ? 'alert' : 'status'}>
            {error || (delivery ? deliveryStatusMessage(delivery) : 'Your WhatsApp is connected. Check the status of your previous request before sending again.')}
          </p>
          <button type="button" onClick={() => void finishConnection()} disabled={loading} className="min-h-14 w-full bg-white px-6 text-sm font-medium uppercase tracking-wider text-black disabled:opacity-50">
            Check my request status →
          </button>
          {delivery && (delivery.deliveryStatus === 'failed' || delivery.deliveryStatus === 'skipped') ? (
            <button type="button" onClick={() => void finishConnection(true)} disabled={loading} className="flex min-h-11 w-full items-center justify-center text-sm text-white underline underline-offset-4">Try sending again</button>
          ) : null}
        </div>
      ) : null}

      <Link href={nextPath} className="mt-7 flex min-h-11 items-center justify-center text-center text-sm text-neutral-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFBA2E]">
        Not now — return to browsing
      </Link>
    </div>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { deliveryStatusMessage, type WhatsAppDeliveryResult } from '@/lib/whatsapp/deliveryClient'

/** Timings from the v9 handoff. */
const IN = 620
const OUT = 420
const HOLD = 2400
const TICK_AT = 0.28

/** ≈ cubic-bezier(0.16, 1, 0.3, 1), the SOR7ED house easing. */
function ease(p: number) {
  return 1 - Math.pow(1 - p, 3.2)
}

const COPY = {
  rest: { lead: 'Save this piece', trail: 'tap the mark' },
  done: { lead: 'Message sent', trail: 'sorted.' },
} as const

interface Props {
  /** The tangle resolves only after this operation succeeds. */
  onSave?: () => Promise<WhatsAppDeliveryResult>
  onRetry?: () => Promise<WhatsAppDeliveryResult>
  disabled?: boolean
  /**
   * When set, the mark navigates here instead of resolving. Everyone sees the
   * same control; only what the click does changes. Visitors who cannot receive
   * anything yet still get the mark rather than a consolation text link.
   */
  href?: string
  /** Rest-state words. The done copy is fixed — it describes what happened. */
  copy?: { lead: string; trail: string }
  compact?: boolean
}

/**
 * The SOR7ED save control: the mark *is* the button, and the hand-drawn tangle
 * resolves into a tick.
 *
 * One progress value drives both layers so the tangle's exit and the tick's
 * draw-in stay locked to the same beat — two independent CSS transitions drift
 * apart and the effect falls flat. --td is the same clock delayed to TICK_AT.
 *
 * The tangle is raster on purpose; a vector trace was tried and rejected because
 * the hand-drawn character does not survive it.
 */
export function SortedSaveButton({
  onSave,
  onRetry,
  disabled = false,
  href,
  copy: restCopy = COPY.rest,
  compact = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tRef = useRef(0)
  const sendingRef = useRef(false)

  const [whatsappUrl, setWhatsAppUrl] = useState('')
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusOnly, setStatusOnly] = useState(false)
  const [canRetry, setCanRetry] = useState(false)

  const paint = useCallback((v: number) => {
    tRef.current = v
    const td = Math.max(0, Math.min(1, (v - TICK_AT) / (1 - TICK_AT)))
    const root = rootRef.current
    if (!root) return
    root.style.setProperty('--t', v.toFixed(3))
    root.style.setProperty('--td', td.toFixed(3))
  }, [])

  const run = useCallback(
    (to: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Reduced motion still swaps tangle for tick — it just skips the journey.
      if (reduce) {
        paint(to)
        return
      }

      const from = tRef.current
      const dur = to > from ? IN : OUT
      const start = performance.now()

      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        paint(from + (to - from) * ease(p))
        if (p < 1) rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [paint]
  )

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  async function handleClick(retry = false) {
    if (disabled || sendingRef.current || !onSave) return
    setError('')
    if (!done) {
      sendingRef.current = true
      setSending(true)
      if (retry) { setCanRetry(false); setStatusOnly(false) }
      try {
        const result = await (retry && onRetry ? onRetry() : onSave())
        setStatusMessage(deliveryStatusMessage(result))
        setWhatsAppUrl(result.whatsappUrl || '')
        if (result.whatsappUrl) window.location.assign(result.whatsappUrl)
        setStatusOnly(result.deliveryStatus !== 'accepted')
        setCanRetry(result.deliveryStatus === 'failed' || result.deliveryStatus === 'skipped')
        if (result.deliveryStatus !== 'accepted') return
      } catch (failure) {
        setStatusOnly(true)
        setError(failure instanceof Error ? failure.message : 'Could not confirm sending. Tap again to check safely.')
        return
      } finally {
        sendingRef.current = false
        setSending(false)
      }
    }
    if (timerRef.current) clearTimeout(timerRef.current)

    const next = !done
    setDone(next)
    run(next ? 1 : 0)

    if (next) {
      timerRef.current = setTimeout(() => {
        setDone(false)
        run(0)
      }, HOLD)
    }
  }

  const copy = done ? COPY.done : sending ? { lead: statusOnly ? 'Checking WhatsApp status…' : 'Sending to WhatsApp…', trail: 'one moment' } : statusOnly ? { lead: 'Check WhatsApp status', trail: 'tap the mark' } : restCopy

  const mark = (
    <span className="sb__mark">
      <Image
        className="sb__tangle"
        src="/images/tangle-white.png"
        alt=""
        width={84}
        height={84}
        draggable={false}
      />
      <svg className="sb__tick" viewBox="-24 -24 48 48" aria-hidden="true">
        <path d="M -13 1 L -3 11 L 15 -11" />
      </svg>
    </span>
  )

  return (
    <div ref={rootRef} className={`sb${compact ? ' sb--compact' : ''}`} aria-busy={sending}>

      {href ? (
        <Link href={href} target="_top" className="sb__btn" aria-label={`${copy.lead} — SOR7ED`}>
          {mark}<span className="sb__text">Get it sorted</span>
        </Link>
      ) : (
        <button
          type="button"
          className="sb__btn"
          aria-label={`${copy.lead} — SOR7ED`}
          onClick={() => void handleClick()}
          disabled={disabled || sending}
        >
          {mark}<span className="sb__text">{sending ? 'Preparing…' : done ? 'Sent to WhatsApp' : 'Get it sorted'}</span>
        </button>
      )}

      {whatsappUrl ? <a className="sb__reply" href={whatsappUrl}>Open WhatsApp and press Send →</a> : null}

      {error ? <span role="alert" className="sb__error">{error}</span> : null}
      {statusMessage && !error ? <span className="sb__error">{statusMessage}</span> : null}
      {canRetry && onRetry ? <button type="button" onClick={() => void handleClick(true)} disabled={sending} className="sb__retry">Try sending again</button> : null}
      {/* The visual change is quiet, so announce it. */}
      <span className="sr-only" role="status" aria-live="polite">
        {sending ? (statusOnly ? 'Checking status…' : 'Sending…') : statusMessage}
      </span>

      <style>{`
        .sb { --sb-accent:#000; --sb-mark:40px; --t:0; --td:0; display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:12px; padding:12px 0; width:100%; }
        .sb__btn { display:inline-flex; align-items:center; justify-content:center; gap:14px; min-height:60px; padding:10px 24px; border:1px solid #FFD400; border-radius:4px; background:#FFD400; color:#000; cursor:pointer; transition:background 180ms,transform 180ms; }
        .sb__btn:hover { background:#fff; border-color:#fff; }.sb__btn:active { transform:scale(.98); }.sb__btn:disabled { cursor:wait; opacity:.55; }
        .sb__text { font:400 23px/1.2 var(--font-anton),sans-serif; text-transform:uppercase; }
        .sb__btn:focus-visible,.sb__reply:focus-visible,.sb__retry:focus-visible { outline:2px solid #fff; outline-offset:4px; }
        .sb__mark { position:relative; flex:0 0 var(--sb-mark); width:var(--sb-mark); height:var(--sb-mark); }
        .sb__tangle { position:absolute; inset:0; width:100%; height:100%; filter:brightness(0); opacity:calc(1 - var(--t)); transform:scale(calc(1 - .12*var(--t))) rotate(calc(var(--t)*-8deg)); }
        .sb__tick { position:absolute; inset:0; width:100%; height:100%; opacity:var(--td); }.sb__tick path { fill:none; stroke:#000; stroke-width:2.6; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:46; stroke-dashoffset:calc(46px*(1 - var(--td))); }
        .sb__error,.sb__reply { flex-basis:100%; text-align:center; font:400 14px/1.5 var(--font-jost),sans-serif; color:#fff; max-width:56ch; }
        .sb__reply,.sb__retry { min-height:44px; text-decoration:underline; text-underline-offset:4px; }.sb__retry { color:#fff; padding:8px 12px; }
        .sb--compact { --sb-mark:32px; }.sb--compact .sb__btn { width:100%; min-height:54px; padding:10px 16px; }.sb--compact .sb__text { font-size:20px; }
        @media(prefers-reduced-motion:reduce) { .sb * { transition:none !important; } }
      `}</style>
    </div>
  )
}

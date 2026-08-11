'use client'

import { useState } from 'react'

interface Sor7edButtonProps {
  slug: string
  context: 'article' | 'tool'
  isLoggedIn: boolean
  whatsappVerified: boolean
  size?: 'md' | 'lg'
}

export function Sor7edButton({ slug, context, isLoggedIn, whatsappVerified, size = 'md' }: Sor7edButtonProps) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const returnPath = context === 'tool' ? `/tools/${slug}` : `/intelligence/${slug}`

  // Not logged in — send to sign in, return here after
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-start gap-3">
        <a
          href={`/signup?next=${encodeURIComponent(returnPath)}`}
          className="sor7ed-btn inline-flex items-center rounded-full border border-[#C0392B] text-white"
          style={{
            background: 'linear-gradient(135deg, #C0392B 0%, #96281B 100%)',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: size === 'lg' ? '1.35rem' : '1.1rem',
            letterSpacing: '0.18em',
            padding: size === 'lg' ? '1rem 2.5rem' : '1rem 2rem',
          }}
        >
          SOR7ED — SIGN IN FIRST
        </a>
        <p className="text-xs text-neutral-500">Sign in to receive the {context === 'tool' ? 'tool link' : 'protocol'} on your WhatsApp.</p>
      </div>
    )
  }

  // Logged in but WhatsApp not connected — send to dashboard settings
  if (!whatsappVerified) {
    return (
      <div className="flex flex-col items-start gap-3">
        <a
          href="/dashboard?tab=settings"
          className="inline-flex items-center rounded-full border border-white/20 text-white hover:border-white/40 transition-colors"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: size === 'lg' ? '1.35rem' : '1.1rem',
            letterSpacing: '0.18em',
            padding: size === 'lg' ? '1rem 2.5rem' : '1rem 2rem',
          }}
        >
          CONNECT WHATSAPP →
        </a>
        <p className="text-xs text-neutral-500">Connect your WhatsApp in dashboard settings to receive this.</p>
      </div>
    )
  }

  // Logged in + WhatsApp verified — send directly from Business WhatsApp
  async function handleSend() {
    setState('sending')
    try {
      const res = await fetch('/api/save-to-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, context, includeLink: true }),
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        onClick={handleSend}
        disabled={state === 'sending' || state === 'sent'}
        className="sor7ed-btn relative inline-flex items-center overflow-hidden rounded-full border font-black text-white transition-all duration-200 select-none disabled:opacity-60"
        style={{
          background: state === 'sent'
            ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
            : 'linear-gradient(135deg, #C0392B 0%, #96281B 100%)',
          borderColor: state === 'sent' ? '#10B981' : '#C0392B',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: size === 'lg' ? '1.35rem' : '1.1rem',
          letterSpacing: '0.18em',
          padding: size === 'lg' ? '1rem 2.5rem' : '1rem 2rem',
          boxShadow: state === 'sent'
            ? '0 0 32px rgba(16,185,129,0.35)'
            : '0 0 32px rgba(192,57,43,0.35), 0 4px 16px rgba(0,0,0,0.5)',
        }}
      >
        {state === 'idle' && 'SOR7ED'}
        {state === 'sending' && 'SENDING…'}
        {state === 'sent' && '✓ SENT TO YOUR WHATSAPP'}
        {state === 'error' && 'COULD NOT SEND — TRY AGAIN'}
      </button>

      {state === 'sent' && (
        <p className="text-xs font-semibold text-emerald-400">
          Check your WhatsApp — the link was sent directly from us.
        </p>
      )}
      {state === 'error' && (
        <p className="text-xs text-red-400">Something went wrong. Please try again.</p>
      )}
    </div>
  )
}

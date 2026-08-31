'use client'
import { useState } from 'react'

interface Props {
  slug: string
  context: 'article' | 'tool'
  isLoggedIn: boolean
  whatsappVerified: boolean
}

export function SaveToPhoneButton({ slug, context, isLoggedIn, whatsappVerified }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  if (!isLoggedIn) {
    const returnPath = context === 'tool' ? `/tools/${slug}` : `/intelligence/${slug}`
    return (
      <a href={`/signup?next=${encodeURIComponent(returnPath)}`}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F5C518] px-8 py-4 text-base font-medium uppercase tracking-wider text-[#050608] transition-opacity hover:opacity-90">
        SIGN IN TO GET THE COMPLETE {context === 'tool' ? 'TOOL' : 'PROTOCOL'} →
      </a>
    )
  }

  if (!whatsappVerified) {
    return (
      <a href="/dashboard?tab=settings"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-medium text-white hover:border-white/40 transition-colors">
        Connect WhatsApp to receive it →
      </a>
    )
  }

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
    <button onClick={handleSend} disabled={state === 'sending' || state === 'sent'}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F5C518] px-8 py-4 text-base font-medium uppercase tracking-wider text-[#050608] transition-opacity hover:opacity-90 disabled:opacity-60">
      {state === 'idle' && 'SEND TO MY WHATSAPP →'}
      {state === 'sending' && 'Sending…'}
      {state === 'sent' && '✓ Sent to your WhatsApp'}
      {state === 'error' && 'Could not send — try again'}
    </button>
  )
}

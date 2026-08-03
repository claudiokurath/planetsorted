'use client'
import { useState } from 'react'

interface Props {
  slug: string
  context: 'article' | 'tool'
  isLoggedIn: boolean
  whatsappVerified: boolean
  keyword?: string
}

export function SaveToPhoneButton({ slug, context, isLoggedIn, whatsappVerified, keyword }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const WA = process.env.NEXT_PUBLIC_WA_NUMBER ?? '447591922247'

  if (!isLoggedIn) {
    const waLink = `https://wa.me/${WA}?text=${encodeURIComponent(keyword ?? slug.toUpperCase())}`
    return (
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C0392B] px-8 py-4 text-base font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors">
        GET IT SOR7ED ON WHATSAPP →
      </a>
    )
  }

  if (!whatsappVerified) {
    return (
      <a href="/dashboard?tab=settings"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-bold text-white hover:border-white/40 transition-colors">
        Verify WhatsApp to receive directly →
      </a>
    )
  }

  async function handleSend() {
    setState('sending')
    try {
      const res = await fetch('/api/save-to-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, context, includeLink: false }), // flip to true once /r/[slug]'s cards are fully fixed
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <button onClick={handleSend} disabled={state === 'sending' || state === 'sent'}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C0392B] px-8 py-4 text-base font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors disabled:opacity-60">
      {state === 'idle' && 'SEND TO MY WHATSAPP →'}
      {state === 'sending' && 'Sending…'}
      {state === 'sent' && '✓ Sent to your WhatsApp'}
      {state === 'error' && 'Could not send — try again'}
    </button>
  )
}

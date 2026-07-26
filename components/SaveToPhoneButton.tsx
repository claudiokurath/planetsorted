'use client'

import { useState } from 'react'
import { GetSortedButton } from '@/components/buttons/GetSortedButton'

interface SaveToPhoneButtonProps {
  slug: string
  context: 'article' | 'tool' | 'result'
  isLoggedIn: boolean
  whatsappVerified: boolean
}

const HELPER_TEXT = {
  article: 'Text this to get the full protocol on WhatsApp',
  tool: 'Text this to run the tool and save your result',
  result: 'Save your result to WhatsApp to come back to it later',
}

export function SaveToPhoneButton({ slug, context, isLoggedIn, whatsappVerified }: SaveToPhoneButtonProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!isLoggedIn) return <GetSortedButton slug={slug} context={context} />

  if (!whatsappVerified) {
    return (
      <div className="flex flex-col items-start gap-1">
        <GetSortedButton slug={slug} context={context} />
        <p className="text-sm text-amber-600">Verify your WhatsApp number in Settings to send directly</p>
      </div>
    )
  }

  async function handleClick() {
    setSending(true)
    try {
      const res = await fetch('/api/save-to-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, context }),
      })
      if (!res.ok) throw new Error('Send failed')
      setSent(true)
    } catch {
      window.open(
        `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '447360277713'}?text=${encodeURIComponent(slug)}`,
        '_blank'
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={sending}
        className="inline-block rounded-full bg-green-500 px-6 py-3 font-bold text-white hover:bg-green-600 transition-colors disabled:opacity-50"
      >
        {sent ? 'Sent to WhatsApp ✓' : sending ? 'Sending…' : 'GET IT SORTED'}
      </button>
      <p className="text-sm text-gray-500">
        {sent ? 'Check WhatsApp — it should be there now.' : HELPER_TEXT[context]}
      </p>
    </div>
  )
}

'use client'
import { useRef, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { deliveryStatusMessage, requestWhatsAppDelivery, startNewDeliveryAction } from '@/lib/whatsapp/deliveryClient'

interface Props {
  slug: string
  context: 'article' | 'tool'
  isLoggedIn: boolean
  whatsappVerified: boolean
}

export function SaveToPhoneButton({ slug, context, isLoggedIn, whatsappVerified }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'check'>('idle')
  const [message, setMessage] = useState('')
  const [canRetry, setCanRetry] = useState(false)
  const activeRef = useRef(false)
  const returnPath = context === 'tool' ? `/tools/${slug}` : `/intelligence/${slug}`
  const setup = `/connect?${new URLSearchParams({ next: returnPath, slug, context })}`

  if (!isLoggedIn) {
    return (
      <a href={`/signup?next=${encodeURIComponent(setup)}`}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFBA2E] px-8 py-4 text-base font-medium uppercase tracking-wider text-[#050608] transition-opacity hover:opacity-90">
        SIGN IN TO GET THE COMPLETE {context === 'tool' ? 'TOOL' : 'PROTOCOL'} →
      </a>
    )
  }

  if (!whatsappVerified) {
    return (
      <a href={setup}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-medium text-white hover:border-white/40 transition-colors">
        Connect WhatsApp to receive it →
      </a>
    )
  }

  async function handleSend(retry = false) {
    if (activeRef.current || state === 'sent') return
    activeRef.current = true
    setState('sending')
    setMessage('')
    if (retry) setCanRetry(false)
    try {
      const { data: { session } } = await createBrowserClient().auth.getSession()
      if (!session?.user.id) throw new Error('Please sign in again to send this item.')
      const request = { slug, context, includeLink: true }
      const nextActionId = retry ? startNewDeliveryAction(request, session.user.id) : undefined
      const result = await requestWhatsAppDelivery(request, session.user.id, nextActionId)
      setState(result.deliveryStatus === 'accepted' ? 'sent' : 'check')
      setCanRetry(result.deliveryStatus === 'failed' || result.deliveryStatus === 'skipped')
      setMessage(deliveryStatusMessage(result))
    } catch (failure) {
      setState('check')
      setMessage(failure instanceof Error ? failure.message : 'Could not confirm sending. Check this request safely.')
    } finally {
      activeRef.current = false
    }
  }

  return (
    <div>
    <button type="button" onClick={() => void handleSend()} disabled={state === 'sending' || state === 'sent'} aria-busy={state === 'sending'}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFBA2E] px-8 py-4 text-base font-medium uppercase tracking-wider text-[#050608] transition-opacity hover:opacity-90 disabled:opacity-60">
      {state === 'idle' && 'SEND TO MY WHATSAPP →'}
      {state === 'sending' && 'Sending…'}
      {state === 'sent' && '✓ Message sent'}
      {state === 'check' && 'Check WhatsApp status →'}
    </button>
    <p className="mt-2 text-sm text-neutral-300" role="status" aria-live="polite">{message}</p>
    {canRetry ? <button type="button" onClick={() => void handleSend(true)} disabled={state === 'sending'} className="mt-2 min-h-11 text-sm text-white underline underline-offset-4">Try sending again</button> : null}
    </div>
  )
}

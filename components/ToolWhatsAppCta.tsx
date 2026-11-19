'use client'

import { useRef } from 'react'
import { SortedSaveButton } from '@/components/SortedSaveButton'
import { BUTTON_ORIGIN, requestButtonResource } from '@/lib/button/popup'

interface Props {
  slug: string
  returnPath?: string
  context?: 'article' | 'tool'
  compact?: boolean
}

/** Planet Sorted has no member session. The separate Button window handles it. */
export function ToolWhatsAppCta({ slug, context = 'tool', compact = false }: Props) {
  const action = useRef<string | null>(null)
  function send() {
    const key = `sorted-button-request:${context}:${slug}`
    if (!action.current) {
      try {
        const stored = JSON.parse(sessionStorage.getItem(key) ?? 'null') as { id?: string; expires?: number } | null
        if (stored?.id && /^[A-Za-z0-9_-]{16,100}$/.test(stored.id) && (stored.expires ?? 0) > Date.now()) action.current = stored.id
      } catch { /* Storage is optional. */ }
      action.current ??= crypto.randomUUID()
      try { sessionStorage.setItem(key, JSON.stringify({ id: action.current, expires: Date.now() + 30 * 60 * 1000 })) } catch {}
    }
    return requestButtonResource(slug, context, action.current)
  }
  return <SortedSaveButton onSave={send} compact={compact} copy={{ lead: context === 'article' ? 'Get this protocol with your Button account' : 'Get this tool with your Button account', trail: 'receive it on WhatsApp and keep it in your library' }} />
}

/** No unspecified content is sent by the general Button-account link. */
export function WhatsAppConnectionCta(_props: { returnPath?: string }) {
  return <SortedSaveButton href={`${BUTTON_ORIGIN}/account`} copy={{ lead: 'Open your Button account', trail: 'your links, tools and protocols' }} />
}

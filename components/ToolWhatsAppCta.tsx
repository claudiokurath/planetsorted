'use client'

import { useEffect, useState } from 'react'
import { SortedSaveButton } from '@/components/SortedSaveButton'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  slug: string
}

/**
 * The send control on a tool page: the SOR7ED mark, which resolves into a tick
 * once the tool is on its way to the visitor's chat.
 *
 * Auth is resolved in the browser on purpose. /tools/[slug] is a cacheable
 * public page, and reading the session on the server would make it per-user
 * dynamic for every visitor.
 *
 * Note for whoever picks this up: the v9 handoff's button has no sign-in gate,
 * and the master document records that gating public CTAs was what "silently
 * blocked most visitors from receiving anything". The gate is kept here only
 * because removing it is a behaviour decision, not a visual one.
 */
export function ToolWhatsAppCta({ slug }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [whatsappVerified, setWhatsappVerified] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      try {
        const supabase = createBrowserClient()
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token
        if (!token) return

        if (!cancelled) setIsLoggedIn(true)

        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return

        const profile = await res.json()
        if (!cancelled) setWhatsappVerified(Boolean(profile?.whatsapp_verified))
      } catch {
        // Leave the signed-out path in place — it is still a usable next step.
      }
    }

    resolve()
    return () => {
      cancelled = true
    }
  }, [])

  const ready = isLoggedIn && whatsappVerified

  async function send() {
    await fetch('/api/save-to-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, context: 'tool', includeLink: true }),
    })
  }

  // Everyone gets the same mark. Only what the click does changes: a visitor
  // who cannot receive anything yet is sent to sign up rather than being handed
  // a consolation text link, which is how the control ended up invisible to
  // precisely the people it exists to convert.
  if (!ready) {
    return (
      <SortedSaveButton
        href={
          isLoggedIn
            ? '/dashboard?tab=settings'
            : `/signup?next=${encodeURIComponent(`/tools/${slug}`)}`
        }
        copy={{
          lead: 'Get this sorted',
          trail: isLoggedIn ? 'connect WhatsApp' : 'sign up to receive',
        }}
      />
    )
  }

  return <SortedSaveButton onSave={send} />
}

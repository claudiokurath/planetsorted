'use client'

import { useEffect, useState } from 'react'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  slug: string
}

/**
 * Resolves the viewer's sign-in and WhatsApp state in the browser, then hands it
 * to SaveToPhoneButton.
 *
 * Deliberately client-side: /tools/[slug] is a cacheable public page, and
 * reading the session on the server would make it per-user dynamic for every
 * visitor. Until the profile lands we render the signed-out button, which is the
 * correct thing to show anyone who is not logged in anyway.
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
        // Leave the signed-out button in place — it still gives a usable path.
      }
    }

    resolve()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex justify-center border-t border-white/[0.12] pt-8">
      <SaveToPhoneButton
        slug={slug}
        context="tool"
        isLoggedIn={isLoggedIn}
        whatsappVerified={whatsappVerified}
      />
    </div>
  )
}

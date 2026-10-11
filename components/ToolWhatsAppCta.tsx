'use client'

import { useEffect, useState } from 'react'
import { SortedSaveButton } from '@/components/SortedSaveButton'
import { createBrowserClient } from '@/lib/supabase/client'
import { safeNext } from '@/lib/safeNext'

interface Props {
  slug: string
  returnPath?: string
  context?: 'article' | 'tool'
  compact?: boolean
}

type ConnectionStatus = 'checking' | 'signed-out' | 'connect' | 'ready' | 'opted-out'
type WhatsAppProfile = { whatsapp_verified?: boolean; whatsapp_opted_out?: boolean }

// Preview grids share concurrent profile reads, without retaining stale profile
// data after a member connects a number or changes their messaging preferences.
const profileRequests = new Map<string, Promise<WhatsAppProfile>>()

function readProfile(token: string): Promise<WhatsAppProfile> {
  const existing = profileRequests.get(token)
  if (existing) return existing
  const request = fetch('/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
  }).then(async response => {
    if (!response.ok) throw new Error('Could not check your connection.')
    return response.json() as Promise<WhatsAppProfile>
  }).finally(() => profileRequests.delete(token))
  profileRequests.set(token, request)
  return request
}

function useWhatsAppStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('checking')

  useEffect(() => {
    let cancelled = false
    let revision = 0
    const supabase = createBrowserClient()

    async function resolve(token?: string) {
      const current = ++revision
      if (!token) {
        setStatus('signed-out')
        return
      }
      setStatus('checking')
      try {
        const profile = await readProfile(token)
        if (cancelled || current !== revision) return
        setStatus(profile.whatsapp_opted_out ? 'opted-out' : profile.whatsapp_verified ? 'ready' : 'connect')
      } catch {
        // The server-backed connection page can check the session again.
        if (!cancelled && current === revision) setStatus('connect')
      }
    }

    // INITIAL_SESSION supplies the current session. Later sign-in/out events
    // update all previews without reloading or trusting a stale client flag.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void resolve(session?.access_token)
    })
    return () => {
      cancelled = true
      revision++
      subscription.unsubscribe()
    }
  }, [])

  return status
}

function connectPath(returnPath: string, slug?: string, context?: Props['context']): string {
  const params = new URLSearchParams({ next: safeNext(returnPath) })
  if (slug && context) {
    params.set('slug', slug)
    params.set('context', context)
  }
  return `/connect?${params}`
}

/** Auth is resolved in the browser so public content remains cacheable. */
export function ToolWhatsAppCta({ slug, returnPath, context = 'tool', compact = false }: Props) {
  const status = useWhatsAppStatus()
  const destination = returnPath ?? `/${context === 'article' ? 'intelligence' : 'tools'}/${slug}`
  const setup = connectPath(destination, slug, context)
  const lead = context === 'article' ? 'Get this protocol via WhatsApp' : 'Get this tool via WhatsApp'

  async function send() {
    const response = await fetch('/api/save-to-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, context, includeLink: true }),
    })
    if (!response.ok) throw new Error('Could not send to WhatsApp. Please try again.')
  }

  if (status === 'checking') {
    return <SortedSaveButton disabled compact={compact} copy={{ lead, trail: 'checking your connection' }} />
  }
  if (status !== 'ready') {
    return (
      <SortedSaveButton
        compact={compact}
        href={status === 'signed-out' ? `/signup?next=${encodeURIComponent(setup)}` : status === 'opted-out' ? '/dashboard?tab=settings' : setup}
        copy={{ lead, trail: status === 'signed-out' ? 'sign in to receive it' : status === 'opted-out' ? 'review messaging preferences' : 'connect WhatsApp once' }}
      />
    )
  }
  return <SortedSaveButton onSave={send} compact={compact} copy={{ lead, trail: 'tap the mark to receive it' }} />
}

/** General pages offer setup; they never claim to send an unspecified item. */
export function WhatsAppConnectionCta({ returnPath = '/' }: { returnPath?: string }) {
  const status = useWhatsAppStatus()
  const setup = connectPath(returnPath)
  return (
    <SortedSaveButton
      disabled={status === 'checking'}
      href={status === 'checking' ? undefined : status === 'signed-out' ? `/signup?next=${encodeURIComponent(setup)}` : status === 'ready' || status === 'opted-out' ? '/dashboard?tab=settings' : setup}
      copy={{
        lead: 'Get SOR7ED on WhatsApp',
        trail: status === 'checking' ? 'checking your connection' : status === 'ready' ? 'manage your connection' : status === 'opted-out' ? 'review messaging preferences' : 'connect your phone once',
      }}
    />
  )
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types/database'

interface ToolItem {
  slug: string
  title: string
  cover_image?: string | null
  read_time?: string | null
}

interface DashboardClientProps {
  tools?: ToolItem[]
}

type Tab = 'tools' | 'settings'

export function DashboardClient({ tools = [] }: DashboardClientProps = {}) {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(), [])

  const [activeTab, setActiveTab] = useState<Tab>('tools')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<User | null>(null)

  const [firstName, setFirstName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  const load = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (!s) {
      router.replace('/signup?next=/dashboard')
      return
    }
    setSession(s)
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${s.access_token}` },
      })
      if (res.ok) {
        const data: User = await res.json()
        setProfile(data)
        setFirstName(data.first_name || '')
      }
    } catch {
      /* non-fatal */
    }
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    load()
  }, [load])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setProfileSaving(true)
    setProfileMessage('')
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ firstName }),
      })
      setProfileMessage(res.ok ? 'Saved.' : 'Could not save just now.')
    } catch {
      setProfileMessage('Could not save just now.')
    }
    setProfileSaving(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return <p className="py-20 text-center text-neutral-500">Loading your account…</p>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bebas text-3xl uppercase tracking-normal text-white sm:text-4xl">Account</h1>
        <button
          onClick={signOut}
          className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-300 transition-colors hover:border-white/40 hover:text-white"
        >
          Sign out
        </button>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {(['tools', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
              activeTab === t ? 'border-b-2 border-[#F5C518] text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t === 'tools' ? 'Tools' : 'Settings'}
          </button>
        ))}
      </div>

      {activeTab === 'tools' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="rounded-lg border border-white/10 bg-black p-5 transition-colors hover:border-[#F5C518]/50"
            >
              <p className="font-bebas text-xl uppercase tracking-normal text-white">{tool.title}</p>
              {tool.read_time ? (
                <p className="mt-1 text-xs uppercase tracking-widest text-neutral-500">{tool.read_time}</p>
              ) : null}
            </Link>
          ))}
          {tools.length === 0 ? (
            <p className="text-sm text-neutral-500">No tools published yet.</p>
          ) : null}
        </div>
      ) : (
        <form onSubmit={saveProfile} className="max-w-md space-y-5">
          <div>
            <label htmlFor="first-name" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-neutral-400">
              First name
            </label>
            <input
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="min-h-12 w-full rounded-none border border-white/10 bg-black px-4 text-base text-white outline-none focus:border-[#F5C518]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-neutral-400">Email</label>
            <p className="text-sm text-neutral-300">{profile?.email || session?.user?.email}</p>
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-lg bg-[#F5C518] px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-black disabled:opacity-50"
          >
            {profileSaving ? 'Saving…' : 'Save'}
          </button>
          {profileMessage ? <p className="text-xs text-neutral-400">{profileMessage}</p> : null}
        </form>
      )}
    </div>
  )
}

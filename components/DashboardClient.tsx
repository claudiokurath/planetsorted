'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SavedItem, User } from '@/lib/types/database'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'

interface ToolItem {
  slug: string
  title: string
  summary?: string | null
  read_time?: string | null
}

interface DashboardClientProps {
  tools?: ToolItem[]
}

type Tab = 'tools' | 'library' | 'settings'
type VerifyState = 'unverified' | 'otp_sent' | 'verified'

export function DashboardClient({ tools = [] }: DashboardClientProps = {}) {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [activeTab, setActiveTab] = useState<Tab>('tools')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<User | null>(null)
  
  // Settings Form State
  const [firstName, setFirstName] = useState('')
  const [weeklyOptedIn, setWeeklyOptedIn] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  // WhatsApp Verification State
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [verifyState, setVerifyState] = useState<VerifyState>('unverified')
  const [whatsappError, setWhatsappError] = useState('')
  const [whatsappSuccess, setWhatsappSuccess] = useState('')
  const [whatsappLoading, setWhatsappLoading] = useState(false)

  // Saved Items State
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [libraryFilter, setLibraryFilter] = useState('')

  // GDPR Deletion State
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Initialize and check session
  useEffect(() => {
    async function initAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/signup')
        return
      }
      const { data: { session: activeSession } } = await supabase.auth.getSession()
      setSession(activeSession)
      await Promise.all([fetchProfile(activeSession), fetchSavedItems(activeSession)])
      setLoading(false)
    }
    
    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      if (!activeSession) {
        router.replace('/signup')
      } else {
        setSession(activeSession)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  async function getAuthHeader(activeSession = session) {
    return {
      'Authorization': `Bearer ${activeSession?.access_token || ''}`,
      'Content-Type': 'application/json'
    }
  }

  async function fetchProfile(activeSession = session) {
    try {
      const headers = await getAuthHeader(activeSession)
      const res = await fetch('/api/profile', { headers })
      if (!res.ok) throw new Error()
      const data: User = await res.json()
      setProfile(data)
      setFirstName(data.first_name || '')
      setWeeklyOptedIn(data.weekly_opted_in)
      setWhatsappNumber(data.whatsapp_number || '')
      setVerifyState(data.whatsapp_verified ? 'verified' : 'unverified')
    } catch {
      console.error('Failed to fetch profile')
    }
  }

  async function fetchSavedItems(activeSession = session) {
    setItemsLoading(true)
    try {
      const headers = await getAuthHeader(activeSession)
      const res = await fetch('/api/saved-items', { headers })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSavedItems(data)
    } catch {
      console.error('Failed to fetch saved items')
    } finally {
      setItemsLoading(false)
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage('')
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({ firstName, weeklyOptedIn })
      })
      if (!res.ok) throw new Error()
      const updated: User = await res.json()
      setProfile(updated)
      setProfileMessage('Settings saved successfully ✓')
    } catch {
      setProfileMessage('Failed to save settings. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setWhatsappLoading(true)
    setWhatsappError('')
    setWhatsappSuccess('')
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers,
        body: JSON.stringify({ whatsappNumber })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
      setVerifyState('otp_sent')
      setWhatsappSuccess('Verification code sent to WhatsApp! Check your phone.')
    } catch (err: any) {
      setWhatsappError(err.message || 'An unexpected error occurred.')
    } finally {
      setWhatsappLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setWhatsappLoading(true)
    setWhatsappError('')
    setWhatsappSuccess('')
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        headers,
        body: JSON.stringify({ otp })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setVerifyState('verified')
      setWhatsappSuccess('WhatsApp number successfully verified ✓')
      await fetchProfile()
    } catch (err: any) {
      setWhatsappError(err.message || 'Verification failed. Please check the code and try again.')
    } finally {
      setWhatsappLoading(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account?\n\nThis will permanently remove your library and settings. This operation is fully GDPR compliant and cannot be undone.'
    )
    if (!confirmed) return

    setDeletingAccount(true)
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers
      })
      if (!res.ok) throw new Error()
      
      await supabase.auth.signOut()
      router.replace('/signup?info=deleted')
    } catch {
      alert('Failed to delete account. Please try again.')
      setDeletingAccount(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/signup')
  }

  const filteredLibrary = savedItems.filter(item => 
    (item.title || '').toLowerCase().includes(libraryFilter.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(libraryFilter.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/80 px-6 py-4 shadow-xl backdrop-blur-xl">
          <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-sm font-medium text-gray-300">Loading your Sorted Lab...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Welcome Card */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-950 to-black shadow-2xl mb-10 min-h-[220px] sm:min-h-[260px] flex items-center p-6 sm:p-10">
        <div className="relative z-10 w-full flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-0.5 w-8 rounded-full bg-[#C0392B]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
                PLANET SOR7ED COMMAND
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white sm:text-4xl tracking-tight drop-shadow-md" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
              </h1>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-400 backdrop-blur-md">
                Member
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-300 font-mono drop-shadow">{session?.user?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 px-4 py-2 text-center backdrop-blur-md shadow-lg">
              <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Free Credits</span>
              <span className="text-base font-black text-emerald-400">5 Runs Available</span>
            </div>

            <button
              onClick={handleSignOut}
              className="rounded-full border border-neutral-800 bg-neutral-900/90 px-5 py-2.5 text-xs font-bold text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800 hover:text-white transition-all shadow-lg backdrop-blur-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <div className="mb-8 flex border-b border-gray-800/80 gap-6">
        <button
          onClick={() => setActiveTab('tools')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tools'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>⚡ Interactive Tools</span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
            {tools.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'library'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>📚 Saved Library</span>
          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-300">
            {savedItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          ⚙️ Account Settings
        </button>
      </div>

      {/* TAB 1: INTERACTIVE TOOLS HUB */}
      {activeTab === 'tools' && (
        <div className="space-y-8">
          {!tools || tools.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No interactive tools active right now.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {tools.map(tool => (
                <div
                  key={tool.slug}
                  className="glass-card glass-card-hover flex flex-col justify-between rounded-2xl p-6 relative group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-medium text-emerald-400 font-mono">{tool.read_time || ''}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {tool.title}
                    </h3>

                    <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                      {tool.summary || ''}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-gray-800/80 pt-4">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="glow-button rounded-xl px-3 py-2 text-center text-xs font-bold text-gray-950"
                    >
                      Run Tool
                    </Link>
                    <SaveToPhoneButton
                      slug={tool.slug}
                      context="tool"
                      isLoggedIn={Boolean(session)}
                      whatsappVerified={Boolean(profile?.whatsapp_verified)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Your Saved Library</h2>
              <p className="text-xs text-gray-400 mt-1">Articles, tools, and protocols saved from the web or WhatsApp.</p>
            </div>

            <input
              type="text"
              placeholder="Search library items..."
              value={libraryFilter}
              onChange={(e) => setLibraryFilter(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-gray-800 bg-gray-900/90 px-4 py-2 text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {itemsLoading ? (
            <div className="glass-card rounded-2xl p-12 text-center text-gray-400 text-sm">
              Loading your saved items...
            </div>
          ) : filteredLibrary.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-gray-400">
              <p className="text-base font-semibold text-gray-300 mb-2">Your library is currently empty</p>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Save articles and tool results right here on the web, or text <code className="bg-gray-950 px-1.5 py-0.5 rounded text-emerald-400 font-mono">SAVE [slug]</code> on WhatsApp to store items for later.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredLibrary.map((item) => (
                <div key={item.id} className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm hover:text-emerald-400 transition-colors mb-1">
                      {item.title || 'Saved Item'}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">{item.description}</p>
                    )}
                  </div>

                  <a
                    href={item.target_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline mt-2"
                  >
                    <span>Open Saved Protocol</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCOUNT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-10">
          {/* Profile Form */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800/80 pb-3">Profile Preferences</h2>
            
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-bold text-gray-300 mb-1.5">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Claudio"
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weeklyOptedIn}
                    onChange={(e) => setWeeklyOptedIn(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-800 bg-gray-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-200">Weekly Broadcast</span>
                    <span className="block text-[11px] text-gray-500 leading-normal mt-0.5">
                      Get one practical neurodivergent nudge on WhatsApp every Tuesday around 10am.
                    </span>
                  </div>
                </label>
              </div>

              {profileMessage && (
                <p className="text-xs font-medium text-emerald-400">{profileMessage}</p>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="glow-button rounded-xl px-6 py-2.5 text-xs font-bold text-gray-950 disabled:opacity-50"
              >
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* WhatsApp Verification Widget */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800/80 pb-3">WhatsApp Link</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Verify your WhatsApp number to enable direct Save-to-Phone capabilities from web tools and articles.
            </p>

            {verifyState === 'verified' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400 flex items-center justify-between">
                  <span>Linked Phone Number: <strong>+{profile?.whatsapp_number}</strong></span>
                  <span className="font-bold text-[10px] bg-emerald-500 text-gray-950 px-2 py-0.5 rounded-full uppercase">Verified</span>
                </div>
                <button
                  onClick={() => setVerifyState('unverified')}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  Change linked phone number
                </button>
              </div>
            )}

            {verifyState === 'unverified' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="whatsapp" className="block text-xs font-bold text-gray-300 mb-1.5">
                    WhatsApp Phone Number (Digits only, starting with country code)
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 447360277713"
                    className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Format: Country code + phone number (e.g. 44 for UK, 1 for US). No plus signs or spaces.
                  </p>
                </div>

                {whatsappError && <p className="text-xs text-red-400">{whatsappError}</p>}
                {whatsappSuccess && <p className="text-xs text-emerald-400">{whatsappSuccess}</p>}

                <button
                  type="submit"
                  disabled={whatsappLoading}
                  className="glow-button rounded-xl px-6 py-2.5 text-xs font-bold text-gray-950 disabled:opacity-50"
                >
                  {whatsappLoading ? 'Sending…' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {verifyState === 'otp_sent' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-xs font-bold text-gray-300 mb-1.5">
                    Enter Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                {whatsappError && <p className="text-xs text-red-400">{whatsappError}</p>}
                {whatsappSuccess && <p className="text-xs text-emerald-400">{whatsappSuccess}</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={whatsappLoading}
                    className="glow-button rounded-xl px-6 py-2.5 text-xs font-bold text-gray-950 disabled:opacity-50"
                  >
                    {whatsappLoading ? 'Verifying…' : 'Verify Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyState('unverified')
                      setWhatsappError('')
                      setWhatsappSuccess('')
                    }}
                    className="rounded-xl border border-gray-800 px-4 py-2.5 text-xs font-medium text-gray-400 hover:text-white"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Account Deletion */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 border-red-500/20">
            <h2 className="text-base font-bold text-red-400">Delete Account (GDPR)</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Permanently erase all saved articles, tool history, credits, and profiles. This operation cannot be reversed.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {deletingAccount ? 'Deleting Account…' : 'Permanently Delete My Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

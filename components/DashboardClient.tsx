'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SavedItem, User } from '@/lib/types/database'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'

interface ToolItem {
  slug: string
  title: string
  cover_image?: string | null
  read_time?: string | null
}

interface DashboardClientProps {
  tools?: ToolItem[]
}

type Tab = 'tools' | 'library' | 'settings'
type VerifyState = 'unverified' | 'otp_sent' | 'verified'

export function DashboardClient({ tools = [] }: DashboardClientProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createBrowserClient(), [])

  const initialTab = ((): Tab => {
    const tab = searchParams.get('tab')
    if (tab === 'tools' || tab === 'library' || tab === 'settings') return tab
    return 'tools'
  })()
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
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
  const [qrLink, setQrLink] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')

  // Saved Items State
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [libraryFilter, setLibraryFilter] = useState('')

  // GDPR Deletion State
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Billing / RUN credits
  const [billingPlan, setBillingPlan] = useState<string>('Free')
  const [billingUnlimited, setBillingUnlimited] = useState(false)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)

  const getAuthHeader = useCallback(async (activeSession = session) => {
    return {
      'Authorization': `Bearer ${activeSession?.access_token || ''}`,
      'Content-Type': 'application/json'
    }
  }, [session])

  const fetchProfile = useCallback(async (activeSession = session) => {
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
      return data
    } catch {
      console.error('Failed to fetch profile')
      return null
    }
  }, [getAuthHeader, session])

  const fetchSavedItems = useCallback(async (activeSession = session) => {
    setItemsLoading(true)
    try {
      const headers = await getAuthHeader(activeSession)
      const res = await fetch('/api/saved-items', { headers })
      if (!res.ok) throw new Error()
      const data: SavedItem[] = await res.json()
      setSavedItems(data)
    } catch {
      console.error('Failed to fetch saved items')
    } finally {
      setItemsLoading(false)
    }
  }, [getAuthHeader, session])

  const fetchBilling = useCallback(async (activeSession = session) => {
    try {
      const headers = await getAuthHeader(activeSession)
      const res = await fetch('/api/billing/status', { headers })
      if (!res.ok) throw new Error()
      const data = await res.json() as {
        plan?: string
        unlimited?: boolean
        balance?: number | null
      }
      setBillingPlan(data.plan || 'Free')
      setBillingUnlimited(Boolean(data.unlimited))
      setCreditBalance(typeof data.balance === 'number' ? data.balance : null)
    } catch {
      // Non-fatal — keep the static Free defaults
    }
  }, [getAuthHeader, session])

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
      const [profileData] = await Promise.all([
        fetchProfile(activeSession),
        fetchSavedItems(activeSession),
        fetchBilling(activeSession),
      ])
      // Honour an explicitly requested tab. WhatsApp is optional, so a new
      // member should land in the usable product instead of being diverted
      // into a second onboarding flow.
      const tabParam = new URLSearchParams(window.location.search).get('tab')
      const requestedTab =
        tabParam === 'tools' || tabParam === 'library' || tabParam === 'settings'
          ? tabParam
          : null
      if (requestedTab) {
        setActiveTab(requestedTab)
      }
      if (requestedTab === 'settings' && profileData && !profileData.whatsapp_verified) {
        handleGenerateQr(activeSession)
      }
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
    // Intentionally runs once on mount only. fetchProfile/fetchSavedItems are
    // recreated whenever `session` changes (which this effect itself sets),
    // so depending on their identity here re-triggers this effect forever —
    // that was the cause of the infinite /user request loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // While a QR/connect link is showing and not yet verified, poll for the
  // webhook having processed it — otherwise the UI just sits there looking
  // broken even after the user correctly taps Send in WhatsApp.
  useEffect(() => {
    if (!qrLink || verifyState === 'verified') return
    const interval = setInterval(async () => {
      const data = await fetchProfile()
      if (data?.whatsapp_verified) {
        setQrLink('')
        clearInterval(interval)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [qrLink, verifyState, fetchProfile])

  async function handleGenerateQr(activeSession = session) {
    setQrLoading(true)
    setQrError('')
    try {
      const headers = await getAuthHeader(activeSession)
      const res = await fetch('/api/whatsapp/connect-qr', { headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate QR code')
      setQrLink(data.waLink)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not generate a QR code right now.'
      setQrError(msg)
    } finally {
      setQrLoading(false)
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setWhatsappError(msg)
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please check the code and try again.'
      setWhatsappError(msg)
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
    (item.category || '').toLowerCase().includes(libraryFilter.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-none border border-gray-800 bg-black px-6 py-4 shadow-xl backdrop-blur-xl">
          <span className="h-3 w-3 rounded-full bg-[#C6A052] animate-ping" />
          <span className="text-sm font-medium text-gray-300">Loading your account...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Compact account header — matches PageHeader language site-wide */}
      <header className="mb-8 sm:mb-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="h-0.5 w-8 rounded-full bg-[#C6A052]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                PLANET SOR7ED
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className="font-bebas text-4xl uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
              </h1>
              <span className="rounded-full border border-[#C6A052]/30 bg-[#C6A052]/10 px-3 py-0.5 text-xs font-medium text-[#C6A052]">
                {billingUnlimited ? billingPlan : 'Member'}
              </span>
            </div>
            <p className="font-mono text-xs tracking-wide text-neutral-500">
              {session?.user?.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-black px-4 py-2.5 text-center">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                {billingUnlimited ? billingPlan : 'Free Credits'}
              </span>
              <span className="text-sm font-normal text-[#C6A052] sm:text-base">
                {billingUnlimited
                  ? 'Unlimited RUNs'
                  : creditBalance === null
                    ? '…'
                    : `${creditBalance} Run${creditBalance === 1 ? '' : 's'} Available`}
              </span>
              {!billingUnlimited && (
                <Link
                  href="/r/upgrade"
                  className="mt-1 block text-[10px] font-medium text-[#C6A052]/80 underline hover:text-[#C6A052]"
                >
                  Upgrade to Plus
                </Link>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="rounded-full border border-neutral-700 bg-black px-5 py-2.5 text-xs font-medium text-neutral-200 transition-all hover:border-neutral-500 hover:bg-neutral-800 hover:text-white active:scale-95"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Tabs */}
      <div className="mb-8 flex gap-6 overflow-x-auto border-b border-gray-800/80">
        <button
          onClick={() => setActiveTab('tools')}
          className={`pb-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tools'
              ? 'border-[#C6A052] text-[#C6A052]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>⚡ Interactive Tools</span>
          <span className="rounded-full bg-[#C6A052]/10 px-2 py-0.5 text-[10px] text-[#C6A052]">
            {tools.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`pb-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'library'
              ? 'border-[#C6A052] text-[#C6A052]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>📚 Saved Library</span>
          <span className="rounded-full bg-black px-2 py-0.5 text-[10px] text-gray-300">
            {savedItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-[#C6A052] text-[#C6A052]'
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map(tool => (
                <div key={tool.slug} className="group flex flex-col justify-between overflow-hidden rounded-none border border-white/[0.12] bg-black">
                  {tool.cover_image ? (
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <Image
                        src={tool.cover_image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div className="space-y-3">
                      {tool.read_time ? (
                        <span className="text-[10px] font-medium text-[#C6A052] font-mono">
                          {tool.read_time}
                        </span>
                      ) : null}

                      {/* Title only — no summary wall of text. Sized ~2× former card title. */}
                      <h3
                        className="font-bebas text-3xl sm:text-4xl uppercase tracking-tight text-white group-hover:text-[#C6A052] transition-colors leading-[1.05]"
                      >
                        {tool.title}
                      </h3>
                    </div>

                    <div className="mt-6 border-t border-gray-800/80 pt-5">
                      <SaveToPhoneButton
                        slug={tool.slug}
                        context="tool"
                        isLoggedIn={Boolean(session)}
                        whatsappVerified={Boolean(profile?.whatsapp_verified)}
                      />
                    </div>
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
              <h2 className="text-xl font-medium text-white">Your Saved Library</h2>
              <p className="text-xs text-gray-400 mt-1">Articles, tools, and protocols saved from the web or WhatsApp.</p>
            </div>

            <input
              type="text"
              placeholder="Search library items..."
              value={libraryFilter}
              onChange={(e) => setLibraryFilter(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-gray-800 bg-black px-4 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C6A052] focus:outline-none"
            />
          </div>

          {itemsLoading ? (
            <div className="glass-card rounded-none p-12 text-center text-gray-400 text-sm">
              Loading your saved items...
            </div>
          ) : filteredLibrary.length === 0 ? (
            <div className="glass-card rounded-none p-12 text-center text-gray-400">
              <p className="text-base font-medium text-gray-300 mb-2">Your library is currently empty</p>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Save articles and tool results right here on the web, or text <code className="bg-black px-1.5 py-0.5 rounded text-[#C6A052] font-mono">SAVE [slug]</code> on WhatsApp to store items for later.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredLibrary.map((item) => (
                <div key={item.id} className="glass-card glass-card-hover rounded-none p-5 sm:p-6 flex flex-col justify-between min-h-[140px]">
                  <div>
                    {item.category ? (
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[#C6A052]/80 mb-2">
                        {item.category}
                      </p>
                    ) : null}
                    <h3
                      className="font-bebas text-2xl sm:text-3xl uppercase leading-[1.05] text-white hover:text-[#C6A052] transition-colors"
                    >
                      {item.title || 'Saved Item'}
                    </h3>
                  </div>

                  <a
                    href={item.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C6A052] hover:underline mt-2"
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
          <div className="glass-card rounded-none p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-medium text-white border-b border-gray-800/80 pb-3">Profile Preferences</h2>
            
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-gray-300 mb-1.5">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Claudio"
                  className="w-full rounded-xl border border-gray-800 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#C6A052] focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weeklyOptedIn}
                    onChange={(e) => setWeeklyOptedIn(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-800 bg-black text-[#C6A052] focus:ring-[#C6A052]"
                  />
                  <div>
                    <span className="block text-xs font-medium text-gray-200">Weekly Broadcast</span>
                    <span className="block text-[11px] text-gray-500 leading-normal mt-0.5">
                      Get one practical neurodivergent nudge on WhatsApp every Tuesday around 10am.
                    </span>
                  </div>
                </label>
              </div>

              {profileMessage && (
                <p className="text-xs font-medium text-[#C6A052]">{profileMessage}</p>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="glow-button rounded-xl px-6 py-2.5 text-xs font-medium text-gray-950 disabled:opacity-50"
              >
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* WhatsApp Verification Widget */}
          <div className="glass-card rounded-none p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-medium text-white border-b border-gray-800/80 pb-3">WhatsApp Link</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Verify your WhatsApp number to enable direct Save-to-Phone capabilities from web tools and articles.
            </p>

            {verifyState === 'verified' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#C6A052]/30 bg-[#C6A052]/10 px-4 py-3 text-xs text-[#C6A052] flex items-center justify-between">
                  <span>Linked Phone Number: <strong>+{profile?.whatsapp_number}</strong></span>
                  <span className="font-medium text-[10px] bg-[#C6A052] text-gray-950 px-2 py-0.5 rounded-full uppercase">Verified</span>
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
                  <label htmlFor="whatsapp" className="block text-xs font-medium text-gray-300 mb-1.5">
                    WhatsApp Phone Number (Digits only, starting with country code)
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 447591922247"
                    className="w-full rounded-xl border border-gray-800 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#C6A052] focus:outline-none font-mono"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Format: Country code + phone number (e.g. 44 for UK, 1 for US). No plus signs or spaces.
                  </p>
                </div>

                {whatsappError && <p className="text-xs text-red-400">{whatsappError}</p>}
                {whatsappSuccess && <p className="text-xs text-[#C6A052]">{whatsappSuccess}</p>}

                <button
                  type="submit"
                  disabled={whatsappLoading}
                  className="glow-button rounded-xl px-6 py-2.5 text-xs font-medium text-gray-950 disabled:opacity-50"
                >
                  {whatsappLoading ? 'Sending…' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {verifyState === 'unverified' && (
              <div className="mt-6 space-y-3 border-t border-gray-800 pt-6">
                <p className="text-xs font-medium text-gray-300">Or scan to connect instantly</p>
                <p className="text-[11px] text-gray-500">
                  Skips typing a number entirely — scan with your phone (or tap the link
                  on mobile). WhatsApp will open with a message already typed in, but{' '}
                  <strong className="text-gray-300">you still have to tap Send inside WhatsApp</strong>{' '}
                  — it doesn&apos;t send itself. That message is what proves it&apos;s really your number.
                </p>
                {!qrLink && (
                  <button
                    type="button"
                    onClick={() => handleGenerateQr()}
                    disabled={qrLoading}
                    className="rounded-xl border border-gray-700 px-4 py-2 text-xs font-medium text-gray-300 hover:border-[#C6A052] hover:text-[#C6A052] transition-colors disabled:opacity-50"
                  >
                    {qrLoading ? 'Generating…' : 'Generate QR Code'}
                  </button>
                )}
                {qrError && <p className="text-xs text-red-400">{qrError}</p>}
                {qrLink && (
                  <div className="flex flex-col items-start gap-3 rounded-xl border border-gray-800 bg-black p-4">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrLink)}`}
                      alt="Scan to connect WhatsApp"
                      width={180}
                      height={180}
                      unoptimized
                      className="rounded-lg bg-white p-2"
                    />
                    <a
                      href={qrLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#C6A052] underline"
                    >
                      Or tap here to open WhatsApp directly →
                    </a>
                    <p className="text-xs font-medium text-amber-400">↑ Remember to tap Send in WhatsApp — it won&apos;t connect until you do.</p>
                    <p className="text-[11px] text-gray-500">Expires in 10 minutes.</p>
                  </div>
                )}
              </div>
            )}

            {verifyState === 'otp_sent' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-xs font-medium text-gray-300 mb-1.5">
                    Enter Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className="w-full rounded-xl border border-gray-800 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#C6A052] focus:outline-none font-mono"
                  />
                </div>

                {whatsappError && <p className="text-xs text-red-400">{whatsappError}</p>}
                {whatsappSuccess && <p className="text-xs text-[#C6A052]">{whatsappSuccess}</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={whatsappLoading}
                    className="glow-button rounded-xl px-6 py-2.5 text-xs font-medium text-gray-950 disabled:opacity-50"
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
          <div className="glass-card rounded-none p-6 sm:p-8 space-y-4 border-red-500/20">
            <h2 className="text-base font-medium text-red-400">Delete Account (GDPR)</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Permanently erase all saved articles, tool history, credits, and profiles. This operation cannot be reversed.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {deletingAccount ? 'Deleting Account…' : 'Permanently Delete My Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

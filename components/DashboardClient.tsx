'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SavedItem, User } from '@/lib/types/database'

type Tab = 'overview' | 'settings'
type VerifyState = 'unverified' | 'otp_sent' | 'verified'

export function DashboardClient() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
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

  // GDPR Deletion State
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Initialize and check session
  useEffect(() => {
    async function initAuth() {
      const { data: { session: activeSession } } = await supabase.auth.getSession()
      if (!activeSession) {
        router.replace('/signup')
        return
      }
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
      await fetchProfile() // reload state
    } catch (err: any) {
      setWhatsappError(err.message || 'Verification failed. Please check the code and try again.')
    } finally {
      setWhatsappLoading(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you absolutely sure you want to delete your account?\n\nThis will permanently delete your library, settings, tool history, credits, and all other data associated with your profile. This cannot be undone.'
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
      
      // Force logout and redirect
      await supabase.auth.signOut()
      router.replace('/signup?info=deleted')
    } catch {
      alert('Failed to delete account. Please contact support or try again.')
      setDeletingAccount(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/signup')
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading your Sorted Lab...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
          </h1>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="self-start rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs Nav */}
      <div className="mb-8 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Account Settings
        </button>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-gray-900">My Saved Library</h2>
            {itemsLoading ? (
              <p className="text-sm text-gray-500">Loading library items...</p>
            ) : savedItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                <p className="mb-2">Your library is currently empty.</p>
                <p className="text-sm text-gray-400">
                  Text SAVE [slug] on WhatsApp to save articles, templates, or tool results here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {savedItems.map((item) => (
                  <li key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <a
                      href={item.target_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 hover:underline">
                            {item.title || 'Saved Item'}
                          </h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                          )}
                        </div>
                        {item.type && (
                          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 capitalize">
                            {item.type}
                          </span>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-2 font-bold text-gray-900">WhatsApp Remote Control</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Saved items are pushed straight to your phone so you don&apos;t have to hunt for URLs on low-energy days.
              </p>
              {verifyState === 'verified' ? (
                <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 font-medium">
                  <span>✓ Phone linked: +{profile?.whatsapp_number}</span>
                </div>
              ) : (
                <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-2">
                  <span className="font-semibold">⚠️ WhatsApp Not Connected</span>
                  <span>Link your number in Settings to enable direct Save-to-Phone functionality.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-12">
          {/* General Profile Settings */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Profile Settings</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Robin"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weeklyOptedIn}
                    onChange={(e) => setWeeklyOptedIn(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-800">Weekly Broadcast</span>
                    <span className="block text-xs text-gray-500 leading-normal">
                      Every Tuesday around 10am, get one practical neurodivergent nudge on WhatsApp. (No spam, opt-out anytime).
                    </span>
                  </div>
                </label>
              </div>

              {profileMessage && (
                <p className="text-sm font-medium text-green-600">{profileMessage}</p>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* WhatsApp Verification */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="mb-2 text-xl font-bold text-gray-900">WhatsApp Link</h2>
            <p className="mb-4 text-sm text-gray-500 leading-relaxed">
              Verify your WhatsApp number to enable direct save functions on articles and tool result pages.
            </p>

            {verifyState === 'verified' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center justify-between">
                  <span>Linked number: <strong>+{profile?.whatsapp_number}</strong></span>
                  <span className="font-semibold text-xs bg-green-200 text-green-900 px-2 py-0.5 rounded-full uppercase">Verified</span>
                </div>
                <button
                  onClick={() => setVerifyState('unverified')}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Change linked phone number
                </button>
              </div>
            )}

            {verifyState === 'unverified' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 447360277713 (include country code, no spaces or +)"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Always format in E.164: start with country code, digits only (e.g. 44 for UK, 1 for US).
                  </p>
                </div>

                {whatsappError && <p className="text-sm text-red-600">{whatsappError}</p>}
                {whatsappSuccess && <p className="text-sm text-green-600">{whatsappSuccess}</p>}

                <button
                  type="submit"
                  disabled={whatsappLoading}
                  className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                >
                  {whatsappLoading ? 'Sending…' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {verifyState === 'otp_sent' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-1">
                    Enter Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>

                {whatsappError && <p className="text-sm text-red-600">{whatsappError}</p>}
                {whatsappSuccess && <p className="text-sm text-green-600">{whatsappSuccess}</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={whatsappLoading}
                    className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
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
                    className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* GDPR Account Deletion */}
          <section className="border-t border-red-100 pt-8">
            <h2 className="mb-2 text-xl font-bold text-red-600">Delete Account</h2>
            <p className="mb-4 text-sm text-gray-500 leading-relaxed">
              This will instantly and permanently erase all saved articles, tool history, credits, and linked profiles. This operation is fully GDPR compliant and cannot be reversed.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deletingAccount ? 'Deleting Account…' : 'Permanently Delete My Account'}
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

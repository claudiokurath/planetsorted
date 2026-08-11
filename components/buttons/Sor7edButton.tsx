'use client'

import { useCallback, useState } from 'react'

interface Sor7edButtonProps {
  href: string
  label?: string
  /** 'page' = inline CTA on a page; 'article' = end-of-article CTA */
  context?: 'page' | 'article'
  /** 'md' = default, 'lg' = larger for prominent CTAs */
  size?: 'md' | 'lg'
  /** Optional slug for tool/article access */
  slug?: string
}

export function Sor7edButton({ href, label = 'SOR7ED', context = 'page', size = 'md', slug }: Sor7edButtonProps) {
  const [pressed, setPressed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [phone, setPhone] = useState('')
  const [sentSuccess, setSentSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const extractSlug = useCallback(() => {
    if (slug) return slug
    const clean = href.replace(/^\/(tools|intelligence|r)\//, '').replace(/^\//, '')
    return clean || 'adhd-tax-calculator'
  }, [href, slug])

  const sendToWhatsApp = useCallback(
    async (targetPhone?: string) => {
      setLoading(true)
      setErrorMessage('')
      try {
        const itemSlug = extractSlug()
        const res = await fetch('/api/send-protocol-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: itemSlug, phone: targetPhone }),
        })
        const data = await res.json()

        if (res.ok && data.success) {
          setSentSuccess(true)
          setShowModal(false)
        } else if (res.status === 400 && data.error === 'Phone number required') {
          setShowModal(true)
        } else {
          setErrorMessage(data.error || 'Failed to send WhatsApp message.')
          setShowModal(true)
        }
      } catch {
        setErrorMessage('Network error. Please try again.')
        setShowModal(true)
      } finally {
        setLoading(false)
      }
    },
    [extractSlug]
  )

  const handlePress = useCallback(() => {
    setPressed(true)
    setTimeout(() => setPressed(false), 200)
    sendToWhatsApp()
  }, [sendToWhatsApp])

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    sendToWhatsApp(phone.trim())
  }

  return (
    <div className={`flex flex-col items-start gap-3 ${context === 'article' ? 'mt-8' : ''}`}>
      <div className="relative inline-flex">
        <button
          onClick={handlePress}
          disabled={loading}
          className="sor7ed-btn group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#C0392B] font-black text-white shadow-[0_0_32px_rgba(192,57,43,0.35)] transition-all duration-200 select-none disabled:opacity-50"
          style={{
            background: sentSuccess
              ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
              : 'linear-gradient(135deg, #C0392B 0%, #96281B 100%)',
            borderColor: sentSuccess ? '#10B981' : '#C0392B',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: size === 'lg' ? '1.35rem' : '1.1rem',
            letterSpacing: '0.18em',
            padding: size === 'lg' ? '1rem 2.5rem' : '1rem 2rem',
            transform: pressed ? 'scale(0.96)' : 'scale(1)',
          }}
          aria-label={label}
        >
          <span className="relative z-10 tracking-[0.18em]">
            {loading ? 'SENDING…' : sentSuccess ? '✓ LINK SENT TO YOUR WHATSAPP' : label}
          </span>
        </button>
      </div>

      {sentSuccess && (
        <p className="text-xs font-semibold text-emerald-400">
          ✓ Check your WhatsApp! The link was sent directly to your phone.
        </p>
      )}

      {/* WhatsApp Phone Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📲</span>
                <h3 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Send Link to WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Enter your WhatsApp phone number below. Our business WhatsApp will automatically send the direct link to your phone.
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+44 7123 456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-black px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-[#C0392B]"
                  required
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-red-400 font-semibold">{errorMessage}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-full border border-neutral-800 py-3 text-xs font-bold text-neutral-400 hover:bg-neutral-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-[#C0392B] py-3 text-xs font-bold text-white hover:bg-[#a93226] transition disabled:opacity-50"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.1em' }}
                >
                  {loading ? 'SENDING…' : 'SEND TO MY WHATSAPP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

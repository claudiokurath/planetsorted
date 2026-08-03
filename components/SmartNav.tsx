'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { isStandaloneToolRoute } from '@/lib/isStandaloneToolRoute'

export function SmartNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userInitial, setUserInitial] = useState<string | null>(null)

  useEffect(() => {
    async function checkUser() {
      try {
        const supabase = createBrowserClient()
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          const email = data.user.email ?? ''
          const name = data.user.user_metadata?.first_name || data.user.user_metadata?.name || email
          if (name) {
            setUserInitial(name.charAt(0).toUpperCase())
          }
        }
      } catch {
        // Fallback for unauthenticated or client error
      }
    }
    checkUser()
  }, [])

  if (isStandaloneToolRoute(pathname)) return null

  const navLinks = [
    { label: 'About', href: '/about' },
    { label: 'Guidebook', href: '/intelligence' },
    { label: 'Toolbox', href: '/tools' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 backdrop-blur-md bg-[#1A1A1A]/95 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
        {/* Wordmark logo with brand 7 */}
        <Link href="/" className="text-2xl font-black uppercase tracking-wider text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Planet SOR7ED
        </Link>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors pb-1 ${
                  isActive
                    ? 'text-white border-b-2 border-[#C0392B]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {userInitial ? (
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full bg-[#C0392B] text-white flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-700 transition-colors"
              title="Account"
            >
              {userInitial}
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className={`text-sm font-semibold uppercase tracking-wider transition-colors pb-1 ${
                pathname === '/dashboard' ? 'text-white border-b-2 border-[#C0392B]' : 'text-white/70 hover:text-white'
              }`}
            >
              Account
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-3 md:hidden">
          {userInitial && (
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full bg-[#C0392B] text-white flex items-center justify-center text-sm font-bold shadow-md"
              title="Account"
            >
              {userInitial}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-neutral-300 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <div className="space-y-1.5 w-6">
              <span className={`block h-0.5 bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-[#1A1A1A] px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-bold uppercase tracking-wider text-white hover:text-[#C0392B] py-2"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-bold uppercase tracking-wider text-white hover:text-[#C0392B] py-2 border-t border-neutral-800 pt-3"
          >
            Account
          </Link>
        </div>
      )}
    </header>
  )
}

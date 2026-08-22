'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createBrowserClient } from '@/lib/supabase/client'
import { isStandaloneToolRoute } from '@/lib/isStandaloneToolRoute'

export function SmartNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (isStandaloneToolRoute(pathname)) return null

  const navLinks = [
    { label: 'Guidebook', href: '/intelligence' },
    { label: 'Toolbox', href: '/tools' },
    { label: 'About', href: '/about' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-900 bg-black/95 text-white backdrop-blur-md">
      {/* Mobile: logo-only bar — primary nav lives in the bottom tab bar */}
      <nav aria-label="Primary navigation" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:hidden">
        <Link href="/" aria-label="PLANET SOR7ED home" className="flex items-center">
          <Image
            src="/images/sor7ed-logo.png"
            alt="SOR7ED"
            width={1600}
            height={402}
            priority
            className="h-5 w-auto"
          />
        </Link>
        {authReady && !user && (
          <Link
            href="/signup"
            className="text-[11px] font-bold uppercase tracking-wider text-[#F5C518]"
          >
            Sign In
          </Link>
        )}
      </nav>

      {/* Desktop: full top nav */}
      <nav aria-label="Primary navigation" className="mx-auto hidden max-w-7xl items-center justify-between gap-8 px-6 py-3 md:flex lg:px-8">
        <Link href="/" aria-label="PLANET SOR7ED home" className="flex shrink-0 items-center">
          <Image
            src="/images/sor7ed-logo.png"
            alt="SOR7ED"
            width={1600}
            height={402}
            priority
            className="h-6 w-auto lg:h-7"
          />
        </Link>

        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-0.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'border-b-2 border-[#F5C518] text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {authReady && (
            user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`pb-0.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    pathname === '/dashboard'
                      ? 'border-b-2 border-[#F5C518] text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="pb-0.5 text-xs font-semibold uppercase tracking-wider text-white/50 transition-colors hover:text-[#F5C518]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/signup"
                className={`pb-0.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  pathname === '/signup'
                    ? 'border-b-2 border-[#F5C518] text-white'
                    : 'text-[#F5C518] hover:text-white'
                }`}
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  )
}

'use client'

import { BrandLogo } from '@/components/BrandLogo'
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
    { label: 'Home', href: '/' },
    { label: 'Toolbox', href: '/tools' },
    { label: 'Guidebook', href: '/intelligence' },
    { label: 'About', href: '/about' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/90 text-white backdrop-blur-xl">
      {/* Mobile: logo-only bar — primary nav lives in the bottom tab bar */}
      <nav aria-label="Primary navigation" className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5 md:hidden">
        <Link href="/" aria-label="PLANET SOR7ED home" className="col-start-2 flex min-h-11 items-center">
          <BrandLogo className="h-7 w-auto" />
        </Link>
        {authReady && !user && (
          <Link
            href={`/signup?mode=returning&next=${encodeURIComponent(pathname || '/')}`}
            className="inline-flex min-h-11 items-center justify-self-end px-2 text-xs font-medium uppercase tracking-[0.16em] text-[#FFD400]"
          >
            Sign In
          </Link>
        )}
      </nav>

      {/* Desktop: full top nav */}
      <nav aria-label="Primary navigation" className="mx-auto hidden max-w-7xl flex-col items-center justify-center gap-2 px-6 py-2 md:flex lg:px-8">
        <Link href="/" aria-label="PLANET SOR7ED home" className="flex min-h-11 shrink-0 items-center">
          <BrandLogo className="h-8 w-auto lg:h-10" />
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center pb-0.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? 'border-b-2 border-[#FFD400] text-white'
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
                  aria-current={pathname === '/dashboard' ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center pb-0.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                    pathname === '/dashboard'
                      ? 'border-b-2 border-[#FFD400] text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex min-h-11 items-center pb-0.5 text-xs font-medium uppercase tracking-[0.12em] text-white/70 transition-colors hover:text-[#FFD400]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href={`/signup?mode=returning&next=${encodeURIComponent(pathname || '/')}`}
                aria-current={pathname === '/signup' ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center pb-0.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                  pathname === '/signup'
                    ? 'border-b-2 border-[#FFD400] text-white'
                    : 'text-[#FFD400] hover:text-white'
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

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
    { label: 'About', href: '/about' },
    { label: 'Guidebook', href: '/intelligence' },
    { label: 'Toolbox', href: '/tools' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-900 bg-black text-white">
      <nav aria-label="Primary navigation" className="mx-auto flex max-w-7xl flex-col items-center">
        <Link href="/" aria-label="PLANET SOR7ED home" className="flex w-full justify-center px-4 py-2.5">
          <Image
            src="/images/sor7ed-logo.png"
            alt="SOR7ED"
            width={1600}
            height={402}
            priority
            className="h-6 w-auto sm:h-7"
          />
        </Link>

        <div className="flex w-full items-center justify-center gap-6 border-t border-neutral-900 px-4 py-2 sm:gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-1 text-[11px] font-semibold uppercase tracking-wider transition-colors sm:text-xs ${
                  isActive
                    ? 'text-white border-b-2 border-[#C0392B]'
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
                  className={`pb-1 text-[11px] font-semibold uppercase tracking-wider transition-colors sm:text-xs ${
                    pathname === '/dashboard'
                      ? 'text-white border-b-2 border-[#C0392B]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/50 hover:text-[#C0392B] transition-colors sm:text-xs"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/signup"
                className={`pb-1 text-[11px] font-semibold uppercase tracking-wider transition-colors sm:text-xs ${
                  pathname === '/signup'
                    ? 'text-white border-b-2 border-[#C0392B]'
                    : 'text-[#C0392B] hover:text-white'
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


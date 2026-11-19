'use client'

import { BrandLogo } from '@/components/BrandLogo'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createBrowserClient } from '@/lib/supabase/client'
import { isStandaloneToolRoute } from '@/lib/isStandaloneToolRoute'
import './SmartNav.css'

export function SmartNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const menuRef = useRef<HTMLDetailsElement>(null)
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
    { label: 'Guidebooks', href: '/guidebooks' },
    { label: 'About', href: '/about' },
  ]

  const closeMenu = () => menuRef.current?.removeAttribute('open')

  return (
    <header className="sorted-menu-header">
      <Link href="/" aria-label="Sorted home" className="sorted-menu-brand"><BrandLogo className="h-8 w-auto" /></Link>
      <details ref={menuRef} className="sorted-menu" onKeyDown={event => {
        if (event.key === 'Escape') {
          closeMenu()
          menuRef.current?.querySelector('summary')?.focus()
        }
      }}>
        <summary aria-label="Navigation menu"><svg width="22" height="18" viewBox="0 0 22 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M1 2h20M1 9h20M1 16h20" /></svg><span>Menu</span></summary>
        <nav aria-label="Primary navigation" className="sorted-menu-links">
          {navLinks.map(link => <Link key={link.href} href={link.href} onClick={closeMenu} aria-current={pathname === link.href || pathname?.startsWith(`${link.href}/`) ? 'page' : undefined}>{link.label}</Link>)}
          {authReady && (user ? <>
            <Link href="/dashboard" onClick={closeMenu}>Your account</Link>
            <button type="button" onClick={() => { closeMenu(); void handleSignOut() }}>Sign out</button>
          </> : <Link href={`/signup?next=${encodeURIComponent(pathname || '/tools')}`} onClick={closeMenu}>Sign in / Create account</Link>)}
        </nav>
      </details>
    </header>
  )
}

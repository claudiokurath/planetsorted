'use client'

import { BrandLogo } from '@/components/BrandLogo'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { isStandaloneToolRoute } from '@/lib/isStandaloneToolRoute'
import './SmartNav.css'

export function SmartNav() {
  const pathname = usePathname()
  const menuRef = useRef<HTMLDetailsElement>(null)

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

        </nav>
      </details>
    </header>
  )
}

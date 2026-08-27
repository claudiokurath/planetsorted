'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isStandaloneToolRoute } from '@/lib/isStandaloneToolRoute'

const TABS = [
  {
    href: '/',
    label: 'Home',
    match: (p: string) => p === '/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
      </svg>
    ),
  },
  {
    href: '/tools',
    label: 'Toolbox',
    match: (p: string) => p === '/tools' || p.startsWith('/tools/'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5z" />
      </svg>
    ),
  },
  {
    href: '/intelligence',
    label: 'Guide',
    match: (p: string) => p === '/intelligence' || p.startsWith('/intelligence/'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Account',
    match: (p: string) => p === '/dashboard' || p.startsWith('/dashboard'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="8" r="3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
      </svg>
    ),
  },
] as const

/**
 * Phone-only bottom tab bar. Hidden from `md` and up where SmartNav
 * keeps the full top link row.
 */
export function MobileNav() {
  const pathname = usePathname() || '/'

  if (isStandaloneToolRoute(pathname)) return null

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-800/90 bg-black backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-lg items-stretch">
        {TABS.map((tab) => {
          const active = tab.match(pathname)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                active
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-200'
              }`}
            >
              <span className={active ? 'text-[#1FD7CF]' : 'text-current'}>{tab.icon}</span>
              <span className={active ? 'text-white' : undefined}>{tab.label}</span>
              <span
                className={`mt-0.5 h-0.5 w-5 rounded-full transition-colors ${
                  active ? 'bg-[#1FD7CF]' : 'bg-transparent'
                }`}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/intelligence', label: 'Guidebook', icon: '📖' },
  { href: '/tools', label: 'Toolbox', icon: '🔧' },
  { href: '/dashboard', label: 'Account', icon: '👤' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-neutral-950/95 backdrop-blur border-t border-neutral-800 flex sm:hidden">
      {TABS.map((tab) => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[11px] font-semibold transition-colors ${
              active ? 'text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isStandaloneToolRoute } from '@/lib/isStandaloneToolRoute'

export function SiteFooter() {
  const pathname = usePathname()

  if (isStandaloneToolRoute(pathname)) return null

  return (
    <footer className="mb-20 border-t border-white/10 bg-black text-neutral-400 md:mb-0 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-3 text-xs">
        <p>© {new Date().getFullYear()} SOR7ED LIMITED</p>
        <nav aria-label="Legal and contact" className="flex flex-wrap gap-x-5">
          {[
            ['/contact', 'Contact'],
            ['/privacy', 'Privacy'],
            ['/terms', 'Terms'],
            ['/cookies', 'Cookies'],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isStandaloneToolRoute } from '@/lib/isStandaloneToolRoute'

export function SiteFooter() {
  const pathname = usePathname()

  if (isStandaloneToolRoute(pathname)) return null

  return (
    <footer className="border-t border-neutral-800 bg-[#0A0A0A] py-12 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3 pb-8 border-b border-neutral-800">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <h3 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Planet SOR7ED
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              Practical tools and protocols for neurodivergent adults. No app. No spam. Just what works.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-2">
            <ul className="space-y-1.5 text-sm text-neutral-300">
              <li><Link href="/intelligence" className="hover:text-white transition-colors">Guidebook</Link></li>
              <li><Link href="/tools" className="hover:text-white transition-colors">Toolbox</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal & Safety */}
          <div className="space-y-2">
            <ul className="space-y-1.5 text-sm text-neutral-300">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="pt-6 text-center space-y-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Planet Sorted Limited (trading as Planet SOR7ED). All rights reserved.
          </p>
          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            Planet SOR7ED provides educational tools and protocols. Not medical, clinical, legal, or financial advice. Not a crisis service. In immediate danger: call 999. To talk now: text SHOUT to 85258.
          </p>
        </div>
      </div>
    </footer>
  )
}

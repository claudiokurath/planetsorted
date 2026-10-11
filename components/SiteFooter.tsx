'use client'

import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'
import { usePathname } from 'next/navigation'
import { isStandaloneToolRoute } from '@/lib/isStandaloneToolRoute'
import { CATEGORY_LIST } from '@/lib/categoryStyles'

export function SiteFooter() {
  const pathname = usePathname()

  if (isStandaloneToolRoute(pathname)) return null

  if (pathname === '/') {
    return (
      <footer className="border-t border-white/10 px-6 py-5 pb-24 text-sm text-neutral-300 md:pb-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SOR7ED LIMITED</p>
          <nav aria-label="Help and legal information" className="flex flex-wrap gap-x-5">
            <Link href="/about" className="inline-flex min-h-11 items-center hover:text-white">About</Link>
            <Link href="/faq" className="inline-flex min-h-11 items-center hover:text-white">FAQ</Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center hover:text-white">Contact</Link>
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-white">Privacy</Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-white">Terms</Link>
            <Link href="/cookies" className="inline-flex min-h-11 items-center hover:text-white">Cookies</Link>
          </nav>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-white/10 bg-black py-12 text-white pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 pb-8 border-b border-white/10 md:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="col-span-2 space-y-3 md:col-span-1">
            <BrandLogo className="h-8 w-auto" />
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#FFBA2E]">
              worry less, live more.
            </p>
            <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
              Practical tools and protocols for neurodivergent adults. No app. No spam. One next step.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <nav aria-label="Explore SOR7ED" className="space-y-2">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">Explore</p>
            <ul className="space-y-1.5 text-sm text-neutral-300">
              <li><Link href="/" className="inline-flex min-h-11 items-center hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/tools" className="inline-flex min-h-11 items-center hover:text-white transition-colors">Toolbox</Link></li>
              <li><Link href="/intelligence" className="inline-flex min-h-11 items-center hover:text-white transition-colors">Guidebook</Link></li>
              <li><Link href="/membership" className="inline-flex min-h-11 items-center hover:text-white transition-colors">Membership</Link></li>
              <li><Link href="/about" className="inline-flex min-h-11 items-center hover:text-white transition-colors">About</Link></li>
              <li><Link href="/faq" className="inline-flex min-h-11 items-center hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="inline-flex min-h-11 items-center hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </nav>


          {/* Column 3: Categories */}
          <nav aria-label="Content categories" className="space-y-2">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">Topics</p>
            <ul className="space-y-1.5 text-sm text-neutral-300">
              {CATEGORY_LIST.map((category) => (
                <li key={category.slug}>
                  <Link href={`/category/${category.slug}`} className="inline-flex min-h-11 items-center hover:text-white transition-colors">
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Legal & Safety */}
          <nav aria-label="Legal information" className="col-span-2 space-y-2 md:col-span-1">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">Legal</p>
            <ul className="flex flex-wrap gap-x-5 text-sm text-neutral-300 md:block md:space-y-1.5">
              <li><Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="inline-flex min-h-11 items-center hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="inline-flex min-h-11 items-center hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </nav>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="pt-6 text-center space-y-2">
          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} SOR7ED LIMITED (trading as SOR7ED). All rights reserved.
          </p>
          <p className="text-sm leading-relaxed text-neutral-400 max-w-xl mx-auto">
            SOR7ED provides educational tools and protocols. Not medical, clinical, legal, or financial advice. Not a crisis service. In immediate danger: call 999. To talk now: text SHOUT to 85258.
          </p>
        </div>
      </div>
    </footer>
  )
}

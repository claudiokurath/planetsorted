'use client'

import { usePathname } from 'next/navigation'
import { ToolWhatsAppCta, WhatsAppConnectionCta } from '@/components/ToolWhatsAppCta'
import { STANDALONE_ROUTES } from '@/lib/standaloneRoutes'

export function SitewideSortedButton() {
  const pathname = usePathname() || '/'
  if (pathname === '/embed/sor7ed-button') return null
  const content = pathname.match(/^\/(tools|intelligence|embed)\/([^/]+)\/?$/)
  const standaloneSlug = Object.entries(STANDALONE_ROUTES).find(([, route]) => route === pathname.replace(/\/$/, ''))?.[0]
  const slug = content?.[2] || standaloneSlug
  return (
    <aside className="sorted-sitewide-save print:hidden" aria-label="Continue with SOR7ED on WhatsApp">
      {slug ? <ToolWhatsAppCta slug={slug} returnPath={pathname} context={content?.[1] === 'intelligence' ? 'article' : 'tool'} /> : (
        <WhatsAppConnectionCta returnPath={pathname} />
      )}
    </aside>
  )
}

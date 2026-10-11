'use client'

import { usePathname } from 'next/navigation'
import { ToolWhatsAppCta } from '@/components/ToolWhatsAppCta'
import { SortedSaveButton } from '@/components/SortedSaveButton'

export function SitewideSortedButton() {
  const pathname = usePathname() || '/'
  const content = pathname.match(/^\/(tools|intelligence|embed)\/([^/]+)\/?$/)
  const standalone = pathname.match(/^\/(?:standalone\/)?(adhd-tax-calculator|biometric-state-tracker|brain-dump-sorter|decision-paralysis-solver|financial-autopilot|weekly-wins|task-breakdown-wizard)\/?$/)
  const slug = content?.[2] || standalone?.[1]
  return (
    <aside className="sorted-sitewide-save print:hidden" aria-label="Continue with SOR7ED on WhatsApp">
      {slug ? <ToolWhatsAppCta slug={slug} returnPath={pathname} context={content?.[1] === 'intelligence' ? 'article' : 'tool'} /> : (
        <SortedSaveButton href="/dashboard?tab=settings" copy={{ lead: 'Get SOR7ED on WhatsApp', trail: 'connect your phone' }} />
      )}
    </aside>
  )
}

import { INTERACTIVE_TOOL_ROUTES } from '@/lib/standaloneRoutes'
import { ArrowIcon } from '@/components/ArrowIcon'
import Link from 'next/link'
import { getCategoryStyle } from '@/lib/categoryStyles'
import { ToolWhatsAppCta } from '@/components/ToolWhatsAppCta'
import './ContentCard.css'

interface ContentCardProps {
  href: string
  title: string
  summary?: string
  category?: string | null
  layout?: 'card' | 'row'
}

export function ContentCard({ href, title, summary, category, layout = 'card' }: ContentCardProps) {
  const categoryStyle = getCategoryStyle(category)
  const description = summary?.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/^#{1,6}\s+/gm, '').replace(/\*\*/g, '').replace(/^OVERVIEW\s*/i, '').trim().split(/\n\s*\n/)[0]
  const item = href.match(/^\/(tools|guidebooks)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)
  const heading = <h3 className="sorted-preview-title font-bebas">{title}</h3>

  if (layout === 'row' && item?.[1] === 'guidebooks') return (
    <article className="sorted-guide-row">
      <Link href={href}>
        <div>{categoryStyle ? <span className="sorted-guide-category">{categoryStyle.label}</span> : null}<h3>{title}</h3>{description ? <p>{description}</p> : null}</div>
        <span className="sorted-guide-arrow"><ArrowIcon /></span>
      </Link>
      <div className="sorted-preview-action print:hidden"><ToolWhatsAppCta slug={item[2]} context="article" returnPath={href} compact /></div>
    </article>
  )

  return (
    <article className="sorted-preview-card">
      <Link href={href} aria-label={title} className="sorted-preview-link">
        <div className="sorted-preview-heading-plain">{heading}</div>
        {(categoryStyle || description) ? (
          <div className="sorted-preview-description">
            {categoryStyle ? <span className="sorted-preview-category">{categoryStyle.label}</span> : null}
            {description ? <p>{description}</p> : null}
          </div>
        ) : null}
      </Link>
      {item ? (
        <div className="sorted-preview-action print:hidden">
          {item[1] === 'tools' && INTERACTIVE_TOOL_ROUTES[item[2]] ? <Link href={INTERACTIVE_TOOL_ROUTES[item[2]]} className="mb-3 inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#FFD400] px-5 py-3 font-bebas text-xl uppercase text-black">Use tool <span aria-hidden="true">→</span></Link> : null}
          <ToolWhatsAppCta slug={item[2]} context={item[1] === 'guidebooks' ? 'article' : 'tool'} returnPath={href} compact />
        </div>
      ) : null}
    </article>
  )
}

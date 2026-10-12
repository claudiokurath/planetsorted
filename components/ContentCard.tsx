import Image from 'next/image'
import Link from 'next/link'
import { getCategoryStyle } from '@/lib/categoryStyles'
import { ToolWhatsAppCta } from '@/components/ToolWhatsAppCta'
import './ContentCard.css'

interface ContentCardProps {
  href: string
  title: string
  summary?: string
  coverImage?: string | null
  category?: string | null
  compact?: boolean
  showCover?: boolean
}

export function ContentCard({ href, title, summary, category, coverImage, showCover = true }: ContentCardProps) {
  const categoryStyle = getCategoryStyle(category)
  const description = summary?.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/^#{1,6}\s+/gm, '').replace(/\*\*/g, '').replace(/^OVERVIEW\s*/i, '').trim().split(/\n\s*\n/)[0]
  const cover = showCover && coverImage ? coverImage : null
  const item = href.match(/^\/(tools|intelligence)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)
  const heading = <h3 className="sorted-preview-title font-bebas">{title}</h3>

  return (
    <article className="sorted-preview-card">
      <Link href={href} aria-label={title} className="sorted-preview-link">
        {showCover ? (
          <div className="sorted-preview-image">
            <Image
              src={cover || '/images/tangle-white.png'}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={cover ? 'sorted-preview-cover' : 'sorted-preview-fallback'}
              unoptimized={Boolean(cover && !cover.startsWith('/') && !cover.startsWith('https://wyxvbzbqbznqjftbgcxc.supabase.co/'))}
            />
            <div className="sorted-preview-heading">{heading}</div>
          </div>
        ) : <div className="sorted-preview-heading-plain">{heading}</div>}
        {(categoryStyle || description) ? (
          <div className="sorted-preview-description">
            {categoryStyle ? <span className="sorted-preview-category">{categoryStyle.label}</span> : null}
            {description ? <p>{description}</p> : null}
          </div>
        ) : null}
      </Link>
      {item ? (
        <div className="sorted-preview-action print:hidden">
          <ToolWhatsAppCta slug={item[2]} context={item[1] === 'intelligence' ? 'article' : 'tool'} returnPath={href} compact />
        </div>
      ) : null}
    </article>
  )
}

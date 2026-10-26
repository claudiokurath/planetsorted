import { ArrowIcon } from '@/components/ArrowIcon'
import Image from 'next/image'
import Link from 'next/link'
import { PREVIEW_COVERS } from '@/lib/content/previewCovers'
import { getCategoryStyle } from '@/lib/categoryStyles'
import { ToolWhatsAppCta } from '@/components/ToolWhatsAppCta'
import './ContentCard.css'

interface ContentCardProps {
  href: string
  title: string
  summary?: string
  coverImage?: string | null
  category?: string | null
  layout?: 'card' | 'row'
  compact?: boolean
  showCover?: boolean
}

export function ContentCard({ href, title, summary, category, coverImage, showCover = true, layout = 'card' }: ContentCardProps) {
  const categoryStyle = getCategoryStyle(category)
  const description = summary?.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/^#{1,6}\s+/gm, '').replace(/\*\*/g, '').replace(/^OVERVIEW\s*/i, '').trim().split(/\n\s*\n/)[0]
  const item = href.match(/^\/(tools|intelligence)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)
  const artworkPreview = item?.[1] === 'tools'
  const cover = showCover ? coverImage || (artworkPreview ? PREVIEW_COVERS[item[2]] : null) : null
  const titleSize = title.length > 80 ? 'extra-long' : title.length > 44 ? 'long' : 'standard'
  const heading = <h3 className="sorted-preview-title font-bebas">{title}</h3>

  if (layout === 'row' && item?.[1] === 'intelligence') return (
    <article className="sorted-guide-row">
      <Link href={href}>
        <div className="sorted-guide-thumb"><Image src={cover || '/images/tangle-white.png'} alt="" fill sizes="112px" className={cover ? 'sorted-preview-cover' : 'sorted-preview-fallback'} unoptimized={Boolean(cover && !cover.startsWith('/') && !cover.startsWith('https://wyxvbzbqbznqjftbgcxc.supabase.co/'))} /></div>
        <div>{categoryStyle ? <span className="sorted-guide-category">{categoryStyle.label}</span> : null}<h3>{title}</h3>{description ? <p>{description}</p> : null}</div>
        <span className="sorted-guide-arrow"><ArrowIcon /></span>
      </Link>
      <div className="sorted-preview-action print:hidden"><ToolWhatsAppCta slug={item[2]} context="article" returnPath={href} compact /></div>
    </article>
  )

  return (
    <article className="sorted-preview-card" data-preview-style={artworkPreview ? 'artwork' : undefined} data-title-size={artworkPreview ? titleSize : undefined}>
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

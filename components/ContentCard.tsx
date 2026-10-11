import Image from 'next/image'
import Link from 'next/link'
import { getCategoryStyle } from '@/lib/categoryStyles'
import { ToolWhatsAppCta } from '@/components/ToolWhatsAppCta'

interface ContentCardProps {
  href: string
  title: string
  summary?: string
  coverImage?: string | null
  meta?: string
  category?: string | null
  compact?: boolean
  index?: number
  showCover?: boolean
}

export function ContentCard({ href, title, summary, meta, category, index, coverImage, showCover = true }: ContentCardProps) {
  const categoryStyle = getCategoryStyle(category)
  const rail = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null
  const description = summary?.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/^#{1,6}\s+/gm, '').replace(/\*\*/g, '').replace(/^OVERVIEW\s*/i, '').trim().split(/\n\s*\n/)[0]
  const cover = showCover && coverImage ? coverImage : null
  const item = href.match(/^\/(tools|intelligence)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden border border-white/15 bg-black">
      <Link href={href} aria-label={title} className="group flex min-w-0 flex-1 flex-col transition-colors hover:bg-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FFBA2E]">
        {showCover ? (
          <div className="relative aspect-square w-full shrink-0 bg-neutral-950">
            {cover ? <Image src={cover} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain" unoptimized={!cover.startsWith('/') && !cover.startsWith('https://wyxvbzbqbznqjftbgcxc.supabase.co/')} /> : null}
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
          <div className="flex h-5 items-center justify-between gap-3 text-sm">
            {categoryStyle ? <span className="truncate font-medium text-[#FFBA2E]">{categoryStyle.label}</span> : <span />}
            {rail ? <span className="font-mono text-neutral-400">{rail}</span> : null}
          </div>
          <h3 title={title} style={{ lineHeight: 1.2 }} className="font-bebas line-clamp-2 h-[2.4em] shrink-0 text-[2rem] uppercase tracking-[-0.015em] text-white transition-colors group-hover:text-[#FFBA2E]">{title}</h3>
          <p style={{ lineHeight: 1.625 }} className="line-clamp-3 h-[4.875em] shrink-0 text-base text-neutral-300">{description || ''}</p>
          <p className={`mt-auto h-9 pt-3 text-sm text-neutral-400${meta ? ' border-t border-white/10' : ''}`}>{meta || ''}</p>
        </div>
      </Link>
      {item ? (
        <div className="mt-auto px-5 pb-5 print:hidden sm:px-6 sm:pb-6">
          <ToolWhatsAppCta slug={item[2]} context={item[1] === 'intelligence' ? 'article' : 'tool'} returnPath={href} compact />
        </div>
      ) : null}
    </article>
  )
}

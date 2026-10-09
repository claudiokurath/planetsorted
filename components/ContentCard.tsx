import Image from 'next/image'
import Link from 'next/link'
import { getCategoryStyle } from '@/lib/categoryStyles'

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

export function ContentCard({ href, title, summary, meta, category, compact = false, index, coverImage, showCover = !compact }: ContentCardProps) {
  const categoryStyle = getCategoryStyle(category)
  const rail = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null
  const description = summary?.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/^#{1,6}\s+/gm, '').replace(/\*\*/g, '').replace(/^OVERVIEW\s*/i, '').trim().split(/\n\s*\n/)[0]
  const cover = showCover && coverImage ? coverImage : null

  return (
    <Link href={href} className="group flex h-full min-w-0 flex-col overflow-hidden border border-white/15 bg-black transition-colors hover:border-[#F5C518] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C518]">
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        {(categoryStyle || rail) ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            {categoryStyle ? <span className="font-medium text-[#F5C518]">{categoryStyle.label}</span> : null}
            {rail ? <span className="font-mono text-neutral-400">{rail}</span> : null}
          </div>
        ) : null}
        <h3 className={`font-bebas uppercase leading-[1.2] text-white transition-colors group-hover:text-[#F5C518] ${compact ? 'text-2xl' : 'text-3xl sm:min-h-[2.4em]'}`}>{title}</h3>
      </div>
      {cover ? (
        <div className="relative aspect-square w-full shrink-0 bg-neutral-950">
          <Image src={cover} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain" unoptimized={!cover.startsWith('/') && !cover.startsWith('https://wyxvbzbqbznqjftbgcxc.supabase.co/')} />
        </div>
      ) : null}
      {(summary || meta) ? (
        <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
          {description ? <p className="line-clamp-4 text-base leading-relaxed text-neutral-300">{description}</p> : null}
          {meta ? <p className="mt-auto border-t border-white/10 pt-4 text-sm text-neutral-400">{meta}</p> : null}
        </div>
      ) : null}
    </Link>
  )
}

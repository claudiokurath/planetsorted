import Link from 'next/link'
import Image from 'next/image'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ContentCardProps {
  href: string
  title: string
  /** Kept optional for call-site compat; no longer rendered on cards. */
  summary?: string
  coverImage?: string | null
  meta?: string
  category?: string | null
  compact?: boolean
}

export function ContentCard({
  href,
  title,
  coverImage,
  meta,
  category,
  compact = false,
}: ContentCardProps) {
  const style = getCategoryStyle(category)

  return (
    <Link
      href={href}
      className="group flex flex-col h-full w-full overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{ backgroundColor: '#0f0f0f' }}
    >
      {coverImage && (
        <div className={`relative w-full flex-shrink-0 overflow-hidden bg-[#222222] ${compact ? 'aspect-[2/1]' : 'aspect-video'}`}>
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className={`flex flex-1 flex-col justify-between ${compact ? 'gap-3 p-4' : 'gap-5 p-6'}`}>
        <div className="flex flex-col flex-1">
          {style && (
            <div>
              <span className={`${compact ? 'mb-2' : 'mb-3'} inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-300`}>
                {style.label}
                {style.tagline && (
                  <span className="ml-1 font-normal normal-case text-neutral-400">
                    • {style.tagline}
                  </span>
                )}
              </span>
            </div>
          )}
          {/* Title only — no summary blurb. Sized ~2× the previous card title. */}
          <h3
            className={`font-bebas ${compact ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl lg:text-5xl'} font-black uppercase leading-[1.05] text-white group-hover:text-[#F5C518] transition-colors line-clamp-3`}
          >
            {title}
          </h3>
        </div>
        {meta && (
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} font-semibold uppercase tracking-widest text-neutral-400 pt-3 border-t border-white/10`}>
            {meta}
          </p>
        )}
      </div>
    </Link>
  )
}

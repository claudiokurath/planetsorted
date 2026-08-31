import Link from 'next/link'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ContentCardProps {
  href: string
  title: string
  /** Kept optional for call-site compatibility; cards are title-led — no cover images. */
  summary?: string
  coverImage?: string | null
  meta?: string
  category?: string | null
  compact?: boolean
}

export function ContentCard({
  href,
  title,
  summary,
  meta,
  category,
  compact = false,
}: ContentCardProps) {
  const style = getCategoryStyle(category)

  return (
    <Link
      href={href}
      className="group relative flex min-h-[168px] h-full w-full flex-col overflow-hidden rounded-none border border-white/[0.12] bg-black transition-all duration-300 hover:-translate-y-1 hover:border-[#F5C518]/35 hover:shadow-none"
    >
      <div className={`flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-6 ${compact ? 'sm:min-h-52' : 'sm:min-h-72 sm:gap-5 lg:p-7'}`}>
        <div className="flex flex-col flex-1">
          {style && (
            <div>
              <span className={`${compact ? 'sm:mb-2' : 'sm:mb-3'} inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-neutral-300 sm:px-2.5 sm:text-xs`}>
                {style.label}
                {style.tagline && (
                  <span className="ml-1 hidden font-normal normal-case text-neutral-400 md:inline">
                    • {style.tagline}
                  </span>
                )}
              </span>
            </div>
          )}
          {/* Title only — no summary blurb. Sized ~2× the previous card title. */}
          <h3
            className={`font-bebas ${compact ? 'text-[1.75rem] sm:text-4xl' : 'text-[1.75rem] sm:text-4xl lg:text-5xl'} mt-4 line-clamp-3 uppercase leading-[1.15] text-white transition-colors group-hover:text-[#F5C518] sm:mt-8`}
          >
            {title}
          </h3>
          {summary ? (
            <p className="mt-2 line-clamp-2 text-[11px] leading-[1.45] text-neutral-400 sm:mt-4 sm:text-sm sm:leading-relaxed">
              {summary}
            </p>
          ) : null}
        </div>
        {meta && (
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} hidden border-t border-white/10 pt-3 font-medium uppercase tracking-widest text-neutral-400 sm:block`}>
            {meta}
          </p>
        )}
      </div>
    </Link>
  )
}

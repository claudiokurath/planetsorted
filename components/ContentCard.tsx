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
  /** Deck-style number rail ("01", "02"…). Omit in compact/dashboard surfaces. */
  index?: number
}

export function ContentCard({
  href,
  title,
  summary,
  meta,
  category,
  compact = false,
  index,
}: ContentCardProps) {
  const style = getCategoryStyle(category)
  const rail = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null

  return (
    <Link
      href={href}
      className="group relative flex min-h-[168px] h-full w-full flex-col overflow-hidden rounded-none border border-white/[0.12] bg-black transition-all duration-300 hover:-translate-y-1 hover:border-[#F5C518] hover:shadow-none before:absolute before:left-0 before:top-0 before:h-[2px] before:w-full before:origin-left before:scale-x-0 before:bg-[#F5C518] before:transition-transform before:duration-300 group-hover:before:scale-x-100"
    >
      {/* Deck-style number rail — system string, yellow on hover */}
      {rail && (
        <span className="absolute left-4 top-4 font-mono text-[11px] font-medium tracking-widest text-neutral-600 transition-colors group-hover:text-[#F5C518] sm:left-5 sm:top-5">
          {rail}
        </span>
      )}

      <div className={`flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-6 ${compact ? 'sm:min-h-52' : 'sm:min-h-72 sm:gap-5 lg:p-7'}`}>
        <div className="flex flex-col flex-1">
          {style && (
            <div className={compact ? undefined : 'pl-7 sm:pl-8'}>
              {/* sor7ed-pill treatment — yellow hairline, not the grey bubble */}
              <span className={`inline-flex items-center rounded-full border border-[#F5C518]/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#F5C518] ${compact ? '' : 'sm:mb-3'}`}>
                {style.label}
                {style.tagline && (
                  <span className="ml-1.5 hidden font-normal normal-case tracking-normal text-neutral-500 md:inline">
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
          <p className={`${compact ? 'text-[11px]' : 'text-[11px]'} hidden border-t border-white/10 pt-3 font-mono font-medium uppercase tracking-widest text-neutral-500 sm:block`}>
            {meta}
          </p>
        )}
      </div>
    </Link>
  )
}

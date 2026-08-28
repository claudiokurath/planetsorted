import Link from 'next/link'
import Image from 'next/image'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ContentCardProps {
  href: string
  title: string
  /** Kept optional for call-site compatibility; cards remain title-led. */
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
  coverImage,
  meta,
  category,
  compact = false,
}: ContentCardProps) {
  const style = getCategoryStyle(category)

  return (
    <Link
      href={href}
      className="group relative flex min-h-[168px] h-full w-full flex-row overflow-hidden rounded-2xl border border-white/[0.12] bg-black transition-all duration-300 hover:-translate-y-1 hover:border-[#1FD7CF]/35 hover:shadow-[0_22px_70px_rgba(31,215,207,0.08)] sm:min-h-0 sm:flex-col"
    >
      <span
        className="absolute inset-x-0 top-0 h-[2px] opacity-80"
        style={{ background: 'linear-gradient(90deg, #1FD7CF, #5095FF 55%, #856CFF)' }}
        aria-hidden
      />
      {coverImage ? (
        <div className={`relative min-h-[168px] w-[38%] flex-shrink-0 overflow-hidden bg-black sm:min-h-0 sm:w-full ${compact ? 'sm:aspect-[2/1]' : 'sm:aspect-video'}`}>
          <Image
            src={coverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 38vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        </div>
      ) : null}
      <div className={`flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-6 ${compact ? 'sm:min-h-52' : `${coverImage ? 'sm:min-h-64' : 'sm:min-h-72'} sm:gap-5 lg:p-7`}`}>
        <div className="flex flex-col flex-1">
          {style && (
            <div>
              <span className={`${compact ? 'sm:mb-2' : 'sm:mb-3'} inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-neutral-300 sm:px-2.5 sm:text-xs`}>
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
            className={`font-bebas ${compact ? 'text-[2.15rem] sm:text-5xl' : 'text-[2.15rem] sm:text-6xl lg:text-7xl'} mt-4 line-clamp-3 font-black uppercase leading-[0.9] text-white transition-colors group-hover:text-[#1FD7CF] sm:mt-8`}
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
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} hidden border-t border-white/10 pt-3 font-semibold uppercase tracking-widest text-neutral-400 sm:block`}>
            {meta}
          </p>
        )}
      </div>
    </Link>
  )
}

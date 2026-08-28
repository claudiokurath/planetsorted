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
  coverImage,
  meta,
  category,
  compact = false,
}: ContentCardProps) {
  const style = getCategoryStyle(category)

  return (
    <Link
      href={href}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-black transition-all duration-300 hover:-translate-y-1 hover:border-[#1FD7CF]/35 hover:shadow-[0_22px_70px_rgba(31,215,207,0.08)]"
    >
      <span
        className="absolute inset-x-0 top-0 h-[2px] opacity-80"
        style={{ background: 'linear-gradient(90deg, #1FD7CF, #5095FF 55%, #856CFF)' }}
        aria-hidden
      />
      {coverImage ? (
        <div className={`relative w-full flex-shrink-0 overflow-hidden bg-black ${compact ? 'aspect-[2/1]' : 'aspect-video'}`}>
          <Image
            src={coverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        </div>
      ) : null}
      <div className={`flex flex-1 flex-col justify-between ${compact ? 'min-h-52 gap-3 p-5' : `${coverImage ? 'min-h-64' : 'min-h-72'} gap-5 p-7`}`}>
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
            className={`font-bebas ${compact ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl lg:text-5xl'} mt-8 line-clamp-3 font-black uppercase leading-[1.05] text-white transition-colors group-hover:text-[#1FD7CF]`}
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

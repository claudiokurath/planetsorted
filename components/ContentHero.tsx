import Link from 'next/link'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ContentHeroProps {
  title: string
  description?: string | null
  category?: string | null
  meta?: string | null
  /** When true: no image, no card chrome — clean editorial header aligned with article body */
  articleMode?: boolean
}

export function ContentHero({ title, description, category, meta, articleMode = false }: ContentHeroProps) {
  const categoryStyle = getCategoryStyle(category)

  if (articleMode) {
    return (
      <header className="mx-auto max-w-4xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {categoryStyle ? (
            <Link
              href={`/category/${categoryStyle.slug}`}
              className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${categoryStyle.className}`}
            >
              {categoryStyle.label}
              {categoryStyle.tagline && (
                <span className="ml-1 font-normal normal-case text-neutral-400">
                  • {categoryStyle.tagline}
                </span>
              )}
            </Link>
          ) : (
            <div className="h-1 w-12 rounded-full bg-[#1FD7CF]" />
          )}

          <h1
            className="font-bebas text-5xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {title}
          </h1>

          {description && (
            <p className="max-w-2xl text-base font-medium leading-relaxed text-neutral-400 sm:text-lg">
              {description}
            </p>
          )}

          {meta && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              {meta}
            </p>
          )}
        </div>
      </header>
    )
  }

  // Compact text-led tool/content header — deliberately image-free.
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#090b0f] p-7 sm:p-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 88% 12%, rgba(80,149,255,0.14), transparent 34%), radial-gradient(circle at 72% 90%, rgba(133,108,255,0.09), transparent 38%)',
        }}
      >
        <span
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, #1FD7CF, #5095FF 55%, #856CFF)' }}
          aria-hidden
        />
        <div className="relative space-y-3">
        {categoryStyle ? (
          <Link
            href={`/category/${categoryStyle.slug}`}
            className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${categoryStyle.className}`}
          >
            {categoryStyle.label}
            {categoryStyle.tagline && (
              <span className="ml-1 font-normal normal-case text-neutral-400">
                • {categoryStyle.tagline}
              </span>
            )}
          </Link>
        ) : (
          <div className="h-1 w-12 rounded-full bg-[#1FD7CF]" />
        )}

        <h1
          className="font-bebas text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          {title}
        </h1>

        {description && (
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-neutral-400 sm:text-base">
            {description}
          </p>
        )}

        {meta && (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
            {meta}
          </p>
        )}
        </div>
      </div>
    </section>
  )
}

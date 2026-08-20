import Image from 'next/image'
import Link from 'next/link'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ContentHeroProps {
  title: string
  description?: string | null
  coverImage?: string | null
  category?: string | null
  meta?: string | null
  /** When true: no image, no card chrome — clean editorial header aligned with article body */
  articleMode?: boolean
}

export function ContentHero({ title, description, coverImage, category, meta, articleMode = false }: ContentHeroProps) {
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
            <div className="h-1 w-12 rounded-full bg-[#F5C518]" />
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

  // Compact tool/content header — same language as PageHeader, optional cover strip
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      {coverImage ? (
        <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950 sm:aspect-[3/1]">
          <Image
            src={coverImage}
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ) : null}

      <div className="space-y-3">
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
          <div className="h-1 w-12 rounded-full bg-[#F5C518]" />
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
    </section>
  )
}

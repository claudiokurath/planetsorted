import Link from 'next/link'
import Image from 'next/image'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ContentHeroProps {
  title: string
  description?: string | null
  category?: string | null
  meta?: string | null
  coverImage?: string | null
  /** When true: no image, no card chrome — clean editorial header aligned with article body */
  articleMode?: boolean
}

export function ContentHero({ title, description, category, meta, coverImage, articleMode = false }: ContentHeroProps) {
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

  // Gamma-style tool header: the same pure-black framed system used by articles.
  return (
    <section className="px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/[0.12] bg-black"
      >
        {coverImage ? (
          <div className="relative aspect-[16/8] w-full overflow-hidden sm:aspect-[16/7]">
            <Image
              src={coverImage}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </div>
        ) : null}

        <div className="px-6 pb-10 pt-8 sm:px-10 sm:pb-14 lg:px-14">
          <div className="relative h-8 w-36">
            <Image
              src="/images/sor7ed-logo-white.png"
              alt="SOR7ED"
              fill
              className="object-contain object-left"
            />
          </div>

          <div className="mt-8">
            {categoryStyle ? (
              <Link
                href={`/category/${categoryStyle.slug}`}
                className="text-xs font-bold uppercase tracking-[0.14em] text-[#1FD7CF] transition-opacity hover:opacity-80"
              >
                {categoryStyle.label}
              </Link>
            ) : (
              <div className="h-1 w-12 rounded-full bg-[#1FD7CF]" />
            )}
          </div>

          <h1
            className="font-bebas mt-4 max-w-4xl bg-gradient-to-r from-[#856CFF] via-[#5095FF] to-[#1FD7CF] bg-clip-text text-4xl font-black uppercase leading-[0.95] tracking-tight text-transparent sm:text-6xl lg:text-7xl"
          >
            {title}
          </h1>

          {description && (
            <p className="mt-8 max-w-3xl text-base leading-8 text-neutral-300 sm:text-lg">
              {description}
            </p>
          )}

          {meta && (
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              {meta}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

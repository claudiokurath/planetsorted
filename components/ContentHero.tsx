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
        {coverImage ? (
          <div className="relative mb-8 aspect-[16/7] w-full overflow-hidden border border-white/10">
            <Image
              src={coverImage}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover grayscale contrast-125 brightness-[0.82]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
            <div className="absolute inset-0 mix-blend-overlay opacity-[0.12] [background-image:repeating-linear-gradient(0deg,#fff_0,#fff_1px,transparent_1px,transparent_3px)]" />
          </div>
        ) : null}
        <div className="space-y-4">
          {categoryStyle ? (
            <Link
              href={`/category/${categoryStyle.slug}`}
              className={`inline-block rounded-full px-3.5 py-1 text-xs font-medium uppercase tracking-wider transition-opacity hover:opacity-80 ${categoryStyle.className}`}
            >
              {categoryStyle.label}
              {categoryStyle.tagline && (
                <span className="ml-1 font-normal normal-case text-neutral-400">
                  • {categoryStyle.tagline}
                </span>
              )}
            </Link>
          ) : (
            <div className="h-1 w-12 rounded-full bg-[#C6A052]" />
          )}

          <h1
            className="font-bebas text-7xl font-extralight uppercase leading-[0.86] tracking-normal text-white sm:text-8xl lg:text-9xl"
          >
            {title}
          </h1>

          {description && (
            <p className="max-w-2xl text-base font-medium leading-relaxed text-neutral-400 sm:text-lg">
              {description}
            </p>
          )}

          {meta && (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
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
        className="relative mx-auto max-w-5xl overflow-hidden rounded-none border border-white/[0.12] bg-black"
      >
        {coverImage ? (
          <div className="relative aspect-[16/6] w-full overflow-hidden sm:aspect-[16/7]">
            <Image
              src={coverImage}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover grayscale contrast-125 brightness-[0.82]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/25" />
            <div className="absolute inset-0 mix-blend-overlay opacity-[0.12] [background-image:repeating-linear-gradient(0deg,#fff_0,#fff_1px,transparent_1px,transparent_3px)]" />
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
                className="text-xs font-medium uppercase tracking-[0.14em] text-[#C6A052] transition-opacity hover:opacity-80"
              >
                {categoryStyle.label}
              </Link>
            ) : (
              <div className="h-1 w-12 rounded-full bg-[#C6A052]" />
            )}
          </div>

          <h1
            className="font-bebas mt-4 max-w-4xl text-7xl font-extralight uppercase leading-[0.84] tracking-normal text-[#F2F2F2] sm:text-8xl lg:text-9xl"
          >
            {title}
          </h1>

          {description && (
            <p className="mt-8 max-w-3xl text-base leading-8 text-neutral-300 sm:text-lg">
              {description}
            </p>
          )}

          {meta && (
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
              {meta}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

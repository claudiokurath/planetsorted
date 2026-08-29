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
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-col items-center gap-5 text-center">
          {categoryStyle ? (
            <Link href={`/category/${categoryStyle.slug}`} className="sor7ed-pill transition-opacity hover:opacity-80">
              {categoryStyle.label}
            </Link>
          ) : null}

          <h1
            className="font-bebas text-5xl uppercase leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl"
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
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-5 px-6 pb-12 pt-10 text-center sm:px-10 sm:pb-16 lg:px-14">
          <div className="relative h-7 w-32">
            <Image
              src="/images/sor7ed-logo-white.png"
              alt="SOR7ED"
              fill
              className="object-contain"
            />
          </div>

          {categoryStyle ? (
            <Link href={`/category/${categoryStyle.slug}`} className="sor7ed-pill transition-opacity hover:opacity-80">
              {categoryStyle.label}
            </Link>
          ) : null}

          <h1
            className="font-bebas max-w-4xl text-5xl uppercase leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {title}
          </h1>

          {description && (
            <p className="max-w-3xl text-base leading-8 text-neutral-300 sm:text-lg">
              {description}
            </p>
          )}

          {meta && (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
              {meta}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

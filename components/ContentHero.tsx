import Link from 'next/link'
import Image from 'next/image'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ContentHeroProps {
  title: string
  description?: string | null
  category?: string | null
  meta?: string | null
  coverImage?: string | null
  /** When true: article context (aligned with body width). Otherwise: tool context (framed). */
  articleMode?: boolean
}

export function ContentHero({ title, description, category, meta, coverImage, articleMode = false }: ContentHeroProps) {
  const categoryStyle = getCategoryStyle(category)

  const inner = (
    <>
      {categoryStyle ? (
        <Link href={`/category/${categoryStyle.slug}`} className="sor7ed-pill transition-opacity hover:opacity-80">
          {categoryStyle.label}
        </Link>
      ) : null}

      <h1 className="font-bebas max-w-4xl text-5xl uppercase leading-[0.92] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl">
        {title}
      </h1>

      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-neutral-200 [text-shadow:0_1px_14px_rgba(0,0,0,0.6)] sm:text-lg">
          {description}
        </p>
      ) : null}

      {meta ? (
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-300">{meta}</p>
      ) : null}
    </>
  )

  // Cover image present — title sits on the image, deck-cover style.
  if (coverImage) {
    return (
      <section className={articleMode ? 'px-0 sm:px-4 lg:px-6' : 'px-3 py-6 sm:px-6 sm:py-10 lg:px-8'}>
        <div className="relative mx-auto flex min-h-[440px] w-full max-w-5xl items-center justify-center overflow-hidden border border-white/10 px-6 py-16 sm:min-h-[540px] sm:px-10 sm:py-24">
          <Image
            src={coverImage}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
          {/* legibility scrim — not a colour grade, just contrast for the type */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/85" />
          <div className="relative z-10 flex flex-col items-center gap-5 text-center">
            {inner}
          </div>
          <span className="pointer-events-none absolute bottom-4 right-5 z-10 select-none font-bebas text-sm uppercase tracking-[0.2em] text-white/35">
            SOR7ED
          </span>
        </div>
      </section>
    )
  }

  // No cover — text-led header on black.
  if (articleMode) {
    return (
      <header className="mx-auto max-w-4xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 text-center">{inner}</div>
      </header>
    )
  }

  return (
    <section className="px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-5 border border-white/[0.12] bg-black px-6 pb-14 pt-12 text-center sm:px-10 sm:pb-16">
        <div className="relative h-7 w-32">
          <Image src="/images/sor7ed-logo-white.png" alt="SOR7ED" fill className="object-contain" />
        </div>
        {inner}
      </div>
    </section>
  )
}

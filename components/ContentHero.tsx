import Link from 'next/link'
import Image from 'next/image'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ContentHeroProps {
  title: string
  description?: string | null
  category?: string | null
  meta?: string | null
  /** Kept for call-site compatibility — cover images are not shown in the preview header. */
  coverImage?: string | null
  /** When true: article context (aligned with body width). Otherwise: tool context (framed). */
  articleMode?: boolean
}

export function ContentHero({ title, description, category, meta, articleMode = false }: ContentHeroProps) {
  const categoryStyle = getCategoryStyle(category)

  const inner = (
    <>
      {categoryStyle ? (
        <Link href={`/category/${categoryStyle.slug}`} className="sor7ed-pill transition-opacity hover:opacity-80">
          {categoryStyle.label}
        </Link>
      ) : null}

      <h1 className="font-bebas max-w-4xl text-4xl uppercase leading-[1.15] tracking-normal text-white sm:text-5xl lg:text-6xl">
        {title}
      </h1>

      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">{description}</p>
      ) : null}

      {meta ? (
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">{meta}</p>
      ) : null}
    </>
  )

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

import Image from 'next/image'
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
            <span className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${categoryStyle.className}`}>
              {categoryStyle.label}
            </span>
          ) : (
            <div className="h-1 w-12 rounded-full bg-[#C0392B]" />
          )}

          <h1
            className="text-3xl font-black uppercase leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
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

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
      <div className="relative flex min-h-[380px] w-full items-end overflow-hidden rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-950 to-black shadow-2xl sm:min-h-[480px]">
        {coverImage && (
          <Image
            src={coverImage}
            alt=""
            fill
            preload
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/20" />

        <div className="relative z-10 max-w-5xl space-y-5 p-6 sm:p-12 lg:p-16">
          {categoryStyle ? (
            <span className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${categoryStyle.className}`}>
              {categoryStyle.label}
            </span>
          ) : (
            <div className="h-1 w-16 rounded-full bg-[#C0392B]" />
          )}

          <h1
            className="text-6xl font-black uppercase leading-[0.98] tracking-tight text-white drop-shadow-lg sm:text-7xl lg:text-8xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {title}
          </h1>

          {description && (
            <p className="max-w-3xl text-lg font-medium leading-relaxed text-neutral-100 drop-shadow sm:text-2xl">
              {description}
            </p>
          )}

          {meta && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-300 sm:text-sm">
              {meta}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

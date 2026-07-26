import Image from 'next/image'
import Link from 'next/link'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ContentCardProps {
  href: string
  title: string
  summary: string
  coverImage?: string | null
  meta?: string
  category?: string | null
}

export function ContentCard({ href, title, summary, coverImage, meta, category }: ContentCardProps) {
  const style = getCategoryStyle(category)

  return (
    <Link
      href={href}
      className="group flex flex-col h-full w-full overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-neutral-700"
      style={{ backgroundColor: '#141414', border: '1px solid #262626' }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#0D0D0D] flex-shrink-0">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={coverImage.startsWith('/images/')}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
            <span className="text-4xl font-black uppercase tracking-widest text-neutral-700 opacity-40 select-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {category || 'SORTED'}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="flex flex-col flex-1">
          {style && (
            <div>
              <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${style.className}`}>
                {style.label}
              </span>
            </div>
          )}
          <h3 className="text-xl sm:text-2xl font-black uppercase leading-snug text-white group-hover:text-[#C0392B] transition-colors line-clamp-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-400 flex-1">{summary}</p>
        </div>
        {meta && <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 pt-2 border-t border-neutral-800/80">{meta}</p>}
      </div>
    </Link>
  )
}

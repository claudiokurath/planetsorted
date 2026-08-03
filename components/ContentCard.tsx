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
  index?: number
  featured?: boolean
  light?: boolean
}

export function ContentCard({ href, title, summary, coverImage, meta, category, index, featured = false, light = false }: ContentCardProps) {
  const style = getCategoryStyle(category)

  return (
    <Link
      href={href}
      className={`group flex h-full w-full flex-col overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${light ? 'border-black/20 bg-[#f8eedb]' : 'border-white/15 bg-[#131313]'}`}
    >
      <div className={`relative w-full flex-shrink-0 overflow-hidden bg-[#0D0D0D] ${featured ? 'aspect-[16/10]' : 'aspect-video'}`}>
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
      <div className="flex flex-1 flex-col justify-between gap-5 p-5">
        <div className="flex flex-col flex-1">
          {index && <span className={`mb-4 text-xs font-black tracking-[.2em] ${light ? 'text-black/35' : 'text-white/30'}`}>{String(index).padStart(2, '0')}</span>}
          {style && (
            <div>
              <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${style.className}`}>
                {style.label}
              </span>
            </div>
          )}
          <h3 className={`font-black uppercase leading-[.95] transition-colors line-clamp-3 ${featured ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-2xl'} ${light ? 'text-black group-hover:text-[#b52e27]' : 'text-white group-hover:text-[#ef4035]'}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {title}
          </h3>
          <p className={`mt-3 line-clamp-3 text-sm leading-relaxed flex-1 ${light ? 'text-black/60' : 'text-white/50'}`}>{summary}</p>
        </div>
        {meta && <p className={`border-t pt-3 text-xs font-semibold uppercase tracking-widest ${light ? 'border-black/15 text-black/45' : 'border-white/10 text-white/35'}`}>{meta}</p>}
      </div>
    </Link>
  )
}

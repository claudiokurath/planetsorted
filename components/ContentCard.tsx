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

const CATEGORY_GRADIENTS: Record<string, string> = {
  Mind: 'from-indigo-950 via-slate-900 to-indigo-900',
  Wealth: 'from-emerald-950 via-teal-900 to-emerald-900',
  Body: 'from-amber-950 via-stone-900 to-amber-900',
  Tech: 'from-cyan-950 via-slate-900 to-cyan-900',
  Connection: 'from-rose-950 via-pink-900 to-rose-900',
  Impression: 'from-purple-950 via-slate-900 to-purple-900',
  Growth: 'from-orange-950 via-amber-900 to-orange-900',
}

export function ContentCard({ href, title, summary, coverImage, meta, category }: ContentCardProps) {
  const style = getCategoryStyle(category)
  const gradientClass = CATEGORY_GRADIENTS[category ?? ''] ?? 'from-gray-900 via-stone-900 to-gray-800'

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D5' }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ backgroundColor: '#F0EBE3' }}>
        {coverImage ? (
          <Image src={coverImage} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientClass}`}>
            <span className="text-6xl font-black uppercase tracking-widest text-white opacity-10 select-none">
              {category || 'SORTED'}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-5">
        <div>
          {style && (
            <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${style.className}`}>
              {style.label}
            </span>
          )}
          <h3 className="text-xl font-black uppercase leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#1A1A1A' }}>
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed" style={{ color: '#666' }}>{summary}</p>
        </div>
        {meta && <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#999' }}>{meta}</p>}
      </div>
    </Link>
  )
}

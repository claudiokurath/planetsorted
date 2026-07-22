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
    <Link href={href} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-950/40 to-gray-900 p-6 text-center">
            <span className="text-xs font-bold text-emerald-400/60 uppercase tracking-widest">Planet Sorted</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between space-y-3 p-5">
        <div>
          {style && (
            <span className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${style.className}`}>
              {style.label}
            </span>
          )}
          <h3 className="text-lg font-bold leading-tight text-white transition-colors group-hover:text-emerald-400">{title}</h3>
          <p className="mt-2 line-clamp-2 text-xs text-gray-400 leading-relaxed">{summary}</p>
        </div>
        {meta && <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 pt-1">{meta}</p>}
      </div>
    </Link>
  )
}

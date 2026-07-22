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
      className="group flex flex-col overflow-hidden rounded-xl transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D5' }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ backgroundColor: '#F0EBE3' }}>
        {coverImage ? (
          <Image src={coverImage} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-12 w-12 rounded-full opacity-20" style={{ backgroundColor: '#C0392B' }} />
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

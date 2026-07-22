import Image from 'next/image'
import Link from 'next/link'

interface ContentCardProps {
  href: string
  title: string
  summary: string
  coverImage?: string | null
  meta?: string
}

export function ContentCard({ href, title, summary, coverImage, meta }: ContentCardProps) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={`${title} — Planet Sorted illustration`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-950/40 to-gray-900 p-6 text-center">
            <span className="text-xs font-bold text-emerald-400/60 uppercase tracking-widest">Planet Sorted</span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{title}</h3>
        <p className="line-clamp-2 text-xs text-gray-400 leading-relaxed">{summary}</p>
        {meta && <p className="text-[11px] font-medium text-gray-500 pt-1">{meta}</p>}
      </div>
    </Link>
  )
}

'use client'

interface GetSortedButtonProps {
  slug: string
  context: 'article' | 'tool' | 'result'
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export function GetSortedButton({ slug, context }: GetSortedButtonProps) {
  const targetLink = `${SITE_URL}/r/${slug}`
  const href = `https://api.whatsapp.com/send?text=${encodeURIComponent(targetLink)}`

  return (
    <div className="flex flex-col items-start gap-1">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-full bg-[#C0392B] px-6 py-3 font-bold text-white hover:bg-[#a93226] transition-colors"
      >
        SOR7ED
      </a>
      <p className="text-xs text-neutral-400">Tap to share this link via WhatsApp</p>
    </div>
  )
}

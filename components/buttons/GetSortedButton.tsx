'use client'

interface GetSortedButtonProps {
  slug: string
  context: 'article' | 'tool' | 'result'
}

const HELPER_TEXT = {
  article: 'Text this to get the full protocol on WhatsApp',
  tool: 'Text this to run the tool and save your result',
  result: 'Save your result to WhatsApp to come back to it later',
}

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '447360277713'

export function GetSortedButton({ slug, context }: GetSortedButtonProps) {
  const verb = context === 'tool' ? 'RUN' : 'SAVE'
  const encoded = encodeURIComponent(`${verb} ${slug}`)
  const href = `https://wa.me/${WA_NUMBER}?text=${encoded}`

  return (
    <div className="flex flex-col items-start gap-1">
      <a href={href} target="_blank" rel="noopener noreferrer"
         className="inline-block rounded-full bg-green-500 px-6 py-3 font-bold text-white hover:bg-green-600 transition-colors">
        GET IT SORTED
      </a>
      <p className="text-sm text-gray-500">{HELPER_TEXT[context]}</p>
    </div>
  )
}

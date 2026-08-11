import { ContentHero } from '@/components/ContentHero'
import { Sor7edButton } from '@/components/buttons/Sor7edButton'
import { getToolRoute } from '@/lib/standaloneRoutes'
import type { Protocol } from '@/lib/types/database'

interface ToolClientProps {
  toolData: Protocol
}

function cleanBlock(block: string) {
  return block.replace(/^#{1,6}\s+/g, '').replace(/\s+/g, ' ').trim()
}

function shortenAtSentence(text: string, maxLength = 620) {
  if (text.length <= maxLength) return text

  const candidate = text.slice(0, maxLength)
  const sentenceEnd = Math.max(candidate.lastIndexOf('.'), candidate.lastIndexOf('!'), candidate.lastIndexOf('?'))

  return `${candidate.slice(0, sentenceEnd > 280 ? sentenceEnd + 1 : maxLength).trim()}…`
}

function splitToolSummary(summary?: string | null, fallbackDescription?: string | null) {
  const blocks = (summary ?? '')
    .split(/\n{2,}/)
    .map(cleanBlock)
    .filter(Boolean)

  const description = blocks[0] || fallbackDescription?.trim() || ''
  const explanation = blocks.slice(1, 3).join(' ') || fallbackDescription?.trim() || description

  return {
    description: shortenAtSentence(description, 220),
    explanation: shortenAtSentence(explanation),
  }
}

export function ToolClient({ toolData }: ToolClientProps) {
  const { description, explanation } = splitToolSummary(toolData.summary, toolData.meta_description)
  const toolHref = getToolRoute(toolData.slug)

  return (
    <div className="min-h-screen bg-black text-white">
      <ContentHero
        title={toolData.title}
        description={description}
        coverImage={toolData.cover_image}
        category={toolData.category}
        meta={toolData.read_time}
      />

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 space-y-10">
        {explanation && (
          <section className="border-l-4 border-[#C0392B] py-2 pl-6 sm:pl-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C0392B]">
              About this tool
            </p>
            <h2
              className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-5xl"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              What it helps you do
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-neutral-200 sm:text-xl">
              {explanation}
            </p>
          </section>
        )}

        <Sor7edButton href={toolHref} context="page" />
      </main>
    </div>
  )
}


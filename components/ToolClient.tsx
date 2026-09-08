import { ContentHero } from '@/components/ContentHero'
import { ContentCard } from '@/components/ContentCard'
import { GammaEmbed } from '@/components/GammaEmbed'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import type { Protocol } from '@/lib/types/database'

type RelatedArticle = Pick<Protocol, 'slug' | 'title' | 'cover_image' | 'read_time' | 'category'>

interface ToolClientProps {
  toolData: Protocol
  relatedArticles?: RelatedArticle[]
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

export function ToolClient({ toolData, relatedArticles = [] }: ToolClientProps) {
  const { description, explanation } = splitToolSummary(toolData.summary, toolData.meta_description)
  const gammaEmbed = gammaEmbedUrl(toolData.blog_gamma_url ?? null)

  return (
    <div className="min-h-screen bg-black text-white">
      <ContentHero
        title={toolData.title}
        description={description}
        category={toolData.category}
        meta={toolData.read_time}
        coverImage={toolData.cover_image}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-4 pb-20 pt-1 sm:px-6 lg:px-8">
        {/* The Gamma deck is the content; the parsed explanation is the
            fallback for tools with no Gamma set yet. */}
        {gammaEmbed ? (
          <GammaEmbed src={gammaEmbed} title={`${toolData.title} — presentation`} />
        ) : explanation ? (
          <section className="rounded-none border border-white/[0.12] bg-black px-6 py-10 sm:px-10 sm:py-12">
            <h2 className="font-bebas text-3xl uppercase leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              What it helps you do
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-neutral-300 sm:text-lg">
              {explanation}
            </p>
          </section>
        ) : null}

        {relatedArticles.length > 0 && (
          <section className="border-t border-white/[0.12] pt-10">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
              Read related intelligence
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedArticles.map((article) => (
                <ContentCard
                  key={article.slug}
                  href={`/intelligence/${article.slug}`}
                  title={article.title}
                  coverImage={article.cover_image}
                  category={article.category}
                  meta={article.read_time || undefined}
                  compact
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

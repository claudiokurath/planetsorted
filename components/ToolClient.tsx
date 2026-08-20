import { ContentHero } from '@/components/ContentHero'
import { ContentCard } from '@/components/ContentCard'
import { Sor7edButton } from '@/components/buttons/Sor7edButton'
import type { Protocol } from '@/lib/types/database'

type RelatedArticle = Pick<Protocol, 'slug' | 'title' | 'cover_image' | 'read_time' | 'category'>

interface ToolClientProps {
  toolData: Protocol
  isLoggedIn: boolean
  whatsappVerified: boolean
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

export function ToolClient({ toolData, isLoggedIn, whatsappVerified, relatedArticles = [] }: ToolClientProps) {
  const { description, explanation } = splitToolSummary(toolData.summary, toolData.meta_description)

  return (
    <div className="min-h-screen bg-black text-white">
      <ContentHero
        title={toolData.title}
        description={description}
        coverImage={toolData.cover_image}
        category={toolData.category}
        meta={toolData.read_time}
      />

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 space-y-12">
        {/* Explanation */}
        {explanation && (
          <section className="border-l-4 border-[#F5C518] py-2 pl-6 sm:pl-8 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5C518]">
              About this tool
            </p>
            <h2
              className="font-bebas text-3xl font-black uppercase leading-none text-white sm:text-4xl"
            >
              What it helps you do
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-neutral-300">
              {explanation}
            </p>
          </section>
        )}

        {/* Visual App Preview Box */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
              ⚡ App Experience Preview
            </span>
            <span className="rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-neutral-400 font-mono">
              {toolData.category || 'Tool'}
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-black p-6 space-y-4">
            <h3 className="font-bebas text-xl font-black uppercase text-white">
              {toolData.title} — Full Interactive App
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {toolData.protocol || 'Interactive calculations, real-time analytics, instant recommendations, and historical progress logs.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs pt-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                <span className="block text-base mb-1">⚡</span>
                <span className="font-semibold text-white">Instant Results</span>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                <span className="block text-base mb-1">📊</span>
                <span className="font-semibold text-white">Actionable Plan</span>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 col-span-2 sm:col-span-1">
                <span className="block text-base mb-1">📲</span>
                <span className="font-semibold text-white">Save via WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-sm font-semibold text-neutral-200">
              Ready to use this tool? Tap the button below to share the link to your WhatsApp and open the full app experience.
            </p>
            <Sor7edButton slug={toolData.slug} context="tool" isLoggedIn={isLoggedIn} whatsappVerified={whatsappVerified} size="lg" />
          </div>
        </section>

        {relatedArticles.length > 0 && (
          <section className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
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

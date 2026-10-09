import { PrintPageButton } from '@/components/PrintPageButton'
import { ContentHero } from '@/components/ContentHero'
import { ContentCard } from '@/components/ContentCard'
import { GammaEmbed } from '@/components/GammaEmbed'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import { ToolWhatsAppCta } from '@/components/ToolWhatsAppCta'
import type { Protocol } from '@/lib/types/database'

type RelatedArticle = Pick<Protocol, 'slug' | 'title' | 'cover_image' | 'read_time' | 'category'>

interface ToolClientProps {
  toolData: Protocol
  relatedArticles?: RelatedArticle[]
}

export function ToolClient({ toolData, relatedArticles = [] }: ToolClientProps) {
  const description = toolData.meta_description || toolData.summary?.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/^OVERVIEW\s*/i, '').trim().split(/\n\s*\n/)[0]
  // Tools sync their single Notion "Gamma" property into gamma_url;
  // blog_gamma_url stays as a fallback for anything set the old way.
  const gammaEmbed = gammaEmbedUrl(toolData.gamma_url) ?? gammaEmbedUrl(toolData.blog_gamma_url)

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
        <div className="print:hidden"><PrintPageButton /></div>
        {gammaEmbed ? (
          <GammaEmbed src={gammaEmbed} title={`${toolData.title} — presentation`} />
        ) : (
          <p className="border border-white/15 p-6 text-base text-neutral-300">This tool’s content is not available yet. Please check back soon.</p>
        )}

        {/* The deck is the pitch; this is the next step off the back of it. */}
        <ToolWhatsAppCta slug={toolData.slug} />

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

import Link from 'next/link'
import { GammaEmbed } from '@/components/GammaEmbed'
import { ContentCard } from '@/components/ContentCard'
import { PageHeader } from '@/components/PageHeader'
import { createServerClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function ToolboxListingPage() {
  const supabase = createServerClient()
  const { data: tools } = await supabase
    .from('protocols')
    .select('slug, title, summary, cover_image, read_time, category')
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
        <PageHeader
          eyebrow="PLANET SOR7ED LAB"
          title="Toolbox"
          description="Practical interactive tools designed to deliver instant clarity and turn overwhelm into a next action."
        />

        <section className="mb-14" aria-label="The tools your brain actually needs">
          <GammaEmbed src="https://gamma.app/embed/d7h8pad1cxhj4z7" title="The tools your brain actually needs" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
            <a href="#published-tools" className="text-[#F5C518] underline underline-offset-4">Browse all tools ↓</a>
            <Link href="https://gamma.app/docs/THE-TOOLS-YOUR-BRAIN-ACTUALLY-NEEDS-d7h8pad1cxhj4z7" target="_blank" rel="noopener noreferrer" className="text-neutral-300 underline underline-offset-4">Open presentation in a new tab</Link>
          </div>
        </section>
        <h2 id="published-tools" className="mb-8 scroll-mt-28 font-bebas text-3xl uppercase text-white sm:text-4xl">All tools</h2>

        {!tools || tools.length === 0 ? (
          <p className="py-12 text-center text-neutral-500">No tools published yet.</p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ContentCard
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                title={tool.title}
                summary={tool.summary}
                coverImage={tool.cover_image}
                category={tool.category}
                meta={tool.read_time}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

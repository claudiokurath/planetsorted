import { createClient } from '@supabase/supabase-js'
import { ContentCard } from '@/components/ContentCard'

export const revalidate = 60

export default async function GuidebookListingPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: articles } = await supabase
    .from('protocols')
    .select('slug, title, summary, cover_image, read_time, category')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mx-auto h-1 w-16 rounded-full bg-[#C0392B] mb-4" />
          <h1 className="text-5xl font-black uppercase text-white sm:text-6xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Guidebook
          </h1>
          <p className="mt-4 text-xl text-neutral-400">Plain-English protocols that turn chaos into a next step.</p>
        </div>

        {!articles || articles.length === 0 ? (
          <p className="text-center text-neutral-500">No protocols published yet.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ContentCard
                key={article.slug}
                href={`/intelligence/${article.slug}`}
                title={article.title}
                summary={article.summary || ''}
                coverImage={article.cover_image}
                category={article.category}
                meta={article.read_time ? `${article.read_time} read` : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import Image from 'next/image'
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
      {/* Banner Header */}
      <div className="relative w-full aspect-[21/9] max-h-72 overflow-hidden bg-neutral-900 border-b border-neutral-800">
        <Image
          src="/images/banners/guidebook banner.png"
          alt="Guidebook Banner"
          fill
          priority
          unoptimized
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto h-1 w-16 rounded-full bg-[#C0392B] mb-3" />
          <h1 className="text-5xl font-black uppercase text-white sm:text-6xl tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Guidebook
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto">
            Plain-English protocols that turn chaos into a next step.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {!articles || articles.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">No protocols published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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

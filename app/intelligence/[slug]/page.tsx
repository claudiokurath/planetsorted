import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { createServerClient } from '@/lib/supabase/server'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'
import { getCategoryStyle } from '@/lib/categoryStyles'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data } = await supabase
    .from('protocols')
    .select('title, seo_title, meta_description, cover_image, slug')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const row = data as Pick<Protocol, 'title' | 'seo_title' | 'meta_description' | 'cover_image' | 'slug'> | null
  if (!row) return {}

  return {
    title: row.seo_title || row.title,
    description: row.meta_description || undefined,
    openGraph: {
      title: row.seo_title || row.title,
      description: row.meta_description || undefined,
      images: row.cover_image
        ? [{ url: row.cover_image, width: 1200, height: 630, alt: row.title }]
        : [],
      url: `/intelligence/${slug}`,
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: rawProtocol } = await supabase
    .from('protocols')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const protocol = rawProtocol as Protocol | null
  if (!protocol) notFound()

  const categoryStyle = getCategoryStyle(protocol.category)
  const audioUrl = protocol.audio_url || protocol.audio

  return (
    <div style={{ backgroundColor: '#FAF7F2' }} className="min-h-screen">
      <article className="mx-auto max-w-3xl px-6 py-12">
        {/* Cover image */}
        {protocol.cover_image && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-[#E8E0D5]">
            <Image
              src={protocol.cover_image}
              alt={`${protocol.title} — Planet Sorted illustration`}
              width={1200}
              height={630}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* Category + tagline + read time */}
        <div className="mb-4 space-y-1">
          {categoryStyle && (
            <div className="flex items-center gap-3">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${categoryStyle.className}`}>
                {categoryStyle.label}
              </span>
              <span className="text-xs text-gray-600">{categoryStyle.tagline}</span>
            </div>
          )}
          {protocol.read_time && (
            <p className="text-xs font-medium text-gray-500 pt-1">{protocol.read_time} read</p>
          )}
        </div>

        {/* Title */}
        <h1
          className="mb-6 text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-none tracking-tight text-[#1A1A1A]"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {protocol.title}
        </h1>

        {/* Audio Deep Dive Block */}
        {audioUrl && (
          <div className="my-8 rounded-2xl border border-[#E8E0D5] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">🎧 Listen to the Deep Dive</h3>
            <audio controls className="w-full" src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
            <a
              href={`https://wa.me/447591922247?text=${encodeURIComponent('AUDIO ' + slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-green-700 underline"
            >
              Send this to WhatsApp instead →
            </a>
          </div>
        )}

        {/* Excerpt */}
        {protocol.excerpt && (
          <p className="mb-8 text-lg font-medium leading-relaxed text-[#1A1A1A]">
            {protocol.excerpt}
          </p>
        )}

        {/* Article body (markdown) */}
        {protocol.problem && (
          <div className="prose prose-lg mb-10 max-w-none prose-p:text-[#1A1A1A] prose-headings:text-[#1A1A1A] prose-strong:text-[#1A1A1A] prose-li:text-[#1A1A1A] text-[#1A1A1A]">
            <ReactMarkdown>{protocol.problem}</ReactMarkdown>
          </div>
        )}

        {/* Action Protocol */}
        {protocol.protocol && (
          <div className="mb-10 rounded-2xl p-6 border border-[#E8E0D5] bg-white shadow-sm">
            <h2 className="text-2xl font-black uppercase text-[#1A1A1A] mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Practical Next Steps
            </h2>
            <div className="prose max-w-none text-sm text-[#1A1A1A] prose-p:text-[#1A1A1A] prose-strong:text-[#1A1A1A] prose-li:text-[#1A1A1A]">
              <ReactMarkdown>{protocol.protocol}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-[#E8E0D5]">
          <SaveToPhoneButton slug={slug} context="article" isLoggedIn={false} whatsappVerified={false} />
        </div>
      </article>
    </div>
  )
}

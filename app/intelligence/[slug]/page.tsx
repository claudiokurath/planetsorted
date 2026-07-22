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
    <article className="mx-auto max-w-2xl px-6 py-12">
      {/* Cover image */}
      {protocol.cover_image && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-800">
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
            <span className="text-xs text-gray-500">{categoryStyle.tagline}</span>
          </div>
        )}
        {protocol.read_time && (
          <p className="text-xs font-medium text-gray-500 pt-1">{protocol.read_time} read</p>
        )}
      </div>

      {/* Title */}
      <h1 className="mb-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
        {protocol.title}
      </h1>

      {/* Excerpt */}
      {protocol.excerpt && (
        <p className="mb-8 text-base leading-relaxed text-gray-300">
          {protocol.excerpt}
        </p>
      )}

      {/* NotebookLM Audio Deep Dive Card (Rendered if audio URL exists) */}
      {audioUrl && (
        <div className="mb-10 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-gray-900 to-gray-950 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 mb-2">
                <span>🎙️ NotebookLM Deep Dive</span>
              </div>
              <h3 className="text-lg font-bold text-white">Audio Protocol Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Listen on web or get the audio delivered straight to your WhatsApp.</p>
            </div>

            <a
              href={`https://wa.me/447591922247?text=${encodeURIComponent(`AUDIO ${slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-950 whitespace-nowrap"
            >
              <span>Send Audio to WhatsApp</span>
              <span>💬</span>
            </a>
          </div>

          <audio controls src={audioUrl} className="w-full mt-2 rounded-lg focus:outline-none" />
        </div>
      )}

      {/* Article body (markdown) */}
      {protocol.problem && (
        <div className="prose prose-invert mb-10 max-w-none text-gray-300">
          <ReactMarkdown>{protocol.problem}</ReactMarkdown>
        </div>
      )}

      {/* Action Protocol */}
      {protocol.protocol && (
        <div className="glass-card mb-10 rounded-2xl p-6 border-emerald-500/30">
          <h2 className="text-lg font-bold text-white mb-3">Practical Next Steps</h2>
          <div className="prose prose-invert text-xs text-gray-300">
            <ReactMarkdown>{protocol.protocol}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SaveToPhoneButton slug={slug} context="article" isLoggedIn={false} whatsappVerified={false} />

        <a
          href={`https://wa.me/447591922247?text=${encodeURIComponent(`AUDIO ${slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-gray-800 bg-gray-900 px-5 py-2.5 text-xs font-bold text-gray-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors text-center"
        >
          🎧 Request WhatsApp Audio Deep Dive
        </a>
      </div>
    </article>
  )
}

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
    .select('title, summary, category, cover_image, problem, protocol, keyword, read_time, cta, excerpt, audio_url, slug')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const protocol = rawProtocol as Protocol | null
  if (!protocol) notFound()

  const categoryStyle = getCategoryStyle(protocol.category)
  const audioUrl = protocol.audio_url
  const triggerKeyword = (protocol as any).whatsapp_trigger || protocol.keyword || slug.toUpperCase()
  const waClickUrl = `https://wa.me/447591922247?text=${encodeURIComponent(triggerKeyword)}`

  // Use problem body markdown, or fall back to protocol text
  const mainContent = protocol.problem || protocol.protocol || protocol.summary || ''

  return (
    <div style={{ backgroundColor: '#FAF7F2' }} className="min-h-screen">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cover image above title (16:9 aspect ratio, rounded-2xl, shadow-lg) */}
        {protocol.cover_image && (
          <div className="relative aspect-video w-full mb-8 overflow-hidden rounded-2xl shadow-xl border border-[#E8E0D5]">
            <Image
              src={protocol.cover_image}
              alt={`${protocol.title} — Planet Sorted illustration`}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        )}

        {/* Category badge above title */}
        {categoryStyle && (
          <div className="mb-3">
            <span className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${categoryStyle.className}`}>
              {categoryStyle.label}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          className="mb-4 text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-tight text-[#1A1A1A]"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {protocol.title}
        </h1>

        {/* Tagline & read time below title */}
        <div className="mb-10 flex items-center gap-3 text-sm font-medium text-gray-500 pb-6 border-b border-[#E8E0D5]">
          {categoryStyle?.tagline && <span>{categoryStyle.tagline}</span>}
          {categoryStyle?.tagline && protocol.read_time && <span>•</span>}
          {protocol.read_time && <span>{protocol.read_time} read</span>}
        </div>

        {/* Audio Deep Dive Block */}
        {audioUrl && (
          <div className="my-8 rounded-2xl border border-[#E8E0D5] bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">🎧 Listen to the Deep Dive</h3>
            <audio controls className="w-full" src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
            <a
              href={`https://wa.me/447591922247?text=${encodeURIComponent('AUDIO ' + slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C0392B] underline hover:text-red-800 transition-colors pt-1"
            >
              Send audio to WhatsApp →
            </a>
          </div>
        )}

        {/* Excerpt */}
        {protocol.excerpt && (
          <div className="mb-8 p-6 bg-white/60 border-l-4 border-[#C0392B] rounded-r-2xl shadow-sm">
            <p className="text-xl sm:text-2xl leading-relaxed font-semibold text-[#1A1A1A]">
              {protocol.excerpt}
            </p>
          </div>
        )}

        {/* Article body with enhanced typography */}
        {mainContent && (
          <div className="prose prose-lg max-w-none mb-12 
            prose-p:text-[#222222] prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
            prose-headings:font-black prose-headings:uppercase prose-headings:text-[#1A1A1A] prose-headings:tracking-tight prose-headings:mt-8 prose-headings:mb-4
            prose-h2:text-3xl prose-h2:border-b prose-h2:border-[#E8E0D5] prose-h2:pb-2
            prose-h3:text-2xl prose-h3:text-[#C0392B]
            prose-strong:font-bold prose-strong:text-[#1A1A1A]
            prose-ul:my-6 prose-li:text-[#222222] prose-li:text-lg prose-li:my-1.5
            prose-blockquote:border-l-4 prose-blockquote:border-[#C0392B] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700"
          >
            <ReactMarkdown>{mainContent}</ReactMarkdown>
          </div>
        )}

        {/* Styled WhatsApp CTA Box with Direct wa.me Click Link */}
        <div className="my-12 rounded-2xl bg-[#1A1A1A] p-8 sm:p-10 text-white shadow-2xl space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3498DB]">Instant WhatsApp Protocol</span>
            <div className="text-4xl sm:text-6xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              TEXT &ldquo;{triggerKeyword}&rdquo;
            </div>
          </div>

          <p className="text-base sm:text-lg leading-relaxed text-neutral-300">
            Click below to open WhatsApp directly with <strong className="text-white">&ldquo;{triggerKeyword}&rdquo;</strong> pre-filled — no typing needed.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href={waClickUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C0392B] px-8 py-4 text-base sm:text-lg font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors shadow-lg"
            >
              <span>GET IT SORTED ON WHATSAPP →</span>
            </a>

            <SaveToPhoneButton slug={slug} context="article" isLoggedIn={false} whatsappVerified={false} />
          </div>
        </div>
      </article>
    </div>
  )
}

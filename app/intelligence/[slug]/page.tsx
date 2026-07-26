import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { createServerClient } from '@/lib/supabase/server'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'
import { getCategoryStyle } from '@/lib/categoryStyles'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '447591922247'

function formatArticleContent(text: string, title?: string): string {
  if (!text) return ''

  let s = text

  // Strip duplicate raw title if present at the very beginning of the body text
  if (title && s.toUpperCase().startsWith(title.toUpperCase())) {
    s = s.slice(title.length).trim()
  }

  // Insert double line breaks before ALL-CAPS headings stuck to sentence endings
  s = s.replace(/([\.!\?])\s*([A-Z\s“”"'\:\-]{5,65})(?=\n|$)/g, '$1\n\n### $2\n\n')
  s = s.replace(/([\.!\?])\s*([A-Z][A-Z\s“”"'\:\-]{5,65}\b)/g, '$1\n\n### $2\n\n')

  const lines = s.split(/\n+/)
  const out: string[] = []

  for (let l of lines) {
    l = l.trim()
    if (!l) continue

    // Detect uppercase subheadings and format as H3 headings
    if (!l.startsWith('#') && l.length > 4 && l.length < 65 && l === l.toUpperCase() && !l.startsWith('---')) {
      out.push(`### ${l}`)
    } else {
      out.push(l)
    }
  }

  return out.join('\n\n')
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

  const title = row.seo_title || row.title
  const description = row.meta_description || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: row.cover_image ? [{ url: row.cover_image, width: 1200, height: 630, alt: row.title }] : [],
      url: `${SITE}/intelligence/${slug}`,
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  let whatsappVerified = false
  if (user) {
    const { data: profile } = await supabase.from('users').select('whatsapp_verified').eq('user_id', user.id).single()
    whatsappVerified = (profile as { whatsapp_verified?: boolean } | null)?.whatsapp_verified ?? false
  }

  const { data: rawProtocol } = await supabase
    .from('protocols')
    .select('title, summary, category, cover_image, problem, keyword, read_time, cta, excerpt, audio_url, slug')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const protocol = rawProtocol as Protocol | null
  if (!protocol) notFound()

  const categoryStyle = getCategoryStyle(protocol.category)
  const audioUrl = protocol.audio_url?.trim() || undefined
  const triggerKeyword = protocol.keyword || slug.toUpperCase()
  const waClickUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(triggerKeyword)}`
  const waAudioUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('AUDIO ' + slug)}`

  // Format Notion body text into distinct paragraphs and section headers
  const rawBodyText = protocol.problem || protocol.excerpt || protocol.summary || ''
  const formattedContent = formatArticleContent(rawBodyText, protocol.title)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Immersive Cover Image Hero Header Banner with Title & Tagline Overlaid */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-neutral-800/80 bg-neutral-950">
        {protocol.cover_image && (
          <div className="absolute inset-0 z-0 opacity-40">
            <Image
              src={protocol.cover_image}
              alt={protocol.title}
              fill
              priority
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          {categoryStyle && (
            <div>
              <span className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${categoryStyle.className}`}>
                {categoryStyle.label}
              </span>
            </div>
          )}

          <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tight text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {protocol.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-medium text-neutral-300 pt-2">
            {categoryStyle?.tagline && <span className="text-white font-semibold">{categoryStyle.tagline}</span>}
            {categoryStyle?.tagline && protocol.read_time && <span className="text-neutral-500">•</span>}
            {protocol.read_time && <span className="text-neutral-400">{protocol.read_time} read</span>}
          </div>
        </div>
      </section>

      {/* Main Reading Container */}
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Audio Deep Dive Player */}
        {audioUrl && (
          <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#3498DB]">🎧 Listen to the Deep Dive</h3>
            <audio controls className="w-full" src={audioUrl}>Your browser does not support the audio element.</audio>
            <a href={waAudioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C0392B] underline hover:text-red-400 transition-colors pt-1">
              Send audio to WhatsApp →
            </a>
          </div>
        )}

        {/* Pull-Quote Excerpt */}
        {protocol.excerpt && (
          <div className="p-6 sm:p-8 bg-[#141414] border-l-4 border-[#C0392B] rounded-r-2xl shadow-xl">
            <p className="text-xl sm:text-2xl leading-relaxed font-semibold text-white">{protocol.excerpt}</p>
          </div>
        )}

        {/* Full Article Body Content split into airy, bold subheadings & spaced paragraphs */}
        {formattedContent && (
          <div className="prose prose-invert prose-lg max-w-none mb-16
            prose-p:text-neutral-200 prose-p:text-lg sm:prose-p:text-xl prose-p:leading-relaxed prose-p:mb-8
            prose-headings:font-black prose-headings:uppercase prose-headings:text-white prose-headings:tracking-tight
            prose-h3:text-2xl sm:prose-h3:text-3xl prose-h3:font-black prose-h3:text-white prose-h3:mt-14 prose-h3:mb-6 prose-h3:border-b prose-h3:border-neutral-800 prose-h3:pb-3
            prose-strong:font-black prose-strong:text-white
            prose-ul:my-8 prose-li:text-neutral-200 prose-li:text-lg prose-li:my-2
            prose-blockquote:border-l-4 prose-blockquote:border-[#C0392B] prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-neutral-200">
            <ReactMarkdown>{formattedContent}</ReactMarkdown>
          </div>
        )}

        {/* Clean WhatsApp Call to Action Box */}
        <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-6 sm:p-10 text-white shadow-2xl space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3498DB]">Instant WhatsApp Protocol</span>
            <div className="text-4xl sm:text-6xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              TEXT &ldquo;{triggerKeyword}&rdquo;
            </div>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-neutral-300">
            Click below to open WhatsApp directly with <strong className="text-white">&ldquo;{triggerKeyword}&rdquo;</strong> pre-filled — no typing needed.
          </p>
          <div className="pt-2 flex flex-col gap-4">
            <a
              href={waClickUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#C0392B] px-8 py-4 text-base sm:text-lg font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors shadow-lg text-center"
            >
              <span>OPEN IN WHATSAPP →</span>
            </a>
            <div className="flex justify-start">
              <SaveToPhoneButton slug={slug} context="article" isLoggedIn={!!user} whatsappVerified={whatsappVerified} />
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

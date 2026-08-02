import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'
import { getCategoryStyle } from '@/lib/categoryStyles'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

interface ArticleSection {
  heading?: string
  text: string
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '447360277713'

function parseArticleSections(rawText: string, title?: string): ArticleSection[] {
  if (!rawText) return []

  let s = rawText

  // Strip duplicate title prefix if present at start of body text
  if (title && s.toUpperCase().startsWith(title.toUpperCase())) {
    s = s.slice(title.length).trim()
  }

  // Insert explicit section separators before ALL-CAPS titles stuck to sentence endings
  s = s.replace(/([\.!\?])\s*([A-Z\s“”"'\:\-]{5,65})(?=\n|$)/g, '$1\n\n===HEADING===$2\n\n')
  s = s.replace(/([\.!\?])\s*([A-Z][A-Z\s“”"'\:\-]{5,65}\b)/g, '$1\n\n===HEADING===$2\n\n')

  const rawBlocks = s.split('\n')
  const sections: ArticleSection[] = []
  let currentHeading = ''
  let currentParagraphs: string[] = []

  for (let line of rawBlocks) {
    line = line.trim()
    if (!line) continue

    if (line.startsWith('===HEADING===')) {
      if (currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
        currentParagraphs = []
      }
      currentHeading = line.replace('===HEADING===', '').trim()
    } else if (line.length > 4 && line.length < 65 && line === line.toUpperCase() && !line.startsWith('---') && !line.includes('.')) {
      if (currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
        currentParagraphs = []
      }
      currentHeading = line
    } else {
      currentParagraphs.push(line)
    }
  }

  if (currentParagraphs.length > 0) {
    sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
  }

  return sections
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
      images: row.cover_image 
        ? [{ url: `${SITE}/api/og?image=${encodeURIComponent(row.cover_image)}`, width: 1200, height: 630, type: 'image/png', alt: row.title }] 
        : [],
      url: `${SITE}/intelligence/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: row.cover_image ? [row.cover_image] : [],
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
  const triggerKeyword = protocol.keyword || slug
  const waAudioUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(triggerKeyword)}`

  // Parse Notion body text into structured section blocks
  const rawBodyText = protocol.problem || protocol.excerpt || protocol.summary || ''
  const sections = parseArticleSections(rawBodyText, protocol.title)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cinematic Hero Banner with Integrated Typography */}
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950 shadow-2xl min-h-[420px] sm:min-h-[560px] flex items-end">
          {protocol.cover_image && (
            <>
              <Image
                src={protocol.cover_image}
                alt={protocol.title}
                fill
                priority
                unoptimized
                className="object-cover object-center opacity-75 sm:opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent sm:bg-gradient-to-r sm:from-black sm:via-black/75 sm:to-transparent" />
            </>
          )}

          <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-3xl space-y-4">
            {categoryStyle && (
              <div>
                <span className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${categoryStyle.className}`}>
                  {categoryStyle.label}
                </span>
              </div>
            )}

            <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tight text-white drop-shadow-lg" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {protocol.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-medium text-neutral-300 pt-2">
              {categoryStyle?.tagline && <span className="text-white font-semibold">{categoryStyle.tagline}</span>}
              {categoryStyle?.tagline && protocol.read_time && <span className="text-neutral-500">•</span>}
              {protocol.read_time && <span className="text-neutral-400">{protocol.read_time} read</span>}
            </div>
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

        {/* Structured Article Sections with Bold Headings & Generous Spacing */}
        <div className="space-y-14 pt-4">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-4">
              {sec.heading && (
                <h3
                  className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white pb-3 border-b border-neutral-800"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {sec.heading}
                </h3>
              )}
              <div className="text-lg sm:text-xl text-neutral-200 leading-relaxed font-normal whitespace-pre-line space-y-6">
                {sec.text}
              </div>
            </div>
          ))}
        </div>

        {/* Ultra-Clean Single-Button WhatsApp Action Card */}
        <div className="mt-16 rounded-2xl border border-neutral-800 bg-[#141414] p-6 sm:p-10 text-white shadow-2xl space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3498DB]">Instant WhatsApp Protocol</span>
            <div className="text-4xl sm:text-6xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              TEXT &ldquo;{triggerKeyword}&rdquo;
            </div>
          </div>
          <div className="pt-2">
            <SaveToPhoneButton slug={triggerKeyword} context="article" isLoggedIn={!!user} whatsappVerified={whatsappVerified} />
          </div>
        </div>
      </article>
    </div>
  )
}

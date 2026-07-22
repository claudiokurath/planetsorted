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
  const triggerKeyword = (protocol as any).whatsapp_trigger || slug.toUpperCase()

  return (
    <div style={{ backgroundColor: '#FAF7F2' }} className="min-h-screen">
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Cover image above title (16:9 aspect ratio, rounded-2xl, shadow-lg) */}
        {protocol.cover_image && (
          <div className="relative aspect-video w-full mb-8 overflow-hidden rounded-2xl shadow-lg border border-[#E8E0D5]">
            <Image
              src={protocol.cover_image}
              alt={`${protocol.title} — Planet Sorted illustration`}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Category badge above title */}
        {categoryStyle && (
          <div className="mb-2">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${categoryStyle.className}`}>
              {categoryStyle.label}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          className="mb-3 text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-tight"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#1A1A1A' }}
        >
          {protocol.title}
        </h1>

        {/* Tagline & read time below title */}
        <div className="mb-8 flex items-center gap-3 text-sm text-gray-500">
          {categoryStyle?.tagline && <span>{categoryStyle.tagline}</span>}
          {categoryStyle?.tagline && protocol.read_time && <span>•</span>}
          {protocol.read_time && <span>{protocol.read_time} read</span>}
        </div>

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
          <p className="mb-8 text-xl leading-relaxed font-medium" style={{ color: '#333' }}>
            {protocol.excerpt}
          </p>
        )}

        {/* Article body (markdown wrapped in prose prose-lg max-w-none) */}
        {protocol.problem && (
          <div className="prose prose-lg max-w-none mb-10 prose-p:text-[#333] prose-headings:text-[#1A1A1A] prose-strong:text-[#1A1A1A] prose-li:text-[#333]" style={{ color: '#333' }}>
            <ReactMarkdown>{protocol.problem}</ReactMarkdown>
          </div>
        )}

        {/* Action Protocol */}
        {protocol.protocol && (
          <div className="mb-10 rounded-2xl p-6 border border-[#E8E0D5] bg-white shadow-sm">
            <h2 className="text-2xl font-black uppercase text-[#1A1A1A] mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Practical Next Steps
            </h2>
            <div className="prose max-w-none text-sm text-[#333] prose-p:text-[#333] prose-strong:text-[#1A1A1A] prose-li:text-[#333]">
              <ReactMarkdown>{protocol.protocol}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Styled WhatsApp CTA Box */}
        <div className="my-10 rounded-2xl bg-[#1A1A1A] p-8 text-white shadow-xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C0392B]">Save to WhatsApp</p>
          <div className="text-4xl sm:text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            TEXT {triggerKeyword}
          </div>
          <p className="text-sm leading-relaxed text-gray-300">
            Text <strong className="text-white">{triggerKeyword}</strong> to <strong className="text-white">+44 7591 922247</strong> to save this protocol directly to your WhatsApp thread for instant reference any time.
          </p>
          <div className="pt-2">
            <SaveToPhoneButton slug={slug} context="article" isLoggedIn={false} whatsappVerified={false} />
          </div>
        </div>
      </article>
    </div>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { createServerClient } from '@/lib/supabase/server'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'
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

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? '447360277713'
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

  return (
    <article className="mx-auto max-w-2xl px-6 py-12">

      {/* Cover image */}
      {protocol.cover_image && (
        <div className="mb-8 overflow-hidden rounded-2xl">
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

      {/* Category + read time */}
      <div className="mb-4 flex items-center gap-3 text-sm text-gray-500">
        {protocol.category && (
          <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
            {protocol.category}
          </span>
        )}
        {protocol.read_time && <span>{protocol.read_time} read</span>}
      </div>

      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900">
        {protocol.title}
      </h1>

      {/* Excerpt */}
      {protocol.excerpt && (
        <p className="mb-8 text-lg leading-relaxed text-gray-600">
          {protocol.excerpt}
        </p>
      )}

      {/* Article body (markdown) */}
      {protocol.problem && (
        <div className="prose prose-gray mb-10 max-w-none">
          <ReactMarkdown>{protocol.problem}</ReactMarkdown>
        </div>
      )}

      {/* GET IT SORTED button */}
      <div className="my-10 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <SaveToPhoneButton
          slug={slug}
          context="article"
          isLoggedIn={false}
          whatsappVerified={false}
        />
      </div>

      {/* CTA copy */}
      {protocol.cta && (
        <p className="mb-10 text-base text-gray-700">{protocol.cta}</p>
      )}

      {/* End-of-article WhatsApp keyword block */}
      {protocol.keyword && (
        <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-sm text-gray-700">
          <p>
            Text <strong>{protocol.keyword}</strong> to{' '}
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(protocol.keyword)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 underline"
            >
              +44 7360 277713
            </a>{' '}
            to get the full protocol on WhatsApp.
          </p>
          <p className="mt-2 text-gray-500">
            Sign up first at{' '}
            <a href={`${site}/signup`} className="underline">
              {site.replace('https://', '')}/signup
            </a>
            . No app. No spam. Just what works.
          </p>
        </div>
      )}

    </article>
  )
}

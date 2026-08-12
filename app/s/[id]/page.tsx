import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { RichLinkRedirect } from '@/app/r/[slug]/RichLinkRedirect'
import type { SavedItem } from '@/lib/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = createServerClient()

  const { data } = await supabase
    .from('saved_items')
    .select('title, category, url')
    .eq('id', id)
    .single()

  const row = data as Pick<SavedItem, 'title' | 'category' | 'url'> | null
  if (!row) return {}

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
  const title = row.title ?? 'Saved Item — PLANET SOR7ED'
  // `saved_items` stores no per-item description or OG image, so fall back to the
  // category blurb and let the site-level default OG image apply.
  const description = row.category
    ? `${row.category} — saved on PLANET SOR7ED.`
    : 'View this saved protocol on PLANET SOR7ED.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${site}/s/${id}`,
      siteName: 'PLANET SOR7ED',
      type: 'website',
    },
  }
}

export default async function SaveCardPage({ params }: Props) {
  const { id } = await params
  
  // Log the access as requested
  console.log(`[SaveCard access] timestamp=${new Date().toISOString()} id=${id}`)

  const supabase = createServerClient()
  const { data } = await supabase
    .from('saved_items')
    .select('url')
    .eq('id', id)
    .single()

  const row = data as Pick<SavedItem, 'url'> | null

  if (!row?.url) {
    // If not found, redirect to / with no error shown
    redirect('/')
  }

  return <RichLinkRedirect targetUrl={row.url} />
}

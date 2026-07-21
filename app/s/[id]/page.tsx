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
    .select('title, description, og_image_url, target_url')
    .eq('id', id)
    .single()

  const row = data as SavedItem | null
  if (!row) return {}

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

  return {
    title: row.title ?? 'Saved Item — Planet Sorted',
    description: row.description ?? 'View this saved protocol on Planet Sorted.',
    openGraph: {
      title: row.title ?? 'Saved Item — Planet Sorted',
      description: row.description ?? 'View this saved protocol on Planet Sorted.',
      images: row.og_image_url
        ? [{ url: row.og_image_url, width: 1200, height: 630, alt: row.title ?? 'Saved Item' }]
        : [],
      url: `${site}/s/${id}`,
      siteName: 'Planet Sorted',
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
    .select('target_url')
    .eq('id', id)
    .single()

  const row = data as SavedItem | null

  if (!row?.target_url) {
    // If not found, redirect to / with no error shown
    redirect('/')
  }

  return <RichLinkRedirect targetUrl={row.target_url} />
}

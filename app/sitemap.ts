import { getLiveContent } from '@/lib/notion/liveContent'
import { SEO_SITE, PUBLIC_SEO_PATHS, publishedSeoEntries } from '@/lib/seo'
import type { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { CATEGORY_LIST } from '@/lib/categoryStyles'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getLiveContent()
  const { data, error } = await createServerClient().from('protocols')
    .select('slug, type, category').eq('status', 'Published')
  if (error) throw new Error('The sitemap is temporarily unavailable')
  const published = publishedSeoEntries(data ?? [], snapshot)
  const categories = new Set(published.map(row => row.category))
  const paths = [
    ...PUBLIC_SEO_PATHS,
    ...CATEGORY_LIST.filter(category => categories.has(category.label)).map(category => `/category/${category.slug}`),
    ...published.map(row => `/${row.type === 'Tool' ? 'tools' : 'guidebooks'}/${row.slug}`),
  ]
  // Database updated_at is a sync timestamp, not a verified content revision.
  // Do not invent lastmod dates whenever a crawler requests this document.
  return [...new Set(paths)].map(path => ({ url: new URL(path, SEO_SITE).toString() }))
}

import type { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

const TOOL_SLUGS = [
  'adhd-tax-calculator',
  'financial-autopilot',
  'decision-paralysis-solver',
  'dopamine-menu-generator',
  'task-triage',
  'rsd-response-scripts',
  'sensory-audit',
  'burnout-assessment',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
  const supabase = createServerClient()

  // Fetch dynamic published articles from Supabase
  const { data } = await supabase
    .from('protocols')
    .select('slug, updated_at')
    .eq('status', 'Published')

  const protocols = (data as Pick<Protocol, 'slug' | 'updated_at'>[]) || []

  // Base paths
  const routes = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/intelligence`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // Static tool pages
  const toolRoutes = TOOL_SLUGS.map((slug) => ({
    url: `${siteUrl}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic article pages
  const dynamicRoutes = protocols.map((item) => ({
    url: `${siteUrl}/intelligence/${item.slug}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...toolRoutes, ...dynamicRoutes]
}


import { SEO_SITE } from '@/lib/seo'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SEO_SITE

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/protocols/', '/s/', '/embed/', '/auth/', '/admin'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

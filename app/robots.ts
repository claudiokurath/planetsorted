import { websiteSiteUrl } from '@/lib/siteUrl'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = websiteSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/protocols/', '/dashboard', '/signup', '/s/', '/embed/', '/auth/', '/admin', '/connect'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

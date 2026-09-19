import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL ?? 'https://www.sor7ed.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/signup', '/s/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

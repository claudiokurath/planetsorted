import type { Metadata } from 'next'
import { CANONICAL_WEBSITE_URL } from './siteUrl.js'

export const SEO_SITE = CANONICAL_WEBSITE_URL
export const SEO_BRAND = 'PLANET SOR7ED'
export const SEO_DESCRIPTION = 'Practical tools and plain-language guides for neurodivergent adults. Find support with overwhelm, decisions, money and everyday life admin.'

/** Search snippets must contain plain, bounded text rather than Notion formatting. */
export function seoText(value: string | null | undefined, max = 160): string {
  const text = (value ?? '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/gi, '&').replace(/&nbsp;/gi, ' ').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/\*\*|__|^#{1,6}\s+/gm, '').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return text.slice(0, max - 1).replace(/\s+\S*$/, '').trimEnd() + '…'
}

export function brandedTitle(value: string): string {
  const topic = seoText(value, 200).replace(/(?:\s*(?:\||—|–|-)\s*(?:planet\s*sor7ed|planet\s*sorted|sor7ed))+$/i, '').trim()
  return `${topic} | ${SEO_BRAND}`
}

export function publicPageMetadata({ title, description, path, image, imageWidth = 1200, imageHeight = 630, type = 'website', noIndex = false }: {
  title: string; description?: string | null; path: string; image?: string; imageWidth?: number; imageHeight?: number; type?: 'website' | 'article'; noIndex?: boolean;
}): Metadata {
  const heading = brandedTitle(title)
  const snippet = seoText(description) || SEO_DESCRIPTION
  const canonical = new URL(path, SEO_SITE).toString()
  if (!path.startsWith('/') || path.startsWith('//') || new URL(canonical).origin !== SEO_SITE) throw new Error('Invalid canonical path')
  const fallback = `/api/og?${new URLSearchParams({ title: seoText(title, 100), description: snippet })}`
  const artwork = new URL(image || fallback, SEO_SITE).toString()
  return {
    title: heading, description: snippet, alternates: { canonical },
    robots: { index: !noIndex, follow: !noIndex },
    openGraph: { title: heading, description: snippet, url: canonical, siteName: SEO_BRAND, locale: 'en_GB', type, images: [{ url: artwork, width: imageWidth, height: imageHeight, alt: seoText(title, 160) }] },
    twitter: { card: 'summary_large_image', title: heading, description: snippet, images: [artwork] },
  }
}

export function contentStructuredData(title: string, description: string, path: string, type: 'Tool' | 'Article', image?: string | null) {
  const url = new URL(path, SEO_SITE).toString()
  return {
    '@context': 'https://schema.org', '@graph': [
      { '@type': type === 'Article' ? 'Article' : 'WebPage', '@id': `${url}#content`, url, name: seoText(title, 200),
        ...(type === 'Article' ? { headline: seoText(title, 200), author: { '@type': 'Organization', '@id': `${SEO_SITE}/#organization` } } : {}),
        description: seoText(description), ...(image ? { image } : {}),
        publisher: { '@id': `${SEO_SITE}/#organization` }, isPartOf: { '@id': `${SEO_SITE}/#website` }, mainEntityOfPage: url },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: SEO_BRAND, item: SEO_SITE + '/' },
        { '@type': 'ListItem', position: 2, name: type === 'Tool' ? 'Toolbox' : 'Guidebooks', item: `${SEO_SITE}/${type === 'Tool' ? 'tools' : 'guidebooks'}` },
        { '@type': 'ListItem', position: 3, name: seoText(title, 200), item: url },
      ] },
    ],
  }
}

export function structuredDataJson(value: unknown): string { return JSON.stringify(value).replace(/</g, '\\u003c') }

export const PUBLIC_SEO_PATHS = ['/', '/tools', '/guidebooks', '/about', '/brain-type', '/hidden-strength', '/self-perception-gap', '/adhd-money-reset', '/contact', '/faq', '/membership', '/privacy', '/terms', '/cookies']

export function publishedSeoEntries<T extends { slug: string; type?: string | null; category?: string | null }>(rows: T[], published: { tools: string[]; articles: string[] }): T[] {
  const tools = new Set(published.tools), articles = new Set(published.articles)
  return rows.filter(row => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) && (row.type === 'Tool' ? tools.has(row.slug) : row.type === 'Article' && articles.has(row.slug)))
}

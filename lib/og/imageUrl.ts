/**
 * Canonical OG image URL builder.
 * Always routes covers through /api/image-proxy so WhatsApp gets a real
 * 1200×630 JPEG (sharp upscale) instead of a tiny source stretched by /api/og.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export function proxiedCoverImage(rawCover: string | null | undefined): string | null {
  const url = rawCover?.trim()
  if (!url || !url.startsWith('http')) return null

  // First-party public assets are already sharp, stable and crawlable. Sending
  // them through image-proxy made /r/start fail because that route deliberately
  // only accepts the Supabase image host.
  try {
    const candidate = new URL(url)
    const site = new URL(SITE)
    if (candidate.origin === site.origin) return url
  } catch {
    return null
  }

  return `${SITE}/api/image-proxy?url=${encodeURIComponent(url)}`
}

/** Fallback branded card when no cover exists. */
export function brandedOgImage(title: string, description?: string): string {
  const params = new URLSearchParams({ title })
  if (description) params.set('description', description.slice(0, 200))
  return `${SITE}/api/og?${params.toString()}`
}

export function ogImageForContent(
  rawCover: string | null | undefined,
  title: string,
  description?: string
): string {
  return proxiedCoverImage(rawCover) ?? brandedOgImage(title, description)
}

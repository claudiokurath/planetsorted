/** The website and partner Button have separate hosts and authentication. */
export const CANONICAL_WEBSITE_URL = 'https://www.planetsorted.com'
const WEBSITE_HOSTS = new Set(['planetsorted.com', 'www.planetsorted.com'])
const RETIRED_WEBSITE_HOSTS = new Set(['sor7ed.com', 'www.sor7ed.com'])

/** @param {string | undefined} [configured] @returns {string} */
export function websiteSiteUrl(configured = process.env.SITE_URL) {
  try {
    const url = new URL(configured || CANONICAL_WEBSITE_URL)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return CANONICAL_WEBSITE_URL
    if (WEBSITE_HOSTS.has(url.hostname) || RETIRED_WEBSITE_HOSTS.has(url.hostname)) return CANONICAL_WEBSITE_URL
    // Explicit local or Vercel preview origins remain useful in development.
    return url.origin
  } catch {
    return CANONICAL_WEBSITE_URL
  }
}

/**
 * Repair historical website links without rewriting partner /s links.
 * @param {string} raw
 * @returns {string}
 */
export function normaliseWebsiteResourceUrl(raw) {
  try {
    const url = new URL(raw)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return raw
    const websitePath = /^\/(r|go|tools|intelligence|protocols|category|embed|images|api\/og|api\/image-proxy)(\/|$)/.test(url.pathname)
    if (WEBSITE_HOSTS.has(url.hostname) || (RETIRED_WEBSITE_HOSTS.has(url.hostname) && websitePath)) {
      return `${CANONICAL_WEBSITE_URL}${url.pathname}${url.search}${url.hash}`
    }
  } catch { /* Leave unrelated external resources unchanged. */ }
  return raw
}

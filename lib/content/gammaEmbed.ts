/**
 * Resolve a Gamma reference to an embeddable URL. Accepts:
 *   - a doc share link   https://gamma.app/docs/Some-Title-abc123def456
 *   - an embed link      https://gamma.app/embed/abc123def456
 *   - a full <iframe …>  snippet pasted from Gamma's Share → Embed dialog
 *
 * Returns null for anything that is not a gamma.app URL, so callers can safely
 * drop the result straight into an <iframe src>.
 */
export function gammaEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // If someone pasted the whole embed snippet, pull the src out.
  const raw = url.trim()
  const iframeSrc = raw.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)?.[1]
  const candidate = iframeSrc ?? raw

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return null
  }

  if (parsed.hostname !== 'gamma.app' && !parsed.hostname.endsWith('.gamma.app')) {
    return null
  }

  // Already an embed link — hand it straight back.
  if (parsed.pathname.startsWith('/embed/')) {
    return `https://gamma.app${parsed.pathname}`
  }

  const lastSegment = parsed.pathname.split('/').filter(Boolean).pop() ?? ''
  const docId = lastSegment.split('-').pop() ?? ''
  if (!docId) return null

  return `https://gamma.app/embed/${docId}`
}

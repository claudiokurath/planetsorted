/**
 * Convert a Gamma doc URL (e.g. https://gamma.app/docs/Some-Title-abc123def456)
 * into its embeddable form (https://gamma.app/embed/abc123def456).
 *
 * Returns null for anything that is not a gamma.app URL, so callers can safely
 * drop the result straight into an <iframe src>.
 */
export function gammaEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null

  let parsed: URL
  try {
    parsed = new URL(url.trim())
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

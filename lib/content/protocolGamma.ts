/** Use the exact Notion-hosted Gamma presentation, never a text/PDF substitute. */
export function protocolGammaUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const raw = value.trim()
  const candidate = raw.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)?.[1] ?? raw
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    if (!['gamma.app', 'gamma.site'].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) return null
    return url.href
  } catch { return null }
}

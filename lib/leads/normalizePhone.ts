/**
 * Normalize a visitor-supplied phone into digits-only E.164-ish form.
 * Accepts +, spaces, dashes, parentheses. Rejects anything under 8 digits
 * or over 15 (E.164 max). Returns null when invalid.
 */
export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) return null
  // Reject obvious junk (all same digit, sequential test numbers)
  if (/^(\d)\1+$/.test(digits)) return null
  return digits
}

/** Partner slug: lowercase kebab, 2–40 chars. */
export function normalizePartnerSlug(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.trim().toLowerCase().slice(0, 40)
  if (!/^[a-z0-9][a-z0-9_-]{1,39}$/.test(s)) return null
  return s
}

/** Tool slug: same shape as site slugs. */
export function normalizeToolSlug(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const s = raw.trim().toLowerCase().slice(0, 100)
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(s)) return null
  return s
}

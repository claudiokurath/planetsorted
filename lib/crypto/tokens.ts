import crypto from 'crypto'

/**
 * Shared HMAC / signature helpers for short-lived tokens that leave our
 * servers (WhatsApp CONNECT links, standalone tool access cookies, etc.).
 *
 * Prefer a dedicated secret (CONNECT_TOKEN_SECRET / APP_SIGNING_SECRET).
 * Fall back to SUPABASE_SERVICE_ROLE_KEY only so existing deploys keep
 * working — rotate to a dedicated secret in production as soon as practical.
 */

const SIG_HEX_LEN = 32 // 128 bits of the HMAC, hex-encoded

function signingSecret(): string {
  const secret =
    process.env.CONNECT_TOKEN_SECRET ||
    process.env.APP_SIGNING_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    throw new Error('No signing secret configured (CONNECT_TOKEN_SECRET / APP_SIGNING_SECRET).')
  }
  return secret
}

/** Constant-time hex compare. Length mismatch → false, never throws. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
  } catch {
    return false
  }
}

function hmacHex(payload: string): string {
  return crypto.createHmac('sha256', signingSecret()).update(payload).digest('hex').slice(0, SIG_HEX_LEN)
}

// ── CONNECT tokens (dashboard → WhatsApp account linking) ──────────────────
// Wire format: `${userId}.${expiryUnixSeconds}.${sig}`
// Prefixed in the WhatsApp message as `CONNECT-${token}`.

export const CONNECT_TOKEN_TTL_SECONDS = 10 * 60

export function signConnectToken(userId: string, expiryUnixSeconds: number): string {
  if (!userId || !Number.isFinite(expiryUnixSeconds)) {
    throw new Error('Invalid connect-token inputs.')
  }
  return hmacHex(`${userId}.${expiryUnixSeconds}`)
}

export function buildConnectToken(userId: string, ttlSeconds = CONNECT_TOKEN_TTL_SECONDS): {
  token: string
  expiry: number
  expiresInSeconds: number
} {
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds
  const sig = signConnectToken(userId, expiry)
  return {
    token: `${userId}.${expiry}.${sig}`,
    expiry,
    expiresInSeconds: ttlSeconds,
  }
}

export function verifyConnectToken(
  token: string
): { ok: true; userId: string } | { ok: false; reason: 'malformed' | 'expired' | 'bad_sig' } {
  const parts = token.split('.')
  if (parts.length !== 3) return { ok: false, reason: 'malformed' }
  const [userId, expiryStr, sig] = parts
  const expiry = Number(expiryStr)
  if (!userId || !expiryStr || !sig || !Number.isFinite(expiry)) {
    return { ok: false, reason: 'malformed' }
  }
  if (Date.now() / 1000 > expiry) return { ok: false, reason: 'expired' }
  const expected = signConnectToken(userId, expiry)
  if (!timingSafeEqualHex(sig, expected)) return { ok: false, reason: 'bad_sig' }
  return { ok: true, userId }
}

// ── Standalone tool access tokens ──────────────────────────────────────────
// Replaces the trivial `access_token=granted` cookie/query gate.

export const STANDALONE_ACCESS_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export function signStandaloneAccess(slug: string, expiryUnixSeconds: number): string {
  return hmacHex(`standalone:${slug}:${expiryUnixSeconds}`)
}

export function buildStandaloneAccessToken(
  slug: string,
  ttlSeconds = STANDALONE_ACCESS_TTL_SECONDS
): { token: string; expiry: number } {
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds
  const sig = signStandaloneAccess(slug, expiry)
  return { token: `${expiry}.${sig}`, expiry }
}

export function verifyStandaloneAccessToken(
  slug: string,
  token: string | undefined | null
): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [expiryStr, sig] = parts
  const expiry = Number(expiryStr)
  if (!expiryStr || !sig || !Number.isFinite(expiry)) return false
  if (Date.now() / 1000 > expiry) return false
  const expected = signStandaloneAccess(slug, expiry)
  return timingSafeEqualHex(sig, expected)
}

// ── Meta WhatsApp webhook signature (X-Hub-Signature-256) ──────────────────

/**
 * Verify Meta's X-Hub-Signature-256 header against the raw request body.
 * Returns true only when the header is present, well-formed, and matches.
 * If META_APP_SECRET is unset we fail closed in production and open in
 * non-production so local dev without Meta credentials still works.
 */
export function verifyMetaSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null
): boolean {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) {
    // Fail closed in production — a missing secret must not silently disable auth.
    return process.env.NODE_ENV !== 'production'
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false
  const received = signatureHeader.slice('sha256='.length)
  if (!/^[a-f0-9]{64}$/i.test(received)) return false

  const expected = crypto
    .createHmac('sha256', appSecret)
    .update(typeof rawBody === 'string' ? rawBody : new Uint8Array(rawBody))
    .digest('hex')

  return timingSafeEqualHex(received.toLowerCase(), expected.toLowerCase())
}

// ── OTP generation ─────────────────────────────────────────────────────────

/** Cryptographically secure 6-digit OTP as a zero-padded string. */
export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

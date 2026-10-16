import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export const PENDING_SIGNUP_COOKIE = 'sor7ed_pending_signup'
export const PENDING_SIGNUP_TTL_MS = 24 * 60 * 60 * 1000

type PendingSignup = { phone: string; expires_at: number; retry_digest: string }

function digest(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/** Only admin.createUser may establish this marker on a brand-new identity. */
export function createPendingSignup(phone: string): { marker: PendingSignup; secret: string } {
  const secret = randomBytes(32).toString('hex')
  return {
    secret,
    marker: { phone, expires_at: Date.now() + PENDING_SIGNUP_TTL_MS, retry_digest: digest(secret) },
  }
}

export function pendingSignupForPhone(value: unknown, phone: string): PendingSignup | null {
  if (!value || typeof value !== 'object') return null
  const marker = value as Partial<PendingSignup>
  if (marker.phone !== phone || typeof marker.expires_at !== 'number' ||
      !Number.isFinite(marker.expires_at) || marker.expires_at <= Date.now() ||
      typeof marker.retry_digest !== 'string' || !/^[a-f0-9]{64}$/.test(marker.retry_digest)) return null
  return marker as PendingSignup
}

export function parsePendingSignupCookie(value: string | undefined): { userId: string; secret: string } | null {
  if (!value) return null
  const [userId, secret, extra] = value.split('.')
  if (extra !== undefined || !/^[a-f0-9-]{36}$/i.test(userId) || !/^[a-f0-9]{64}$/.test(secret)) return null
  return { userId, secret }
}

export function matchesPendingSignupSecret(marker: PendingSignup, secret: string): boolean {
  return timingSafeEqual(Buffer.from(marker.retry_digest), Buffer.from(digest(secret)))
}

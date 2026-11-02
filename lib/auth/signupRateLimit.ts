import { createHmac } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/server'

export function signupLimitBuckets(phone: string, email: string, ip: string, secret: string) {
  const key = (value: string) => createHmac('sha256', secret).update(`signup:${value}`).digest('hex')
  const buckets = [
    { key: key(`phone:${phone}`), limit: 3, seconds: 900 },
    { key: key(`phone-day:${phone}`), limit: 10, seconds: 86400 },
    { key: key(`ip:${ip}`), limit: 10, seconds: 900 },
    { key: key(`ip-day:${ip}`), limit: 50, seconds: 86400 },
    { key: key('global-day'), limit: 200, seconds: 86400 },
  ]
  if (email) buckets.push({ key: key(`email:${email}`), limit: 3, seconds: 900 })
  return buckets
}

/** Atomic database reservations apply across concurrent requests and instances. */
export async function reserveSignupSend(phone: string, email: string, requestHeaders: Headers) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Sign-in protection unavailable')
  // Vercel overwrites this header at ingress. Never trust a caller's generic
  // x-forwarded-for for quotas. Unknown hosts share the conservative fallback.
  const rawIp = process.env.VERCEL === '1' ? requestHeaders.get('x-vercel-forwarded-for') : null
  const ip = rawIp?.split(',')[0]?.trim().slice(0, 64) || 'unknown'
  const { data, error } = await createServiceClient().rpc('reserve_signup_send', {
    buckets: signupLimitBuckets(phone, email, ip, secret),
  })
  if (error || !data || typeof data.allowed !== 'boolean') throw new Error('Sign-in protection unavailable')
  return { allowed: data.allowed, retryAfter: Math.max(1, Number(data.retry_after) || 60) }
}

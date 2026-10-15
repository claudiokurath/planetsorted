import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type OtpClient = Pick<SupabaseClient<Database>, 'rpc'>

export type OtpReservation =
  | { outcome: 'reserved'; expiresAt: string }
  | { outcome: 'cooldown' | 'limit' }

export type OtpVerificationOutcome =
  | 'verified'
  | 'missing'
  | 'expired'
  | 'limit'
  | 'incorrect'
  | 'conflict'

/** Reserve under a database lock so simultaneous requests share one limit. */
export async function reserveOtpChallenge(
  client: OtpClient,
  userId: string,
  phone: string,
  digest: string
): Promise<OtpReservation> {
  const { data, error } = await client.rpc('reserve_whatsapp_otp', {
    p_user_id: userId,
    p_phone: phone,
    p_otp_hash: digest,
  })
  if (error || !Array.isArray(data) || data.length !== 1) {
    throw new Error('Verification session could not be reserved')
  }
  const row = data[0]
  if (row.outcome === 'cooldown' || row.outcome === 'limit') {
    return { outcome: row.outcome }
  }
  if (
    row.outcome === 'reserved' &&
    typeof row.expires_at === 'string' &&
    Number.isFinite(Date.parse(row.expires_at))
  ) {
    return { outcome: 'reserved', expiresAt: row.expires_at }
  }
  throw new Error('Verification session could not be reserved')
}

/** Compare, count attempts, link the number and consume the code atomically. */
export async function verifyOtpChallenge(
  client: OtpClient,
  userId: string,
  digest: string,
  firstName: string,
  email: string
): Promise<OtpVerificationOutcome> {
  const { data, error } = await client.rpc('verify_whatsapp_otp', {
    p_user_id: userId,
    p_otp_hash: digest,
    p_first_name: firstName,
    p_email: email,
  })
  if (error || !Array.isArray(data) || data.length !== 1) {
    throw new Error('Verification session could not be checked')
  }
  const outcome = data[0].outcome
  switch (outcome) {
    case 'verified':
    case 'missing':
    case 'expired':
    case 'limit':
    case 'incorrect':
    case 'conflict':
      return outcome
    default:
      throw new Error('Verification session could not be checked')
  }
}

export type OtpSendOutcome = 'accepted' | 'rejected' | 'unknown'

/**
 * Exactly one provider request. Timeouts and incomplete responses cannot tell
 * us whether Meta accepted the message, so never automatically send again.
 * Never persist/log the code, payload, phone number or provider response.
 */
export async function sendOtpCode(
  phone: string,
  otp: string,
  config: { phoneNumberId: string; token: string; templateName: string; language: string }
): Promise<OtpSendOutcome> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone,
          type: 'template',
          template: {
            name: config.templateName,
            language: { code: config.language },
            components: [
              { type: 'body', parameters: [{ type: 'text', text: otp }] },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [{ type: 'text', text: otp }],
              },
            ],
          },
        }),
      }
    )
    if (!response.ok) return response.status >= 500 || response.status === 408 ? 'unknown' : 'rejected'

    const result: unknown = await response.json()
    if (typeof result !== 'object' || result === null || !('messages' in result)) {
      return 'unknown'
    }
    const messages = result.messages
    if (!Array.isArray(messages) || messages.length !== 1) return 'unknown'
    const message: unknown = messages[0]
    return typeof message === 'object' && message !== null &&
      'id' in message && typeof message.id === 'string' && message.id.trim()
      ? 'accepted'
      : 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Stripe webhook event store — durable idempotency.
 *
 * claimStripeEvent inserts event.id. On unique violation the event was
 * already processed (or is in-flight) and the caller should no-op with 200.
 *
 * markStripeEventFailed lets ops see poison events; a failed claim is NOT
 * re-released automatically — re-delivery after a 5xx still hits the unique
 * key, so callers that return 5xx before mark should delete the claim first
 * via releaseStripeEventClaim.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Admin = SupabaseClient<Database>

export type ClaimResult =
  | { claimed: true }
  | { claimed: false; reason: 'duplicate' | 'error' }

export async function claimStripeEvent(
  sb: Admin,
  eventId: string,
  eventType: string
): Promise<ClaimResult> {
  const { error } = await sb.from('stripe_events').insert({
    event_id: eventId,
    event_type: eventType,
    status: 'processing',
  })

  if (!error) return { claimed: true }

  // 23505 = unique_violation
  const code = (error as { code?: string }).code
  if (code === '23505') {
    return { claimed: false, reason: 'duplicate' }
  }

  // Table missing in env that hasn't run the migration yet — fall open so
  // payments still work; log loudly.
  console.error('[stripe_events] claim failed', error)
  return { claimed: false, reason: 'error' }
}

export async function markStripeEventDone(
  sb: Admin,
  eventId: string
): Promise<void> {
  const { error } = await sb
    .from('stripe_events')
    .update({ status: 'done', processed_at: new Date().toISOString() })
    .eq('event_id', eventId)
  if (error) console.error('[stripe_events] mark done failed', error)
}

export async function markStripeEventFailed(
  sb: Admin,
  eventId: string,
  detail: string
): Promise<void> {
  const { error } = await sb
    .from('stripe_events')
    .update({
      status: 'failed',
      error_detail: detail.slice(0, 500),
      processed_at: new Date().toISOString(),
    })
    .eq('event_id', eventId)
  if (error) console.error('[stripe_events] mark failed failed', error)
}

/** Delete claim so Stripe can safely retry after a processing 5xx. */
export async function releaseStripeEventClaim(
  sb: Admin,
  eventId: string
): Promise<void> {
  const { error } = await sb.from('stripe_events').delete().eq('event_id', eventId)
  if (error) console.error('[stripe_events] release failed', error)
}

/**
 * WhatsApp RUN metering.
 *
 * Spec (docs/planet-sorted-master.md):
 *   CanRun = (entitlements.status = 'active') OR (sum credits_ledger.delta > 0)
 *
 * Website tool usage is NEVER metered — only WhatsApp TOOL/RUN commands.
 * Signup grant is +5 (DB trigger and/or ensureSignupCredits).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

export const SIGNUP_CREDITS = 5
export const SIGNUP_REASON = 'signup_grant'
export const RUN_REASON = 'whatsapp_run'

export type BillingClient = SupabaseClient<Database>

export type RunGateResult =
  | { allowed: true; unlimited: true; balance: null }
  | { allowed: true; unlimited: false; balance: number; remainingAfter: number }
  | { allowed: false; unlimited: false; balance: number; reason: 'no_credits' }

/** True when the member has an active Plus (or other paid) entitlement. */
export async function hasActiveEntitlement(
  sb: BillingClient,
  userId: string | null | undefined
): Promise<boolean> {
  if (!userId) return false
  const { data } = await sb
    .from('entitlements')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) return false
  if (data.status !== 'active' && data.status !== 'trialing') return false

  // Honour period end when present — a lapsed period is not active.
  if (data.current_period_end) {
    const end = Date.parse(data.current_period_end)
    if (Number.isFinite(end) && end < Date.now()) return false
  }
  return true
}

/** Sum of all ledger deltas for a user. Missing rows → 0. */
export async function getCreditBalance(
  sb: BillingClient,
  userId: string | null | undefined
): Promise<number> {
  if (!userId) return 0
  const { data, error } = await sb
    .from('credits_ledger')
    .select('delta')
    .eq('user_id', userId)

  if (error || !data) {
    console.error('[credits] balance query failed', error)
    return 0
  }
  return data.reduce((sum, row) => sum + (row.delta ?? 0), 0)
}

/**
 * Idempotent signup grant. Safe to call on every profile load —
 * only inserts once per user (reason = signup_grant).
 * Covers web-only signups where the users-row trigger never fired.
 */
export async function ensureSignupCredits(
  sb: BillingClient,
  userId: string
): Promise<void> {
  const { data: existing } = await sb
    .from('credits_ledger')
    .select('id')
    .eq('user_id', userId)
    .eq('reason', SIGNUP_REASON)
    .maybeSingle()

  if (existing) return

  const { error } = await sb.from('credits_ledger').insert({
    user_id: userId,
    delta: SIGNUP_CREDITS,
    reason: SIGNUP_REASON,
    source: 'signup',
  })

  // Unique race or missing table — log, don't throw.
  if (error) {
    console.error('[credits] ensureSignupCredits insert failed', error)
  }
}

/**
 * Decide whether a WhatsApp RUN is allowed.
 * Does NOT deduct — call consumeRunCredit after a successful send.
 */
export async function checkRunAllowed(
  sb: BillingClient,
  userId: string | null | undefined
): Promise<RunGateResult> {
  if (userId && (await hasActiveEntitlement(sb, userId))) {
    return { allowed: true, unlimited: true, balance: null }
  }

  const balance = userId ? await getCreditBalance(sb, userId) : 0
  if (balance > 0) {
    return {
      allowed: true,
      unlimited: false,
      balance,
      remainingAfter: balance - 1,
    }
  }
  return { allowed: false, unlimited: false, balance, reason: 'no_credits' }
}

/** Deduct one RUN credit. No-op for Plus members or missing userId. */
export async function consumeRunCredit(
  sb: BillingClient,
  userId: string | null | undefined,
  toolKey: string
): Promise<void> {
  if (!userId) return
  if (await hasActiveEntitlement(sb, userId)) return

  const { error } = await sb.from('credits_ledger').insert({
    user_id: userId,
    delta: -1,
    reason: RUN_REASON,
    source: `whatsapp:${toolKey.slice(0, 80)}`,
  })
  if (error) {
    console.error('[credits] consumeRunCredit failed', error)
  }
}

/** Plain-English paywall copy for WhatsApp. */
export function paywallMessage(upgradeUrl: string, balance = 0): string {
  const balLine =
    balance <= 0
      ? "You've used your 5 free WhatsApp tool runs."
      : `You have ${balance} free run${balance === 1 ? '' : 's'} left.`
  return (
    `${balLine}\n\n` +
    `Upgrade to PLANET SOR7ED Plus for unlimited RUN commands, saved history, and full plans:\n` +
    `${upgradeUrl}\n\n` +
    `Or text SAVE <keyword> anytime — saves are always free.`
  )
}

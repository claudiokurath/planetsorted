import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

export type DeliveryStatus = 'pending' | 'accepted' | 'failed' | 'skipped' | 'unknown'
export type WebsiteDeliveryResponse = {
  success: boolean
  actionId: string
  saveStatus: 'saved'
  deliveryStatus: DeliveryStatus
  deliveryReason: string | null
}
const STATUSES: DeliveryStatus[] = ['pending', 'accepted', 'failed', 'skipped', 'unknown']
export const isActionId = (value: unknown): value is string => typeof value === 'string'
  && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

export function deliveryRequestHash(slug: string, link: boolean, protocol: boolean, audio: boolean): string {
  return createHash('sha256').update(JSON.stringify([slug, link, protocol, audio])).digest('hex')
}

export function deliveryResponse(actionId: string, status: string, reason: string | null, updatedAt: string): WebsiteDeliveryResponse {
  const timestamp = Date.parse(updatedAt)
  const stale = status === 'pending' && (!Number.isFinite(timestamp) || Date.now() - timestamp > 120_000)
  const valid = STATUSES.includes(status as DeliveryStatus)
  const state: DeliveryStatus = stale || !valid ? 'unknown' : status as DeliveryStatus
  return { success: state === 'accepted', actionId, saveStatus: 'saved', deliveryStatus: state, deliveryReason: stale || !valid ? 'unconfirmed' : reason }
}

export async function claimDelivery(admin: SupabaseClient<Database>, input: {
  userId: string; actionId: string; hash: string; slug: string; url: string; title: string; category: string
}) {
  const { data, error } = await admin.rpc('claim_whatsapp_delivery_action', {
    p_user_id: input.userId, p_action_key: input.actionId, p_hash: input.hash,
    p_slug: input.slug, p_url: input.url, p_title: input.title, p_category: input.category,
  })
  if (error) {
    if (error.message?.includes('whatsapp_action_conflict')) throw new DeliveryActionConflict()
    throw new Error('This delivery request could not be saved.')
  }
  const row = data?.[0]
  if (!row || typeof row.created !== 'boolean' || !STATUSES.includes(row.delivery_status as DeliveryStatus)) {
    throw new Error('This delivery request could not be saved.')
  }
  return row
}

export class DeliveryActionConflict extends Error {}

export async function finishDelivery(admin: SupabaseClient<Database>, userId: string, actionId: string, status: DeliveryStatus, reason: string | null, messageIds: string[]) {
  const { data, error } = await admin.rpc('finish_whatsapp_delivery_action', {
    p_user_id: userId, p_action_key: actionId, p_status: status, p_reason: reason, p_message_ids: messageIds,
  })
  if (error || data !== true) throw new Error('The message outcome could not be recorded.')
}

export async function readDelivery(admin: SupabaseClient<Database>, userId: string, actionId: string) {
  const { data, error } = await admin.from('whatsapp_delivery_actions')
    .select('delivery_status, delivery_reason, updated_at')
    .eq('user_id', userId).eq('action_key', actionId).maybeSingle()
  if (error) throw new Error('The message outcome could not be checked.')
  return data ? deliveryResponse(actionId, data.delivery_status, data.delivery_reason, data.updated_at) : null
}

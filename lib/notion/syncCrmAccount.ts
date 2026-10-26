import { randomUUID, createHash } from 'node:crypto'
import { after } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { toCrmContact } from '@/lib/notion/crmContact'
import { syncUserToCrm } from '@/lib/notion/syncUserToCrm'

export async function syncCrmAccount(userId: string, force = false): Promise<'synced' | 'unchanged' | 'busy' | 'archived'> {
  const admin = createServiceClient()
  const { data: auth, error: authError } = await admin.auth.admin.getUserById(userId)
  if (authError || !auth.user) throw new Error('CRM account lookup failed')
  const { data: profile, error: profileError } = await admin.from('users')
    .select('first_name, whatsapp_number, whatsapp_verified, whatsapp_opted_out').eq('user_id', userId).maybeSingle()
  if (profileError) throw new Error('CRM profile lookup failed')
  const contact = toCrmContact(auth.user, profile)
  const hash = createHash('sha256').update(JSON.stringify(contact)).digest('hex')
  const { error: initializeError } = await admin.from('notion_crm_sync').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true })
  if (initializeError) throw new Error('CRM tracking is unavailable')
  const lockToken = randomUUID()
  const now = new Date()
  const { data: state, error: lockError } = await admin.from('notion_crm_sync')
    .update({ lock_until: new Date(now.getTime() + 120000).toISOString(), lock_token: lockToken })
    .eq('user_id', userId).or(`lock_until.is.null,lock_until.lt.${now.toISOString()}`).select('*').maybeSingle()
  if (lockError) throw new Error('CRM lock failed')
  if (!state) return 'busy'
  try {
    if (!force && state.contact_hash === hash && state.notion_page_id) return 'unchanged'
    const pageId = await syncUserToCrm(contact, { pageId: state.notion_page_id })
    if (pageId === null) {
      // Keep the page identity and do not claim a successful data sync. A later
      // Notion restore is detected on the next reconciliation because hash is null.
      const { error } = await admin.from('notion_crm_sync').update({ contact_hash: null, last_error: null })
        .eq('user_id', userId).eq('lock_token', lockToken)
      if (error) throw new Error('CRM tracking update failed')
      return 'archived'
    }
    const { error } = await admin.from('notion_crm_sync').update({ notion_page_id: pageId, contact_hash: hash, synced_at: new Date().toISOString(), last_error: null })
      .eq('user_id', userId).eq('lock_token', lockToken)
    if (error) throw new Error('CRM tracking update failed')
    return 'synced'
  } catch {
    // Keep retry state without storing Notion's response, emails or phone numbers.
    await admin.from('notion_crm_sync').update({ last_error: 'Sync failed; retry on the next reconciliation' }).eq('user_id', userId).eq('lock_token', lockToken)
    throw new Error('CRM sync failed')
  } finally {
    await admin.from('notion_crm_sync').update({ lock_until: null, lock_token: null }).eq('user_id', userId).eq('lock_token', lockToken)
  }
}

export function scheduleCrmSync(userId: string): void {
  after(async () => {
    try { await syncCrmAccount(userId) }
    catch { console.error('[Notion CRM] Account sync failed; daily reconciliation will retry') }
  })
}

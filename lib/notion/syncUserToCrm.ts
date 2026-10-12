import { Client } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import type { CrmContact } from './crmContact'
import { newCrmStatus } from './crmContact'

const DEFAULT_CRM = '35e0d601-4acc-80ff-8761-c320c06835ee'
type WriterOptions = { client?: Client; pageId?: string | null; databaseId?: string }

export async function syncUserToCrm(contact: CrmContact, options: WriterOptions = {}): Promise<string> {
  const token = process.env.NOTION_CRM_SECRET || process.env.NOTION_SECRET
  if (!options.client && !token) throw new Error('CRM integration is not configured')
  const notion = options.client || new Client({ auth: token, timeoutMs: 15000, logger: () => {} })
  const databaseId = options.databaseId || process.env.NOTION_CRM_DB_ID || DEFAULT_CRM
  let existing: PageObjectResponse | undefined
  if (options.pageId) {
    const page = await notion.pages.retrieve({ page_id: options.pageId })
    if (!('properties' in page) || page.archived) throw new Error('CRM record is unavailable')
    existing = page
  } else {
    const byId = await notion.databases.query({ database_id: databaseId, page_size: 2,
      filter: { property: 'Supabase User ID', rich_text: { equals: contact.userId } } })
    if (byId.results.length > 1) throw new Error('CRM identity conflict')
    const result = byId.results[0]
    if (result && result.object === 'page' && 'properties' in result) existing = result
    if (!existing && (contact.email || contact.whatsappNumber)) {
      const or = [
        ...(contact.email ? [{ property: 'Email', email: { equals: contact.email } }] : []),
        ...(contact.whatsappNumber ? [
          { property: 'WhatsApp', phone_number: { equals: contact.whatsappNumber } },
          { property: 'WhatsApp', phone_number: { equals: contact.whatsappNumber.replace(/^\+/, '') } },
        ] : []),
      ]
      const legacy = await notion.databases.query({ database_id: databaseId, page_size: 2, filter: { or } })
      if (legacy.results.length > 1) throw new Error('CRM identity conflict')
      const match = legacy.results[0]
      if (match && match.object === 'page' && 'properties' in match) {
        const id = match.properties['Supabase User ID']
        if (id?.type === 'rich_text' && id.rich_text.some(part => part.plain_text && part.plain_text !== contact.userId)) throw new Error('CRM identity conflict')
        existing = match
      }
    }
  }

  const status = existing?.properties.Status
  const currentStatus = status?.type === 'select' ? status.select?.name : null
  const properties: Parameters<Client['pages']['create']>[0]['properties'] = {
    'Supabase User ID': { rich_text: [{ text: { content: contact.userId } }] },
    'Account Confirmed': { checkbox: contact.confirmed },
    'WhatsApp Verified': { checkbox: contact.whatsappVerified },
    'Last Synced': { date: { start: new Date().toISOString() } },
    'Signed Up': { date: { start: contact.signedUp } },
    ...(contact.firstName || !existing ? { Name: { title: [{ text: { content: contact.firstName || contact.email || contact.whatsappNumber || 'New member' } }] } } : {}),
    ...(contact.email || !existing ? { Email: { email: contact.email } } : {}),
    ...(contact.whatsappNumber ? { WhatsApp: { phone_number: contact.whatsappNumber } } : {}),
  }
  // Preserve manual acquisition source, notes, country and unsubscribe/bounce
  // decisions. Confirmation promotes only our Pending status.
  if (!existing) {
    properties.Source = { select: { name: contact.source } }
    properties.Status = { select: { name: newCrmStatus(contact) } }
  } else if (contact.optedOut || (currentStatus === 'Pending' && contact.confirmed)) {
    properties.Status = { select: { name: contact.optedOut ? 'Unsubscribed' : 'Active' } }
  }
  const page = existing
    ? await notion.pages.update({ page_id: existing.id, properties })
    : await notion.pages.create({ parent: { database_id: databaseId }, properties })
  return page.id
}

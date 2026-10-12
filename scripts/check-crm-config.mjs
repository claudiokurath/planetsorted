import { Client } from '@notionhq/client'

const token = process.env.NOTION_CRM_SECRET || process.env.NOTION_SECRET
if (!token) {
  console.log('[CRM configuration] No Notion credentials in this build environment; check skipped.')
} else {
  try {
    const client = new Client({ auth: token, timeoutMs: 15000, logger: () => {} })
    const database = await client.databases.retrieve({ database_id: process.env.NOTION_CRM_DB_ID || '35e0d601-4acc-80ff-8761-c320c06835ee' })
    for (const property of ['Name', 'Email', 'WhatsApp', 'Status', 'Source', 'Signed Up', 'Supabase User ID', 'Account Confirmed', 'WhatsApp Verified', 'Last Synced']) {
      if (!database.properties[property]) throw new Error('CRM schema is incomplete')
    }
    console.log('[CRM configuration] Integration can read the CRM and required properties.')
  } catch {
    console.error('[CRM configuration] The Notion integration cannot read the configured CRM with the required properties. Share CRM with the configured integration and verify NOTION_CRM_DB_ID.')
    process.exitCode = 1
  }
}

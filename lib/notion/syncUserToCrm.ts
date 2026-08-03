import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_CRM_SECRET })
const CRM_DATABASE_ID = process.env.NOTION_CRM_DB_ID ?? '35e0d601-4acc-80ff-8761-c320c06835ee'

function normalizePhone(phone: string): string {
  return phone.startsWith('+') ? phone : `+${phone}`
}

export async function syncUserToCrm(params: {
  firstName: string
  email: string
  whatsappNumber?: string | null
  source: 'Website' | 'Phone'
}): Promise<void> {
  await notion.pages.create({
    parent: { database_id: CRM_DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: params.firstName || 'Unknown' } }] },
      Email: { email: params.email },
      ...(params.whatsappNumber
        ? { WhatsApp: { phone_number: normalizePhone(params.whatsappNumber) } }
        : {}),
      Status: { select: { name: 'Active' } },
      Source: { select: { name: params.source } },
      'Signed Up': { date: { start: new Date().toISOString() } },
    },
  })
}

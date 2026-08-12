import fs from 'fs'
import path from 'path'
import { Client } from '@notionhq/client'
import { createClient } from '@supabase/supabase-js'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = process.env[key] || value
    }
  }
}

const notion = new Client({ auth: process.env.NOTION_SECRET })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function syncAllPagesToSupabase() {
  console.log('Querying Notion database for ALL pages...')
  const response = await notion.databases.query({
    database_id: process.env.NOTION_ARTICLES_DB_ID || 'db668e4687ed455498357b8d11d2c714',
  })

  console.log(`Found ${response.results.length} total pages in Notion. Syncing categories to Supabase...`)

  let syncedCount = 0
  for (const page of response.results) {
    const props = page.properties
    const slug = getText(props['Slug'])
    if (!slug) continue

    const category = props['Category']?.select?.name ?? props['Category 1']?.select?.name ?? ''

    if (category) {
      const { error } = await supabase
        .from('protocols')
        .update({ category, updated_at: new Date().toISOString() })
        .eq('slug', slug)

      if (error) {
        console.error(`Error updating category for ${slug}:`, error)
      } else {
        syncedCount++
        console.log(`Updated Supabase protocol "${slug}" -> Category: "${category}"`)
      }
    }
  }

  console.log(`Finished syncing categories for ${syncedCount} protocols in Supabase!`)
}

function getText(prop) {
  if (!prop) return ''
  if (prop.type === 'type' || prop.type === 'title') return prop.title?.map((t) => t.plain_text).join('') || ''
  if (prop.type === 'rich_text') return prop.rich_text?.map((t) => t.plain_text).join('') || ''
  return ''
}

syncAllPagesToSupabase().catch(err => console.error('Sync failed:', err))

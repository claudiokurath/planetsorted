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

const CATEGORY_MAP = {
  'where-adhd-tax-actually-hides': 'Wealth',
  'people-pleasing-fear-not-kindness': 'Impression',
  'loneliness-full-life-surrounded-people': 'Connection',
  'masking-in-therapy-real-help': 'Mind',
  'hypersexuality-bipolar-tech-cycle': 'Tech',
  'adhd-prescription-access-postcode-lottery': 'Mind',
  'low-maintenance-friend-trap': 'Connection'
}

async function fixPublishedCategories() {
  for (const [slug, category] of Object.entries(CATEGORY_MAP)) {
    await supabase
      .from('protocols')
      .update({ category, updated_at: new Date().toISOString() })
      .eq('slug', slug)

    const notionRes = await notion.databases.query({
      database_id: process.env.NOTION_ARTICLES_DB_ID || 'db668e4687ed455498357b8d11d2c714',
      filter: { property: 'Slug', rich_text: { equals: slug } }
    })

    if (notionRes.results.length > 0) {
      await notion.pages.update({
        page_id: notionRes.results[0].id,
        properties: {
          Category: { select: { name: category } }
        }
      })
    }
  }
  console.log('Categories updated for all published protocols!')
}

fixPublishedCategories()

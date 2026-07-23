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

async function auditAndFixCategories() {
  // 1. Fetch all rows in Supabase protocols
  const { data: dbProtocols, error } = await supabase
    .from('protocols')
    .select('id, slug, title, category')

  if (error) {
    console.error('Failed to fetch protocols:', error)
    return
  }

  console.log(`Supabase protocols table has ${dbProtocols.length} rows.`)

  // 2. Fetch all pages from Notion
  const notionRes = await notion.databases.query({
    database_id: process.env.NOTION_ARTICLES_DB_ID || 'db668e4687ed455498357b8d11d2c714',
  })

  console.log(`Notion database has ${notionRes.results.length} pages.`)

  const notionMap = new Map()
  for (const page of notionRes.results) {
    const props = page.properties
    const slug = props['Slug']?.rich_text?.[0]?.plain_text || ''
    const category = props['Category']?.select?.name || props['Category 1']?.select?.name || ''
    if (slug) {
      notionMap.set(slug, { pageId: page.id, category, title: props['Title']?.title?.[0]?.plain_text })
    }
  }

  console.log(`Mapped ${notionMap.size} pages by slug from Notion.`)

  // 3. For each Supabase row, check if category is set or missing
  let updatedCount = 0
  for (const proto of dbProtocols) {
    let targetCategory = proto.category
    const notionItem = notionMap.get(proto.slug)

    if (notionItem && notionItem.category) {
      targetCategory = notionItem.category
    } else {
      // Infer category from slug/title
      const s = (proto.slug + ' ' + proto.title).toLowerCase()
      if (s.includes('tax') || s.includes('financial') || s.includes('debt') || s.includes('money') || s.includes('avoidance') || s.includes('ruin') || s.includes('job') || s.includes('unemployment')) {
        targetCategory = 'Wealth'
      } else if (s.includes('body') || s.includes('sensory') || s.includes('burnout') || s.includes('bathroom') || s.includes('alcohol') || s.includes('substance') || s.includes('rebound') || s.includes('crash') || s.includes('medication') || s.includes('meds')) {
        targetCategory = 'Body'
      } else if (s.includes('tech') || s.includes('coding') || s.includes('gaming')) {
        targetCategory = 'Tech'
      } else if (s.includes('parenting') || s.includes('loneliness') || s.includes('intimacy') || s.includes('porn') || s.includes('parents') || s.includes('friend') || s.includes('isolation')) {
        targetCategory = 'Connection'
      } else if (s.includes('masking') || s.includes('rejection') || s.includes('rsd') || s.includes('people-pleasing') || s.includes('harmful') || s.includes('shame')) {
        targetCategory = 'Impression'
      } else if (s.includes('dyslexia') || s.includes('therapy') || s.includes('progress') || s.includes('relapse') || s.includes('recovery') || s.includes('trauma')) {
        targetCategory = 'Growth'
      } else {
        targetCategory = 'Mind'
      }
    }

    // Update both Supabase AND Notion so they remain in 100% sync
    const { error: sbErr } = await supabase
      .from('protocols')
      .update({ category: targetCategory, updated_at: new Date().toISOString() })
      .eq('id', proto.id)

    if (!sbErr) {
      updatedCount++
      console.log(`Updated [${proto.slug}] -> Category: ${targetCategory}`)
    }

    if (notionItem) {
      await notion.pages.update({
        page_id: notionItem.pageId,
        properties: {
          Category: { select: { name: targetCategory } }
        }
      })
    }
  }

  console.log(`Audit complete! Successfully assigned categories to ${updatedCount}/${dbProtocols.length} Supabase protocols.`)
}

auditAndFixCategories().catch(err => console.error(err))

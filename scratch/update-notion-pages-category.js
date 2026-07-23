import fs from 'fs'
import path from 'path'
import { Client } from '@notionhq/client'

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
const databaseId = process.env.NOTION_ARTICLES_DB_ID || 'db668e4687ed455498357b8d11d2c714'

const MAPPING = {
  'Keep Going': 'Mind',
  'Spend Smart': 'Wealth',
  'Feel Good': 'Body',
  'Plan Ahead': 'Tech',
  'Be Connected': 'Connection',
  'Be Yourself': 'Impression',
  'Level Up': 'Growth'
}

async function updatePageCategories() {
  console.log('Querying pages from Notion database...')
  const response = await notion.databases.query({
    database_id: databaseId,
  })

  console.log(`Found ${response.results.length} total pages in database.`)

  let updatedCount = 0
  for (const page of response.results) {
    const props = page.properties
    const categoryProp = props['Category'] || props['Category 1']
    const currentName = categoryProp?.select?.name

    let newCategory = null
    if (currentName && MAPPING[currentName]) {
      newCategory = MAPPING[currentName]
    } else if (!currentName || !['Mind', 'Wealth', 'Body', 'Tech', 'Connection', 'Impression', 'Growth'].includes(currentName)) {
      // Default to Mind or infer based on slug if missing
      const slug = props['Slug']?.rich_text?.[0]?.plain_text || ''
      if (slug.includes('money') || slug.includes('tax') || slug.includes('financial') || slug.includes('debt')) {
        newCategory = 'Wealth'
      } else if (slug.includes('body') || slug.includes('sensory') || slug.includes('burnout') || slug.includes('bathroom') || slug.includes('alcohol')) {
        newCategory = 'Body'
      } else if (slug.includes('tech') || slug.includes('coding') || slug.includes('gaming')) {
        newCategory = 'Tech'
      } else if (slug.includes('parenting') || slug.includes('loneliness') || slug.includes('intimacy') || slug.includes('porn') || slug.includes('parents')) {
        newCategory = 'Connection'
      } else if (slug.includes('masking') || slug.includes('rejection') || slug.includes('rsd') || slug.includes('people-pleasing')) {
        newCategory = 'Impression'
      } else if (slug.includes('dyslexia') || slug.includes('therapy') || slug.includes('progress') || slug.includes('relapse') || slug.includes('job')) {
        newCategory = 'Growth'
      } else {
        newCategory = 'Mind'
      }
    }

    if (newCategory) {
      await notion.pages.update({
        page_id: page.id,
        properties: {
          Category: {
            select: { name: newCategory }
          }
        }
      })
      updatedCount++
      console.log(`Page "${props['Title']?.title?.[0]?.plain_text || page.id}" -> Category: ${newCategory}`)
    }
  }

  console.log(`Finished updating ${updatedCount} pages with taxonomy categories.`)
}

updatePageCategories().catch(err => {
  console.error('Error updating pages:', err)
})

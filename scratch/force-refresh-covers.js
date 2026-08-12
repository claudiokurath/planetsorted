/**
 * force-refresh-covers.js
 * Force re-downloads all Notion cover images into Supabase Storage,
 * overwriting whatever was previously stored.
 * Run with: node scratch/force-refresh-covers.js
 */

require('dotenv').config({ path: '.env.local' })
const { Client } = require('@notionhq/client')
const { createClient } = require('@supabase/supabase-js')

const notion = new Client({ auth: process.env.NOTION_SECRET })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  console.log('Fetching published articles from Notion…')
  const response = await notion.databases.query({
    database_id: process.env.NOTION_ARTICLES_DB_ID,
    filter: { property: 'Status', status: { equals: 'Published' } },
  })

  const pages = response.results
  console.log(`Found ${pages.length} articles\n`)

  for (const page of pages) {
    const props = page.properties
    const slug = getText(props['Slug'])
    if (!slug) continue

    const coverFiles = props['Cover Image 1']?.files ?? []
    if (!coverFiles[0]) {
      console.log(`  ⚠  ${slug} — no cover image in Notion, skipping`)
      continue
    }

    if (coverFiles[0].type === 'external') {
      console.log(`  ⏭  ${slug} — external URL, not stored in Supabase`)
      continue
    }

    const notionUrl = coverFiles[0].file.url
    const path = `notion-files/covers/${slug}.jpg`

    try {
      console.log(`  ↓  ${slug} — downloading…`)
      const res = await fetch(notionUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = await res.arrayBuffer()

      // Delete the old file first so upsert is clean
      await supabase.storage.from('public').remove([path])

      // Upload the fresh version
      const { error } = await supabase.storage.from('public').upload(path, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(path)
      console.log(`  ✓  ${slug}`)
      console.log(`     ${publicUrl}`)

      // Update the cover_image field in the protocols table
      const { error: dbErr } = await supabase
        .from('protocols')
        .update({ cover_image: publicUrl })
        .eq('slug', slug)
      if (dbErr) console.log(`  ⚠  DB update failed: ${dbErr.message}`)
    } catch (err) {
      console.log(`  ✗  ${slug} — ${err.message}`)
    }
  }

  console.log('\nDone.')
}

function getText(prop) {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title.map(t => t.plain_text).join('')
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('')
  return ''
}

run().catch(console.error)

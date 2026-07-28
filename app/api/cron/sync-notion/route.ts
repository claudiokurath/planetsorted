import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { createClient } from '@supabase/supabase-js'

const notion = new Client({ auth: process.env.NOTION_SECRET })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = await notion.databases.query({
    database_id: process.env.NOTION_ARTICLES_DB_ID!,
    filter: { property: 'Status', status: { equals: 'Published' } },
  })

  const synced: string[] = []
  for (const page of response.results as any[]) {
    const props = page.properties
    const slug = getText(props['Slug'])
    if (!slug) continue

    let cover_image: string | null = null
    const coverFiles = props['Cover Image 1']?.files ?? []
    if (coverFiles[0]?.type === 'file') cover_image = await syncCoverImage(slug, coverFiles[0].file.url)
    else if (coverFiles[0]?.type === 'external') cover_image = coverFiles[0].external.url

    const audioUrlProp = props['Audio URL']
    const audio_url = audioUrlProp?.type === 'url' ? (audioUrlProp.url ?? null) : (getText(audioUrlProp) || null)

    const row = {
      slug,
      title: getText(props['Title']),
      type: props['Type']?.select?.name ?? 'Article',
      category: props['Category']?.select?.name ?? '',
      status: props['Status']?.status?.name ?? '',
      summary: getText(props['Summary']),
      excerpt: getText(props['Excerpt']),
      problem: getText(props['Blog Post']),
      cta: getText(props['CTA']),
      protocol: getText(props['Protocol']),
      keyword: getText(props['WhatsApp Trigger']),
      cover_image,
      audio_url,
      read_time: getText(props['Read Time']),
      meta_description: getText(props['Meta Description']),
      seo_title: getText(props['SEO Title']),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('protocols').upsert(row, { onConflict: 'slug' })
    if (!error) synced.push(slug)
  }

  return NextResponse.json({ synced: synced.length, slugs: synced })
}

async function syncCoverImage(slug: string, notionUrl: string): Promise<string> {
  const path = `notion-files/covers/${slug}.jpg`
  const buffer = await (await fetch(notionUrl)).arrayBuffer()
  await supabase.storage.from('public').upload(path, buffer, { contentType: 'image/jpeg', upsert: true })
  return supabase.storage.from('public').getPublicUrl(path).data.publicUrl
}

function getText(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title.map((t: any) => t.plain_text).join('')
  if (prop.type === 'rich_text') return prop.rich_text.map((t: any) => t.plain_text).join('')
  return ''
}

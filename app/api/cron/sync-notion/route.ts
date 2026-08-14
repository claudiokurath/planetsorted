import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

let _notion: Client | null = null
function getNotion(): Client {
  if (!_notion) _notion = new Client({ auth: process.env.NOTION_SECRET })
  return _notion
}

let _supabase: ReturnType<typeof createClient<Database>> | null = null
function getSupabase() {
  if (!_supabase) _supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  return _supabase
}

const LEGACY_CATEGORIES: Record<string, string> = {
  'Keep Going': 'Mind',
  'Spend Smart': 'Wealth',
  'Feel Good': 'Body',
  'Plan Ahead': 'Tech',
  'Be Connected': 'Connection',
  'Be Yourself': 'Impression',
  'Level Up': 'Growth',
}

interface SyncSource {
  databaseId: string
  type: 'Article' | 'Tool'
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'You are not allowed to run this sync.' }, { status: 401 })
  }

  try {
    const articleDatabaseId = process.env.NOTION_BLOG_DB_ID ?? process.env.NOTION_ARTICLES_DB_ID
    const toolDatabaseId = process.env.NOTION_TOOLS_DB_ID

    if (!articleDatabaseId || !toolDatabaseId) {
      return NextResponse.json(
        { error: 'The Notion content databases are not configured.' },
        { status: 500 }
      )
    }

    const sources: SyncSource[] = [
      { databaseId: articleDatabaseId, type: 'Article' },
      { databaseId: toolDatabaseId, type: 'Tool' },
    ]

    const results = []
    for (const source of sources) {
      results.push(await syncPublishedContent(source))
    }

    return NextResponse.json({
      synced: results.reduce((total, result) => total + result.slugs.length, 0),
      articles: results.find((result) => result.type === 'Article')?.slugs ?? [],
      tools: results.find((result) => result.type === 'Tool')?.slugs ?? [],
    })
  } catch (error) {
    console.error('[Notion sync failed]', error)
    return NextResponse.json(
      { error: 'The Notion content sync could not be completed.' },
      { status: 500 }
    )
  }
}

async function syncPublishedContent(source: SyncSource) {
  const pages = await queryAllPublishedPages(source.databaseId)
  const publishedSlugs: string[] = []

  for (const page of pages) {
    const props = page.properties
    const slug = getText(props['Slug']).trim()
    if (!slug) continue

    try {
      const coverProperty = source.type === 'Article' ? props['Cover Image'] : props['Cover Image 1']
      // getCoverImage returns undefined when the Notion signed URL has expired —
      // in that case we omit cover_image from the upsert so the existing value is preserved.
      const coverImage = await getCoverImage(slug, coverProperty)

      const sharedRow: Record<string, unknown> = {
        slug,
        type: source.type,
        status: 'Published',
        summary: getText(props['Summary']),
        problem: getText(props['Blog Post']),
        keyword: getText(props['WhatsApp Trigger']),
        meta_description: getText(props['Meta Description']),
        updated_at: new Date().toISOString(),
      }

      // Only include cover_image in the upsert when we actually resolved one,
      // so an expired Notion URL doesn't overwrite a valid Supabase-stored URL.
      if (coverImage !== undefined) {
        sharedRow.cover_image = coverImage
      }

      const row: any = source.type === 'Article'
        ? {
            ...sharedRow,
            title: getText(props['Title']),
            category: mapCategory(props['Category']?.select?.name),
            excerpt: getText(props['Excerpt']),
            cta: getText(props['CTA']),
            protocol: getText(props['Protocol']),
            audio_url: getUrl(props['Deep Dive']),
            read_time: getText(props['Read Time']),
            seo_title: getText(props['SEO Title']),
          }
        : {
            ...sharedRow,
            title: getText(props['Name']),
            category: mapCategory(props['Category 1']?.select?.name),
            cta: props['CTA Text']?.select?.name ?? '',
          }

      const { error } = await getSupabase().from('protocols').upsert(row, { onConflict: 'slug' })
      if (error) throw error

      publishedSlugs.push(slug)
    } catch (err) {
      // Log the failure but don't abort the rest of the batch
      console.error(`[Notion sync] Failed to sync ${source.type} "${slug}":`, err)
    }
  }

  await unpublishStaleRows(source.type, publishedSlugs)
  return { type: source.type, slugs: publishedSlugs }
}

async function queryAllPublishedPages(databaseId: string) {
  const pages: any[] = []
  let startCursor: string | undefined

  do {
    const response = await getNotion().databases.query({
      database_id: databaseId,
      filter: { property: 'Status', status: { equals: 'Published' } },
      start_cursor: startCursor,
      page_size: 100,
    })

    pages.push(...response.results)
    startCursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (startCursor)

  return pages as Array<{ properties: Record<string, any> }>
}

async function unpublishStaleRows(type: SyncSource['type'], publishedSlugs: string[]) {
  const { data, error } = await getSupabase()
    .from('protocols')
    .select('slug')
    .eq('type', type)
    .eq('status', 'Published')

  if (error) throw error

  const publishedSet = new Set(publishedSlugs)
  const staleSlugs = (data ?? [])
    .map((row) => row.slug)
    .filter((slug): slug is string => Boolean(slug) && !publishedSet.has(slug))

  if (staleSlugs.length === 0) return

  const { error: updateError } = await getSupabase()
    .from('protocols')
    .update({ status: 'Draft', updated_at: new Date().toISOString() })
    .in('slug', staleSlugs)

  if (updateError) throw updateError
}

async function getCoverImage(slug: string, prop: any): Promise<string | null | undefined> {
  const firstFile = prop?.files?.[0]
  // No file property set in Notion — store null
  if (!firstFile) return null

  if (firstFile.type === 'external') return firstFile.external.url

  if (firstFile.type === 'file') {
    try {
      return await syncCoverImage(slug, firstFile.file.url)
    } catch (err) {
      // Notion's signed S3 URLs expire quickly. Return undefined so the caller
      // skips updating cover_image and preserves whatever is already in the DB.
      console.warn(`[Notion sync] Cover image download failed for "${slug}" (URL may have expired):`, err)
      return undefined
    }
  }

  return null
}

async function syncCoverImage(slug: string, notionUrl: string): Promise<string> {
  const path = `notion-files/covers/${slug}.jpg`
  const response = await fetch(notionUrl)
  if (!response.ok) throw new Error(`Could not download the Notion cover for ${slug}.`)

  const buffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  const { error } = await getSupabase().storage
    .from('public')
    .upload(path, buffer, { contentType, upsert: true })

  if (error) throw error
  return getSupabase().storage.from('public').getPublicUrl(path).data.publicUrl
}

// Applied to Articles and Tools alike: a retired descriptive name left on any
// Notion row is normalised to the one-word taxonomy before it reaches the
// `category` column, so retired names can never become database values.
function mapCategory(category?: string): string {
  if (!category) return ''
  return LEGACY_CATEGORIES[category] ?? category
}

function getUrl(prop: any): string | null {
  if (!prop) return null
  if (prop.type === 'url') return prop.url ?? null
  return getText(prop) || null
}

function getText(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title.map((item: any) => item.plain_text).join('')
  if (prop.type === 'rich_text') return prop.rich_text.map((item: any) => item.plain_text).join('')
  return ''
}

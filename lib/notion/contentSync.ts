import 'server-only'
import { Client } from '@notionhq/client'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'
import { buildVersionedCoverPath } from '@/lib/content/coverStorage'
import { getNotionProperty } from '@/lib/content/notionProperties'

let _notion: Client | null = null
function getNotion(): Client {
  if (!_notion) _notion = new Client({ auth: process.env.NOTION_SECRET, timeoutMs: 10000, logger: () => {} })
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

/** Complete a fresh Notion snapshot before exposing any cached content. */
export async function syncPublishedContent(): Promise<{ tools: string[]; articles: string[] }> {
  const articleDatabaseId = process.env.NOTION_BLOG_DB_ID ?? process.env.NOTION_ARTICLES_DB_ID
  const toolDatabaseId = process.env.NOTION_TOOLS_DB_ID
  if (!process.env.NOTION_SECRET || !articleDatabaseId || !toolDatabaseId) throw new Error('Notion content is not configured')
  const results = await Promise.all([
    reconcilePublishedContent({ databaseId: articleDatabaseId, type: 'Article' }),
    reconcilePublishedContent({ databaseId: toolDatabaseId, type: 'Tool' }),
  ])
  return { tools: results[1].slugs, articles: results[0].slugs }
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
    .eq('type', type)
    .in('slug', staleSlugs)

  if (updateError) throw updateError
}

// Reconciliation pass: verify all published Notion pages are in DB
// This runs hourly and catches any webhooks that may have been missed
async function reconcilePublishedContent(source: SyncSource) {
  const pages = await queryAllPublishedPages(source.databaseId)
  const publishedSlugs: string[] = []
  const reconciled: string[] = []
  let failures = 0

  for (const page of pages) {
    const props = page.properties
    const slug = getText(props['Slug']).trim()
    if (!slug) continue

    publishedSlugs.push(slug)

    // Check if this page is already in DB and recently synced
    const { data: existing } = await getSupabase()
      .from('protocols')
      .select('slug, status, last_synced_at, sync_status')
      .eq('slug', slug)
      .single()

    if (existing) {
      // Page exists in DB
      const lastSyncedAt = new Date(existing.last_synced_at || 0)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

      if (existing.status !== 'Published' || new Date((page as any).last_edited_time || 0) > lastSyncedAt || lastSyncedAt < fiveMinutesAgo || existing.sync_status === 'failed') {
        // Webhook may have been missed or failed — re-sync now
        try {
          await syncPageFromNotion(page, source.type)
          reconciled.push(slug)
          console.log(`[Notion cron] Reconciled ${source.type}: ${slug}`)
        } catch (err) {
          failures++
          console.error(`[Notion cron] Failed to reconcile ${source.type} "${slug}":`, err)
        }
      }
    } else {
      // Page not in DB yet — add it
      try {
        await syncPageFromNotion(page, source.type)
        reconciled.push(slug)
        console.log(`[Notion cron] Added missing ${source.type}: ${slug}`)
      } catch (err) {
        failures++
        console.error(`[Notion cron] Failed to add ${source.type} "${slug}":`, err)
      }
    }
  }

  await unpublishStaleRows(source.type, publishedSlugs)
  if (failures) throw new Error('Some Notion content could not be synced')
  return { type: source.type, slugs: publishedSlugs, reconciled }
}

async function syncPageFromNotion(page: any, sourceType: 'Article' | 'Tool') {
  const props = page.properties
  const slug = getText(props['Slug']).trim()
  if (!slug) throw new Error('No slug found')

  const coverProperty = sourceType === 'Article' ? props['Cover Image'] : props['Cover Image 1']
  const coverImage = await getCoverImage(slug, coverProperty)

  const sharedRow: Record<string, unknown> = {
    slug,
    type: sourceType,
    status: 'Published',
    summary: getText(props['Summary']),
    problem: getText(props['Blog Post']),
    keyword: getText(props['WhatsApp Trigger']),
    meta_description: getText(props['Meta Description']),
    updated_at: new Date().toISOString(),
    sync_status: 'synced',
    last_synced_at: new Date().toISOString(),
    sync_error: null,
  }

  if (coverImage !== undefined) {
    sharedRow.cover_image = coverImage
  }

  const row: any = sourceType === 'Article'
    ? {
        ...sharedRow,
        title: getText(props['Title']),
        category: mapCategory(props['Category']?.select?.name),
        excerpt: getText(props['Excerpt']),
        cta: getText(props['CTA']),
        protocol: getText(props['Protocol']),
        gamma_url: getUrl(props['Protocol Gamma']),
        blog_gamma_url: getUrl(getNotionProperty(props, 'Blog Post Gamma')),
        audio_url: getUrl(props['Deep Dive']),
        read_time: getText(props['Read Time']),
        seo_title: getText(props['SEO Title']),
      }
    : {
        ...sharedRow,
        title: getText(props['Name']),
        category: mapCategory(props['Category 1']?.select?.name),
        cta: props['CTA Text']?.select?.name ?? '',
        // Tools carry a single "Gamma" property. It holds either a share
        // link or the whole <iframe> snippet from Gamma's embed dialog —
        // gammaEmbedUrl normalises both, so store what Notion has verbatim.
        gamma_url: getUrl(props['Gamma']),
      }

  const { error } = await getSupabase().from('protocols').upsert(row, { onConflict: 'slug' })
  if (error) throw error
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
  const response = await fetch(notionUrl)
  if (!response.ok) throw new Error(`Could not download the Notion cover for ${slug}.`)

  const bytes = new Uint8Array(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  // The path includes a hash of the actual image bytes. Replacing a Notion
  // cover therefore produces a new URL, which prevents Supabase, Next Image,
  // and the member's browser from continuing to serve the old cached artwork.
  const path = buildVersionedCoverPath(slug, bytes, contentType)
  const { error } = await getSupabase().storage
    .from('public')
    .upload(path, bytes, {
      contentType,
      cacheControl: '31536000',
      upsert: true,
    })

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

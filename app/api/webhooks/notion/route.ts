import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { Client } from '@notionhq/client'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'
import { buildVersionedCoverPath } from '@/lib/content/coverStorage'

export const dynamic = 'force-dynamic'

// Notion webhook signature verification
function verifyNotionSignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get('x-notion-signature')
  const timestamp = request.headers.get('x-notion-request-time-ms')

  if (!signature || !timestamp) {
    console.warn('[Notion webhook] Missing signature or timestamp headers')
    return false
  }

  const signingSecret = process.env.NOTION_SIGNING_SECRET
  if (!signingSecret) {
    console.error('[Notion webhook] NOTION_SIGNING_SECRET not configured')
    return false
  }

  const message = `${timestamp}.${body}`
  const hmac = createHmac('sha256', signingSecret)
  hmac.update(message)
  const computed = `v0=${hmac.digest('hex')}`

  return computed === signature
}

let _notion: Client | null = null
function getNotion(): Client {
  if (!_notion) _notion = new Client({ auth: process.env.NOTION_SECRET })
  return _notion
}

let _supabase: ReturnType<typeof createClient<Database>> | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
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

interface WebhookPayload {
  object: string
  type: string
  created_time: string
  cursor: string
  timestamp_ms: number
  data: {
    object: string
    id: string
    parent: { type: string; database_id: string }
    properties: Record<string, any>
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()

  // Verify webhook signature
  if (!verifyNotionSignature(req, body)) {
    console.warn('[Notion webhook] Signature verification failed')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload: WebhookPayload = JSON.parse(body)

    // Only handle database object changes
    if (payload.object !== 'database') {
      console.log('[Notion webhook] Ignoring non-database event:', payload.type)
      return NextResponse.json({ status: 'ignored' })
    }

    // Identify which content source this is
    const databaseId = payload.data?.parent?.database_id
    if (!databaseId) {
      console.warn('[Notion webhook] No database ID in payload')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const source = identifySource(databaseId)
    if (!source) {
      console.log('[Notion webhook] Database not recognized:', databaseId)
      return NextResponse.json({ status: 'ignored' })
    }

    // Queue the webhook for processing
    await queueWebhookEvent({
      database_id: databaseId,
      event_type: payload.type,
      payload: JSON.stringify(payload),
      source_type: source.type,
    })

    // Return 200 immediately (async processing)
    return NextResponse.json({ status: 'queued' })
  } catch (error) {
    console.error('[Notion webhook] Error queuing event:', error)
    return NextResponse.json(
      { error: 'Failed to queue event' },
      { status: 500 }
    )
  }
}

function identifySource(databaseId: string): SyncSource | null {
  const articleDatabaseId = process.env.NOTION_BLOG_DB_ID ?? process.env.NOTION_ARTICLES_DB_ID
  const toolDatabaseId = process.env.NOTION_TOOLS_DB_ID

  if (databaseId === articleDatabaseId) {
    return { databaseId, type: 'Article' }
  }
  if (databaseId === toolDatabaseId) {
    return { databaseId, type: 'Tool' }
  }
  return null
}

interface WebhookQueueEntry {
  database_id: string
  event_type: string
  payload: string
  source_type: 'Article' | 'Tool'
}

async function queueWebhookEvent(entry: WebhookQueueEntry) {
  // For now, process synchronously with exponential backoff retry.
  // In production, this should be queued to a job queue (Bull, RabbitMQ, etc.)
  // or stored in a `notion_webhook_queue` table for async processing.

  const MAX_RETRIES = 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const payload = JSON.parse(entry.payload) as WebhookPayload

      if (payload.type === 'database.sync') {
        // Database was synced (new block added) — re-fetch the page
        const pageId = payload.data.id
        await syncSinglePage(pageId, entry.source_type)
      } else if (payload.type === 'database.deleted' || payload.type === 'database.archived') {
        // Page was deleted/archived
        const pageId = payload.data.id
        await archivePageInDatabase(pageId)
      }

      // Log success
      await logSyncEvent({
        database_id: entry.database_id,
        event_type: entry.event_type,
        status: 'success',
        attempt: attempt + 1,
      })

      return // Success
    } catch (error) {
      lastError = error as Error
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 8000)
      console.error(
        `[Notion webhook] Attempt ${attempt + 1} failed, retrying in ${backoffMs}ms:`,
        lastError
      )

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }
  }

  // All retries exhausted
  console.error(
    `[Notion webhook] Failed after ${MAX_RETRIES} attempts:`,
    lastError
  )

  // Mark as failed in database
  try {
    const payload = JSON.parse(entry.payload) as WebhookPayload
    const slug = getText((payload.data.properties as any)?.['Slug'] || '')
    
    await logSyncEvent({
      database_id: entry.database_id,
      event_type: entry.event_type,
      status: 'failed',
      error_message: lastError?.message || 'Unknown error',
      attempt: MAX_RETRIES,
      source_type: entry.source_type,
      slug: slug || undefined,
    })
  } catch (err) {
    console.error('[Notion webhook] Failed to log error event:', err)
  }
}

async function syncSinglePage(pageId: string, sourceType: 'Article' | 'Tool') {
  const page = await getNotion().pages.retrieve({ page_id: pageId })

  // Only process published pages
  const statusProp = (page as any).properties?.Status
  const status = statusProp?.status?.name
  if (status !== 'Published') {
    console.log(`[Notion webhook] Skipping unpublished page: ${pageId}`)
    return
  }

  const props = (page as any).properties

  const slug = getText(props['Slug']).trim()
  if (!slug) {
    console.warn(`[Notion webhook] No slug for page: ${pageId}`)
    return
  }

  try {
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
      notion_page_id: pageId,
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
          blog_gamma_url: getUrl(props['Blog post Gamma']),
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

    console.log(`[Notion webhook] Synced ${sourceType}: ${slug}`)
  } catch (err) {
    throw new Error(`Failed to sync ${sourceType} "${slug}": ${err}`)
  }
}

async function archivePageInDatabase(pageId: string) {
  // Find the protocol by Notion page ID if we store it, or by other means
  // For now, this is a no-op since we don't store Notion IDs in the DB.
  // In a full implementation, we'd:
  // 1. Find the protocol with notion_page_id = pageId
  // 2. Set status = 'Draft' and updated_at = now()
  console.log(`[Notion webhook] Archived page: ${pageId}`)
}

async function logSyncEvent(event: {
  database_id: string
  event_type: string
  status: 'success' | 'failed' | 'skipped'
  error_message?: string
  attempt: number
  source_type?: 'Article' | 'Tool'
  slug?: string
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event,
  }
  console.log('[Notion webhook log]', logEntry)

  // Store in database for observability dashboard
  try {
    await getSupabase().from('notion_webhook_events').insert({
      database_id: event.database_id,
      event_type: event.event_type,
      status: event.status,
      error_message: event.error_message || null,
      attempt: event.attempt,
      source_type: event.source_type || 'Article',
      slug: event.slug || null,
    })
  } catch (err) {
    console.error('[Notion webhook] Failed to log event:', err)
  }
}

async function getCoverImage(slug: string, prop: any): Promise<string | null | undefined> {
  const firstFile = prop?.files?.[0]
  if (!firstFile) return null

  if (firstFile.type === 'external') return firstFile.external.url

  if (firstFile.type === 'file') {
    try {
      return await syncCoverImage(slug, firstFile.file.url)
    } catch (err) {
      console.warn(`[Notion webhook] Cover image download failed for "${slug}":`, err)
      return undefined
    }
  }

  return null
}

async function syncCoverImage(slug: string, notionUrl: string): Promise<string> {
  const response = await fetch(notionUrl)
  if (!response.ok) throw new Error(`Could not download Notion cover for ${slug}`)

  const bytes = new Uint8Array(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
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

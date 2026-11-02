import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { Client } from '@notionhq/client'
import { createServiceClient } from '@/lib/supabase/server'
import { syncPublishedContent } from '@/lib/notion/contentSync'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/** Notion signs the untouched request body with its subscription token. */
function trustedSignature(body: string, signature: string | null): boolean {
  const token = process.env.NOTION_SIGNING_SECRET
  if (!token || !signature || !/^sha256=[a-f0-9]{64}$/.test(signature)) return false
  const expected = `sha256=${createHmac('sha256', token).update(body).digest('hex')}`
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

function normalId(value: string | undefined) { return value?.replace(/-/g, '') }

export async function POST(req: NextRequest) {
  const body = await req.text()
  if (Buffer.byteLength(body) > 128_000) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 })
  if (!trustedSignature(body, req.headers.get('x-notion-signature'))) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }
  let payload
  try { payload = JSON.parse(body) } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const type = typeof payload?.type === 'string' ? payload.type : ''
  const pageId = payload?.entity?.type === 'page' ? payload.entity.id : null
  if (!type.startsWith('page.') || typeof pageId !== 'string' || !/^[a-f0-9-]{32,36}$/i.test(pageId)) {
    return NextResponse.json({ status: 'ignored' })
  }
  const sources = [
    { databaseId: process.env.NOTION_BLOG_DB_ID ?? process.env.NOTION_ARTICLES_DB_ID, type: 'Article' as const },
    { databaseId: process.env.NOTION_TOOLS_DB_ID, type: 'Tool' as const },
  ]
  try {
    const notion = new Client({ auth: process.env.NOTION_SECRET, timeoutMs: 10000, logger: () => {} })
    let parentId: string | undefined
    try {
      const page = await notion.pages.retrieve({ page_id: pageId })
      if ('parent' in page && page.parent.type === 'database_id') parentId = page.parent.database_id
    } catch (error) {
      // Deleted/moved pages may no longer be retrievable. A full fresh source
      // reconciliation safely withdraws them; never trust the old event values.
      if (!(error && typeof error === 'object' && 'status' in error && error.status === 404)) throw error
    }
    const source = sources.find(item => item.databaseId && normalId(item.databaseId) === normalId(parentId))
    if (parentId && !source) return NextResponse.json({ status: 'ignored' })
    if (!parentId && type !== 'page.deleted' && type !== 'page.moved') return NextResponse.json({ status: 'ignored' })

    // Reuse exactly the same live source reader as catalogues and scheduled
    // reconciliation, including unpublication and current Gamma properties.
    await syncPublishedContent()
    if (source?.databaseId) {
      const { error } = await createServiceClient().from('notion_webhook_events').insert({
        database_id: source.databaseId, event_type: type, status: 'success', source_type: source.type, attempt: 1, slug: null, error_message: null,
      })
      if (error) throw new Error('Sync audit unavailable')
    }
    return NextResponse.json({ status: 'synced' })
  } catch {
    // A non-2xx response makes Notion retry; do not claim an async queue exists.
    console.error('[Notion webhook] Reconciliation failed; retry required')
    return NextResponse.json({ error: 'Content could not be updated. Please retry.' }, { status: 503 })
  }
}

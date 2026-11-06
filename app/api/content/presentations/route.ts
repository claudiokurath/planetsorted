import { NextRequest, NextResponse } from 'next/server'
import { getLiveContent } from '@/lib/notion/liveContent'
import { createServiceClient } from '@/lib/supabase/server'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'no-store' }

/** Configuration health only: presentations render from Notion's live embeds. */
export async function GET(request: NextRequest) {
  try {
    const published = await getLiveContent()
    const db = createServiceClient()
    const [tools, articles] = await Promise.all([
      db.from('protocols').select('slug, gamma_url').eq('type', 'Tool').eq('status', 'Published'),
      db.from('protocols').select('slug, blog_gamma_url').eq('type', 'Article').eq('status', 'Published'),
    ])
    if (tools.error || articles.error) throw new Error('Sources unavailable')
    const entries = [
      ...(tools.data ?? []).filter(item => published.tools.includes(item.slug)).map(item => ({ slug: item.slug, type: 'Tool', field: 'Gamma', src: gammaEmbedUrl(item.gamma_url) })),
      ...(articles.data ?? []).filter(item => published.articles.includes(item.slug)).map(item => ({ slug: item.slug, type: 'Article', field: 'Blog Post Gamma', src: gammaEmbedUrl(item.blog_gamma_url) })),
    ]
    const configured = entries.length === published.tools.length + published.articles.length && entries.every(item => item.src)
    return NextResponse.json({ mode: 'live-notion-embed', configured, entries }, { headers, status: request.nextUrl.searchParams.get('health') === '1' && !configured ? 503 : 200 })
  } catch { return NextResponse.json({ error: 'Presentation links are temporarily unavailable.' }, { status: 503, headers }) }
}

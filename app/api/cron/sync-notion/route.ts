import { NextRequest, NextResponse } from 'next/server'
import { syncPublishedContent } from '@/lib/notion/contentSync'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'You are not allowed to run this sync.' }, { status: 401 })
  }
  try {
    const snapshot = await syncPublishedContent()
    return NextResponse.json({ synced: snapshot.tools.length + snapshot.articles.length, ...snapshot })
  } catch {
    console.error('[Notion sync] Reconciliation failed; public content will retry')
    return NextResponse.json({ error: 'The Notion content sync could not be completed.' }, { status: 503 })
  }
}

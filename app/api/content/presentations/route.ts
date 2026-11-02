import { NextRequest, NextResponse } from 'next/server'
import { verifyAutomationPublisher, GAMMA_SYNC_AUDIENCE } from '@/lib/content/automationPublisher'
import { getPresentationSources, readPresentationSnapshot, validatePresentation, writePresentationSnapshot, MAX_PRESENTATION_AGE, type PresentationSnapshot } from '@/lib/content/presentationCache'

export const dynamic = 'force-dynamic'
export const maxDuration = 300
const headers = { 'Cache-Control': 'no-store' }

export async function GET(request: NextRequest) {
  try {
    const entries = await getPresentationSources()
    if (request.nextUrl.searchParams.get('health') !== '1') return NextResponse.json({ entries }, { headers })
    const items = await Promise.all(entries.map(async source => {
      const snapshot = await readPresentationSnapshot(source)
      const current = !!snapshot?.data && !snapshot.error && Number.isFinite(Date.parse(snapshot.checkedAt)) && Date.now() - Date.parse(snapshot.checkedAt) < MAX_PRESENTATION_AGE
      return { ...source, status: current ? 'current' : snapshot?.error ? 'failed' : 'awaiting-refresh', checkedAt: snapshot?.checkedAt ?? null, sourceUpdatedAt: snapshot?.sourceUpdatedAt ?? null }
    }))
    const healthy = items.every(item => item.status === 'current')
    return NextResponse.json({ healthy, items }, { status: healthy ? 200 : 503, headers })
  } catch { return NextResponse.json({ error: 'Published presentations are temporarily unavailable.' }, { status: 503, headers }) }
}

export async function POST(request: NextRequest) {
  try { await verifyAutomationPublisher(request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '', GAMMA_SYNC_AUDIENCE) }
  catch { return NextResponse.json({ error: 'Not authorised.' }, { status: 401, headers }) }
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > 1_000_000) return NextResponse.json({ error: 'Presentation is too large.' }, { status: 413, headers })
    const body = JSON.parse(text)
    const source = (await getPresentationSources()).find(item => item.slug === body.slug && item.sourceId === body.sourceId)
    if (!source) return NextResponse.json({ error: 'The published source has changed. Refresh and try again.' }, { status: 409, headers })
    const snapshot: PresentationSnapshot = { version: 1, slug: source.slug, sourceId: source.sourceId, sourceUpdatedAt: '', checkedAt: new Date().toISOString() }
    if (body.error === true) snapshot.error = 'The public source could not be refreshed.'
    else {
      validatePresentation(body.data)
      if (typeof body.sourceUpdatedAt !== 'string' || !Number.isFinite(Date.parse(body.sourceUpdatedAt))) throw new Error('Invalid revision')
      snapshot.sourceUpdatedAt = body.sourceUpdatedAt
      snapshot.data = body.data
    }
    await writePresentationSnapshot(source, snapshot)
    return NextResponse.json({ saved: true, slug: source.slug }, { headers })
  } catch { return NextResponse.json({ error: 'The presentation could not be updated.' }, { status: 503, headers }) }
}

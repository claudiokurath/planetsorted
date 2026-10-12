import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { createSessionClient, createServiceClient } from '@/lib/supabase/server'
import { canDownloadProtocol, decryptPrivateAsset, PRIVATE_PDF_SLUG } from '@/lib/content/privateProtocol'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
}

/** The WhatsApp card lands here; no PDF bytes are read until access is checked. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug !== PRIVATE_PDF_SLUG) {
    return NextResponse.json({ error: 'This download is not available.' }, { status: 404, headers: PRIVATE_HEADERS })
  }
  try {
    const session = await createSessionClient()
    const { data: { user } } = await session.auth.getUser()
    const next = `/api/protocols/${slug}`
    if (!user) {
      return NextResponse.redirect(new URL(`/signup?next=${encodeURIComponent(next)}`, req.url), { headers: PRIVATE_HEADERS })
    }
    const db = createServiceClient()
    const { data: profile } = await db.from('users')
      .select('whatsapp_verified, whatsapp_number').eq('user_id', user.id).single()
    if (!canDownloadProtocol(user.id, profile)) {
      return NextResponse.redirect(new URL(`/connect?next=${encodeURIComponent(next)}`, req.url), { headers: PRIVATE_HEADERS })
    }
    const { data: published } = await db.from('protocols').select('slug')
      .eq('slug', slug).eq('status', 'Published').eq('type', 'Article').single()
    if (!published) return NextResponse.json({ error: 'This download is not available.' }, { status: 404, headers: PRIVATE_HEADERS })
    const key = process.env.PRIVATE_PROTOCOL_KEY
    if (!key) throw new Error('Private download not configured')
    const encrypted = await readFile(path.join(process.cwd(), 'private/protocols/financial-avoidance.pdf.enc'))
    const pdf = decryptPrivateAsset(encrypted, key)
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="FINANCIAL-AVOIDANCE PROTOCOL.pdf"',
      },
    })
  } catch {
    console.error('[private protocol] Download unavailable')
    return NextResponse.json({ error: 'Your download is temporarily unavailable. Please try again shortly.' }, { status: 503, headers: PRIVATE_HEADERS })
  }
}

import { NextRequest, NextResponse } from 'next/server'

const SITE = process.env.SITE_URL ?? 'https://planetsorted.com'

/**
 * The URL the WhatsApp Sorted-button card points at. It must always land the
 * visitor on SOR7ED for that piece, never jump straight to gamma.app.
 *
 * `/r/[slug]` handles tool vs private protocol routing and rich OG cards for
 * crawlers. Member protocols validate the session at the destination.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const cleanSlug = slug.toLowerCase()

  if (!/^[a-z0-9-]{1,100}$/.test(cleanSlug)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.redirect(`${SITE}/r/${cleanSlug}`)
}

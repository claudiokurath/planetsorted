import { NextRequest, NextResponse } from 'next/server'

const SITE = process.env.SITE_URL ?? 'https://www.sor7ed.com'

/**
 * The URL the WhatsApp Sorted-button card points at. It must always land the
 * visitor on the SOR7ED page for that piece — where the Gamma deck is embedded
 * with the Sorted button underneath — never jump straight to gamma.app, or the
 * button they need to press for the protocol isn't there.
 *
 * `/r/[slug]` handles the rest: article vs tool routing, the access token, and
 * rich OG cards for crawlers.
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

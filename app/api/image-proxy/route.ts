import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FETCH_TIMEOUT_MS = 8_000
const MAX_BYTES = 1_500_000 // ~1.5 MB hard cap after wsrv conversion

function isTrustedImageHost(rawUrl: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return false
  }
  if (parsed.protocol !== 'https:') return false

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null
  return parsed.hostname === supabaseHost
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })
  if (!isTrustedImageHost(url)) return new NextResponse('Untrusted image host', { status: 400 })

  // Route through wsrv.nl to force a sharp 1200×630 JPEG for WhatsApp OG.
  // q=82 keeps files under ~250KB while looking crisp (q=60 was visibly soft).
  // wsrv's current API uses width=/height=, not the w=/h= short aliases —
  // the short forms are silently ignored and wsrv falls back to returning
  // the source image completely untouched (verified directly against
  // wsrv.nl: w=/h= = passthrough at original size; width=/height= = correct
  // resize). The `we` (sharpen-on-enlarge) flag has the same failure mode —
  // its mere presence, bare or `we=1`, makes wsrv ignore width/height/fit
  // entirely and pass the original through. sharp=1 alone sharpens fine
  // without that side effect, so `we` is dropped rather than relied on.
  // Done server-side so & params aren't mangled into &amp; inside og:image tags.
  const wsrvUrl = `https://wsrv.nl/?url=${encodeURIComponent(
    url.replace('https://', '')
  )}&width=1200&height=630&fit=cover&output=jpg&q=82&sharp=1`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(wsrvUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { Accept: 'image/jpeg,image/*;q=0.8,*/*;q=0.5' },
    })
    if (!response.ok) throw new Error(`wsrv status ${response.status}`)

    const contentLength = response.headers.get('content-length')
    if (contentLength && Number(contentLength) > MAX_BYTES) {
      return new NextResponse('Image too large', { status: 413 })
    }

    // Stream with a hard byte cap so a misbehaving upstream can't OOM us.
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        total += value.byteLength
        if (total > MAX_BYTES) {
          try {
            await reader.cancel()
          } catch {
            /* ignore */
          }
          return new NextResponse('Image too large', { status: 413 })
        }
        chunks.push(value)
      }
    }

    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)))

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    const aborted =
      err instanceof Error && (err.name === 'AbortError' || /aborted/i.test(err.message))
    console.error('[image-proxy]', aborted ? 'timeout' : err)
    return new NextResponse(aborted ? 'Upstream timeout' : 'Error proxying image', {
      status: aborted ? 504 : 500,
    })
  } finally {
    clearTimeout(timer)
  }
}

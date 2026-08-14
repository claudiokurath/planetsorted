import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

  // Route through wsrv.nl to force JPEG conversion and guarantee size < 300KB
  // We do this server-side because placing multiple query parameters (using &) 
  // directly in the og:image meta tag causes WhatsApp to parse them as &amp;,
  // which breaks the wsrv.nl URL and results in massive uncompressed images.
  const wsrvUrl = `https://wsrv.nl/?url=${encodeURIComponent(url.replace('https://', ''))}&w=1200&h=630&fit=cover&output=jpg&q=60`
  
  try {
    const response = await fetch(wsrvUrl)
    if (!response.ok) throw new Error('Failed to fetch from wsrv')
    
    const buffer = await response.arrayBuffer()
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Error proxying image', { status: 500 })
  }
}

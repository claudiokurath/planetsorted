import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const cleanSlug = slug.toLowerCase()

  if (!/^[a-z0-9-]{1,100}$/.test(cleanSlug)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const supabase = createServerClient()
  const { data: content } = await supabase
    .from('protocols')
    .select('gamma_url, type')
    .eq('slug', cleanSlug)
    .eq('status', 'Published')
    .maybeSingle()

  const gammaUrl = content?.gamma_url?.trim()
  if (content?.type === 'Article' && gammaUrl) {
    try {
      const destination = new URL(gammaUrl)
      if (
        destination.protocol === 'https:' &&
        (destination.hostname === 'gamma.app' || destination.hostname.endsWith('.gamma.app'))
      ) {
        return NextResponse.redirect(destination)
      }
    } catch {
      // Invalid or non-Gamma Notion values fall through to the safe SOR7ED URL.
    }
  }

  return NextResponse.redirect(`${SITE}/r/${cleanSlug}`)
}

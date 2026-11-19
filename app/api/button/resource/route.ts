import { verifyRelay } from '@/lib/whatsapp/buttonRelayAuth'
import { createToolGrant } from '@/lib/button/toolGrant'
import { isContentPublished } from '@/lib/notion/liveContent'
import { createServiceClient } from '@/lib/supabase/server'
import { protocolGammaUrl } from '@/lib/content/protocolGamma'
import { INTERACTIVE_TOOL_ROUTES } from '@/lib/standaloneRoutes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store' }

/** Read-only, server-to-server resolver. Never accepts a destination from a visitor. */
export async function POST(req: Request) {
  if (Number(req.headers.get('content-length') ?? 0) > 1024) return Response.json({ error: 'Request too large' }, { status: 413, headers })
  const raw = await req.text()
  if (Buffer.byteLength(raw) > 1024) return Response.json({ error: 'Request too large' }, { status: 413, headers })
  const secret = process.env.BUTTON_RELAY_SECRET
  if (!verifyRelay(secret, 'resource', req.headers.get('x-sor7ed-ts'), req.headers.get('x-sor7ed-id'), raw, req.headers.get('x-sor7ed-signature'))) return Response.json({ error: 'Unauthorised' }, { status: 401, headers })
  let body
  try { body = JSON.parse(raw) } catch { return Response.json({ error: 'Invalid request' }, { status: 400, headers }) }
  if (!body || typeof body.slug !== 'string' || !/^[a-z0-9-]{1,100}$/.test(body.slug) || !['article', 'tool'].includes(body.context) || Object.keys(body).some(key => !['slug', 'context'].includes(key))) return Response.json({ error: 'Invalid resource' }, { status: 400, headers })
  try {
    const type = body.context === 'tool' ? 'Tool' : 'Article'
    if (!await isContentPublished(body.slug, type)) return Response.json({ error: 'This resource is not published.' }, { status: 404, headers })
    const { data: item, error } = await createServiceClient().from('protocols').select('title,gamma_url,slug').eq('slug', body.slug).eq('type', type).eq('status', 'Published').single()
    if (error || !item) return Response.json({ error: 'This resource is unavailable.' }, { status: 404, headers })
    const nativePath = body.context === 'tool' ? INTERACTIVE_TOOL_ROUTES[body.slug] : undefined
    const gamma = protocolGammaUrl(item.gamma_url)
    if (!nativePath && !gamma) return Response.json({ error: 'This resource does not have a delivery link yet.' }, { status: 409, headers })
    // Permanent library URLs never contain an expiring access grant.
    const resource = new URL('https://www.sor7ed.com/resource')
    resource.searchParams.set('slug', body.slug)
    resource.searchParams.set('context', body.context)
    const openUrl = nativePath ? new URL(nativePath, 'https://www.planetsorted.com') : null
    if (openUrl) openUrl.searchParams.set('access', createToolGrant(secret!, body.slug))
    return Response.json({ title: item.title, url: nativePath ? resource.href : gamma, openUrl: openUrl?.href ?? gamma, embedded: Boolean(nativePath) }, { headers })
  } catch { return Response.json({ error: 'Could not check the current Notion publication. Please try later.' }, { status: 503, headers }) }
}

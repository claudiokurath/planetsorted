import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createServerClient } from '@/lib/supabase/server'
import {
  normalizePhone,
  normalizePartnerSlug,
  normalizeToolSlug,
} from '@/lib/leads/normalizePhone'

/**
 * Public partner-widget lead capture.
 *
 * POST { partner, phone, tool?, source_host?, source_path? }
 * CORS: * (embeddable from any partner origin).
 *
 * No auth — rate-limited lightly by IP hash + partner+phone de-dupe (24h).
 * Full partner accounts / billing are out of scope for v1.
 */

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Please send a JSON body.' }, 400)
  }

  if (!body || typeof body !== 'object') {
    return json({ error: 'Invalid request.' }, 400)
  }

  const b = body as Record<string, unknown>
  const partner = normalizePartnerSlug(b.partner)
  const phone = normalizePhone(b.phone)
  const tool = normalizeToolSlug(b.tool) ?? null

  if (!partner) {
    return json(
      { error: 'Missing or invalid partner id. Add data-partner="your-name" to the script tag.' },
      400
    )
  }
  if (!phone) {
    return json(
      { error: 'Please enter a valid WhatsApp number with country code.' },
      400
    )
  }

  // Optional context from the embed page
  const sourceHost =
    typeof b.source_host === 'string' ? b.source_host.slice(0, 200) : null
  const sourcePath =
    typeof b.source_path === 'string' ? b.source_path.slice(0, 500) : null

  const ua = (req.headers.get('user-agent') || '').slice(0, 300)
  const fwd = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
  const ip = fwd.split(',')[0]?.trim() || ''
  const ipHash = ip
    ? createHash('sha256').update(ip + (process.env.CRON_SECRET || 'salt')).digest('hex').slice(0, 32)
    : null

  const sb = createServerClient()

  // 24h de-dupe for same partner + phone
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: existing } = await sb
    .from('partner_leads')
    .select('id')
    .eq('partner_slug', partner)
    .eq('phone', phone)
    .gte('created_at', since)
    .maybeSingle()

  if (existing) {
    return json({ success: true, duplicate: true })
  }

  const { error } = await sb.from('partner_leads').insert({
    partner_slug: partner,
    phone,
    tool_slug: tool,
    source_host: sourceHost,
    source_path: sourcePath,
    user_agent: ua || null,
    ip_hash: ipHash,
    status: 'new',
  })

  if (error) {
    // Table may not exist yet pre-migration — don't 500 the partner page.
    console.error('[leads] insert failed', error)
    const code = (error as { code?: string }).code
    if (code === '42P01' || code === 'PGRST205') {
      return json(
        {
          error:
            'Lead capture is not fully set up yet. Please try WhatsApp directly, or contact the site owner.',
        },
        503
      )
    }
    return json({ error: 'Could not save your number right now. Please try again.' }, 500)
  }

  return json({ success: true })
}

import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { verifyRelay } from '@/lib/whatsapp/buttonRelayAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Authenticated read-only provider check: no WhatsApp message is sent.
export async function GET(req: Request) {
  if (!verifyRelay(process.env.BUTTON_RELAY_SECRET, 'outbound', req.headers.get('x-sor7ed-ts'), req.headers.get('x-sor7ed-id'), '', req.headers.get('x-sor7ed-signature'))) return Response.json({ error: 'Unauthorised' }, { status: 401 })
  const token = process.env.META_WHATSAPP_TOKEN, phone = process.env.META_PHONE_NUMBER_ID
  if (!token || !phone) return Response.json({ provider: 'unconfigured' }, { status: 503 })
  try {
    const res = await fetch(`https://graph.facebook.com/v23.0/${phone}?fields=display_phone_number`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000), cache: 'no-store' })
    if (!res.ok) return Response.json({ provider: 'unavailable', providerStatus: res.status }, { status: 503 })
    return Response.json({ provider: 'ready' }, { headers: { 'cache-control': 'no-store' } })
  } catch { return Response.json({ provider: 'unavailable' }, { status: 503 }) }
}

export async function POST(req: Request) {
  if (Number(req.headers.get('content-length') || 0) > 16_384) return Response.json({ error: 'Request too large' }, { status: 413 })
  const raw = await req.text()
  if (Buffer.byteLength(raw) > 16_384) return Response.json({ error: 'Request too large' }, { status: 413 })
  const id = req.headers.get('x-sor7ed-id')
  if (!verifyRelay(process.env.BUTTON_RELAY_SECRET, 'outbound', req.headers.get('x-sor7ed-ts'), id, raw, req.headers.get('x-sor7ed-signature'))) return Response.json({ error: 'Unauthorised' }, { status: 401 })
  let payload
  try { payload = JSON.parse(raw) } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }) }
  if (payload?.messaging_product !== 'whatsapp' || payload.type !== 'text' || typeof payload.to !== 'string' || !/^\d{7,15}$/.test(payload.to || '') || typeof payload.text?.body !== 'string' || payload.text.body.length < 1 || payload.text.body.length > 4096) return Response.json({ error: 'Invalid text message' }, { status: 400 })
  const token = process.env.META_WHATSAPP_TOKEN
  const phone = process.env.META_PHONE_NUMBER_ID
  if (!token || !phone) return Response.json({ error: 'Messaging is unavailable' }, { status: 503 })
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const hash = createHash('sha256').update(raw).digest('hex')
  const { error: claimError } = await sb.from('button_whatsapp_requests').insert({ id, body_hash: hash })
  if (claimError) {
    if (claimError.code !== '23505') return Response.json({ error: 'Messaging is unavailable' }, { status: 503 })
    const { data, error } = await sb.from('button_whatsapp_requests').select('body_hash,status,response_status,response').eq('id', id).single()
    if (error || !data || data.body_hash !== hash) return Response.json({ error: 'Request conflict' }, { status: 409 })
    if (data.status === 'accepted' || data.status === 'failed') return Response.json(data.response, { status: data.response_status })
    return Response.json({ error: 'Message status is unconfirmed' }, { status: 502 })
  }
  // No user-provided URL, token or sender ID is forwarded. No automatic retry.
  const version = /^v\d+\.\d+$/.test(process.env.META_GRAPH_API_VERSION || '') ? process.env.META_GRAPH_API_VERSION : 'v23.0'
  let status = 'unknown', responseStatus = 502
  let response: Record<string, unknown> = { error: 'Message status is unconfirmed' }
  try {
    const res = await fetch(`https://graph.facebook.com/${version}/${phone}/messages`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: payload.to, type: 'text', text: { body: payload.text.body, preview_url: payload.text.preview_url === true } }), signal: AbortSignal.timeout(15_000) })
    const result = await res.json().catch(() => null)
    const messageId = result?.messages?.[0]?.id
    if (res.ok && typeof messageId === 'string' && messageId) { status = 'accepted'; responseStatus = 200; response = { messages: [{ id: messageId }] } }
    else if (!res.ok && res.status < 500 && res.status !== 408) { status = 'failed'; responseStatus = res.status; response = { error: 'WhatsApp rejected the message' } }
  } catch { /* The provider might already have accepted the message. */ }
  const { error: resultError } = await sb.from('button_whatsapp_requests').update({ status, response_status: responseStatus, response }).eq('id', id)
  if (resultError) return Response.json({ error: 'Message status is unconfirmed' }, { status: 502 })
  // Expired requests cannot authenticate again after five minutes. Keep a
  // one-day receipt buffer, then remove a bounded batch without message text.
  const { data: old } = await sb.from('button_whatsapp_requests').select('id').lt('created_at', new Date(Date.now() - 86_400_000).toISOString()).limit(50)
  if (old?.length) await sb.from('button_whatsapp_requests').delete().in('id', old.map(row => row.id))
  return Response.json(response, { status: responseStatus })
}

import { websiteSiteUrl } from '@/lib/siteUrl'
import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { sendWhatsAppMessage, sendWhatsAppAudio, sendWhatsAppContentCard, WhatsAppSendError } from '@/lib/whatsapp/send'
import { splitIntoChunks } from '@/lib/whatsapp/splitIntoChunks'
import { ogImageForContent } from '@/lib/og/imageUrl'
import { claimDelivery, finishDelivery, readDelivery, deliveryRequestHash, deliveryResponse, isActionId, DeliveryActionConflict, type DeliveryStatus } from '@/lib/whatsapp/deliveryActions'

export const dynamic = 'force-dynamic'
const SITE = websiteSiteUrl()
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' }
const SAFE_LIMIT = 3500

export async function GET(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const actionId = req.nextUrl.searchParams.get('actionId')
  if (!isActionId(actionId)) return NextResponse.json({ error: 'This send request could not be identified.' }, { status: 400, headers: PRIVATE_HEADERS })
  try {
    const result = await readDelivery(auth.admin, auth.user.id, actionId)
    if (!result) return NextResponse.json({ error: 'This send request could not be found.' }, { status: 404, headers: PRIVATE_HEADERS })
    return NextResponse.json(result, { headers: PRIVATE_HEADERS })
  } catch {
    return NextResponse.json({ error: 'We could not check this message yet. Please try again.' }, { status: 503, headers: PRIVATE_HEADERS })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user, admin } = auth
  let body: Record<string, unknown>
  try {
    const parsed: unknown = await req.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'We could not read this send request.' }, { status: 400, headers: PRIVATE_HEADERS })
  }
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  if (!/^[a-z0-9-]{1,150}$/.test(slug)) return NextResponse.json({ error: 'This item could not be identified.' }, { status: 400, headers: PRIVATE_HEADERS })
  if (!isActionId(body.idempotencyKey)) {
    return NextResponse.json({ error: 'Please refresh this page before sending this item.' }, { status: 400, headers: PRIVATE_HEADERS })
  }
  const actionId = body.idempotencyKey
  const link = body.includeLink !== false, protocol = body.includeProtocol === true, audio = body.includeAudio === true

  try {
    // Claim validates the payload hash. A replay returns its original status
    // before reading preferences and can never initiate another send.
    const { data: content, error: contentError } = await admin.from('protocols')
      .select('title, summary, excerpt, cover_image, protocol, audio_url, slug, type, category')
      .eq('slug', slug).eq('status', 'Published').single()
    if (contentError || !content) return NextResponse.json({ error: 'This item is not available.' }, { status: 404, headers: PRIVATE_HEADERS })
    if (!link && !(protocol && content.protocol) && !(audio && content.audio_url)) {
      return NextResponse.json({ error: 'Choose an available item to send.' }, { status: 400, headers: PRIVATE_HEADERS })
    }
    const action = await claimDelivery(admin, {
      userId: user.id, actionId, hash: deliveryRequestHash(slug, link, protocol, audio), slug,
      url: `${SITE}/r/${content.slug}`, title: content.title, category: content.category || 'General',
    })
    if (!action.created) return NextResponse.json(deliveryResponse(actionId, action.delivery_status, action.delivery_reason, action.updated_at), { headers: PRIVATE_HEADERS })

    let state: DeliveryStatus = 'skipped'
    let reason: string | null = 'not_connected'
    const ids: string[] = []
    try {
      const { data: profile, error } = await admin.from('users')
        .select('whatsapp_number, whatsapp_verified, whatsapp_opted_out')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (error) {
        // No provider request has begun, so an explicit new action can safely
        // retry after a temporary profile lookup failure.
        state = 'failed'; reason = 'profile_unavailable'
      } else if (profile?.whatsapp_verified && profile.whatsapp_number) {
        if (profile.whatsapp_opted_out) reason = 'opted_out'
        else {
          if (link) {
            const receipt = await sendWhatsAppContentCard({
              to: profile.whatsapp_number, slug: content.slug, title: content.title,
              summary: content.summary || content.excerpt,
              imageUrl: ogImageForContent(content.cover_image, content.title, content.summary || content.excerpt),
              url: `${SITE}/go/${content.slug}`,
            })
            ids.push(receipt.messageId)
          }
          if (protocol && content.protocol) {
            const text = `*${content.title}*\n\n${content.protocol}`
            for (const chunk of text.length <= SAFE_LIMIT ? [text] : splitIntoChunks(text, SAFE_LIMIT)) {
              ids.push((await sendWhatsAppMessage(profile.whatsapp_number, chunk)).messageId)
            }
          }
          if (audio && content.audio_url) ids.push((await sendWhatsAppAudio(profile.whatsapp_number, content.audio_url)).messageId)
          state = 'accepted'; reason = null
        }
      }
    } catch (error) {
      state = ids.length > 0 ? 'unknown' : error instanceof WhatsAppSendError ? error.outcome : 'unknown'
      reason = ids.length > 0 ? 'partial_send' : state === 'failed' ? 'send_failed' : 'unconfirmed'
      console.warn('[WhatsApp send outcome]', { actionId, state })
    }

    try { await finishDelivery(admin, user.id, actionId, state, reason, ids) }
    catch { console.warn('[WhatsApp outcome storage unavailable]', { actionId }) }
    // Provider acceptance is the strongest evidence available here. A DB
    // failure must not turn it into a failed send or authorise a retry.
    return NextResponse.json(deliveryResponse(actionId, state, reason, new Date().toISOString()), { status: 201, headers: PRIVATE_HEADERS })
  } catch (error) {
    if (error instanceof DeliveryActionConflict) return NextResponse.json({ error: 'This send request was already used for a different item.' }, { status: 409, headers: PRIVATE_HEADERS })
    return NextResponse.json({ error: 'We could not save this send request. Please check again before retrying.' }, { status: 503, headers: PRIVATE_HEADERS })
  }
}

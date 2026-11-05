import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'
import { getLiveContent } from '@/lib/notion/liveContent'
import { websiteSiteUrl } from '@/lib/siteUrl'
import { claimDelivery, deliveryRequestHash, deliveryResponse, finishDelivery, isActionId } from './deliveryActions'
import { sendWhatsAppContentCard, WhatsAppSendError } from './send'
import { protocolGammaUrl } from '@/lib/content/protocolGamma'
import { ogImageForContent } from '@/lib/og/imageUrl'

type Admin = SupabaseClient<Database>
type Payload = { includeLink: boolean; includeProtocol: boolean; includeAudio: boolean }
const SITE=websiteSiteUrl()

export async function stageWebsiteReply(admin: Admin, userId: string, actionId: string, slug: string, payload: Payload) {
  if (!payload.includeLink && !payload.includeProtocol && !payload.includeAudio) throw new Error('Choose an item to receive.')
  const published=await getLiveContent()
  if (![...published.tools,...published.articles].includes(slug)) throw new Error('This item is no longer available.')
  const {data:content,error}=await admin.from('protocols').select('title,category').eq('slug',slug).eq('status','Published').single()
  if (error || !content) throw new Error('This item is no longer available.')
  const {data:profile,error:profileError}=await admin.from('users').select('whatsapp_number,whatsapp_verified,whatsapp_opted_out').eq('user_id',userId).single()
  if (profileError || !profile?.whatsapp_verified || !profile.whatsapp_number) throw new Error('Connect your WhatsApp number before requesting this item.')
  if (profile.whatsapp_opted_out) throw new Error('Messaging is paused. Review your messaging preferences first.')
  const action=await claimDelivery(admin,{userId,actionId,hash:deliveryRequestHash(slug,payload.includeLink,payload.includeProtocol,payload.includeAudio),slug,url:`${SITE}/r/${slug}`,title:content.title,category:content.category || 'General'})
  if (!action.created) return deliveryResponse(actionId,action.delivery_status,action.delivery_reason,action.updated_at)
  const now=new Date().toISOString()
  const {error:stageError}=await admin.from('whatsapp_delivery_actions').update({request_payload:payload,awaiting_reply:true,reply_expires_at:new Date(Date.now()+15*60_000).toISOString(),delivery_reason:'awaiting_reply',updated_at:now}).eq('user_id',userId).eq('action_key',actionId).eq('delivery_status','pending')
  if (stageError) { await finishDelivery(admin,userId,actionId,'failed','request_unavailable',[]);throw new Error('We could not prepare your WhatsApp request. Please try again.') }
  return deliveryResponse(actionId,'pending','awaiting_reply',now)
}

/** Only called for a signed Meta inbound message, after crisis handling. */
export async function fulfilWebsiteReply(admin: Admin, phone: string, text: string): Promise<boolean> {
  const match=text.trim().match(/^GET IT SORTED\s+([a-f0-9-]{36})$/i)
  if (!match || !isActionId(match[1])) return false
  const actionId=match[1]
  const {data:profile,error:profileError}=await admin.from('users').select('user_id,whatsapp_verified,whatsapp_opted_out').eq('whatsapp_number',phone).maybeSingle()
  if (profileError) throw new Error('Could not check the request owner.')
  if (!profile?.user_id || !profile.whatsapp_verified || profile.whatsapp_opted_out) return true
  const {data:action,error}=await admin.from('whatsapp_delivery_actions').select('slug,request_payload,reply_expires_at').eq('user_id',profile.user_id).eq('action_key',actionId).eq('delivery_status','pending').eq('awaiting_reply',true).maybeSingle()
  if (error) throw new Error('Could not load the requested item.')
  if (!action) return true
  if (!action.reply_expires_at || Date.parse(action.reply_expires_at)<Date.now()) {
    await finishDelivery(admin,profile.user_id,actionId,'failed','request_expired',[])
    return true
  }
  const payload=action.request_payload as unknown as Payload | null
  if (!payload || typeof payload.includeLink!=='boolean' || typeof payload.includeProtocol!=='boolean' || typeof payload.includeAudio!=='boolean') return true
  // Conditional UPDATE is the concurrency lock: duplicate webhook deliveries
  // cannot send again, including after a timeout with an uncertain outcome.
  const {data:claimed,error:claimError}=await admin.from('whatsapp_delivery_actions').update({awaiting_reply:false,delivery_reason:null,updated_at:new Date().toISOString()}).eq('user_id',profile.user_id).eq('action_key',actionId).eq('delivery_status','pending').eq('awaiting_reply',true).select('action_key').maybeSingle()
  if (claimError) throw new Error('Could not claim the requested item.')
  if (!claimed) return true
  const ids:string[]=[]
  try {
    const published=await getLiveContent()
    if (![...published.tools,...published.articles].includes(action.slug)) { await finishDelivery(admin,profile.user_id,actionId,'failed','not_available',[]);return true }
    const {data:content,error:contentError}=await admin.from('protocols').select('title,summary,excerpt,cover_image,gamma_url,type,slug').eq('slug',action.slug).eq('status','Published').single()
    if (contentError || !content) throw new WhatsAppSendError('This item is unavailable.',undefined,undefined,'failed')
    const destination=content.type==='Article' ? protocolGammaUrl(content.gamma_url) : `${SITE}/go/${content.slug}`
    if (!destination) throw new WhatsAppSendError('This protocol is not ready to send yet.',undefined,undefined,'failed')
    ids.push((await sendWhatsAppContentCard({to:phone,slug:content.slug,title:content.title,imageUrl:ogImageForContent(content.cover_image,content.title,content.summary || content.excerpt),url:destination})).messageId)
    if (!ids.length) { await finishDelivery(admin,profile.user_id,actionId,'failed','not_available',[]); return true }
    await finishDelivery(admin,profile.user_id,actionId,'accepted',null,ids)
  } catch (error) {
    const status=ids.length ? 'unknown' : error instanceof WhatsAppSendError ? error.outcome : 'unknown'
    try { await finishDelivery(admin,profile.user_id,actionId,status,ids.length ? 'partial_send' : status==='failed' ? 'send_failed' : 'unconfirmed',ids) } catch { console.warn('[Website reply] Outcome could not be stored') }
  }
  return true
}

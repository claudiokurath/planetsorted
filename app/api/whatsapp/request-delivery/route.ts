import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { isActionId, DeliveryActionConflict } from '@/lib/whatsapp/deliveryActions'
import { stageWebsiteReply } from '@/lib/whatsapp/websiteReplyDelivery'

export async function POST(req: NextRequest) {
  const auth=await requireUser(req)
  if (!auth.user) return auth.error
  let body
  try { body=await req.json() } catch { return NextResponse.json({error:'Please refresh this page and try again.'},{status:400}) }
  if (!body || typeof body.slug!=='string' || !/^[a-z0-9-]{1,150}$/.test(body.slug) || !isActionId(body.idempotencyKey)) return NextResponse.json({error:'This item could not be identified.'},{status:400})
  try {
    const result=await stageWebsiteReply(auth.admin,auth.user.id,body.idempotencyKey,body.slug,{includeLink:body.includeLink!==false,includeProtocol:body.includeProtocol===true,includeAudio:body.includeAudio===true})
    return NextResponse.json(result,{headers:{'Cache-Control':'private, no-store'}})
  } catch (error) {
    return NextResponse.json({error:error instanceof DeliveryActionConflict ? 'This request belongs to a different item. Please refresh the page.' : error instanceof Error ? error.message : 'We could not prepare this request.'},{status:error instanceof DeliveryActionConflict ? 409 : 503})
  }
}

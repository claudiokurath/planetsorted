import { NextRequest, NextResponse } from 'next/server'

/**
 * Inbound WhatsApp is retired. This endpoint only stays alive so Meta's
 * webhook verification keeps passing and delivery callbacks don't error —
 * it does nothing with anything it receives.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (
    searchParams.get('hub.mode') === 'subscribe' &&
    searchParams.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new NextResponse(searchParams.get('hub.challenge'), { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST() {
  return NextResponse.json({ status: 'ignored' })
}

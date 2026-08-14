import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@/lib/supabase/server'

const WA_BUSINESS_NUMBER = '447591922247'
const TOKEN_TTL_SECONDS = 10 * 60 // 10 minutes, matching the existing OTP expiry

function signToken(userId: string, expiry: number): string {
  return crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(`${userId}.${expiry}`)
    .digest('hex')
    .slice(0, 12)
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient()

  const { data: { user: authUser } } = await supabase.auth.getUser(
    req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  )

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expiry = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const sig = signToken(authUser.id, expiry)
  const token = `${authUser.id}.${expiry}.${sig}`
  const message = `CONNECT-${token}`
  const waLink = `https://wa.me/${WA_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`

  return NextResponse.json({ waLink, expiresInSeconds: TOKEN_TTL_SECONDS })
}

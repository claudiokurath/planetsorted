import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import {
  buildConnectToken,
  CONNECT_TOKEN_TTL_SECONDS,
} from '@/lib/crypto/tokens'

const WA_BUSINESS_NUMBER =
  process.env.NEXT_PUBLIC_WA_NUMBER?.replace(/\D/g, '') || '447591922247'

export async function GET(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user: authUser } = auth

  const { token, expiresInSeconds } = buildConnectToken(
    authUser.id,
    CONNECT_TOKEN_TTL_SECONDS
  )
  const message = `CONNECT-${token}`
  const waLink = `https://wa.me/${WA_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`

  return NextResponse.json({ waLink, expiresInSeconds })
}

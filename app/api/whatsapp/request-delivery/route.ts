import type { NextRequest } from 'next/server'
import { POST as sendAutomatically } from '@/app/api/save-to-phone/route'

/** Compatibility for older open pages: new requests send, never stage a code. */
export async function POST(req: NextRequest) {
  return sendAutomatically(req)
}

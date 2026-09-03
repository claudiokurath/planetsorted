import { NextRequest, NextResponse } from 'next/server'
import { logToolRun, logAnalyticsEvent } from '@/lib/analytics/events'
import { getRequestUser } from '@/lib/auth/requireUser'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const { user } = await getRequestUser(req)
    const userId = user?.id || null

    if (body.type === 'tool_run') {
      const { toolSlug, success, latencyMs, error, outputText } = body

      if (!toolSlug || typeof toolSlug !== 'string') {
        return NextResponse.json({ error: 'toolSlug is required.' }, { status: 400 })
      }

      const result = await logToolRun({
        toolSlug,
        success: Boolean(success),
        latencyMs: typeof latencyMs === 'number' ? latencyMs : undefined,
        userId,
        error: typeof error === 'string' ? error : undefined,
        outputText: typeof outputText === 'string' ? outputText : undefined,
      })

      return NextResponse.json({ ok: result.success, id: result.id })
    }

    if (body.type === 'custom' || body.eventName) {
      const eventName = body.eventName || body.event
      if (!eventName || typeof eventName !== 'string') {
        return NextResponse.json({ error: 'eventName is required.' }, { status: 400 })
      }

      const properties = (body.properties && typeof body.properties === 'object') ? body.properties : {}
      const result = await logAnalyticsEvent(eventName, properties, userId)

      return NextResponse.json({ ok: result.success })
    }

    return NextResponse.json({ error: 'Unknown event type.' }, { status: 400 })
  } catch (err) {
    console.error('[API analytics/event] Error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

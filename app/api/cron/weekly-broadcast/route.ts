import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import type { User, Protocol } from '@/lib/types/database'

/** Skip anyone messaged in the last 6 days (cron is weekly; small buffer). */
const MIN_RESEND_MS = 6 * 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  try {
    const { data: rawProtocol, error: protocolError } = await supabase
      .from('protocols')
      .select('title, summary, slug')
      .eq('status', 'Published')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (protocolError || !rawProtocol) {
      console.error('[Weekly Broadcast] Failed to fetch latest protocol:', protocolError)
      return NextResponse.json(
        { error: 'No published protocols found to broadcast.' },
        { status: 404 }
      )
    }

    const protocol = rawProtocol as Pick<Protocol, 'title' | 'summary' | 'slug'>

    // Include last_weekly_sent_at so we can skip recent recipients (idempotent
    // on Vercel cron retries / manual re-runs within the same week).
    const { data: rawUsers, error: usersError } = await supabase
      .from('users')
      .select('id, user_id, whatsapp_number, last_weekly_sent_at')
      .eq('weekly_opted_in', true)
      .eq('whatsapp_opted_out', false)
      .not('whatsapp_number', 'is', null)

    if (usersError) {
      console.error('[Weekly Broadcast] Failed to fetch opted-in users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch subscribers list.' }, { status: 500 })
    }

    type BroadcastUser = Pick<
      User,
      'id' | 'user_id' | 'whatsapp_number' | 'last_weekly_sent_at'
    >
    const users = (rawUsers as BroadcastUser[]) || []
    if (users.length === 0) {
      return NextResponse.json({ sent: 0, skipped: 0, message: 'No opted-in subscribers.' })
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
    const linkUrl = `${site}/r/${protocol.slug}`
    // Real newlines — previous version had a double-escaped "\\n\\n" literal.
    const messageBody = `*${protocol.title}*\n\n${
      protocol.summary || 'A new protocol from PLANET SOR7ED.'
    }\n\nGet it sorted here 👇\n${linkUrl}`

    let successCount = 0
    let skippedCount = 0
    const now = Date.now()
    const nowIso = new Date(now).toISOString()

    for (const user of users) {
      if (!user.whatsapp_number) continue

      if (user.last_weekly_sent_at) {
        const last = Date.parse(user.last_weekly_sent_at)
        if (Number.isFinite(last) && now - last < MIN_RESEND_MS) {
          skippedCount++
          continue
        }
      }

      try {
        await sendWhatsAppMessage(user.whatsapp_number, messageBody, linkUrl)
        successCount++

        // Stamp last_weekly_sent_at so retries don't double-send.
        if (user.id) {
          await supabase
            .from('users')
            .update({ last_weekly_sent_at: nowIso })
            .eq('id', user.id)
        } else if (user.user_id) {
          await supabase
            .from('users')
            .update({ last_weekly_sent_at: nowIso })
            .eq('user_id', user.user_id)
        }
      } catch (err) {
        console.error(
          `[Weekly Broadcast] Failed to send to number ${user.whatsapp_number}:`,
          err
        )
      }
    }

    return NextResponse.json({
      sent: successCount,
      skipped: skippedCount,
      total: users.length,
    })
  } catch (err) {
    console.error('[Weekly Broadcast global error]', err)
    return NextResponse.json(
      { error: 'Internal server error occurred during broadcast.' },
      { status: 500 }
    )
  }
}

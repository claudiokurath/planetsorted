import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import type { User, Protocol } from '@/lib/types/database'

export async function GET(req: NextRequest) {
  // 1. Verify cron authorization token
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  try {
    // 2. Query the single most recently updated Published protocol
    const { data: rawProtocol, error: protocolError } = await supabase
      .from('protocols')
      .select('title, summary, slug')
      .eq('status', 'Published')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (protocolError || !rawProtocol) {
      console.error('[Weekly Broadcast] Failed to fetch latest protocol:', protocolError)
      return NextResponse.json({ error: 'No published protocols found to broadcast.' }, { status: 404 })
    }

    const protocol = rawProtocol as Pick<Protocol, 'title' | 'summary' | 'slug'>

    // 3. Query all users opted in to weekly broadcasts and not opted out
    const { data: rawUsers, error: usersError } = await supabase
      .from('users')
      .select('whatsapp_number')
      .eq('weekly_opted_in', true)
      .eq('whatsapp_opted_out', false)
      .not('whatsapp_number', 'is', null)

    if (usersError) {
      console.error('[Weekly Broadcast] Failed to fetch opted-in users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch subscribers list.' }, { status: 500 })
    }

    const users = (rawUsers as Pick<User, 'whatsapp_number'>[]) || []
    if (users.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No opted-in subscribers to send to.' })
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
    const linkUrl = `${site}/r/${protocol.slug}`
    const messageBody = `*${protocol.title}*\n\n${protocol.summary || 'A new protocol from Sorted Lab.'}\n\nGet it sorted here 👇\n${linkUrl}`

    let successCount = 0

    // 4. Send messages sequentially, catching individual user errors
    for (const user of users) {
      if (!user.whatsapp_number) continue
      try {
        await sendWhatsAppMessage(user.whatsapp_number, messageBody, linkUrl)
        successCount++
      } catch (err) {
        console.error(`[Weekly Broadcast] Failed to send to number ${user.whatsapp_number}:`, err)
      }
    }

    return NextResponse.json({ sent: successCount, total: users.length })
  } catch (err: any) {
    console.error('[Weekly Broadcast global error]', err)
    return NextResponse.json({ error: 'Internal server error occurred during broadcast.' }, { status: 500 })
  }
}

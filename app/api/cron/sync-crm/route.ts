import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { syncCrmAccount } from '@/lib/notion/syncCrmAccount'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }
  const requested = req.nextUrl.searchParams.get('page')
  const requestedPage = requested ? Number(requested) : null
  if (requestedPage !== null && (!Number.isInteger(requestedPage) || requestedPage < 1)) return NextResponse.json({ error: 'Choose a valid account page.' }, { status: 400 })
  const admin = createServiceClient()
  const counts = { synced: 0, unchanged: 0, busy: 0, archived: 0, failed: 0 }
  try {
    const { data: cursor, error: cursorError } = await admin.from('notion_crm_reconciliation').select('next_page').eq('id', 1).single()
    if (cursorError) throw new Error('CRM cursor is unavailable')
    let page = requestedPage || cursor.next_page
    let nextPage = 1
    const started = Date.now()
    let interrupted = false
    for (let batch = 0; batch < 3; batch++, page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 25 })
      if (error) throw new Error('Account listing failed')
      for (const user of data.users) {
        if (Date.now() - started > 210000) { interrupted = true; break }
        try { counts[await syncCrmAccount(user.id)]++ }
        catch { counts.failed++ }
      }
      nextPage = interrupted ? page : data.users.length === 25 ? page + 1 : 1
      if (interrupted || data.users.length < 25) break
    }
    const { error: saveError } = await admin.from('notion_crm_reconciliation').update({ next_page: nextPage }).eq('id', 1)
    if (saveError) throw new Error('CRM cursor update failed')
    return NextResponse.json({ ...counts, nextPage }, { status: counts.failed ? 503 : 200 })
  } catch {
    return NextResponse.json({ error: 'CRM reconciliation could not finish. Please try again.', ...counts }, { status: 503 })
  }
}

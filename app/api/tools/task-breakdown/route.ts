import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

export const runtime = 'nodejs'

/**
 * POST /api/tools/task-breakdown
 *
 * Accepts: { task: string; context?: string }
 * - Generates a plain-language next step via OpenAI
 * - Sends the result to the user's WhatsApp
 * - Returns the result text for the on-page confirmation screen
 */
export async function POST(req: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────────────────
  const auth = await requireUser(req)
  if (!auth.user) return auth.error

  // ── 2. Input ─────────────────────────────────────────────────────────────
  let task = ''
  let context = ''
  try {
    const body = await req.json()
    task = String(body.task ?? '').trim()
    context = String(body.context ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!task) {
    return NextResponse.json({ error: 'task is required.' }, { status: 400 })
  }

  // ── 3. Fetch user's WhatsApp number ──────────────────────────────────────
  const admin = createServerClient()
  const { data: userRow } = await (admin as ReturnType<typeof createServerClient>)
    .from('users')
    .select('whatsapp_number')
    .eq('user_id', auth.user.id)
    .maybeSingle()

  const waNumber = (userRow as { whatsapp_number?: string } | null)?.whatsapp_number
  if (!waNumber) {
    return NextResponse.json(
      { error: 'no_whatsapp', message: 'No WhatsApp number linked to your account.' },
      { status: 422 }
    )
  }

  // ── 4. Generate breakdown via OpenAI ─────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 })
  }

  const systemPrompt = `You are Planet Sorted, a practical support tool for neurodivergent adults.
Your job is to take a task someone is avoiding and break it into one small, concrete first action.

Rules:
- Give ONE primary action (the smallest possible first step)
- Then give ONE optional follow-on step if they feel ready
- Use plain English — no jargon, no motivational waffle
- Do not celebrate, do not tell them they can do it
- Maximum 60 words total
- Format exactly as:
  First step: [one concrete action]
  
  Then, if you're ready: [one follow-on step]`

  const userPrompt = context
    ? `Task: ${task}\nContext: ${context}`
    : `Task: ${task}`

  let resultText = ''
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.4,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[task-breakdown] OpenAI error', res.status, err)
      return NextResponse.json({ error: 'AI generation failed.' }, { status: 502 })
    }

    const data = await res.json()
    resultText = data.choices?.[0]?.message?.content?.trim() ?? ''
  } catch (err) {
    console.error('[task-breakdown] fetch error', err)
    return NextResponse.json({ error: 'AI generation failed.' }, { status: 502 })
  }

  if (!resultText) {
    return NextResponse.json({ error: 'AI returned an empty result.' }, { status: 502 })
  }

  // ── 5. Send to WhatsApp ───────────────────────────────────────────────────
  const waBody = `Planet Sorted\nYour next step\n\n${resultText}\n\nYou can stop after the first action.`
  try {
    await sendWhatsAppMessage(waNumber, waBody)
  } catch (err) {
    console.error('[task-breakdown] WhatsApp send error', err)
    // Return the result anyway — user can read it on-page
    return NextResponse.json(
      { result: resultText, whatsapp: false, error: 'whatsapp_send_failed' },
      { status: 200 }
    )
  }

  return NextResponse.json({ result: resultText, whatsapp: true }, { status: 200 })
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { sendWhatsAppMessage, WhatsAppSendError } from '@/lib/whatsapp/send'

export const runtime = 'nodejs'
const INPUT_LIMIT = 2000
const RESULT_LIMIT = 3500
const GENERATION_TIMEOUT_MS = 20_000
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' }

function respond(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

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
    const body: unknown = await req.json()
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return respond({ error: 'Please enter a task to break down.' }, 400)
    }
    const input = body as Record<string, unknown>
    if (typeof input.task !== 'string' ||
        (input.context !== undefined && typeof input.context !== 'string')) {
      return respond({ error: 'Please enter your task and context as text.' }, 400)
    }
    if (input.task.length > INPUT_LIMIT ||
        (typeof input.context === 'string' && input.context.length > INPUT_LIMIT)) {
      return respond({ error: 'Please keep each answer to 2,000 characters or fewer.' }, 400)
    }
    task = input.task.trim()
    context = typeof input.context === 'string' ? input.context.trim() : ''
  } catch {
    return respond({ error: 'We could not read your answers. Please try again.' }, 400)
  }

  if (!task || task.length > INPUT_LIMIT || context.length > INPUT_LIMIT) {
    return respond({ error: 'Please enter a task and keep each answer to 2,000 characters or fewer.' }, 400)
  }

  // ── 3. Fetch user's WhatsApp number ──────────────────────────────────────
  let waNumber = ''
  try {
    const { data: profile, error } = await auth.admin.from('users')
      .select('whatsapp_number, whatsapp_verified, whatsapp_opted_out')
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (error) {
      return respond({ error: 'We could not check your WhatsApp settings. Please try again later.' }, 503)
    }
    if (profile?.whatsapp_verified !== true || typeof profile.whatsapp_number !== 'string' ||
        !/^\+?\d{10,15}$/.test(profile.whatsapp_number)) {
      return respond({ error: 'no_whatsapp', message: 'Please verify your WhatsApp number before sending a result.' }, 422)
    }
    if (profile.whatsapp_opted_out !== false) {
      return respond({ error: 'whatsapp_opted_out', message: 'WhatsApp messages are paused. Review your account settings before sending a result.' }, 403)
    }
    waNumber = profile.whatsapp_number
  } catch {
    return respond({ error: 'We could not check your WhatsApp settings. Please try again later.' }, 503)
  }

  // ── 4. Generate breakdown via OpenAI ─────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY?.trim()
  if (!openaiKey) {
    return respond({ error: 'service_unavailable', message: 'Task Breakdown is temporarily unavailable. Please try again later.' }, 503)
  }

  const systemPrompt = `You are SOR7ED, a practical support tool for neurodivergent adults.
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
      signal: AbortSignal.timeout(GENERATION_TIMEOUT_MS),
    })

    if (!res.ok) {
      console.warn('[task-breakdown] Generation rejected', { status: res.status })
      return respond({ error: 'We could not generate your next step. Please try again later.' }, 502)
    }

    const data = await res.json()
    const content: unknown = data?.choices?.[0]?.message?.content
    if (typeof content === 'string') resultText = content.trim()
  } catch {
    console.warn('[task-breakdown] Generation unavailable')
    return respond({ error: 'We could not generate your next step. Please try again later.' }, 502)
  }

  if (!resultText || resultText.length > RESULT_LIMIT) {
    return respond({ error: 'We could not generate your next step. Please try again later.' }, 502)
  }

  // ── 5. Send to WhatsApp ───────────────────────────────────────────────────
  const waBody = `SOR7ED\nYour next step\n\n${resultText}\n\nYou can stop after the first action.`
  try {
    const receipt = await sendWhatsAppMessage(waNumber, waBody)
    if (receipt?.kind === 'text' && typeof receipt.messageId === 'string' && receipt.messageId.trim()) {
      return respond({ result: resultText, whatsapp: true, deliveryStatus: 'accepted' })
    }
  } catch (error) {
    // Return the result anyway — user can read it on-page
    const deliveryStatus = error instanceof WhatsAppSendError ? error.outcome : 'unknown'
    console.warn('[task-breakdown] WhatsApp sending unconfirmed', { deliveryStatus })
    return respond({ result: resultText, whatsapp: false, deliveryStatus })
  }

  return respond({ result: resultText, whatsapp: false, deliveryStatus: 'unknown' })
}

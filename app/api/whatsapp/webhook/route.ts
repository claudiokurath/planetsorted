import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { detectCrisis, CRISIS_RESPONSE } from '@/lib/whatsapp/crisis'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { createWhatsAppUser } from '@/lib/whatsapp/createWhatsAppUser'
import { verifyConnectToken, verifyMetaSignature } from '@/lib/crypto/tokens'
import {
  checkRunAllowed,
  consumeRunCredit,
  ensureSignupCredits,
  paywallMessage,
} from '@/lib/billing/credits'
import type { Database } from '@/lib/types/database'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

const TOOL_KEYWORDS: Record<string, string> = {
  TAX: 'adhd-tax-calculator',
  AUTOPILOT: 'financial-autopilot',
  CLARITY: 'decision-paralysis-solver',
  DOPAMINE: 'dopamine-menu-generator',
  TRIAGE: 'task-triage',
  RSD: 'rsd-response-scripts',
  SENSORY: 'sensory-audit',
  BURNOUT: 'burnout-assessment',
}

/** Only allow safe characters into PostgREST filter strings. */
function isSafeLookupToken(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(value)
}

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

export async function POST(req: NextRequest) {
  try {
    // Read the raw body first so we can verify Meta's HMAC signature.
    const rawBody = await req.text()
    const signature = req.headers.get('x-hub-signature-256')
    if (!verifyMetaSignature(rawBody, signature)) {
      console.error('[Webhook] Invalid or missing X-Hub-Signature-256')
      return new NextResponse('Invalid signature', { status: 401 })
    }

    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ status: 'ignored' })
    }

    type WebhookChange = {
      field?: string
      value?: {
        messages?: Array<{ type?: string; from?: string; text?: { body?: string } }>
        statuses?: Array<{
          status?: string
          recipient_id?: string
          errors?: Array<{ code?: number; title?: string; error_data?: { details?: string } }>
        }>
      }
    }

    const change = (body as { entry?: Array<{ changes?: WebhookChange[] }> })?.entry?.[0]?.changes?.[0]
    const value = change?.value
    const message = value?.messages?.[0]

    if (!message || message.type !== 'text' || !message.from || !message.text?.body) {
      // Diagnostics only — behaviour below is unchanged. This branch used to
      // discard every non-text payload silently, which made "WhatsApp never
      // replied" impossible to diagnose: delivery failures arrive here as
      // `statuses` callbacks and were dropped without a trace.
      // console.error (not log) so these land in the runtime-errors table,
      // which retains for days rather than the 1h runtime-log window.
      // Never logs message content; phone numbers are truncated to 4 digits.
      const status = value?.statuses?.[0]
      if (status) {
        console.error(
          '[Webhook diag] delivery status',
          JSON.stringify({
            status: status.status,
            recipient: status.recipient_id ? `...${status.recipient_id.slice(-4)}` : null,
            errors:
              status.errors?.map((e) => ({
                code: e.code,
                title: e.title,
                details: e.error_data?.details,
              })) ?? null,
          })
        )
      } else {
        console.error(
          '[Webhook diag] ignored payload',
          JSON.stringify({
            field: change?.field ?? null,
            valueKeys: value ? Object.keys(value) : null,
            messageCount: value?.messages?.length ?? 0,
            messageType: message?.type ?? null,
            hasFrom: Boolean(message?.from),
            hasTextBody: Boolean(message?.text?.body),
          })
        )
      }
      return NextResponse.json({ status: 'ignored' })
    }

    const from: string = message.from
    const text: string = message.text.body.trim()

    // Safety-critical — always plain text, never a card, no exceptions.
    if (detectCrisis(text)) {
      await sendWhatsAppMessage(from, CRISIS_RESPONSE)
      return NextResponse.json({ status: 'crisis' })
    }

    const verb = text.toUpperCase()
    const sb = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const cacheBust = Date.now()
    const START_URL = `${SITE}/r/start?v=${cacheBust}`
    const GOODBYE_URL = `${SITE}/r/goodbye?v=${cacheBust}`

    // ── Consent commands — isolated on purpose.
    if (verb === 'STOP') {
      await sb.from('users').update({ whatsapp_opted_out: true }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, GOODBYE_URL, GOODBYE_URL)
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'START') {
      await sb.from('users').update({ whatsapp_opted_out: false }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, START_URL, START_URL)
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'STOPWEEKLY') {
      await sb.from('users').update({ weekly_opted_in: false }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, GOODBYE_URL, GOODBYE_URL)
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'STARTWEEKLY') {
      await sb.from('users').update({ weekly_opted_in: true }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, START_URL, START_URL)
      return NextResponse.json({ status: 'ok' })
    }

    // ── QR / click-to-chat account linking — CONNECT-<userId>.<expiry>.<sig>.
    if (/^CONNECT-/i.test(text)) {
      const token = text.slice(text.indexOf('-') + 1)
      const verified = verifyConnectToken(token)

      if (!verified.ok) {
        await sendWhatsAppMessage(
          from,
          'That connect code has expired or is invalid. Please generate a new one from your dashboard Settings.'
        )
        return NextResponse.json({ status: 'invalid_connect_token' })
      }

      const tokenUserId = verified.userId

      // Refuse to steal a number already linked to a different account.
      const { data: phoneOwner } = await sb
        .from('users')
        .select('user_id')
        .eq('whatsapp_number', from)
        .maybeSingle()

      if (phoneOwner?.user_id && phoneOwner.user_id !== tokenUserId) {
        await sendWhatsAppMessage(
          from,
          'This WhatsApp number is already linked to a different account.'
        )
        return NextResponse.json({ status: 'connect_conflict' })
      }

      const { data: updatedRows, error: updateError } = await sb
        .from('users')
        .update({
          whatsapp_number: from,
          whatsapp_verified: true,
          whatsapp_opted_out: false,
        })
        .eq('user_id', tokenUserId)
        .select('user_id')

      if (updateError) {
        console.error('[CONNECT update error]', updateError)
        await sendWhatsAppMessage(
          from,
          'This WhatsApp number is already linked to a different account.'
        )
        return NextResponse.json({ status: 'connect_conflict' })
      }

      if (!updatedRows || updatedRows.length === 0) {
        const { data: authUserData } = await sb.auth.admin.getUserById(tokenUserId)
        // Insert only — never upsert-on-phone (that reassigned accounts).
        const { error: insertError } = await sb.from('users').insert({
          user_id: tokenUserId,
          first_name: authUserData?.user?.user_metadata?.first_name || '',
          email: authUserData?.user?.email || '',
          whatsapp_number: from,
          whatsapp_verified: true,
          weekly_opted_in: false,
          whatsapp_opted_out: false,
        })

        if (insertError) {
          console.error('[CONNECT insert error]', insertError)
          await sendWhatsAppMessage(
            from,
            'This WhatsApp number is already linked to a different account.'
          )
          return NextResponse.json({ status: 'connect_conflict' })
        }
      }

      await sendWhatsAppMessage(from, 'Your WhatsApp is now connected to PLANET SOR7ED ✓')
      return NextResponse.json({ status: 'connected' })
    }

    // ── WhatsApp-first signup — no email required to get started.
    const { data: existingUser } = await sb
      .from('users')
      .select('email')
      .eq('whatsapp_number', from)
      .maybeSingle()

    if (!existingUser) {
      const { data: pending } = await sb
        .from('whatsapp_pending_signups')
        .select('id')
        .eq('phone', from)
        .maybeSingle()

      if (!pending) {
        await sb.from('whatsapp_pending_signups').insert({ phone: from })
        await sendWhatsAppMessage(from, "Welcome to PLANET SOR7ED. What's your first name?")
        return NextResponse.json({ status: 'awaiting_name' })
      }

      // Bound and sanitise the name — never store arbitrary free text.
      const firstName = text.trim().slice(0, 40).replace(/[^\p{L}\p{N}\s'-]/gu, '')
      if (!firstName || firstName.length < 1) {
        await sendWhatsAppMessage(from, "Sorry — what's your first name? Just the name is fine.")
        return NextResponse.json({ status: 'awaiting_name' })
      }

      await createWhatsAppUser(from, firstName)
      await sb.from('whatsapp_pending_signups').delete().eq('phone', from)
      await sendWhatsAppMessage(
        from,
        `Nice to meet you, ${firstName}. You're in — text ${Object.keys(TOOL_KEYWORDS).join(', ')} to run a tool, or any keyword to get a protocol.`
      )
      return NextResponse.json({ status: 'registered' })
    }

    // ── LOGIN — real magic link pushed straight to WhatsApp, no email typing.
    //    Sent as plain text (no preview_url): a preview fetch would hit Supabase's
    //    verify endpoint and burn the one-time token before the user taps it.
    if (verb === 'LOGIN') {
      if (!existingUser.email) {
        const url = `${SITE}/signup`
        await sendWhatsAppMessage(from, url, url)
        return NextResponse.json({ status: 'ok' })
      }

      const { data: linkData, error: linkError } = await sb.auth.admin.generateLink({
        type: 'magiclink',
        email: existingUser.email,
        options: { redirectTo: `${SITE}/auth/callback` },
      })
      const link = linkData?.properties?.action_link
      if (link && !linkError) {
        await sendWhatsAppMessage(from, link)
      } else {
        console.error('[LOGIN generateLink error]', linkError)
        const url = `${SITE}/signup`
        await sendWhatsAppMessage(from, url, url)
      }
      return NextResponse.json({ status: 'ok' })
    }

    // ── LIBRARY — list the member's saved items
    if (verb === 'LIBRARY' || verb === 'SAVED') {
      const { data: profile } = await sb
        .from('users')
        .select('user_id, id')
        .eq('whatsapp_number', from)
        .maybeSingle()

      let items: Array<{ title: string | null; url: string; category: string | null }> | null = null
      if (profile?.user_id) {
        const { data } = await sb
          .from('saved_items')
          .select('title, url, category')
          .eq('user_id', profile.user_id)
          .order('saved_at', { ascending: false })
          .limit(10)
        items = data
      }
      if ((!items || items.length === 0) && from) {
        const { data } = await sb
          .from('saved_items')
          .select('title, url, category')
          .eq('phone', from)
          .order('saved_at', { ascending: false })
          .limit(10)
        items = data
      }

      if (!items || items.length === 0) {
        await sendWhatsAppMessage(
          from,
          'Your library is empty. Save something with SAVE <keyword> or SAVE <url>.'
        )
      } else {
        const lines = items.map((it, i) => {
          const label = it.title || it.url
          return `${i + 1}. ${label}${it.url ? `\n   ${it.url}` : ''}`
        })
        await sendWhatsAppMessage(
          from,
          `*Your library* (${items.length})\n\n${lines.join('\n\n')}`
        )
      }
      return NextResponse.json({ status: 'library' })
    }

    // ── SAVE <keyword|slug|url> — idempotent save into saved_items
    if (/^SAVE\b/i.test(text)) {
      const arg = text.replace(/^SAVE\s+/i, '').trim()
      if (!arg) {
        await sendWhatsAppMessage(
          from,
          'What should I save? Try SAVE <keyword> or SAVE <url>.'
        )
        return NextResponse.json({ status: 'save_missing_arg' })
      }

      const { data: profile } = await sb
        .from('users')
        .select('user_id, id')
        .eq('whatsapp_number', from)
        .maybeSingle()

      let title: string | null = null
      let url = arg
      let category: string | null = 'General'

      // URL save
      if (/^https?:\/\//i.test(arg)) {
        title = arg
        url = arg
      } else {
        const lookup = arg.toLowerCase()
        const upper = arg.toUpperCase()
        let article: { slug: string; title: string; category: string | null } | null = null

        if (isSafeLookupToken(upper)) {
          const { data } = await sb
            .from('protocols')
            .select('slug, title, category')
            .eq('status', 'Published')
            .ilike('keyword', upper)
            .maybeSingle()
          article = data
        }
        if (!article && isSafeLookupToken(lookup)) {
          const { data } = await sb
            .from('protocols')
            .select('slug, title, category')
            .eq('status', 'Published')
            .ilike('slug', lookup)
            .maybeSingle()
          article = data
        }
        // Tool keywords map
        if (!article && TOOL_KEYWORDS[upper]) {
          const slug = TOOL_KEYWORDS[upper]
          const { data } = await sb
            .from('protocols')
            .select('slug, title, category')
            .eq('slug', slug)
            .maybeSingle()
          article = data
          if (!article) {
            article = { slug, title: upper, category: 'General' }
          }
        }

        if (!article) {
          await sendWhatsAppMessage(
            from,
            `I couldn't find anything called "${arg.slice(0, 40)}". Try a known keyword or a full URL.`
          )
          return NextResponse.json({ status: 'save_not_found' })
        }

        title = article.title
        url = `${SITE}/r/${article.slug}`
        category = article.category || 'General'
      }

      // Idempotent: skip if this user/phone already saved the same URL.
      let already = false
      if (profile?.user_id) {
        const { data: existing } = await sb
          .from('saved_items')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('url', url)
          .maybeSingle()
        already = !!existing
      }
      if (!already) {
        const { data: existingPhone } = await sb
          .from('saved_items')
          .select('id')
          .eq('phone', from)
          .eq('url', url)
          .maybeSingle()
        already = !!existingPhone
      }

      if (already) {
        await sendWhatsAppMessage(from, `Already in your library:\n${title || url}\n${url}`)
        return NextResponse.json({ status: 'save_duplicate' })
      }

      const { error: saveError } = await sb.from('saved_items').insert({
        user_id: profile?.user_id || null,
        phone: from,
        url,
        title,
        category,
      })

      if (saveError) {
        console.error('[SAVE error]', saveError)
        await sendWhatsAppMessage(from, 'Sorry — I could not save that right now. Try again in a moment.')
        return NextResponse.json({ status: 'save_error' })
      }

      await sendWhatsAppMessage(
        from,
        `Saved ✓\n*${title || url}*\n${url}\n\nText LIBRARY anytime to see your saves.`
      )
      return NextResponse.json({ status: 'saved' })
    }

    // Strip legacy action prefixes (SAVE, RUN, ARTICLE, AUDIO) if present.
    // RUN is the metered verb; bare tool keywords (TAX, CLARITY, …) count as RUN.
    const isExplicitRun = /^RUN\b/i.test(text)
    const cleanText = text.replace(/^(SAVE|RUN|ARTICLE|AUDIO)\s+/i, '').trim()
    const cleanVerb = cleanText.toUpperCase()

    // Resolve member user_id once for metering (WhatsApp-first users always have one).
    const { data: runProfile } = await sb
      .from('users')
      .select('user_id')
      .eq('whatsapp_number', from)
      .maybeSingle()
    const memberUserId = runProfile?.user_id ?? null

    // Best-effort signup grant for older accounts that never received credits.
    if (memberUserId) {
      await ensureSignupCredits(sb, memberUserId)
    }

    // ── Known tool keyword / RUN <tool> → metered tool card
    if (TOOL_KEYWORDS[cleanVerb]) {
      const toolSlug = TOOL_KEYWORDS[cleanVerb]
      const gate = await checkRunAllowed(sb, memberUserId)
      if (!gate.allowed) {
        const upgradeUrl = `${SITE}/r/upgrade?v=${cacheBust}`
        await sendWhatsAppMessage(
          from,
          paywallMessage(upgradeUrl, gate.balance),
          upgradeUrl
        )
        return NextResponse.json({ status: 'paywall' })
      }

      const url = `${SITE}/r/${toolSlug}?v=${cacheBust}`
      await sendWhatsAppMessage(from, url, url)
      // Deduct only after a successful send. Plus members are a no-op inside.
      await consumeRunCredit(sb, memberUserId, cleanVerb)
      return NextResponse.json({
        status: 'ok',
        metered: !gate.unlimited,
        remaining: gate.unlimited ? null : gate.remainingAfter,
        run: isExplicitRun,
      })
    }

    // ── Known article keyword or slug → that article's card (NOT metered)
    //    Parameterised filters only — never interpolate user text into .or().
    if (isSafeLookupToken(cleanVerb) || isSafeLookupToken(cleanText.toLowerCase())) {
      const lookupSlug = cleanText.toLowerCase()
      let article: { slug: string; type?: string | null } | null = null

      if (isSafeLookupToken(cleanVerb)) {
        const { data } = await sb
          .from('protocols')
          .select('slug, type')
          .eq('status', 'Published')
          .ilike('keyword', cleanVerb)
          .maybeSingle()
        article = data
      }

      if (!article && isSafeLookupToken(lookupSlug)) {
        const { data } = await sb
          .from('protocols')
          .select('slug, type')
          .eq('status', 'Published')
          .ilike('slug', lookupSlug)
          .maybeSingle()
        article = data
      }

      if (article) {
        // If the matched protocol is a Tool (not in TOOL_KEYWORDS map), still meter.
        if (article.type === 'Tool') {
          const gate = await checkRunAllowed(sb, memberUserId)
          if (!gate.allowed) {
            const upgradeUrl = `${SITE}/r/upgrade?v=${cacheBust}`
            await sendWhatsAppMessage(
              from,
              paywallMessage(upgradeUrl, gate.balance),
              upgradeUrl
            )
            return NextResponse.json({ status: 'paywall' })
          }
          const url = `${SITE}/r/${article.slug}?v=${cacheBust}`
          await sendWhatsAppMessage(from, url, url)
          await consumeRunCredit(sb, memberUserId, article.slug)
          return NextResponse.json({ status: 'ok', metered: !gate.unlimited })
        }

        const url = `${SITE}/r/${article.slug}?v=${cacheBust}`
        await sendWhatsAppMessage(from, url, url)
        return NextResponse.json({ status: 'ok' })
      }
    }

    // ── HELP / MENU / unrecognized word / first contact —
    //    all collapse to exactly one universal fallback card.
    await sendWhatsAppMessage(from, START_URL, START_URL)
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('[Webhook error]', err)
    // Always 200 to Meta so it does not retry forever on application errors.
    return NextResponse.json({ status: 'error_logged' }, { status: 200 })
  }
}

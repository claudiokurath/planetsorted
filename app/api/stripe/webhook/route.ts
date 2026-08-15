import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import {
  claimStripeEvent,
  markStripeEventDone,
  markStripeEventFailed,
  releaseStripeEventClaim,
} from '@/lib/billing/stripeEvents'

/**
 * Extract current_period_end from a Stripe Subscription.
 * Newer Stripe API versions may nest period dates on subscription items;
 * never fall back to "now" (that would immediately expire Plus).
 */
function periodEndIso(sub: Stripe.Subscription): string | null {
  const top = (sub as { current_period_end?: unknown }).current_period_end
  if (typeof top === 'number' && Number.isFinite(top) && top > 0) {
    return new Date(top * 1000).toISOString()
  }

  const items = sub.items?.data
  if (Array.isArray(items)) {
    for (const item of items) {
      const itemEnd = (item as { current_period_end?: unknown }).current_period_end
      if (typeof itemEnd === 'number' && Number.isFinite(itemEnd) && itemEnd > 0) {
        return new Date(itemEnd * 1000).toISOString()
      }
    }
  }

  // Last resort: trial_end if present.
  if (typeof sub.trial_end === 'number' && sub.trial_end > 0) {
    return new Date(sub.trial_end * 1000).toISOString()
  }

  return null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret.' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed'
    console.error(`[Stripe Webhook Signature Verification Failed]`, msg)
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 })
  }

  const supabase = createServerClient()

  // Durable idempotency: claim event.id before any side effects.
  // On duplicate, acknowledge 200 so Stripe stops retrying.
  const claim = await claimStripeEvent(supabase, event.id, event.type)
  if (!claim.claimed && claim.reason === 'duplicate') {
    console.log(`[Stripe Webhook] duplicate event=${event.id} type=${event.type}`)
    return NextResponse.json({ received: true, duplicate: true, event_id: event.id })
  }
  // claim.reason === 'error' (e.g. table missing) falls through — still process.

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null
        const stripeSubscriptionId =
          typeof session.subscription === 'string' ? session.subscription : null

        if (!userId) {
          console.warn(
            '[Stripe Webhook] checkout.session.completed received without client_reference_id (user_id)'
          )
          break
        }

        if (!stripeSubscriptionId) {
          console.warn(
            '[Stripe Webhook] checkout.session.completed without subscription id — ignoring'
          )
          break
        }

        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
        const currentPeriodEnd = periodEndIso(sub)

        const row = {
          user_id: userId,
          plan: 'Plus',
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          status: sub.status,
          current_period_end: currentPeriodEnd, // string | null — never invent "now"
        }

        const { error } = await supabase.from('entitlements').upsert(row, {
          onConflict: 'user_id',
        })

        if (error) {
          console.error('[Stripe Webhook] Error inserting entitlement:', error)
          await releaseStripeEventClaim(supabase, event.id)
          return NextResponse.json({ error: 'Database upsert failed' }, { status: 500 })
        }
        console.log(
          `[Stripe Webhook] Entitlement created for user=${userId} event=${event.id}`
        )
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : null
        if (!stripeCustomerId) break

        const currentPeriodEnd = periodEndIso(sub)
        const updates: {
          status: string
          stripe_subscription_id: string
          current_period_end: string | null
        } = {
          status: sub.status,
          stripe_subscription_id: sub.id,
          current_period_end: currentPeriodEnd,
        }

        const { error } = await supabase
          .from('entitlements')
          .update(updates)
          .eq('stripe_customer_id', stripeCustomerId)

        if (error) {
          console.error('[Stripe Webhook] Error updating subscription:', error)
          await releaseStripeEventClaim(supabase, event.id)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }
        console.log(
          `[Stripe Webhook] Subscription updated customer=${stripeCustomerId} event=${event.id}`
        )
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : null
        if (!stripeCustomerId) break

        const { error } = await supabase
          .from('entitlements')
          .update({
            status: 'canceled',
          })
          .eq('stripe_customer_id', stripeCustomerId)

        if (error) {
          console.error('[Stripe Webhook] Error canceling subscription:', error)
          await releaseStripeEventClaim(supabase, event.id)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }
        console.log(
          `[Stripe Webhook] Subscription canceled customer=${stripeCustomerId} event=${event.id}`
        )
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : null
        console.warn(
          `[Stripe Webhook] invoice.payment_failed customer=${customerId} event=${event.id}`
        )
        break
      }

      default:
        break
    }

    await markStripeEventDone(supabase, event.id)
    return NextResponse.json({ received: true, event_id: event.id })
  } catch (err) {
    console.error('[Stripe Webhook Internal Error]', err)
    const detail = err instanceof Error ? err.message : 'internal error'
    await markStripeEventFailed(supabase, event.id, detail)
    await releaseStripeEventClaim(supabase, event.id)
    return NextResponse.json({ error: 'Internal server processing error' }, { status: 500 })
  }
}

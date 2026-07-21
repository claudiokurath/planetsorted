import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

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
  } catch (err: any) {
    console.error(`[Stripe Webhook Signature Verification Failed]`, err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const stripeCustomerId = session.customer as string
        const stripeSubscriptionId = session.subscription as string

        if (!userId) {
          console.warn('[Stripe Webhook] checkout.session.completed received without client_reference_id (user_id)')
          break
        }

        // Fetch subscription details to get status and current period end date
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
        const currentPeriodEnd = new Date((sub as any).current_period_end * 1000).toISOString()

        const { error } = await supabase.from('entitlements').upsert(
          {
            user_id: userId,
            plan: 'Plus',
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            status: sub.status,
            current_period_end: currentPeriodEnd,
          },
          { onConflict: 'user_id' }
        )

        if (error) {
          console.error('[Stripe Webhook] Error inserting entitlement:', error)
          return NextResponse.json({ error: 'Database upsert failed' }, { status: 500 })
        }
        console.log(`[Stripe Webhook] Entitlement created successfully for user: ${userId}`)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const stripeCustomerId = sub.customer as string
        const currentPeriodEnd = new Date((sub as any).current_period_end * 1000).toISOString()

        const { error } = await supabase
          .from('entitlements')
          .update({
            status: sub.status,
            current_period_end: currentPeriodEnd,
            stripe_subscription_id: sub.id,
          })
          .eq('stripe_customer_id', stripeCustomerId)

        if (error) {
          console.error('[Stripe Webhook] Error updating subscription:', error)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }
        console.log(`[Stripe Webhook] Subscription updated for customer: ${stripeCustomerId}`)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const stripeCustomerId = sub.customer as string

        const { error } = await supabase
          .from('entitlements')
          .update({
            status: 'canceled',
          })
          .eq('stripe_customer_id', stripeCustomerId)

        if (error) {
          console.error('[Stripe Webhook] Error canceling subscription:', error)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }
        console.log(`[Stripe Webhook] Subscription deleted (canceled) for customer: ${stripeCustomerId}`)
        break
      }

      default:
        // Other events ignored
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[Stripe Webhook Internal Error]', err)
    return NextResponse.json({ error: 'Internal server processing error' }, { status: 500 })
  }
}

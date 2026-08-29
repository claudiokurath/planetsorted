import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSessionClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export const metadata = {
  title: 'Upgrade to Plus — Planet Sorted',
  description: 'Unlock unlimited tools and saved results.',
}

export default async function UpgradePage() {
  const sessionClient = await createSessionClient()
  const {
    data: { user: authUser },
  } = await sessionClient.auth.getUser()

  // Server Action to handle the subscription redirection
  async function handleSubscribe() {
    'use server'

    const session = await createSessionClient()
    const {
      data: { user: currentUser },
    } = await session.auth.getUser()

    if (!currentUser) {
      redirect('/signup')
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
    const priceId = process.env.STRIPE_PRICE_ID_PLUS_MONTHLY

    if (!priceId) {
      console.error('STRIPE_PRICE_ID_PLUS_MONTHLY is missing in environment variables.')
      redirect('/dashboard?error=checkout-failed')
    }

    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        client_reference_id: currentUser.id,
        customer_email: currentUser.email || undefined,
        success_url: `${site}/dashboard?upgraded=true`,
        cancel_url: `${site}/r/upgrade-cancelled`,
      })

      if (!checkoutSession.url) {
        throw new Error('Failed to retrieve checkout session URL.')
      }

      redirect(checkoutSession.url)
    } catch (err) {
      // Next.js redirect() throws a special error — rethrow it.
      if (
        err &&
        typeof err === 'object' &&
        'digest' in err &&
        typeof (err as { digest?: unknown }).digest === 'string' &&
        String((err as { digest: string }).digest).startsWith('NEXT_REDIRECT')
      ) {
        throw err
      }
      console.error('[Stripe Upgrade Checkout Error]', err)
      redirect('/dashboard?error=checkout-failed')
    }
  }

  const disclaimer = `Planet Sorted provides educational information, templates, and practical tools. It is not medical, clinical, legal, or financial advice, and not a substitute for professional support. It is not a crisis service. If you are in immediate danger in the UK, call 999. If you are at risk of harming yourself, text SHOUT to 85258.`

  // State 1: No active session
  if (!authUser) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center space-y-8 font-sans">
        <div className="space-y-3">
          <div className="text-4xl">🔒</div>
          <h1 className="text-2xl font-medium text-white">Sign in to Upgrade</h1>
          <p className="text-sm text-neutral-300">
            To upgrade to Plus, you need to be signed in first.
          </p>
        </div>

        <Link
          href="/signup"
          className="inline-block w-full rounded-full bg-green-500 py-3 font-medium text-white hover:bg-green-600 transition-colors"
        >
          Sign in or create your free account — no password needed.
        </Link>

        <p className="text-xs text-neutral-500 leading-normal text-left border-t border-white/10 pt-6">
          {disclaimer}
        </p>
      </div>
    )
  }

  // State 2: Active session
  return (
    <div className="mx-auto max-w-md px-6 py-20 space-y-8 font-sans">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">PLANET SOR7ED Plus</h1>
        <p className="text-lg font-medium text-green-600">£5.99/month or £49/year</p>
      </div>

      <div className="rounded-none border border-white/10 bg-black p-6 space-y-4">
        <h2 className="font-medium text-white">Included in Plus:</h2>
        <ul className="space-y-3 text-sm text-neutral-300">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-medium">✓</span>
            <span>Saved run history (timestamped)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-medium">✓</span>
            <span>Compare mode for your tool runs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-medium">✓</span>
            <span>PDF exports for plans and briefs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-medium">✓</span>
            <span>Full 7-day and 30-day action plans</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-medium">✓</span>
            <span>Unlimited WhatsApp RUN commands</span>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <form action={handleSubscribe}>
          <button
            type="submit"
            className="w-full rounded-full bg-green-500 py-3 font-medium text-white hover:bg-green-600 transition-colors"
          >
            Subscribe Now
          </button>
        </form>

        <p className="text-xs text-center text-neutral-500">
          Scholarships and pay-what-you-can tiers are available, no proof needed. Contact us at{' '}
          <a href="mailto:hello@planetsorted.com" className="underline">
            hello@planetsorted.com
          </a>
          .
        </p>
      </div>

      <p className="text-xs text-neutral-500 leading-normal border-t border-white/10 pt-6">
        {disclaimer}
      </p>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSessionClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export const metadata = {
  title: 'Plus membership — PLANET SOR7ED',
  description: 'Review SOR7ED Plus membership and subscription details.',
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

    const site = process.env.SITE_URL ?? 'https://planetsorted.com'
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
      <div className="mx-auto max-w-lg px-6 py-16 text-center space-y-8">
        <div className="space-y-3">
          <span className="sor7ed-pill">SOR7ED Plus</span>
          <h1 className="font-bebas text-4xl uppercase text-white sm:text-5xl">Sign in to review Plus</h1>
          <p className="text-base leading-relaxed text-neutral-300">
            Sign in with your email to continue. No password needed.
          </p>
        </div>

        <Link
          href="/signup?next=%2Fr%2Fupgrade"
          className="inline-flex min-h-12 w-full items-center justify-center bg-white px-5 py-3 text-base font-medium text-black transition-colors hover:bg-[#FFBA2E]"
        >
          Sign in or create a free account
        </Link>

        <Link href="/membership" className="inline-flex min-h-11 items-center text-base text-[#FFBA2E] underline">Back to membership</Link>
        <p className="text-sm text-neutral-400 leading-relaxed text-left border-t border-white/10 pt-6">
          {disclaimer}
        </p>
      </div>
    )
  }

  // State 2: Active session
  return (
    <div className="mx-auto max-w-lg px-6 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="sor7ed-pill">Membership</span>
        <h1 className="font-bebas text-4xl uppercase text-white sm:text-5xl">PLANET SOR7ED Plus</h1>
        <p className="text-2xl text-[#FFBA2E]">£5.99 per month</p>
      </div>

      <div className="rounded-none border border-white/10 bg-black p-6 space-y-4">
        <h2 className="font-bebas text-3xl uppercase text-white">Before you subscribe</h2>
        <p className="text-base leading-relaxed text-neutral-300">Core tools, guidebook content and your saved library are available without a paid membership.</p>
        <p className="text-base leading-relaxed text-neutral-300">Continue to checkout to review the subscription price and terms before confirming payment.</p>
        <Link href="/contact" className="inline-flex min-h-11 items-center text-base text-[#FFBA2E] underline">Ask a membership question</Link>
      </div>

      <div className="space-y-4">
        <form action={handleSubscribe}>
          <button
            type="submit"
            className="min-h-12 w-full bg-white px-5 py-3 text-base font-medium text-black transition-colors hover:bg-[#FFBA2E]"
          >
            Continue to secure checkout
          </button>
        </form>

        <p className="text-sm leading-relaxed text-center text-neutral-400">
          For membership or billing questions, contact{' '}
          <a href="mailto:hello@planetsorted.com" className="inline-flex min-h-11 items-center break-all text-[#FFBA2E] underline">
            hello@planetsorted.com
          </a>
          .
        </p>
      </div>

      <Link href="/membership" className="inline-flex min-h-11 items-center text-base text-[#FFBA2E] underline">Back to membership</Link>
      <p className="text-sm text-neutral-400 leading-relaxed border-t border-white/10 pt-6">
        {disclaimer}
      </p>
    </div>
  )
}

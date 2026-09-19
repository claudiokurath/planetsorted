import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqDisclosure } from '@/components/marketing/FaqDisclosure'
import { SectionHeader } from '@/components/marketing/SectionHeader'

export const metadata: Metadata = {
  title: 'Membership — PLANET SOR7ED',
  description:
    'Save your results, revisit previous work and keep useful steps together. Free is honestly free — Membership adds the version of each tool you can actually use on a Wednesday.',
}

/**
 * Membership — restyled to match the 2026 marketing surface (Home).
 *
 * Copy honesty:
 *   The three-tier pricing (£0 / £5.99 / £9.99) shown in the design mock is
 *   provisional. Fill in real numbers before launch and delete the "[TBD]"
 *   markers below. Same for the tier features that still read "[TBD]".
 */

const FAQ = [
  {
    q: 'Can I really use SOR7ED without paying?',
    a: 'Yes. The blog is free forever — no account, no paywall. Once tools open (in waves via the waitlist), the free tier is a real tier — not a nag screen. You lower the ceiling on how often you can use the paid version. Nothing more.',
  },
  {
    q: 'What exactly is behind Plus?',
    a: '[TBD — full Plus feature list to be confirmed before launch. Draft: save runs, compare across weeks, full-fidelity PDF export of any tool output, unlimited WhatsApp reruns, private beta access to unreleased tools.]',
  },
  {
    q: 'How do I qualify for a scholarship?',
    a: 'If you are on a waiting list, unemployed, or just cannot right now — you get Plus for £0–£2/month. No proof required. Ask via the waitlist form and mention "scholarship" in the message field.',
  },
  {
    q: 'Do you offer refunds?',
    a: '[TBD — refund policy to be confirmed before launch. Likely: full refund within 14 days, no questions asked.]',
  },
  {
    q: 'Is there a lifetime option?',
    a: '[TBD — lifetime pricing to be confirmed before launch. Currently: no lifetime tier planned.]',
  },
  {
    q: 'What happens if I cancel?',
    a: '[TBD — cancellation flow to be confirmed before launch. Likely: cancel from the account page in one tap. Access continues to the end of the paid period. Saved runs remain readable for 90 days.]',
  },
]

/**
 * NB: prices below are placeholders from the design mock — replace before launch.
 */
const TIERS = [
  {
    tag: 'FREE · ALWAYS',
    name: 'Just try it',
    price: '£0',
    period: '/ FOREVER',
    tagline: 'Anyone. Everyone. The website works without an account. Sign up only when you want to save.',
    features: [
      'All 24 blog posts — no paywall, no account',
      'All tools — full result on screen',
      'Basic breakdown + 24-hour action plan',
      'Save runs to your account',
      'All 154 guidebook articles',
    ],
    cta: { label: 'Start with a post', href: '/intelligence' },
    accent: false,
  },
  {
    tag: 'PLUS · FOUNDING MEMBER',
    name: 'Sort it properly',
    price: '£5.99',
    period: '/ MONTH',
    tagline: 'For the person who is already using the tools and wants to keep the outputs.',
    features: [
      'Everything in Free',
      'Saved run history — compare across weeks',
      'PDF exports — Leak Map, Decision Brief, Autopilot Pack',
      'Full 7-day + 30-day plans',
      'Advanced variants (conservative / realistic / aggressive)',
      'WhatsApp companion when it ships',
    ],
    cta: { label: 'Join waitlist for Plus', href: '#waitlist' },
    accent: true,
  },
  {
    tag: 'SUPPORTER · PAY IT FORWARD',
    name: 'Buy someone else in',
    price: '£9.99',
    period: '/ MONTH',
    tagline: 'Some features in Plus. Your name funds a scholarship seat for someone on a long NHS waiting list.',
    features: [
      'Everything in Plus',
      '1 scholarship seat funded per month',
      'Early access to new tools (before the wider list)',
      'Named on the /supporters page (optional)',
    ],
    cta: { label: 'Support the work', href: '#waitlist' },
    accent: false,
  },
]

export default function MembershipPage() {
  return (
    <main className="bg-black text-white">

      {/* Header */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">

          <SectionHeader index="01" label="MEMBERSHIP" right="3 TIERS · £0 START" />

          <h1 className="font-bebas text-5xl uppercase leading-[1.02] tracking-normal text-white md:text-[112px]">
            Membership
          </h1>
          <h2 className="mt-4 font-bebas text-3xl uppercase leading-tight tracking-normal text-[#F5C518] md:text-5xl">
            Free is honestly free.
          </h2>

          <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-300 md:text-[16px]">
            The blog is free forever. The tools open in waves via the waitlist. Once you're in, the free
            tier is a real tier — not a nag screen. You pay only for the version the future-you can actually
            use on a Wednesday.
          </p>
          <p className="mt-2 max-w-2xl text-[13px] text-neutral-500">
            No trial needed. No email guilt-trips. Cancel from your account page in one tap.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="border-t border-white/10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-6 md:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col border p-6 md:p-8 ${
                  t.accent
                    ? 'border-[#F5C518] bg-neutral-950 shadow-[0_0_0_1px_#F5C518_inset]'
                    : 'border-white/15 bg-neutral-950'
                }`}
              >
                <span className={`themed-idx mb-4 ${t.accent ? 'text-[#F5C518]' : ''}`}>{t.tag}</span>
                <h3 className="font-bebas text-2xl uppercase tracking-normal text-white">{t.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-bebas text-6xl leading-none tracking-normal text-white">
                    {t.price}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    {t.period}
                  </span>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-neutral-400">{t.tagline}</p>
                <ul className="mt-6 flex-1 space-y-3 border-t border-white/10 pt-5">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13px] leading-relaxed text-neutral-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5C518]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={t.cta.href}
                  className={`mt-6 block text-center px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-90 ${
                    t.accent
                      ? 'bg-[#F5C518] text-black'
                      : 'border border-white/25 text-white hover:border-white'
                  }`}
                >
                  {t.cta.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarship band */}
      <section className="border-t border-white/10 bg-[#F5C518] py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-5 text-center text-black">
          <p className="font-bebas text-2xl uppercase leading-tight tracking-normal md:text-4xl">
            If you're on a waiting list, unemployed,
            <br />
            or just cannot right now —{' '}
            <span className="underline decoration-black/40 underline-offset-8">you get Plus</span> for
            £0–£2/month. No proof needed.
          </p>
          <p className="mt-6 text-[13px] text-black/70">
            This is a promise, not a formality. 1-in-12 members funds 1-in-4 seats. If that ratio slips, we
            say so on this page.
          </p>
          <Link
            href="#waitlist"
            className="mt-8 inline-block bg-black px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
          >
            Ask on the waitlist form
          </Link>
        </div>
      </section>

      {/* Free vs Plus, without the table */}
      <section className="border-t border-white/10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeader index="02" label="THE PLAIN-ENGLISH VERSION" right="FREE VS PLUS · WITHOUT THE TABLE" />

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <div className="border border-white/15 bg-neutral-950 p-8">
              <span className="themed-idx">FREE · ON-SCREEN</span>
              <h3 className="mt-4 font-bebas text-3xl uppercase leading-tight tracking-normal text-white md:text-4xl">
                The tool tells you the answer.
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-neutral-400">
                Every tool runs fully in the browser. You see the number, the breakdown, the one first thing
                to do this week. You don't need an account.
              </p>
            </div>
            <div className="border border-[#F5C518] bg-neutral-950 p-8 shadow-[0_0_0_1px_#F5C518_inset]">
              <span className="themed-idx text-[#F5C518]">PLUS · DELIVERABLE · CONTINUITY</span>
              <h3 className="mt-4 font-bebas text-3xl uppercase leading-tight tracking-normal text-white md:text-4xl">
                The tool remembers you.
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-neutral-400">
                Saved runs. Compare week-on-week. Real PDFs to print. Full 30-day plans instead of 7.
                Unlimited WhatsApp reruns. The version of the tool future-you can actually use on a
                Wednesday.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-5">
          <SectionHeader index="03" label="REASONABLE FEARS" right="THE HONEST ANSWERS" />
          <div>
            {FAQ.map((item, i) => (
              <FaqDisclosure key={item.q} question={item.q} defaultOpen={i === 0}>
                {item.a}
              </FaqDisclosure>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist anchor + closing */}
      <section id="waitlist" className="theme-paper py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <span className="themed-idx mb-6 block">THE NEXT STEP</span>
          <h2 className="font-bebas text-4xl uppercase leading-[1.02] tracking-normal md:text-[64px]">
            Read a post first.{' '}
            <span style={{ color: 'rgba(10,10,10,0.42)' }}>Decide about Plus on a Wednesday.</span>
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/intelligence"
              className="inline-flex items-center gap-2 bg-black px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
            >
              Read the blog
            </Link>
            <Link
              href="/#waitlist"
              className="inline-flex items-center gap-2 border border-black/25 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:border-black"
            >
              Join the waitlist
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

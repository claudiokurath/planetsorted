import Link from 'next/link'
import type { Metadata } from 'next'
import { BlogRow } from '@/components/marketing/BlogRow'
import { BrainDumpPreviewCard } from '@/components/marketing/BrainDumpPreviewCard'
import { FaqDisclosure } from '@/components/marketing/FaqDisclosure'
import { HeroMarquee } from '@/components/marketing/HeroMarquee'
import { IdeaColumns } from '@/components/marketing/IdeaColumns'
import { LatticeSection, TOTAL_PROTOCOLS } from '@/components/marketing/LatticeSection'
import { LeakBreakdownCard } from '@/components/marketing/LeakBreakdownCard'
import { SectionHeader } from '@/components/marketing/SectionHeader'
import { WaitlistForm } from '@/components/marketing/WaitlistForm'

export const metadata: Metadata = {
  title: 'PLANET SOR7ED — Practical tools for brains that work differently',
  description:
    'A small library of practical tools and plain-English protocols for the messy moment, not the ideal one. Sorted into seven parts of adult life.',
  openGraph: {
    title: 'PLANET SOR7ED',
    description: 'Practical tools for brains that work differently.',
  },
}

/*
 * Section grounds alternate so every seam is visible and it's obvious where
 * one section ends and the next begins. Tokens live in app/globals.css.
 *
 *   01 Hero         ink     (black)
 *   02 Calculator   paper   (off-white)
 *   03 The idea     ink
 *   04 Pillars      gold    ← the single yellow ground on the page
 *   05 Blog         ink
 *   06 Brain dump   paper
 *   07 FAQ          ink  ┐ one dark block: the questions and the sign-up
 *   08 Waitlist     ink  ┘ belong together, split by a hairline only
 *   09 Closing      paper   (ends light, against the black site footer)
 */

const AUDIENCE_PRIMARY = ['ADHD', 'Autistic', 'AuDHD']
const AUDIENCE_SECONDARY = [
  'Dyslexic',
  'Bipolar',
  'Long-waitlist',
  'Newly diagnosed',
  'Not diagnosed, just tired',
]

const BLOG_ROWS = [
  {
    href: '/intelligence/adhd-admin-overwhelm-protocol',
    date: '08 Sep 2026',
    kicker: 'Mind · Featured',
    title: 'ADHD admin overwhelm — a protocol, not a pep talk',
    body:
      "The 12-step routine, the Gamma deck, and the tool. For the days when you have 47 tabs open and one unanswered email that's costing you £600.",
    meta: '9 min · with slides →',
  },
  {
    href: '/intelligence/499-sweep-forgotten-subscriptions',
    date: '01 Sep 2026',
    kicker: 'Wealth',
    title: 'The £4.99 sweep — why forgotten subs are 34% of your ADHD tax',
    body:
      'A 6-minute audit that catches most dead subscriptions in one search. Includes the calculator preview and the exact bank-app queries.',
    meta: '6 min read →',
  },
  {
    href: '/intelligence/sleep-is-a-sensory-problem',
    date: '25 Aug 2026',
    kicker: 'Body',
    title: 'Sleep is not a discipline problem — it\'s a sensory one',
    body:
      'Why sleep hygiene advice fails for ND adults, and the four sensory levers that actually work. Body pillar, guidebook 03.',
    meta: '7 min read →',
  },
]

export default function HomePage() {
  return (
    <main id="top" className="bg-black text-white">

      {/* 01 — HERO · ink */}
      <section className="theme-ink relative">
        <div className="mx-auto max-w-6xl px-5 pt-14 pb-12 md:pt-24 md:pb-16">

          <SectionHeader index="01" label="WHAT THIS IS" right="EST. LONDON · 2025" />

          {/* Hero video */}
          <div className="relative mx-auto mb-10 w-full max-w-[380px] sm:max-w-[440px] md:max-w-[480px] md:mb-14">
            <div className="relative aspect-square overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/images/hero-poster.png"
                preload="metadata"
                aria-label="SOR7ED painted logo sequence"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/media/sequence01_1.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="mt-5 flex justify-center">
              <span className="sor7ed-pill">Built for ADHD, autistic & AuDHD adults</span>
            </div>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="themed-strong font-bebas text-[38px] uppercase leading-[0.98] tracking-normal md:text-[80px] lg:text-[96px]">
              Most productivity advice was built for
              <br className="hidden sm:block" />{' '}
              <span className="themed-soft">a brain you don't have.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.7] themed-body md:mt-10 md:text-[17px]">
              SOR7ED is a small library of practical tools and plain-English protocols for the messy moment,
              not the ideal one. Sorted into seven parts of adult life, so you always know where to start.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/intelligence"
                className="themed-btn inline-flex items-center gap-2 px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em]"
              >
                Read the blog
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
                </svg>
              </Link>
              <Link
                href="#calculator"
                className="themed-btn-ghost inline-flex items-center gap-2 px-8 py-4 text-xs font-medium uppercase tracking-[0.16em]"
              >
                Preview a tool
              </Link>
            </div>

            {/* Audience row */}
            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2 md:mt-14 md:gap-3">
              {AUDIENCE_PRIMARY.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center border border-[#F5C518]/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#F5C518]"
                >
                  {a}
                </span>
              ))}
              {AUDIENCE_SECONDARY.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center border border-white/15 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        <HeroMarquee />
      </section>

      {/* 02 — CALCULATOR SHOWCASE · paper */}
      <section id="calculator" className="theme-paper py-16 md:py-28">
        <div className="mx-auto max-w-6xl px-5">

          <SectionHeader
            index="02"
            label="THE ONE TOOL PEOPLE ACTUALLY FINISH"
            right="FREE · NO SIGN-UP"
          />

          <div className="grid items-start gap-8 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <span className="sor7ed-pill">Featured tool · Wealth</span>
              <h2 className="themed-strong mt-6 font-bebas text-4xl uppercase leading-[1.02] tracking-normal md:text-[64px]">
                The ADHD
                <br />
                <span className="themed-soft">Tax Calculator.</span>
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-[1.7] themed-body">
                Three minutes. You put in the money you actually lost to late fees, forgotten
                subscriptions, duplicate purchases and impulse buys. You get a real number, a leak map,
                and a 30-day plan to cut it.
              </p>
              <p className="themed-note mt-4 max-w-md text-[13px] leading-[1.6]">
                The tool is in private beta. Read what it does, see a live preview, then join the
                waitlist to get access.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/tools/adhd-tax-calculator"
                  className="themed-btn px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  Read about the tool
                </Link>
                <span className="themed-idx">3 min · beta</span>
              </div>
            </div>

            <div className="md:col-span-7">
              <LeakBreakdownCard />
              <p className="themed-idx mt-4 text-right">
                ↑ Sample result. Full tool has 40+ line items and a 30-day plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — THE IDEA · ink */}
      <section id="about" className="theme-ink py-16 md:py-28">
        <div className="mx-auto max-w-6xl px-5">

          <SectionHeader index="03" label="THE IDEA" right="3 THINGS TO KNOW" />

          <div className="mb-12 max-w-3xl md:mb-20">
            <h2 className="themed-strong font-bebas text-4xl uppercase leading-[1.02] tracking-normal md:text-[64px]">
              Support that fits{' '}
              <span className="themed-soft">how your brain actually works.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] themed-body md:mt-8 md:text-[16px]">
              Most productivity and wellbeing advice assumes a brain that plans ahead, starts on time, and
              follows through. SOR7ED is for everyone else — built in short steps, for the messy moment
              rather than the ideal one.
            </p>
          </div>

          <IdeaColumns />
        </div>
      </section>

      {/* 04 — PILLARS LATTICE · gold */}
      <section id="pillars" className="theme-gold py-16 md:py-28">
        <div className="mx-auto max-w-6xl px-5">

          <SectionHeader
            index="04"
            label="THE PILLARS"
            right={`${TOTAL_PROTOCOLS} PROTOCOLS LIVE · 7 CATEGORIES`}
          />

          <div className="mb-10 max-w-3xl md:mb-16">
            <h2 className="themed-strong font-bebas text-4xl uppercase leading-[1.02] tracking-normal md:text-[64px]">
              <span>Sorted by life area. </span>
              <span className="themed-soft">Not by mood.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] themed-body">
              Seven categories. Every tool, every guide, every WhatsApp keyword — sorted here.
              Click a pillar to open its guidebook.
            </p>
          </div>

          <LatticeSection />
        </div>
      </section>

      {/* 05 — FROM THE BLOG · ink */}
      <section id="blog" className="theme-ink py-16 md:py-28">
        <div className="mx-auto max-w-6xl px-5">

          <SectionHeader index="05" label="FROM THE BLOG" right="READ FIRST · TOOLS LATER" />

          <div className="mb-10 max-w-3xl md:mb-14">
            <h2 className="themed-strong font-bebas text-4xl uppercase leading-[1.02] tracking-normal md:text-[64px]">
              Every tool starts as a post.{' '}
              <span className="themed-soft">Read the thinking, then use the thing.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] themed-body">
              Each protocol is written up in plain English first — the problem, the pattern, the fix — with
              the tool embedded inside. Free to read. No account needed.
            </p>
          </div>

          <div>
            {BLOG_ROWS.map((r) => (
              <BlogRow key={r.href} {...r} />
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/intelligence"
              className="themed-btn inline-flex items-center gap-2 px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              Read the blog →
            </Link>
          </div>
        </div>
      </section>

      {/* 06 — BRAIN DUMP · paper */}
      <section id="tool" className="theme-paper py-16 md:py-28">
        <div className="mx-auto max-w-7xl px-5">

          <SectionHeader
            index="06"
            label="A SECOND TOOL"
            right="WHEN THE LEAK ISN'T MONEY, IT'S TABS"
          />

          <div className="grid items-start gap-8 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <span className="sor7ed-pill">Tool · Mind · Beta</span>
              <h2 className="themed-strong mt-6 font-bebas text-4xl uppercase leading-[1.02] tracking-normal md:text-[56px]">
                Brain Dump
                <br />
                <span className="themed-soft">Sorter.</span>
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-[1.7] themed-body">
                Empty your head. We sort what came out into{' '}
                <span
                  className="font-medium"
                  style={{ color: '#000000', background: '#F5C518', padding: '0 4px' }}
                >
                  Do now
                </span>
                , Do later, Delegate, or <span className="line-through">Drop</span>. No judgement, no dopamine
                tax.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="#waitlist"
                  className="themed-btn px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  Join the waitlist
                </Link>
                <span className="themed-idx">Private beta</span>
              </div>
            </div>

            <div className="md:col-span-7">
              <BrainDumpPreviewCard />
              <p className="themed-idx mt-4 text-right">
                ↑ Sample output. Real thing has 40+ categories and a save option.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 07 — FAQ · ink (start of the dark FAQ + waitlist block) */}
      <section className="theme-ink py-16 md:py-28">
        <div className="mx-auto max-w-4xl px-5">

          <SectionHeader index="07" label="IS THIS FOR ME?" right="READ IF UNSURE" />

          <h2 className="themed-strong mb-10 font-bebas text-4xl uppercase leading-[1.02] tracking-normal md:mb-14 md:text-[56px]">
            <span>A few honest answers </span>
            <span className="themed-soft">before you commit five minutes.</span>
          </h2>

          <div>
            <FaqDisclosure question="Do I need a diagnosis to use SOR7ED?" defaultOpen>
              No. Self-identifying is welcome, and everything here is designed to be useful whether you have
              a formal diagnosis or you just recognise yourself in the patterns. Nothing on this site is
              clinical.
            </FaqDisclosure>
            <FaqDisclosure question="Is this a therapy service?">
              No, and it isn't medical, legal or financial advice either. SOR7ED is educational tools and
              protocols. In immediate danger call 999. To talk now text SHOUT to 85258.
            </FaqDisclosure>
            <FaqDisclosure question="Do I have to sign up?">
              The blog and all guidebook articles are free to read with no account. The interactive tools
              are currently in private beta — join the waitlist and we'll email you when your slot opens.
              No spam, no email guilt-trips.
            </FaqDisclosure>
            <FaqDisclosure question="What about the WhatsApp thing I've heard about?">
              The SOR7ED WhatsApp companion — a way to save runs and text keywords to rerun tools — is
              coming later. For now, the website is the whole product. Waitlist members get first access
              when WhatsApp lights up.
            </FaqDisclosure>
            <FaqDisclosure question="Is SOR7ED only for ADHD?">
              No. It's built for ADHD, autistic, AuDHD, dyslexic, bipolar and other neurodivergent adults.
              Content is written so it lands even if you haven't worked out exactly which label(s) fit you.
            </FaqDisclosure>
            <FaqDisclosure question="Where do I start if I feel too overwhelmed to choose?">
              Start with the{' '}
              <Link href="#calculator" className="themed-link">
                ADHD Tax Calculator
              </Link>
              . Three minutes, one honest number, one next step. That's the whole promise of the site.
            </FaqDisclosure>
            <FaqDisclosure question={'What does the "7" stand for?'}>
              The seven pillars — Mind, Wealth, Body, Tech, Connection, Impression, Growth. Between them
              they cover the whole reality of neurodivergent adult life, not just productivity.
            </FaqDisclosure>
          </div>
        </div>
      </section>

      {/* 08 — WAITLIST · ink (same block as the FAQ, hairline divider only) */}
      <section id="waitlist" className="theme-ink themed-hair-t py-16 md:py-28">
        <div className="mx-auto max-w-4xl px-5">

          <SectionHeader index="08" label="EARLY ACCESS" right="147 ON THE LIST · UK FIRST" />

          <h2 className="themed-strong font-bebas text-4xl uppercase leading-[1.02] tracking-normal md:text-[64px]">
            <span>The blog is open. </span>
            <span className="themed-soft">The tools are next.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] themed-body">
            Drop your email and we'll send you a single message the day your tool access opens. No sequence,
            no drip, no newsletter guilt. One email. That's the whole deal.
          </p>

          <WaitlistForm />

          <p className="themed-idx mt-6">
            By joining you accept the{' '}
            <Link href="/privacy" className="themed-link">
              Privacy Notice
            </Link>
            . One email. Never sold. Unsubscribe with one tap.
          </p>
        </div>
      </section>

      {/* 09 — CLOSING · paper (ends light, against the black site footer) */}
      <section className="theme-paper py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <span className="themed-idx mb-6 block">09 / END</span>
          <h2 className="themed-strong font-bebas text-4xl uppercase leading-[1.02] tracking-normal md:text-[72px]">
            <span>Pick one thing. </span>
            <span className="themed-soft">Do it badly. That still counts.</span>
          </h2>
          <p className="themed-idx mt-10">Built by Claudio Kurath in London · 2026</p>
        </div>
      </section>

    </main>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — PLANET SOR7ED',
  description:
    'SOR7ED is a practical support platform for ADHD, autistic, AuDHD, dyslexic, bipolar and other neurodivergent adults — honest editorial content paired with interactive tools that end in a real next step.',
}

const PILLARS = [
  {
    name: 'Mind',
    slug: 'mind',
    body: 'Executive function, attention, decision fatigue, emotional regulation, RSD, anxiety, ADHD systems.',
  },
  {
    name: 'Wealth',
    slug: 'wealth',
    body: 'ADHD tax, bills, debt, subscriptions, financial avoidance, money systems, admin survival.',
  },
  {
    name: 'Body',
    slug: 'body',
    body: 'Burnout, sensory load, medication, sleep, chronic pain, substance use, physical regulation.',
  },
  {
    name: 'Tech',
    slug: 'tech',
    body: 'Digital systems, automation, AI tools, accessibility, focus infrastructure, notification design.',
  },
  {
    name: 'Connection',
    slug: 'connection',
    body: 'Relationships, friendship, consent, intimacy, boundaries, shared living, communication scripts.',
  },
  {
    name: 'Impression',
    slug: 'impression',
    body: 'Masking, identity, confidence, visibility, personal presentation, social performance, unmasking.',
  },
  {
    name: 'Growth',
    slug: 'growth',
    body: 'Work, career, learning, therapy, skills, self-advocacy, long-term change.',
  },
]

const LOOP = [
  {
    n: '1',
    head: 'Read an article',
    body: 'Feel briefly understood — then return to square one with no concrete next step and no lasting change.',
  },
  {
    n: '2',
    head: 'Download an app',
    body: 'Get overwhelmed by onboarding, confused by the interface, and quietly abandon it within a week.',
  },
  {
    n: '3',
    head: 'Try a planner',
    body: 'Lose the planner. Feel shame. Stop trying. File the whole episode under "things that don’t work for me."',
  },
]

function PillarCard({ name, slug, body }: (typeof PILLARS)[number]) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group flex flex-col gap-3 rounded-lg border border-[#C6A052]/45 p-6 transition-colors hover:border-[#C6A052] hover:bg-[#C6A052]/[0.04]"
    >
      <span className="font-bebas text-2xl uppercase tracking-tight text-white sm:text-3xl">{name}</span>
      <span className="text-[13px] leading-relaxed text-neutral-400">{body}</span>
    </Link>
  )
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-7 px-5 py-28 text-center sm:py-36">
        <h1 className="font-bebas text-5xl uppercase leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Tools built for brains that work differently
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-neutral-400 sm:text-lg">
          SOR7ED is a practical support platform for ADHD, autistic, AuDHD, dyslexic, bipolar and other
          neurodivergent adults — combining honest editorial content with interactive tools that turn
          overwhelming moments into real, usable outcomes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tools"
            className="rounded-lg bg-[#C6A052] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-black transition-transform hover:-translate-y-0.5"
          >
            Explore the tools
          </Link>
          <Link
            href="/intelligence"
            className="rounded-lg border border-[#C6A052] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[#C6A052] transition-colors hover:bg-[#C6A052]/10"
          >
            Read the content
          </Link>
        </div>
      </section>

      {/* 7 Pillars */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="mx-auto mb-14 flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="font-bebas text-4xl uppercase tracking-tight text-white sm:text-5xl">The 7 pillars</h2>
          <p className="text-sm leading-relaxed text-neutral-400 sm:text-base">
            Every tool and article on SOR7ED lives inside one of seven life areas — each one chosen because
            it&rsquo;s where neurodivergent adults face the most friction, shame and unmet need.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.slice(0, 4).map((p) => (
            <PillarCard key={p.slug} {...p} />
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.slice(4).map((p) => (
            <PillarCard key={p.slug} {...p} />
          ))}
        </div>
      </section>

      {/* Most systems were never built for you */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <div className="mx-auto mb-16 flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="font-bebas text-4xl uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Most systems were never built for you
          </h2>
          <p className="text-sm leading-relaxed text-neutral-400 sm:text-base">
            Most productivity and wellbeing advice is engineered for neurotypical brains. SOR7ED is built for
            everyone else — with tools designed to work in the <em>actual</em> moment, not the ideal one.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {LOOP.map((item) => (
            <div key={item.n} className="flex flex-col items-center gap-3 text-center">
              <span className="font-sans text-6xl font-light text-[#C6A052]">{item.n}</span>
              <span className="font-bebas text-xl uppercase tracking-tight text-white">{item.head}</span>
              <span className="text-[13px] leading-relaxed text-neutral-400">{item.body}</span>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-16 max-w-3xl text-center text-sm leading-relaxed text-neutral-400 sm:text-base">
          SOR7ED breaks that loop by pairing content directly with action. Every article, tool and workflow
          is designed to end in a concrete next step — not just insight. Founded by{' '}
          <span className="text-white">Claudio Kurath</span> and based in London, SOR7ED uses WhatsApp as the
          remote control and the website as the engine where real value is created, kept and revisited.
        </p>
      </section>
    </main>
  )
}

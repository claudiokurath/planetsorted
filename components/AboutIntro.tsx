import Image from 'next/image'
import Link from 'next/link'

const WHAT = [
  {
    head: 'Tools that do something',
    body: 'Interactive calculators, sorters and planners — not just articles. You put something in, you get something usable out.',
  },
  {
    head: 'Guides in plain language',
    body: 'Practical write-ups on the real stuff: burnout, admin, masking, money, relationships. No jargon, no shame, no “just try harder”.',
  },
  {
    head: 'Sorted by life area',
    body: 'Everything sits under one of seven pillars. Pick the part of life you’re stuck in and start there.',
  },
]

const PILLARS = [
  { name: 'Body', slug: 'body', body: 'Burnout, sensory load, medication, sleep, chronic pain, substance use, physical regulation.' },
  { name: 'Connection', slug: 'connection', body: 'Relationships, friendship, consent, intimacy, boundaries, shared living, communication scripts.' },
  { name: 'Growth', slug: 'growth', body: 'Work, career, learning, therapy, skills, self-advocacy, long-term change.' },
  { name: 'Impression', slug: 'impression', body: 'Masking, identity, confidence, visibility, personal presentation, social performance, unmasking.' },
  { name: 'Tech', slug: 'tech', body: 'Digital systems, automation, AI tools, accessibility, focus infrastructure, notification design.' },
  { name: 'Wealth', slug: 'wealth', body: 'ADHD tax, bills, debt, subscriptions, financial avoidance, money systems, admin survival.' },
  { name: 'Mind', slug: 'mind', body: 'Executive function, attention, decision fatigue, emotional regulation, RSD, anxiety, ADHD systems.' },
]

function PillarCard({ name, slug, body }: (typeof PILLARS)[number]) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group flex flex-col items-center gap-3 text-center transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-square w-44 overflow-hidden rounded-full bg-[#F5C518] ring-1 ring-white/10 sm:w-52">
        <Image
          src={`/images/pillars/${slug}.png`}
          alt={`${name} pillar`}
          fill
          sizes="208px"
          className="object-cover"
        />
      </div>
      {/* Name is baked into the pillar artwork; alt text carries it for a11y. */}
      <span className="max-w-[15rem] text-[13px] leading-relaxed text-neutral-400">{body}</span>
    </Link>
  )
}

export function AboutIntro() {
  return (
    <>
      {/* Hero */}
      <section
        className="flex min-h-screen flex-col items-center justify-center bg-black px-5 py-16 sm:py-20"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="relative mb-8 aspect-square w-full max-w-md sm:max-w-lg">
          <video autoPlay loop muted playsInline className="h-full w-full object-cover">
            <source src="/media/sequence01_1.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-7 text-center">
          <span className="sor7ed-pill">Neurodivergent-first platform</span>
          <h1 className="font-bebas text-4xl uppercase leading-[1.15] tracking-normal text-white sm:text-5xl lg:text-6xl">
            Tools built for brains that work differently
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            SOR7ED is a practical support hub for ADHD, autistic, AuDHD, dyslexic, bipolar and other
            neurodivergent adults &mdash; tools, protocols and plain-language guides that make everyday life
            less overwhelming.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools"
              className="rounded-lg bg-[#F5C518] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-black transition-transform hover:-translate-y-0.5"
            >
              Explore the tools
            </Link>
            <Link
              href="/intelligence"
              className="rounded-lg border border-[#F5C518] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[#F5C518] transition-colors hover:bg-[#F5C518]/10"
            >
              Read the content
            </Link>
          </div>
        </div>
      </section>

      {/* What this is */}
      <section className="border-t border-white/10 bg-black">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-24">
          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-normal uppercase tracking-[0.18em] text-neutral-500">
              The idea
            </span>
            <h2 className="font-bebas text-3xl uppercase leading-[1.1] tracking-normal sm:text-4xl lg:text-5xl">
              <span className="text-white">Support that fits </span>
              <span className="text-neutral-500">how your brain actually works</span>
            </h2>
            <p className="text-sm leading-relaxed text-neutral-400 sm:text-base">
              Most productivity and wellbeing advice assumes a brain that plans ahead, starts on time and
              follows through. SOR7ED is for everyone else &mdash; built for ADHD, autistic and AuDHD brains,
              in short steps, for the messy moment rather than the ideal one.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-6">
            {WHAT.map((w) => (
              <div key={w.head} className="text-center">
                <h3 className="font-bebas text-xl uppercase tracking-normal text-white sm:text-2xl">
                  {w.head}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-[13px] leading-relaxed text-neutral-400">
                  {w.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Pillars */}
      <section
        className="flex min-h-screen flex-col justify-center border-t border-white/10 bg-black"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-24">
          <div className="mb-10 flex flex-col items-center gap-4 text-center sm:mb-12">
            <span className="text-[10px] font-normal uppercase tracking-[0.18em] text-neutral-500">
              Content pillars
            </span>
            <h2 className="font-bebas text-3xl uppercase leading-[1.1] tracking-normal sm:text-4xl lg:text-5xl">
              <span className="text-white">7 pillars. </span>
              <span className="text-neutral-500">Every part of ND adult life.</span>
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
              SOR7ED covers the full reality of neurodivergent adult life &mdash; not just productivity hacks.
              Pick a pillar to see its tools and guides.
            </p>
          </div>

          <div className="grid justify-items-center gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.slice(0, 4).map((p) => (
              <PillarCard key={p.slug} {...p} />
            ))}
          </div>
          <div className="mt-12 grid justify-items-center gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.slice(4).map((p) => (
              <PillarCard key={p.slug} {...p} />
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-3 border-t border-white/10 pt-8 text-center sm:mt-20">
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Built by Claudio Kurath in London
            </p>
            <Link
              href="/tools"
              className="font-bebas text-lg uppercase tracking-normal text-[#F5C518] transition-opacity hover:opacity-80"
            >
              Start with a tool &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

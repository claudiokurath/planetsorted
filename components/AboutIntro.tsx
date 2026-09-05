import Image from 'next/image'
import Link from 'next/link'

const STEPS = [
  { n: '1', head: 'Find a tool', body: 'Browse the pillars and pick the tool for the moment you’re actually in.' },
  { n: '2', head: 'Push the button', body: 'Tap the SOR7ED button. First time: a magic-link sign-in and a one-off WhatsApp link.' },
  { n: '3', head: 'Get the message', body: 'Your result and next step land in your WhatsApp thread — kept to come back to.' },
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

type Tone = 'dark' | 'light'

const T = {
  dark: {
    heading: 'text-white',
    headingMuted: 'text-neutral-500',
    body: 'text-neutral-400',
    label: 'text-neutral-500',
    hairline: 'border-white/12',
    chipBg: 'bg-black',
    ring: 'ring-white/12',
  },
  light: {
    heading: 'text-neutral-950',
    headingMuted: 'text-neutral-400',
    body: 'text-neutral-600',
    label: 'text-neutral-500',
    hairline: 'border-black/15',
    chipBg: 'bg-[#F2F2F2]',
    ring: 'ring-black/15',
  },
} satisfies Record<Tone, Record<string, string>>

/**
 * Editorial section header: a gold index number with a label, then the two-tone
 * display heading and intro — left-aligned, per the master doc ("Anton caps,
 * separated by hairlines only").
 */
function SectionHeader({
  index,
  label,
  lead,
  rest,
  tone,
  children,
}: {
  index: string
  label: string
  lead: string
  rest: string
  tone: Tone
  children: React.ReactNode
}) {
  const t = T[tone]
  return (
    <div className="mb-14 flex flex-col gap-5 sm:mb-16">
      <div className="flex items-baseline gap-3">
        <span className="font-bebas text-lg leading-none text-[#F5C518] sm:text-xl">{index}</span>
        <span className={`text-[10px] font-normal uppercase tracking-[0.18em] ${t.label}`}>{label}</span>
      </div>
      <h2 className="font-bebas text-3xl uppercase leading-[1.1] tracking-normal sm:text-4xl lg:text-5xl">
        <span className={t.heading}>{lead} </span>
        <span className={t.headingMuted}>{rest}</span>
      </h2>
      <p className={`max-w-2xl text-sm leading-relaxed sm:text-base ${t.body}`}>{children}</p>
    </div>
  )
}

function StepCard({ n, head, body, tone }: (typeof STEPS)[number] & { tone: Tone }) {
  const t = T[tone]
  return (
    <div className="relative flex flex-col items-center px-2 text-center">
      <span
        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full font-bebas text-4xl leading-none text-[#F5C518] ring-1 sm:h-20 sm:w-20 sm:text-5xl ${t.chipBg} ${t.ring}`}
      >
        {n}
      </span>
      <h3 className={`mt-5 font-bebas text-2xl uppercase tracking-normal sm:text-3xl ${t.heading}`}>{head}</h3>
      <p className={`mt-3 max-w-xs text-[13px] leading-relaxed ${t.body}`}>{body}</p>
    </div>
  )
}

function PillarCard({ name, slug, body }: (typeof PILLARS)[number]) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group flex flex-col items-center gap-3 text-center transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-square w-32 overflow-hidden rounded-full bg-[#F5C518] ring-1 ring-white/10 sm:w-36">
        <Image
          src={`/images/pillars/${slug}.jpg`}
          alt={`${name} pillar`}
          fill
          sizes="144px"
          className="object-cover"
        />
      </div>
      <span className="font-bebas text-xl uppercase tracking-normal text-white sm:text-2xl">{name}</span>
      <span className="max-w-[15rem] text-[13px] leading-relaxed text-neutral-400">{body}</span>
    </Link>
  )
}

export function AboutIntro() {
  return (
    <>
      {/* Snap section 1: Video + Hero — black */}
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
            SOR7ED is a practical support platform for ADHD, autistic, AuDHD, dyslexic, bipolar and other
            neurodivergent adults &mdash; combining honest editorial content with interactive tools that turn
            overwhelming moments into real, usable outcomes.
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

      {/* Snap section 2: How it works — inverted (off-white) for a hard visual split */}
      <section
        className="flex min-h-screen flex-col justify-center bg-[#F2F2F2] text-neutral-950"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-24">
          <SectionHeader
            index="01"
            label="The problem we’re solving"
            lead="How it works."
            rest="3 steps to success"
            tone="light"
          >
            Most productivity and wellbeing advice is engineered for neurotypical brains. SOR7ED is built for
            everyone else &mdash; with tools designed to work in the <em>actual</em> moment, not the ideal one.
          </SectionHeader>

          <div className="relative grid gap-12 sm:grid-cols-3 sm:gap-6">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-8 hidden border-t border-black/15 sm:block sm:top-10"
            />
            {STEPS.map((s) => (
              <StepCard key={s.n} tone="light" {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Snap section 3: 7 Pillars — black (the photos need the dark ground) */}
      <section
        className="flex min-h-screen flex-col justify-center bg-black"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-24">
          <SectionHeader
            index="02"
            label="Content pillars"
            lead="7 pillars."
            rest="Every part of ND adult life."
            tone="dark"
          >
            SOR7ED covers the full reality of neurodivergent adult life &mdash; not just productivity hacks. Pick a
            pillar to see its tools and guidebook protocols.
          </SectionHeader>

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

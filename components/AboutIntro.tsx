import Image from 'next/image'
import Link from 'next/link'

const STEPS = [
  { n: '1', head: 'Find a tool', body: 'Browse the pillars and pick the tool for the moment you\u2019re actually in.' },
  { n: '2', head: 'Push the button', body: 'Tap the SOR7ED button. First time: a magic-link sign-in and a one-off WhatsApp link.' },
  { n: '3', head: 'Get the message', body: 'Your result and next step land in your WhatsApp thread \u2014 kept to come back to.' },
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

/** White lead-in, muted grey remainder \u2014 the deck's two-tone display heading. */
function TwoToneHeading({ lead, rest }: { lead: string; rest: string }) {
  return (
    <h2 className="font-bebas text-3xl uppercase leading-[1.1] tracking-normal sm:text-4xl lg:text-5xl">
      <span className="text-white">{lead} </span>
      <span className="text-neutral-500">{rest}</span>
    </h2>
  )
}

function StepCard({ n, head, body }: (typeof STEPS)[number]) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <span className="font-bebas text-6xl leading-none text-[#F5C518] sm:text-7xl">{n}</span>
      <h3 className="mt-4 font-bebas text-2xl uppercase tracking-normal text-white sm:text-3xl">{head}</h3>
      <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-neutral-400">{body}</p>
    </div>
  )
}

function PillarCard({ name, slug, body }: (typeof PILLARS)[number]) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group flex flex-col items-center gap-3 text-center transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-square w-32 overflow-hidden rounded-full bg-[#F5C518] sm:w-36">
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
      {/* Snap section 1: Video + Hero */}
      <section
        className="min-h-screen flex flex-col items-center justify-center px-5 py-16 sm:py-20"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        {/* Feature video */}
        <div className="relative w-full max-w-md sm:max-w-lg aspect-square mb-8">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            <source src="/media/sequence01_1.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Hero copy */}
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

      {/* Snap section 2: How it works */}
      <section
        className="min-h-screen flex flex-col justify-center mx-auto max-w-6xl px-5 py-16 sm:py-24"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="mx-auto mb-16 flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="sor7ed-pill">The problem we&rsquo;re solving</span>
          <TwoToneHeading lead="How it works." rest="3 steps to success" />
          <p className="text-sm leading-relaxed text-neutral-400 sm:text-base">
            Most productivity and wellbeing advice is engineered for neurotypical brains. SOR7ED is built for
            everyone else &mdash; with tools designed to work in the <em>actual</em> moment, not the ideal one.
          </p>
        </div>
        <div className="grid gap-12 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((s) => (
            <StepCard key={s.n} {...s} />
          ))}
        </div>
      </section>

      {/* Snap section 3: 7 Pillars */}
      <section
        className="min-h-screen flex flex-col justify-center mx-auto max-w-6xl px-5 py-16 sm:py-24"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <span className="sor7ed-pill">Content pillars</span>
          <TwoToneHeading lead="7 pillars." rest="Every part of ND adult life." />
          <p className="max-w-3xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            SOR7ED covers the full reality of neurodivergent adult life &mdash; not just productivity hacks. Pick a
            pillar to see its tools and guidebook protocols.
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
      </section>
    </>
  )
}

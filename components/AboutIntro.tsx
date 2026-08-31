import Link from 'next/link'

const STEPS = [
  { n: '1', head: 'Find a tool', body: 'Browse the pillars and pick the tool for the moment you’re actually in.' },
  { n: '2', head: 'Push the button', body: 'Tap the SOR7ED button. First time: a magic-link sign-in and a one-off WhatsApp link.' },
  { n: '3', head: 'Get the message', body: 'Your result and next step land in your WhatsApp thread — kept to come back to.' },
]

const PILLARS = [
  { name: 'Mind', slug: 'mind', body: 'Executive function, attention, decision fatigue, emotional regulation, RSD, anxiety, ADHD systems.' },
  { name: 'Wealth', slug: 'wealth', body: 'ADHD tax, bills, debt, subscriptions, financial avoidance, money systems, admin survival.' },
  { name: 'Body', slug: 'body', body: 'Burnout, sensory load, medication, sleep, chronic pain, substance use, physical regulation.' },
  { name: 'Tech', slug: 'tech', body: 'Digital systems, automation, AI tools, accessibility, focus infrastructure, notification design.' },
  { name: 'Connection', slug: 'connection', body: 'Relationships, friendship, consent, intimacy, boundaries, shared living, communication scripts.' },
  { name: 'Impression', slug: 'impression', body: 'Masking, identity, confidence, visibility, personal presentation, social performance, unmasking.' },
  { name: 'Growth', slug: 'growth', body: 'Work, career, learning, therapy, skills, self-advocacy, long-term change.' },
]

function StepCard({ n, head, body }: (typeof STEPS)[number]) {
  return (
    <div className="relative mt-6 border border-white/12 border-t-4 border-t-[#F5C518] bg-black px-7 pb-9 pt-11 text-center">
      <span className="absolute left-1/2 top-0 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F5C518] font-bebas text-lg text-black">
        {n}
      </span>
      <h3 className="font-bebas text-2xl uppercase tracking-normal text-white sm:text-3xl">{head}</h3>
      <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">{body}</p>
    </div>
  )
}

function PillarCard({ name, slug, body }: (typeof PILLARS)[number]) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group flex flex-col items-center gap-2.5 rounded-lg bg-[#F5C518] p-6 text-center text-black transition-transform hover:-translate-y-1"
    >
      <span className="font-bebas text-2xl uppercase tracking-normal sm:text-3xl">{name}</span>
      <span className="text-[13px] font-medium leading-relaxed text-black/70">{body}</span>
    </Link>
  )
}

export function AboutIntro() {
  return (
    <>
      {/* Top Feature Media */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-5 pt-12 pb-4 sm:pt-16">
        <div className="relative w-full max-w-md sm:max-w-lg aspect-square overflow-hidden rounded-2xl border border-white/12 bg-black shadow-2xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/media/hero-poster.png"
            className="h-full w-full object-cover"
          >
            <source src="/media/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-7 px-5 py-16 text-center sm:py-20">
        <span className="sor7ed-pill">Neurodivergent-first platform</span>
        <h1 className="font-bebas text-4xl uppercase leading-[1.15] tracking-normal text-white sm:text-5xl lg:text-6xl">
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
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="mx-auto mb-14 flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="sor7ed-pill">The problem we&rsquo;re solving</span>
          <h2 className="font-bebas text-3xl uppercase leading-[1.15] tracking-normal text-white sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="text-sm leading-relaxed text-neutral-400 sm:text-base">
            Most productivity and wellbeing advice is engineered for neurotypical brains. SOR7ED is built for
            everyone else — with tools designed to work in the <em>actual</em> moment, not the ideal one.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <StepCard key={s.n} {...s} />
          ))}
        </div>
      </section>

      {/* 7 Pillars */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="mb-14 flex flex-col items-center gap-4 text-center">
          <span className="sor7ed-pill">Content pillars</span>
          <h2 className="font-bebas text-3xl uppercase leading-[1.15] tracking-normal text-white sm:text-4xl lg:whitespace-nowrap lg:text-5xl">
            7 pillars. Every part of ND adult life.
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            SOR7ED covers the full reality of neurodivergent adult life — not just productivity hacks. Pick a
            pillar to see its tools and guidebook protocols.
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
    </>
  )
}

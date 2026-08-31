import Link from 'next/link'

const STEPS = [
  { n: '1', head: 'Find a tool', body: 'Pick the tool for the moment you’re actually in — not the ideal one.' },
  { n: '2', head: 'Push the button', body: 'One tap on the SOR7ED button. No sign-up wall, no onboarding maze.' },
  { n: '3', head: 'Get the message', body: 'The result and your next step land in your WhatsApp, kept for later.' },
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
      <h3 className="font-bebas text-2xl uppercase tracking-tight text-white sm:text-3xl">{head}</h3>
      <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">{body}</p>
    </div>
  )
}

function PillarCard({ name, slug, body }: (typeof PILLARS)[number]) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group flex flex-col gap-2.5 rounded-lg bg-[#F5C518] p-6 text-black transition-transform hover:-translate-y-1"
    >
      <span className="font-bebas text-2xl uppercase tracking-tight sm:text-3xl">{name}</span>
      <span className="text-[13px] font-medium leading-relaxed text-black/70">{body}</span>
    </Link>
  )
}

export function AboutIntro() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-7 px-5 py-28 text-center sm:py-36">
        <span className="sor7ed-pill">Neurodivergent-first platform</span>
        <h1 className="font-bebas text-5xl uppercase leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-8xl">
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
          <h2 className="font-bebas text-4xl uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
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
        <div className="mx-auto mb-14 flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="sor7ed-pill">Content pillars</span>
          <h2 className="font-bebas text-4xl uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            7 pillars. Every part of ND adult life.
          </h2>
          <p className="text-sm leading-relaxed text-neutral-400 sm:text-base">
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

        <p className="mx-auto mt-16 max-w-3xl text-center text-sm leading-relaxed text-neutral-400 sm:text-base">
          SOR7ED breaks the read-an-article / download-an-app / lose-the-planner loop by pairing content
          directly with action — every article, tool and workflow ends in a concrete next step. Founded by{' '}
          <span className="text-white">Claudio Kurath</span> and based in London, it uses WhatsApp as the
          remote control and the website as the engine where real value is created, kept and revisited.
        </p>
      </section>
    </>
  )
}

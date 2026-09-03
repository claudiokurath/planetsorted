import Link from 'next/link'

/* ── Static WhatsApp message example ─────────────────────────────────── */
function WhatsAppExample() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <p className="mb-3 text-center text-xs uppercase tracking-widest text-neutral-500">
        Example: what the Task Breakdown Wizard sends you
      </p>
      <div className="rounded-2xl bg-[#1a1a1a] p-4 text-left shadow-xl ring-1 ring-white/8">
        {/* Chat header */}
        <div className="mb-3 flex items-center gap-3 border-b border-white/8 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5C518] font-bebas text-sm text-black">
            PS
          </div>
          <span className="text-sm font-medium text-white">Planet Sorted</span>
        </div>
        {/* Message bubble */}
        <div className="rounded-xl bg-[#2a2a2a] px-4 py-3 text-[13px] leading-relaxed text-neutral-200">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#F5C518]">
            Your next step
          </p>
          <p className="text-white">Open the email. You don&rsquo;t need to reply yet.</p>
          <p className="mt-3 text-neutral-400">
            Then, if you&rsquo;re ready:{' '}
            <span className="text-white">
              Write one sentence saying what the sender needs from you.
            </span>
          </p>
          <p className="mt-3 text-neutral-500 text-[11px]">You can stop after the first action.</p>
        </div>
        <p className="mt-2 text-right text-[11px] text-neutral-600">Delivered via WhatsApp</p>
      </div>
    </div>
  )
}

/* ── Step card ────────────────────────────────────────────────────────── */
function StepCard({ n, head, body }: { n: string; head: string; body: string }) {
  return (
    <div className="relative mt-6 border border-white/12 border-t-4 border-t-[#F5C518] bg-black px-7 pb-9 pt-11 text-center">
      <span className="absolute left-1/2 top-0 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F5C518] font-bebas text-lg text-black">
        {n}
      </span>
      <h3 className="font-bebas text-2xl uppercase tracking-normal text-white sm:text-3xl">
        {head}
      </h3>
      <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">{body}</p>
    </div>
  )
}

/* ── Problem card ─────────────────────────────────────────────────────── */
function ProblemCard({
  id,
  heading,
  body,
  cta,
  href,
}: {
  id: string
  heading: string
  body: string
  cta: string
  href: string
}) {
  return (
    <Link
      id={id}
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-white/3 p-7 transition-all duration-200 hover:border-[#F5C518]/40 hover:bg-white/5"
    >
      <h3 className="font-bebas text-2xl uppercase tracking-normal text-white sm:text-3xl">
        {heading}
      </h3>
      <p className="text-[13px] leading-relaxed text-neutral-400">{body}</p>
      <span className="mt-auto inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#F5C518] transition-all group-hover:gap-3">
        {cta}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="transition-transform group-hover:translate-x-1"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </Link>
  )
}

/* ── Tool spotlight card ──────────────────────────────────────────────── */
function ToolCard({
  href,
  title,
  description,
  result,
  cta,
}: {
  href: string
  title: string
  description: string
  result: string
  cta: string
}) {
  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/3 p-7">
      <h3 className="font-bebas text-2xl uppercase tracking-normal text-white sm:text-3xl">
        {title}
      </h3>
      <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">{description}</p>
      <p className="mt-4 text-[12px] text-neutral-500">
        <span className="font-medium text-neutral-300">You get: </span>
        {result}
      </p>
      <Link
        href={href}
        className="mt-6 inline-block rounded-lg bg-[#F5C518] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-black transition-opacity hover:opacity-90"
      >
        {cta}
      </Link>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────── */
export function AboutIntro() {
  return (
    <>
      {/* ── SNAP 1: Hero ─────────────────────────────────────────────────── */}
      <section
        className="min-h-screen flex flex-col items-center justify-center gap-12 px-5 py-16 sm:py-20 lg:flex-row lg:gap-16"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        {/* Left: copy */}
        <div className="flex max-w-xl flex-col gap-6 text-center lg:text-left">
          <span className="sor7ed-pill mx-auto lg:mx-0">
            Practical support for neurodivergent adults
          </span>
          <h1 className="font-bebas text-4xl uppercase leading-[1.15] tracking-normal text-white sm:text-5xl lg:text-6xl">
            Turn overwhelm into one clear next step.
          </h1>
          <p className="text-base leading-relaxed text-neutral-400">
            When getting started feels difficult, start smaller. Answer one or two questions, and
            your next step arrives in your WhatsApp &mdash; kept there to come back to whenever
            you&rsquo;re ready.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              id="hero-cta-primary"
              href="/start"
              className="rounded-lg bg-[#F5C518] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition-transform hover:-translate-y-0.5"
            >
              Find my starting point
            </Link>
            <Link
              id="hero-cta-secondary"
              href="/tools"
              className="rounded-lg border border-[#F5C518] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[#F5C518] transition-colors hover:bg-[#F5C518]/10"
            >
              Browse tools
            </Link>
          </div>

          <p className="text-xs leading-relaxed text-neutral-500">
            First time: we&rsquo;ll link your WhatsApp in one step. After that, everything just
            arrives.
          </p>
          <p className="text-xs leading-relaxed text-neutral-600">
            Built for low-energy days. Results live in WhatsApp — no extra app to remember.
          </p>
        </div>

        {/* Right: Video & WhatsApp example */}
        <div className="w-full max-w-sm shrink-0 flex flex-col gap-10">
          <div className="relative w-full aspect-square">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover rounded-2xl"
            >
              <source src="/media/sequence01_1.mp4" type="video/mp4" />
            </video>
          </div>
          <WhatsAppExample />
        </div>
      </section>

      {/* ── SNAP 2: What's making today difficult? ───────────────────────── */}
      <section
        className="min-h-screen flex flex-col justify-center mx-auto max-w-5xl px-5 py-16 sm:py-24"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="mb-12 text-center">
          <h2 className="font-bebas text-3xl uppercase leading-[1.15] tracking-normal text-white sm:text-4xl lg:text-5xl">
            What&rsquo;s making today difficult?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-neutral-400">
            Pick the closest match. You don&rsquo;t need to explain it perfectly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProblemCard
            id="problem-task"
            heading="I can't get started"
            body="Break a task into a first step you can work with."
            cta="Break down a task"
            href="/task-breakdown-wizard"
          />
          <ProblemCard
            id="problem-admin"
            heading="I'm putting off life admin"
            body="Choose one thing to deal with and work out where to begin."
            cta="Find an admin tool"
            href="/adhd-tax-calculator"
          />
          {/* Guide card hidden until ≥5 solid guides exist */}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/tools"
            className="text-sm text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-300"
          >
            Nothing quite fits? Browse all topics
          </Link>
        </div>
      </section>

      {/* ── SNAP 3: Tool spotlights ───────────────────────────────────────── */}
      <section
        className="min-h-screen flex flex-col justify-center mx-auto max-w-5xl px-5 py-16 sm:py-24"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="mb-12 text-center">
          <span className="sor7ed-pill">Start with one useful tool</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <ToolCard
            href="/task-breakdown-wizard"
            title="Task Breakdown Wizard"
            description="Turn a task you're avoiding into smaller steps."
            result="a first action in your WhatsApp, then a short sequence you can work through at your own pace."
            cta="Break down my task"
          />
          <ToolCard
            href="/adhd-tax-calculator"
            title="ADHD Tax Calculator"
            description="Estimate what forgotten subscriptions, late fees and missed admin may be costing you."
            result="a breakdown based on your answers and one area to look at first."
            cta="Estimate my costs"
          />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/tools"
            className="text-sm text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-300"
          >
            Browse all tools
          </Link>
        </div>
      </section>

      {/* ── Below the snaps ──────────────────────────────────────────────── */}

      {/* 3-step explainer */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="sor7ed-pill">Three steps. One lands in your pocket.</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StepCard n="1" head="Pick the tool for the moment you're in" body="" />
          <StepCard
            n="2"
            head="Answer a couple of questions"
            body="First time only: link your WhatsApp in one step."
          />
          <StepCard
            n="3"
            head="Get your next step in WhatsApp"
            body="Read it now, come back to it tomorrow."
          />
        </div>
      </section>

      {/* Editorial section */}
      <section className="mx-auto max-w-3xl px-5 py-12 pb-20 sm:py-16">
        <div className="rounded-xl border border-white/8 bg-white/3 px-8 py-10 sm:px-12 sm:py-14">
          <h2 className="mb-6 font-bebas text-2xl uppercase tracking-normal text-white sm:text-3xl">
            Support that leaves room for a difficult day
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-neutral-400">
            You shouldn&rsquo;t have to organise your whole life before you can deal with one part
            of it. Planet Sorted starts with what&rsquo;s in front of you: the task you&rsquo;re
            avoiding, the admin that&rsquo;s built up, the thing you want to understand. The aim is
            to make the next step clearer &mdash; and to put it somewhere you&rsquo;ll find again.
          </p>
          <ul className="space-y-3">
            {[
              'Small enough to start: one main action at a time',
              'Clear enough to use: plain language and concrete outputs',
              'Easy to come back to: your steps live in your WhatsApp thread',
            ].map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-relaxed text-neutral-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5C518]" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Start with a free tool. Membership gives you a place to keep your results and return to
          previous work.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            id="home-membership-compare"
            href="/membership"
            className="rounded-lg bg-[#F5C518] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition-opacity hover:opacity-90"
          >
            Compare free and membership
          </Link>
          <Link
            id="home-membership-free"
            href="/start"
            className="text-xs font-medium uppercase tracking-widest text-neutral-400 underline underline-offset-4 transition-colors hover:text-white"
          >
            Or try a free tool
          </Link>
        </div>
      </section>
    </>
  )
}

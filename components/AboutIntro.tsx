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

    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Start Here — Planet Sorted',
  description:
    'Choose the closest match to what would help right now. Planet Sorted will point you to the right tool.',
}

const CARDS = [
  {
    id: 'start-task',
    emoji: '🎯',
    heading: 'Help me start a task',
    body: 'Break a task you\'re avoiding into a first step you can work with.',
    cta: 'Break down a task',
    href: '/task-breakdown-wizard',
  },
  {
    id: 'start-admin',
    emoji: '📋',
    heading: 'Help me deal with life admin',
    body: 'Choose one thing to deal with and work out where to begin.',
    cta: 'Find an admin tool',
    href: '/adhd-tax-calculator',
  },
  // Guide card hidden until ≥5 solid guides exist
  // {
  //   id: 'start-understand',
  //   emoji: '📖',
  //   heading: 'Help me understand something',
  //   body: 'Find a plain-English explanation and something practical to try.',
  //   cta: 'Explore guides',
  //   href: '/intelligence',
  // },
] as const

export default function StartHerePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-5 pt-20 pb-28 sm:pt-28">

        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="font-bebas text-4xl uppercase leading-[1.15] tracking-normal text-white sm:text-5xl lg:text-6xl">
            What would help right now?
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-neutral-400">
            Choose the closest match. You can change direction whenever you need to.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {CARDS.map((card) => (
            <Link
              key={card.id}
              id={card.id}
              href={card.href}
              className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-white/3 p-8 transition-all duration-200 hover:border-[#F5C518]/40 hover:bg-white/5"
            >
              <span className="text-3xl">{card.emoji}</span>
              <div>
                <h2 className="font-bebas text-2xl uppercase tracking-normal text-white sm:text-3xl">
                  {card.heading}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{card.body}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#F5C518] transition-gap group-hover:gap-3">
                {card.cta}
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
          ))}
        </div>

        {/* Browse everything — visually secondary */}
        <div className="mt-10 text-center">
          <Link
            id="start-browse-all"
            href="/tools"
            className="text-sm text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-300"
          >
            Nothing quite fits? Browse all topics
          </Link>
        </div>

      </div>
    </div>
  )
}

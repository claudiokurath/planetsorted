import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Planet Sorted',
  description: 'Practical tools and protocols for neurodivergent adults.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-black text-white tracking-tight">About Planet Sorted</h1>
      <div className="mt-8 space-y-6 text-base sm:text-lg leading-relaxed text-gray-300">
        <p>
          Planet Sorted is templates, not inspiration — practical tools and protocols for neurodivergent adults.
          No app. No spam. Just what works.
        </p>
        <p>
          Everything we build is built around seven areas of life — mind, money, body, tech, connection,
          identity, and growth. You&apos;ll see a small, quiet label on articles and tools so you know what
          they&apos;re mainly about — but it&apos;s not a filing system, and you&apos;ll never have to pick a
          box before you can browse.
        </p>
        <p>
          Free tools give you the real answer. Paid tools give you the full plan and something to keep.
          Either way, you get one clear next step — not a lecture.
        </p>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Planet Sorted',
  description: 'Practical tools and protocols for neurodivergent adults.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          About Planet Sorted
        </h1>
        <div className="mt-8 space-y-6 text-base sm:text-lg leading-relaxed text-neutral-300">
          <p>
            Planet Sorted is templates, not inspiration — practical tools and protocols for neurodivergent adults.
            No app. No spam. Just what works.
          </p>
          <p>
            Everything we build is designed to make complex, overwhelming tasks manageable. You will see a small, quiet category tag on articles and tools so you know what they are mainly about — but it is not a rigid filing system, and you will never have to pick a box before you can browse.
          </p>
          <p>
            Free tools give you the real answer directly. Paid tools give you the full action plan and something to keep. Either way, you get one clear next step — not a lecture.
          </p>
        </div>
      </div>
    </div>
  )
}

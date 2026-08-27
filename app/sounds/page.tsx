import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

const KLOUDAI_URL = 'https://kloudai-music.rare-pearl-4148.chatgpt.site'

export const metadata: Metadata = {
  title: 'Sounds — Planet Sorted',
  description: 'Planet Sorted Sounds. Independent artists, new voices and music made to be felt.',
}

export default function SoundsPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-[#f4ead7]">
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-4 sm:px-6 sm:pt-10 lg:px-8">
        <PageHeader
          eyebrow="PLANET SOR7ED PRESENTS"
          title="Sounds"
          description="New artists. Big feeling. No background noise."
        />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mb-8 flex items-center justify-between border-b border-[#f4ead7]/25 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4ead7]/65">01 / Artist signal</p>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1FD7CF]">Live now</p>
        </div>

        <article className="overflow-hidden border border-[#f4ead7]/40 bg-black shadow-[10px_10px_0_#1FD7CF]">
          <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#1FD7CF]">Artist 001 · Independent AI music artist</p>
              <h2 className="text-5xl font-black leading-tight tracking-[-0.035em] sm:text-7xl">
                KLOUDAI<span className="text-[#1FD7CF]">.</span>
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#f4ead7]/80">
                Human feeling. Machine imagination. Anthems for people who refuse to fade into the background.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-[#f4ead7]/25 pt-6">
              <a
                href={KLOUDAI_URL}
                className="inline-flex items-center gap-8 border border-[#f4ead7] bg-[#1FD7CF] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#080a0c] transition-transform hover:translate-x-1 hover:translate-y-1"
              >
                Enter KLOUDAI <span aria-hidden="true">↗</span>
              </a>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4ead7]/55">Featuring “You Won’t Silence Me”</span>
            </div>
          </div>
        </article>
      </section>

      <section className="border-t border-[#f4ead7]/25 bg-black px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-[.7fr_1.3fr] sm:items-end">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f4ead7]/70">More signals soon</p>
          <div>
            <p className="text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-5xl">
              ONE NEW VOICE IS ONLY THE START.
            </p>
            <Link href="/contact" className="mt-6 inline-block border-b border-[#f4ead7] pb-1 text-sm font-bold uppercase tracking-[0.14em] hover:text-[#1FD7CF]">
              Get in touch →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

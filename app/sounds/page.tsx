import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

const KLOUDAI_URL = 'https://kloudai-music.rare-pearl-4148.chatgpt.site'

export const metadata: Metadata = {
  title: 'Sounds — Planet Sorted',
  description: 'Planet Sorted Sounds. Independent artists, new voices and music made to be felt.',
}

export default function SoundsPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#080a0c] text-[#f4ead7]">
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="relative flex min-h-[420px] w-full items-end overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950 shadow-2xl sm:min-h-[560px]">
          <Image src="/images/banners/sounds-banner.png" alt="Abstract piano artwork for PLANET SOR7ED Sounds" fill priority className="object-cover object-center opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent sm:bg-gradient-to-r sm:from-black sm:via-black/70 sm:to-transparent" />
          <div className="relative z-10 max-w-3xl space-y-4 p-6 sm:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ef3c2f]">Planet Sorted presents</p>
            <h1 className="text-5xl font-black leading-tight tracking-[-0.035em] text-white sm:text-7xl">Sounds.</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#f4ead7]/85 sm:text-xl">New artists. Big feeling. No background noise.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mb-8 flex items-center justify-between border-b border-[#f4ead7]/25 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4ead7]/65">01 / Artist signal</p>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ef3c2f]">Live now</p>
        </div>

        <article className="grid overflow-hidden border border-[#f4ead7]/40 bg-[#11171a] shadow-[10px_10px_0_#ef3c2f] lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative aspect-square min-h-[360px] lg:min-h-full">
            <Image
              src="/images/sounds/kloudai-wont-silence-me.png"
              alt="You Won’t Silence Me cover art by KLOUDAI"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 border border-[#f4ead7]/70 bg-[#080a0c]/90 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em]">Artist 001</span>
          </div>

          <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#ef3c2f]">Independent AI music artist</p>
              <h2 className="text-5xl font-black leading-tight tracking-[-0.035em] sm:text-7xl">
                KLOUDAI<span className="text-[#ef3c2f]">.</span>
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#f4ead7]/80">
                Human feeling. Machine imagination. Anthems for people who refuse to fade into the background.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-[#f4ead7]/25 pt-6">
              <a
                href={KLOUDAI_URL}
                className="inline-flex items-center gap-8 border border-[#f4ead7] bg-[#ef3c2f] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#080a0c] transition-transform hover:translate-x-1 hover:translate-y-1"
              >
                Enter KLOUDAI <span aria-hidden="true">↗</span>
              </a>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4ead7]/55">Featuring “You Won’t Silence Me”</span>
            </div>
          </div>
        </article>
      </section>

      <section className="border-t border-[#f4ead7]/25 bg-[#073f48] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-[.7fr_1.3fr] sm:items-end">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f4ead7]/70">More signals soon</p>
          <div>
            <p className="text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-5xl">
              ONE NEW VOICE IS ONLY THE START.
            </p>
            <Link href="/contact" className="mt-6 inline-block border-b border-[#f4ead7] pb-1 text-sm font-bold uppercase tracking-[0.14em] hover:text-[#ef3c2f]">
              Get in touch →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

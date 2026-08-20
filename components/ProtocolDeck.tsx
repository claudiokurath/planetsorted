'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { DeckBlock, DeckSlide, ProtocolDeckData } from '@/lib/protocolDeck'
import { ArticleAudioControls } from '@/components/ArticleAudioControls'
import { getCategoryStyle } from '@/lib/categoryStyles'

interface ProtocolDeckProps {
  deck: ProtocolDeckData
  /** Full plain text for TTS */
  bodyText: string
  audioUrl?: string
  isSubscriber?: boolean
}

const ACCENT = '#F5C518' // kit yellow
const ACCENT_SOFT = 'rgba(245, 197, 24, 0.14)'

function renderInline(text: string) {
  // Lightweight **bold** support
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function Blocks({ blocks }: { blocks: DeckBlock[] }) {
  return (
    <div className="mt-6 space-y-5">
      {blocks.map((block, i) => {
        if (block.kind === 'paragraph') {
          return (
            <p
              key={i}
              className="max-w-3xl text-base leading-relaxed text-neutral-300 sm:text-lg whitespace-pre-line"
            >
              {renderInline(block.text)}
            </p>
          )
        }

        if (block.kind === 'callout') {
          return (
            <div
              key={i}
              className="flex gap-3 rounded-2xl border border-neutral-700/80 bg-neutral-900/80 px-5 py-4 text-sm leading-relaxed text-neutral-200 sm:text-base"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: ACCENT }}
                aria-hidden
              />
              <p>{renderInline(block.text)}</p>
            </div>
          )
        }

        if (block.kind === 'list') {
          return (
            <ul key={i} className="space-y-3">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="flex overflow-hidden rounded-xl border"
                  style={{ borderColor: ACCENT }}
                >
                  <span
                    className="flex w-12 shrink-0 items-center justify-center text-sm font-black text-black sm:w-14"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {String(j + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 bg-black px-4 py-3.5 text-sm font-medium uppercase tracking-wide text-white sm:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          )
        }

        if (block.kind === 'stats') {
          return (
            <div
              key={i}
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {block.items.map((stat, j) => (
                <div key={j} className="text-center">
                  {stat.value ? (
                    <p
                      className="font-bebas text-5xl font-black leading-none text-white sm:text-6xl"
                    >
                      {stat.value}
                    </p>
                  ) : null}
                  <p
                    className="font-bebas mt-2 text-sm font-black uppercase tracking-wide"
                    style={{ color: ACCENT }}
                  >
                    {stat.label}
                  </p>
                  {stat.detail ? (
                    <p className="mt-1 text-xs leading-snug text-neutral-400">{stat.detail}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )
        }

        // cards
        const n = block.items.length
        const cols =
          n === 1
            ? 'grid-cols-1'
            : n === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : n === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'

        return (
          <div key={i} className={`grid gap-3 ${cols}`}>
            {block.items.map((card, j) => {
              const fullWidth = n > 3 && j === n - 1 && n % 2 === 1
              return (
                <div
                  key={j}
                  className={`rounded-2xl px-5 py-5 sm:px-6 sm:py-6 ${fullWidth ? 'sm:col-span-2' : ''}`}
                  style={{ backgroundColor: ACCENT }}
                >
                  <h3
                    className="font-bebas text-xl font-black uppercase leading-tight text-black sm:text-2xl"
                  >
                    {card.title}
                  </h3>
                  {card.body ? (
                    <p className="mt-2 text-sm leading-relaxed text-black/80 sm:text-[15px]">
                      {card.body}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function SlideCard({ slide, index }: { slide: DeckSlide; index: number }) {
  return (
    <section
      data-deck-slide
      className="deck-slide relative overflow-hidden rounded-3xl border border-neutral-800/90 bg-black px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14"
      style={{ minHeight: 'min(70vh, 640px)' }}
    >
      {/* Soft watermark logo */}
      <div
        className="pointer-events-none absolute right-6 top-5 select-none text-xs font-semibold tracking-[0.35em] text-white/15 sm:right-10 sm:top-8"
        aria-hidden
      >
        SOR7ED
      </div>

      {slide.badge ? (
        <span className="inline-flex rounded-md bg-neutral-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-300">
          {slide.badge}
        </span>
      ) : (
        <span className="inline-flex rounded-md bg-neutral-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-300">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}

      <h2
        className="font-bebas mt-4 max-w-4xl text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl"
      >
        <span style={{ color: ACCENT }}>{slide.title}</span>
        {slide.titleMuted ? (
          <span className="text-neutral-500"> {slide.titleMuted}</span>
        ) : null}
      </h2>

      <Blocks blocks={slide.blocks} />
    </section>
  )
}

export function ProtocolDeck({
  deck,
  bodyText,
  audioUrl,
  isSubscriber = false,
}: ProtocolDeckProps) {
  const categoryStyle = getCategoryStyle(deck.category)
  const chips = [
    deck.readTime || null,
    deck.protocolSlide ? 'Protocol included' : null,
  ].filter(Boolean) as string[]

  function handlePrint() {
    window.print()
  }

  return (
    <div className="protocol-deck bg-black text-white" data-protocol-deck>
      {/* Cover slide */}
      <section
        data-deck-slide
        className="deck-slide relative mx-auto mb-6 max-w-6xl overflow-hidden rounded-3xl border border-neutral-800 bg-black sm:mb-8"
      >
        <div className="grid lg:grid-cols-2">
          {/* Visual half */}
          <div className="relative min-h-[220px] bg-neutral-950 sm:min-h-[320px] lg:min-h-[420px]">
            {deck.coverImage ? (
              <Image
                src={deck.coverImage}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 30% 40%, ${ACCENT_SOFT}, transparent 55%), linear-gradient(160deg, #111 0%, #000 70%)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/80 max-lg:bg-gradient-to-t max-lg:from-black/80 max-lg:via-transparent max-lg:to-transparent" />
          </div>

          {/* Copy half */}
          <div className="flex flex-col justify-center gap-5 px-6 py-10 sm:px-10 sm:py-14 lg:px-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-500">
              PLANET SOR7ED · Guidebook
            </p>
            <h1
              className="font-bebas text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: ACCENT }}
            >
              {deck.title}
            </h1>
            {deck.lede ? (
              <p className="max-w-xl text-sm font-medium uppercase leading-relaxed tracking-wide text-neutral-200 sm:text-base">
                {deck.lede}
              </p>
            ) : null}

            {categoryStyle || chips.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {categoryStyle ? (
                  <Link
                    href={`/category/${categoryStyle.slug}`}
                    className="rounded-full border border-neutral-600 bg-neutral-900/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-200 transition-colors hover:border-neutral-400 hover:text-white"
                  >
                    {categoryStyle.label}
                  </Link>
                ) : null}
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-neutral-600 bg-neutral-900/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-200"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <path d="M6 14h12v7H6z" />
                </svg>
                Print / Save as PDF
              </button>
              <span className="text-[11px] text-neutral-500">
                A4 landscape · looks like the kit sheets
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Audio — screen only */}
      <div className="mx-auto mb-6 max-w-6xl px-1 print:hidden sm:mb-8">
        <ArticleAudioControls
          bodyText={bodyText}
          deepDiveUrl={audioUrl}
          isSubscriber={isSubscriber}
        />
      </div>

      {/* Step slides */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:gap-8">
        {deck.slides.map((slide, i) => (
          <SlideCard key={`${slide.badge}-${i}`} slide={slide} index={i} />
        ))}

        {deck.protocolSlide ? (
          <SlideCard slide={deck.protocolSlide} index={deck.slides.length} />
        ) : null}
      </div>
    </div>
  )
}

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

/**
 * Design tokens matched to the SOR7ED presentation PDF system
 * (e.g. BURNOUT DOESN'T WANT YOU DEAD kit): pure black field,
 * white display titles, cyan accents, charcoal cards.
 */
const ACCENT = '#1FD7CF'
const ACCENT_DARK = '#000000'
const ACCENT_SOFT = 'rgba(31, 215, 207, 0.14)'
const CARD = '#000000'
const CARD_BORDER = '#202733'
const MUTED = '#8B98AD'

function renderInline(text: string) {
  // **bold** → white semibold
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

/** Simple geometric icons for small card grids (PDF step layouts). */
function CardGlyph({ index }: { index: number }) {
  const paths = [
    // lock
    <path
      key="a"
      d="M8 11V8a4 4 0 1 1 8 0v3M7 11h10v9H7z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />,
    // chat
    <path
      key="b"
      d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 3v-3H6a2 2 0 0 1-2-2V6z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    />,
    // people
    <path
      key="c"
      d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 20c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5M15 15.5c2.8.3 5 2 5 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />,
    // arrow
    <path
      key="d"
      d="M5 12h12M13 6l6 6-6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    // phone
    <path
      key="e"
      d="M7 3h3l1.5 4-2 1.5a12 12 0 0 0 5 5L16 12l4 1.5V17a2 2 0 0 1-2 2A14 14 0 0 1 5 5a2 2 0 0 1 2-2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />,
    // shield
    <path
      key="f"
      d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />,
  ]
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      {paths[index % paths.length]}
    </svg>
  )
}

function Blocks({ blocks }: { blocks: DeckBlock[] }) {
  return (
    <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
      {blocks.map((block, i) => {
        if (block.kind === 'paragraph') {
          return (
            <p
              key={i}
              className="max-w-4xl text-[15px] leading-relaxed text-neutral-300 sm:text-base md:text-lg whitespace-pre-line"
            >
              {renderInline(block.text)}
            </p>
          )
        }

        if (block.kind === 'callout') {
          // Red left-bar quote (PDF style) when text starts with a quote,
          // otherwise dark-red alert banner.
          const isQuote = /^\s*["“']/.test(block.text)
          if (isQuote) {
            return (
              <blockquote
                key={i}
                className="border-l-[3px] pl-5 py-1 text-base leading-relaxed text-neutral-200 sm:text-lg"
                style={{ borderColor: ACCENT }}
              >
                {renderInline(block.text)}
              </blockquote>
            )
          }
          return (
            <div
              key={i}
              className="flex gap-3 rounded-lg px-5 py-4 text-sm leading-relaxed text-white sm:text-base"
              style={{ backgroundColor: ACCENT_DARK, border: '1px solid rgba(31, 215, 207, 0.34)' }}
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                style={{ backgroundColor: ACCENT }}
                aria-hidden
              >
                !
              </span>
              <p>{renderInline(block.text)}</p>
            </div>
          )
        }

        if (block.kind === 'list') {
          // 4-up step cards with red top rule + centered number (PDF page 7)
          const n = block.items.length
          const cols =
            n <= 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : n === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          return (
            <ol key={i} className={`grid gap-4 ${cols}`}>
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="relative overflow-visible rounded-xl border px-4 pb-5 pt-8 sm:px-5"
                  style={{ backgroundColor: CARD, borderColor: CARD_BORDER }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl"
                    style={{ backgroundColor: ACCENT }}
                    aria-hidden
                  />
                  <span
                    className="absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-black text-white shadow-md"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {j + 1}
                  </span>
                  <p className="text-sm font-semibold leading-snug text-white sm:text-[15px]">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          )
        }

        if (block.kind === 'stats') {
          return (
            <div key={i} className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {block.items.map((stat, j) => (
                <div key={j} className="text-center">
                  {stat.value ? (
                    <p className="font-bebas text-5xl font-black leading-none text-white sm:text-6xl">
                      {stat.value}
                    </p>
                  ) : null}
                  <p
                    className="font-bebas mt-2 text-sm font-black uppercase tracking-wide sm:text-base"
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

        // cards — dark charcoal + red number/icon circle (PDF grid)
        const n = block.items.length
        const cols =
          n === 1
            ? 'grid-cols-1'
            : n === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : n === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2'

        // Timeline-style when 4–6 short cards (PDF zigzag feel)
        const useTimeline = n >= 4 && n <= 6 && block.items.every((c) => c.body.length < 220)

        if (useTimeline) {
          return (
            <div key={i} className="relative mx-auto max-w-3xl py-2">
              <div
                className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 max-sm:left-3 max-sm:translate-x-0"
                style={{ backgroundColor: '#333' }}
                aria-hidden
              />
              <ul className="space-y-8">
                {block.items.map((card, j) => {
                  const left = j % 2 === 0
                  return (
                    <li key={j} className="relative grid items-start gap-4 sm:grid-cols-2">
                      <div
                        className={`max-sm:pl-10 ${
                          left ? 'sm:pr-10 sm:text-right' : 'sm:col-start-2 sm:pl-10'
                        }`}
                      >
                        <h3 className="text-base font-bold text-white sm:text-lg">
                          {card.title}
                        </h3>
                        {card.body ? (
                          <p className="mt-1.5 text-sm leading-relaxed text-neutral-400 sm:text-[15px]">
                            {card.body}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full max-sm:left-3 max-sm:translate-x-0"
                        style={{ backgroundColor: ACCENT, boxShadow: `0 0 0 4px ${ACCENT_SOFT}` }}
                        aria-hidden
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        }

        // 2–3 cards: icon circles (PDF step layout); 4+: numbered circles
        const useIcons = n <= 3

        return (
          <div key={i} className={`grid gap-3 sm:gap-4 ${cols}`}>
            {block.items.map((card, j) => {
              const fullWidth = n > 3 && j === n - 1 && n % 2 === 1
              return (
                <div
                  key={j}
                  className={`rounded-xl border px-5 py-6 sm:px-6 sm:py-7 ${
                    fullWidth ? 'sm:col-span-2' : ''
                  } ${useIcons ? 'text-center' : ''}`}
                  style={{ backgroundColor: CARD, borderColor: CARD_BORDER }}
                >
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full text-white ${
                      useIcons ? 'mx-auto' : ''
                    }`}
                    style={{ backgroundColor: ACCENT }}
                    aria-hidden
                  >
                    {useIcons ? (
                      <CardGlyph index={j} />
                    ) : (
                      <span className="font-bebas text-lg leading-none">{j + 1}</span>
                    )}
                  </div>
                  <h3
                    className={`font-bebas text-xl font-black uppercase leading-tight tracking-wide text-white sm:text-2xl ${
                      useIcons ? '' : ''
                    }`}
                  >
                    {card.title}
                  </h3>
                  {card.body ? (
                    <p className="mt-2.5 text-sm leading-relaxed text-neutral-400 sm:text-[15px]">
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

function StepBadge({ label }: { label: string }) {
  const text = label.toUpperCase()
  return (
    <span
      className="inline-flex rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
      style={{ backgroundColor: ACCENT_DARK, border: `1px solid ${ACCENT}` }}
    >
      {text}
    </span>
  )
}

function SlideCard({ slide, index }: { slide: DeckSlide; index: number }) {
  const badge = slide.badge || String(index + 1).padStart(2, '0')
  return (
    <section
      data-deck-slide
      className="deck-slide relative overflow-hidden rounded-2xl border border-white/[0.12] bg-black px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16"
      style={{ minHeight: 'min(62vh, 560px)' }}
    >
      <StepBadge label={badge} />

      <h2 className="font-bebas mt-5 max-w-5xl bg-gradient-to-r from-[#856CFF] via-[#5095FF] to-[#1FD7CF] bg-clip-text text-3xl font-black uppercase leading-[0.95] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
        {slide.title}
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
      {/* ── Cover slide (PDF page 1) ─────────────────────────────── */}
      <section
        data-deck-slide
        className="deck-slide relative mx-auto mb-6 flex min-h-[min(78vh,640px)] max-w-6xl flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.12] bg-black px-6 py-16 text-center sm:mb-8 sm:px-12 sm:py-20"
      >
        {deck.coverImage ? (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <Image src={deck.coverImage} alt="" fill priority className="object-cover opacity-45" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black" />
          </div>
        ) : null}
        {/* SOR7ED wordmark */}
        <div className="relative z-10 mb-10 sm:mb-14" aria-hidden>
          <div className="relative mx-auto h-8 w-36 sm:h-10 sm:w-44">
            <Image
              src="/images/sor7ed-logo-white.png"
              alt="SOR7ED"
              fill
              priority
              className="object-contain opacity-95"
            />
          </div>
        </div>

        <h1 className="font-bebas relative z-10 max-w-5xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {deck.title}
        </h1>

        {deck.lede ? (
          <p className="relative z-10 mt-8 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:mt-10 sm:text-base">
            {deck.lede}
          </p>
        ) : null}

        {categoryStyle || chips.length > 0 ? (
          <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2">
            {categoryStyle ? (
              <Link
                href={`/category/${categoryStyle.slug}`}
                className="rounded-full border border-neutral-700 bg-black px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
              >
                {categoryStyle.label}
              </Link>
            ) : null}
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-neutral-700 bg-black px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-300"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}

        <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <path d="M6 14h12v7H6z" />
            </svg>
            Print / Save as PDF
          </button>
          <span className="text-[11px]" style={{ color: MUTED }}>
            Landscape slides · matches the kit
          </span>
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

      {/* Content slides */}
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:gap-7">
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

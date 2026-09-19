import Link from 'next/link'

/**
 * "Pillars" section — a stack of 7 large clickable rows linking to /category/[slug].
 * Replaces the swipe-carousel from earlier iterations.
 *
 * NB: counts are hardcoded. When they drift, either edit here or refactor to fetch:
 *   from('protocols').select('category').eq('status','Published') + group-by.
 */
const PILLARS = [
  { idx: '01', name: 'Mind',       slug: 'mind',       tag: 'Momentum & executive function', count: 68 },
  { idx: '02', name: 'Wealth',     slug: 'wealth',     tag: 'Money, bills & the ADHD tax',    count: 10 },
  { idx: '03', name: 'Body',       slug: 'body',       tag: 'Energy, sleep & sensory needs',  count: 38 },
  { idx: '04', name: 'Tech',       slug: 'tech',       tag: 'Systems, calendars & setup',     count: 7  },
  { idx: '05', name: 'Connection', slug: 'connection', tag: 'People, scripts & boundaries',   count: 12 },
  { idx: '06', name: 'Impression', slug: 'impression', tag: 'Identity & self-concept',         count: 10 },
  { idx: '07', name: 'Growth',     slug: 'growth',     tag: 'Career & skills without burnout', count: 9  },
]

export function LatticeSection() {
  return (
    <div className="border-t border-white/10">
      {PILLARS.map((p) => (
        <Link
          key={p.slug}
          href={`/category/${p.slug}`}
          className="group grid grid-cols-[auto_1fr_auto_auto] items-center gap-6 border-b border-white/10 px-2 py-7 transition-colors hover:bg-white/[0.02] md:gap-10 md:py-9"
        >
          <span className="font-mono text-[11px] tracking-widest text-neutral-500 group-hover:text-[#F5C518]">
            {p.idx}
          </span>
          <div>
            <div className="font-bebas text-4xl uppercase leading-none tracking-normal text-white transition-colors group-hover:text-[#F5C518] md:text-6xl">
              {p.name}
            </div>
            <div className="mt-2 text-[12px] text-neutral-500 md:text-sm">{p.tag}</div>
          </div>
          <span className="hidden text-[11px] uppercase tracking-widest text-neutral-500 md:inline">
            {p.count} Protocols
          </span>
          <span className="font-mono text-lg text-neutral-500 group-hover:text-[#F5C518]" aria-hidden>
            →
          </span>
        </Link>
      ))}
    </div>
  )
}

export const TOTAL_PROTOCOLS = PILLARS.reduce((s, p) => s + p.count, 0) // 154

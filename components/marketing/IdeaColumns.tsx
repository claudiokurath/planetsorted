/**
 * "The idea" — three-column supporting statement. Paper theme.
 * Copy is the same as the old <AboutIntro /> — kept for continuity.
 */
const COLUMNS = [
  {
    idx: '01 · Tools',
    head: 'Tools that do something.',
    body: 'Interactive calculators, sorters and planners — not just articles. You put something in, you get something usable out.',
  },
  {
    idx: '02 · Guides',
    head: 'Guides in plain language.',
    body: 'Practical write-ups on the real stuff: burnout, admin, masking, money, relationships. No jargon, no shame, no "just try harder".',
  },
  {
    idx: '03 · Sorted',
    head: 'Sorted by life area.',
    body: 'Everything sits under one of seven pillars. Pick the part of life you\'re stuck in and start there.',
  },
]

export function IdeaColumns() {
  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-0">
      {COLUMNS.map((c, i) => (
        <div
          key={c.idx}
          className={`md:px-10 ${i > 0 ? 'md:border-l md:border-[rgba(10,10,10,0.10)]' : ''}`}
        >
          <span className="themed-idx block mb-4">{c.idx}</span>
          <h3 className="mb-3 font-bebas text-2xl uppercase leading-tight tracking-normal md:text-[26px]">
            {c.head}
          </h3>
          <p className="max-w-xs text-[14px] leading-relaxed themed-body">{c.body}</p>
        </div>
      ))}
    </div>
  )
}

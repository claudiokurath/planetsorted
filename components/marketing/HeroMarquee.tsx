/**
 * The seven-pillar name strip that sits under the hero.
 * Order matches the site's canonical pillar taxonomy.
 */
const PILLARS = ['Mind', 'Wealth', 'Body', 'Tech', 'Connection', 'Impression', 'Growth']

export function HeroMarquee() {
  return (
    <div className="themed-hair-t themed-hair-b overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-4 flex items-center gap-6 md:gap-10 flex-wrap justify-center text-[10px] md:text-[11px] tracking-[0.24em] uppercase font-medium text-[var(--sor7ed-muted,#8a8a8a)]">
        {PILLARS.map((p, i) => (
          <span key={p} className="contents">
            <span>{p}</span>
            {i < PILLARS.length - 1 ? <span className="text-neutral-700">/</span> : null}
          </span>
        ))}
      </div>
    </div>
  )
}

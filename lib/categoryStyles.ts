export interface CategoryStyle {
  label: string
  tagline: string
  className: string
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Mind:       { label: 'Mind',       tagline: 'Momentum & executive function',    className: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
  Wealth:     { label: 'Wealth',     tagline: 'Money, bills & the ADHD tax',      className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  Body:       { label: 'Body',       tagline: 'Energy, sleep & sensory needs',    className: 'bg-teal-500/10 text-teal-400 border border-teal-500/20' },
  Tech:       { label: 'Tech',       tagline: 'Systems, calendars & setup',       className: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
  Connection: { label: 'Connection', tagline: 'People, scripts & boundaries',     className: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
  Impression: { label: 'Impression', tagline: 'Identity & self-concept',          className: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
  Growth:     { label: 'Growth',     tagline: 'Career & skills without burnout',  className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
}

// Returns null safely if the category is missing or doesn't match a known branch
export function getCategoryStyle(category?: string | null): CategoryStyle | null {
  if (!category) return null
  return CATEGORY_STYLES[category] ?? null
}

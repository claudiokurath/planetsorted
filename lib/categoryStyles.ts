export interface CategoryStyle {
  label: string
  tagline: string
  className: string
}

const UNIFIED_TAG_STYLE = 'bg-neutral-800/80 text-neutral-300 border border-neutral-700/60'

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Mind:       { label: 'Mind',       tagline: 'Momentum & executive function',    className: UNIFIED_TAG_STYLE },
  Wealth:     { label: 'Wealth',     tagline: 'Money, bills & the ADHD tax',      className: UNIFIED_TAG_STYLE },
  Body:       { label: 'Body',       tagline: 'Energy, sleep & sensory needs',    className: UNIFIED_TAG_STYLE },
  Tech:       { label: 'Tech',       tagline: 'Systems, calendars & setup',       className: UNIFIED_TAG_STYLE },
  Connection: { label: 'Connection', tagline: 'People, scripts & boundaries',     className: UNIFIED_TAG_STYLE },
  Impression: { label: 'Impression', tagline: 'Identity & self-concept',          className: UNIFIED_TAG_STYLE },
  Growth:     { label: 'Growth',     tagline: 'Career & skills without burnout',  className: UNIFIED_TAG_STYLE },
}

export function getCategoryStyle(category?: string | null): CategoryStyle | null {
  if (!category) return null
  return CATEGORY_STYLES[category] ?? { label: category, tagline: '', className: UNIFIED_TAG_STYLE }
}

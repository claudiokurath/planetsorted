export interface CategoryStyle {
  label: string
  tagline: string
  className: string
  slug: string
}

const UNIFIED_TAG_STYLE = 'bg-neutral-800/80 text-neutral-300 border border-neutral-700/60'

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Mind:       { label: 'Mind',       tagline: 'Momentum & executive function',    className: UNIFIED_TAG_STYLE, slug: 'mind' },
  Wealth:     { label: 'Wealth',     tagline: 'Money, bills & the ADHD tax',      className: UNIFIED_TAG_STYLE, slug: 'wealth' },
  Body:       { label: 'Body',       tagline: 'Energy, sleep & sensory needs',    className: UNIFIED_TAG_STYLE, slug: 'body' },
  Tech:       { label: 'Tech',       tagline: 'Systems, calendars & setup',       className: UNIFIED_TAG_STYLE, slug: 'tech' },
  Connection: { label: 'Connection', tagline: 'People, scripts & boundaries',     className: UNIFIED_TAG_STYLE, slug: 'connection' },
  Impression: { label: 'Impression', tagline: 'Identity & self-concept',          className: UNIFIED_TAG_STYLE, slug: 'impression' },
  Growth:     { label: 'Growth',     tagline: 'Career & skills without burnout',  className: UNIFIED_TAG_STYLE, slug: 'growth' },
}

/** Canonical list of the 7 categories, in taxonomy order. */
export const CATEGORY_LIST: CategoryStyle[] = Object.values(CATEGORY_STYLES)

export function getCategoryStyle(category?: string | null): CategoryStyle | null {
  if (!category) return null
  return CATEGORY_STYLES[category] ?? { label: category, tagline: '', className: UNIFIED_TAG_STYLE, slug: category.toLowerCase() }
}

/** Looks up a category by its URL slug (e.g. "mind" -> Mind's CategoryStyle). */
export function getCategoryBySlug(slug: string): CategoryStyle | null {
  return CATEGORY_LIST.find((c) => c.slug === slug.toLowerCase()) ?? null
}

export interface CategoryStyle {
  label: string
  tagline: string
  /** Long-form scope of the pillar — what actually sits inside it. */
  blurb: string
  className: string
  slug: string
}

const UNIFIED_TAG_STYLE = 'bg-neutral-800/80 text-neutral-300 border border-neutral-700/60'

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Mind:       { label: 'Mind',       tagline: 'Momentum & executive function',    blurb: 'Executive function, attention, decision fatigue, emotional regulation, RSD, anxiety, ADHD systems.', className: UNIFIED_TAG_STYLE, slug: 'mind' },
  Wealth:     { label: 'Wealth',     tagline: 'Money, bills & the ADHD tax',      blurb: 'ADHD tax, bills, debt, subscriptions, financial avoidance, money systems, admin survival.', className: UNIFIED_TAG_STYLE, slug: 'wealth' },
  Body:       { label: 'Body',       tagline: 'Energy, sleep & sensory needs',    blurb: 'Burnout, sensory load, medication, sleep, chronic pain, substance use, physical regulation.', className: UNIFIED_TAG_STYLE, slug: 'body' },
  Tech:       { label: 'Tech',       tagline: 'Systems, calendars & setup',       blurb: 'Digital systems, automation, AI tools, accessibility, focus infrastructure, notification design.', className: UNIFIED_TAG_STYLE, slug: 'tech' },
  Connection: { label: 'Connection', tagline: 'People, scripts & boundaries',     blurb: 'Relationships, friendship, consent, intimacy, boundaries, shared living, communication scripts.', className: UNIFIED_TAG_STYLE, slug: 'connection' },
  Impression: { label: 'Impression', tagline: 'Identity & self-concept',          blurb: 'Masking, identity, confidence, visibility, personal presentation, social performance, unmasking.', className: UNIFIED_TAG_STYLE, slug: 'impression' },
  Growth:     { label: 'Growth',     tagline: 'Career & skills without burnout',  blurb: 'Work, career, learning, therapy, skills, self-advocacy, long-term change.', className: UNIFIED_TAG_STYLE, slug: 'growth' },
}

/** Canonical list of the 7 categories, in taxonomy order. */
export const CATEGORY_LIST: CategoryStyle[] = Object.values(CATEGORY_STYLES)

export function getCategoryStyle(category?: string | null): CategoryStyle | null {
  if (!category) return null
  return CATEGORY_STYLES[category] ?? { label: category, tagline: '', blurb: '', className: UNIFIED_TAG_STYLE, slug: category.toLowerCase() }
}

/** Looks up a category by its URL slug (e.g. "mind" -> Mind's CategoryStyle). */
export function getCategoryBySlug(slug: string): CategoryStyle | null {
  return CATEGORY_LIST.find((c) => c.slug === slug.toLowerCase()) ?? null
}

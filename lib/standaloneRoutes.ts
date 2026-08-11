// lib/standaloneRoutes.ts
// Maps tool slugs that have bespoke standalone components to their
// dedicated standalone route. Tools not in this map fall back to /tools/[slug].
// Add new tools here as they get their own standalone component.

export const STANDALONE_ROUTES: Record<string, string> = {
  'adhd-tax-calculator': '/adhd-tax-calculator',
  'weekly-wins-generator': '/weekly-wins-generator',
  'biometric-state-tracker': '/biometric-state-tracker',
  'decision-paralysis-solver': '/decision-paralysis-solver',
}

export function getToolRoute(slug: string): string {
  return STANDALONE_ROUTES[slug] ?? `/tools/${slug}`
}

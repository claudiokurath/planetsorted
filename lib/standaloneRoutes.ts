// lib/standaloneRoutes.ts
// Maps tool slugs that have bespoke standalone components to their
// dedicated standalone route. Tools not in this map fall back to /tools/[slug].
// Add new tools here as they get their own standalone component.

export const STANDALONE_ROUTES: Record<string, string> = {
  'adhd-tax-calculator': '/adhd-tax-calculator',
  'task-breakdown-wizard': '/task-breakdown-wizard',
  'weekly-wins-generator': '/weekly-wins-generator',
  'biometric-state-tracker': '/biometric-state-tracker',
  'decision-paralysis-solver': '/decision-paralysis-solver',
  'financial-autopilot': '/financial-autopilot',
  'brain-dump-sorter': '/brain-dump-sorter',
}

// These public app routes render the inputs and results, while /tools/[slug]
// remains the discovery presentation. Task Breakdown has its own member flow.
export const INTERACTIVE_TOOL_ROUTES: Record<string, string> = {
  'adhd-tax-calculator': '/embed/adhd-tax-calculator',
  'weekly-wins-generator': '/embed/weekly-wins-generator',
  'biometric-state-tracker': '/embed/biometric-state-tracker',
  'decision-paralysis-solver': '/embed/decision-paralysis-solver',
  'financial-autopilot': '/embed/financial-autopilot',
  'brain-dump-sorter': '/embed/brain-dump-sorter',
}

export function getToolRoute(slug: string): string {
  if (Object.hasOwn(INTERACTIVE_TOOL_ROUTES, slug)) return INTERACTIVE_TOOL_ROUTES[slug]
  if (Object.hasOwn(STANDALONE_ROUTES, slug)) return STANDALONE_ROUTES[slug]
  return `/tools/${slug}`
}

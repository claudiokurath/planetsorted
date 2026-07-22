const TOOL_SHORTHANDS: Record<string, string> = {
  TAX: 'adhd-tax-calculator',
  AUTOPILOT: 'financial-autopilot',
  CLARITY: 'decision-paralysis-solver',
  DOPAMINE: 'dopamine-menu-generator',
  TRIAGE: 'task-triage',
  RSD: 'rsd-response-scripts',
  SENSORY: 'sensory-audit',
  BURNOUT: 'burnout-assessment',
}

const BARE_VERBS = new Set([
  'LIBRARY', 'LOGIN', 'STOP', 'STOPWEEKLY',
  'START', 'STARTWEEKLY', 'HELP', 'MENU',
])

export function parseCommand(raw: string): { verb: string; arg: string } {
  const trimmed = raw.trim()
  const upper = trimmed.toUpperCase()
  const parts = upper.split(/\s+/)
  const first = parts[0]
  const rest = trimmed.slice(first.length).trim().toLowerCase()

  if (TOOL_SHORTHANDS[first] && parts.length === 1) {
    return { verb: 'RUN', arg: TOOL_SHORTHANDS[first] }
  }
  if (['SAVE', 'RUN', 'ARTICLE', 'AUDIO'].includes(first) && rest) {
    return { verb: first, arg: rest }
  }
  if (BARE_VERBS.has(first)) {
    return { verb: first, arg: '' }
  }
  return { verb: 'UNKNOWN', arg: raw }
}

export const TOOL_KEYWORDS = new Set([
  'TAX',
  'AUTOPILOT',
  'CLARITY',
  'DOPAMINE',
  'TRIAGE',
  'RSD',
  'SENSORY',
  'BURNOUT',
])

const SYSTEM_COMMANDS = new Set([
  'LOGIN',
  'STOP',
  'STOPWEEKLY',
  'START',
  'STARTWEEKLY',
  'HELP',
  'MENU',
  'LIBRARY',
])

export function parseCommand(raw: string): { verb: string; arg: string } {
  const trimmed = raw.trim()
  const upper = trimmed.toUpperCase()
  const parts = upper.split(/\s+/)
  const first = parts[0]
  const rest = trimmed.slice(first.length).trim()

  // 1. Tool keyword typed directly (e.g. "TAX" or "RUN TAX")
  if (first === 'RUN' && rest) {
    const target = rest.toUpperCase()
    if (TOOL_KEYWORDS.has(target)) {
      return { verb: 'TOOL', arg: target }
    }
  }

  if (TOOL_KEYWORDS.has(first) && parts.length === 1) {
    return { verb: 'TOOL', arg: first }
  }

  // 2. System command typed directly
  if (SYSTEM_COMMANDS.has(first)) {
    return { verb: first, arg: rest }
  }

  // 3. Optional SAVE command
  if (first === 'SAVE' && rest) {
    return { verb: 'SAVE', arg: rest }
  }

  // 4. Anything else treated as potential article keyword lookup
  return { verb: 'ARTICLE_KEYWORD', arg: trimmed }
}

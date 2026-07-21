const CRISIS_KEYWORDS = [
  'suicid', 'kill myself', 'end my life', 'want to die',
  'cant go on', "can't go on", 'self harm', 'self-harm',
  'hurt myself', 'no reason to live', 'not worth living',
  'overdose', 'cutting myself',
]

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw))
}

export const CRISIS_RESPONSE = `We noticed your message may mean you're going through something serious right now.

Planet Sorted is not a crisis service — but real support is available right now:

If you're in immediate danger: call 999
If you're at risk of harming yourself: text SHOUT to 85258 (free, 24/7)
Samaritans: call 116 123 (free, 24/7)

When you're ready, we're here. Text MENU to see what Planet Sorted can help with.`

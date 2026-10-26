import type { Presentation } from '@/components/NativePresentation'

type ObjectValue = Record<string, unknown>
const object = (value: unknown): ObjectValue => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as ObjectValue : {}
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : []

function nodeText(value: unknown, depth = 0): string {
  if (depth > 60) throw new Error('Presentation is too deep')
  const node = object(value)
  if (node.type === 'text') return typeof node.text === 'string' ? node.text : ''
  if (node.type === 'hardBreak') return '\n'
  if (node.type === 'emoji') return String(object(node.attrs).native ?? '')
  return list(node.content).map(child => nodeText(child, depth + 1)).join('')
}

function plainFragment(html: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', ndash: '–', mdash: '—', bull: '•' }
  return html.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (!entity.startsWith('#')) return named[entity.toLowerCase()] ?? match
    const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : ''
  }).trim()
}

/** Parse public Gamma data into React text and approved artwork, never executable HTML. */
export function parseGammaDocument(input: unknown): Presentation {
  const data = object(input)
  const documents = list(object(data.content).content)
  if (documents.length !== 1 || object(documents[0]).type !== 'document') throw new Error('Unsupported presentation')
  const cards: Presentation['cards'] = []
  let visited = 0
  for (const value of list(object(documents[0]).content)) {
    const card = object(value)
    if (card.type !== 'card' || object(card.attrs).hidden) continue
    const blocks: { kind: string; text: string }[] = []
    const images: Presentation['cards'][number]['images'] = []
    const seen = new Set<string>()
    function addImage(value: unknown) {
      const image = object(value)
      if (typeof image.src !== 'string' || seen.has(image.src)) return
      let url: URL
      try { url = new URL(image.src) } catch { return }
      if (url.protocol !== 'https:' || url.hostname !== 'cdn.gamma.app') return
      seen.add(image.src)
      const meta = object(image.meta)
      const dimension = (v: unknown, fallback: number) => typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.min(10000, Math.round(v)) : fallback
      images.push({ src: image.src, width: dimension(meta.width, 1200), height: dimension(meta.height, 800) })
    }
    function walk(value: unknown, depth = 0) {
      if (++visited > 30000 || depth > 60) throw new Error('Presentation is too large')
      const node = object(value), attrs = object(node.attrs)
      addImage(attrs); addImage(object(attrs.background).image)
      const text = nodeText(node).trim()
      if (['title', 'heading', 'paragraph', 'bullet'].includes(String(node.type))) {
        if (text) blocks.push({ kind: node.type === 'title' || node.type === 'heading' ? `h${Math.min(6, Math.max(1, Number(attrs.level) || 1))}` : node.type === 'bullet' ? 'li' : 'p', text })
        return
      }
      if (node.type === 'smartDiagram') {
        for (const step of list(object(attrs.data).step)) {
          const html = object(step).text
          if (typeof html !== 'string') continue
          for (const match of html.matchAll(/<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
            const text = plainFragment(match[2])
            if (text) blocks.push({ kind: match[1].toLowerCase(), text })
          }
        }
        return
      }
      for (const child of list(node.content)) walk(child, depth + 1)
    }
    walk(card); cards.push({ blocks, images })
  }
  if (!cards.length || !cards.some(card => card.blocks.length)) throw new Error('Empty presentation')
  return { cards }
}

export function parsePublicGammaHtml(html: string, expectedId: string): { presentation: Presentation; updatedAt: string | null } {
  const script = html.match(/<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)
  if (!script) throw new Error('Presentation is unavailable')
  const props = object(object(object(JSON.parse(script[1])).props).pageProps)
  const doc = object(props.doc)
  if (doc.id !== expectedId) throw new Error('Presentation source mismatch')
  return { presentation: parseGammaDocument(props), updatedAt: typeof doc.updatedTime === 'string' ? doc.updatedTime : null }
}

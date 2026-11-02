import type { Presentation } from '@/components/NativePresentation'

export function validatePresentation(data: unknown): asserts data is Presentation {
  const p = data as Presentation
  if (!p || !Array.isArray(p.cards) || p.cards.length < 1 || p.cards.length > 100) throw new Error('Invalid presentation')
  let textCount = 0
  for (const card of p.cards) {
    if (!Array.isArray(card.blocks) || card.blocks.length > 500 || !Array.isArray(card.images) || card.images.length > 30) throw new Error('Invalid card')
    for (const block of card.blocks) {
      if (!/^(h[1-6]|p|li)$/.test(block.kind) || typeof block.text !== 'string' || block.text.length > 20_000) throw new Error('Invalid text')
      textCount += block.text.length
    }
    for (const image of card.images) {
      const url = new URL(image.src)
      if (url.protocol !== 'https:' || url.hostname !== 'cdn.gamma.app' || url.username || url.password
        || !Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width < 1 || image.height < 1
        || image.width > 20000 || image.height > 20000) throw new Error('Invalid image')
    }
  }
  if (!textCount || textCount > 500_000) throw new Error('Invalid text size')
}


export function isCurrentSnapshot(snapshot: { sourceId: string; checkedAt: string; data?: unknown; error?: string }, sourceId: string, now = Date.now()): boolean {
  const checked = Date.parse(snapshot.checkedAt)
  return snapshot.sourceId === sourceId && !!snapshot.data && !snapshot.error && Number.isFinite(checked) && checked <= now + 30_000 && now - checked < 45 * 60_000
}

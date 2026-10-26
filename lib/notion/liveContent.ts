import 'server-only'
import { syncPublishedContent } from '@/lib/notion/contentSync'

type Snapshot = { tools: string[]; articles: string[] }
const TTL_MS = 30_000
let current: { value: Snapshot; expiresAt: number } | undefined
let pending: Promise<Snapshot> | undefined

/** Coalesce traffic without serving stale publication decisions on refresh failure. */
export async function getLiveContent(): Promise<Snapshot> {
  if (current && current.expiresAt > Date.now()) return current.value
  if (pending) return pending
  pending = syncPublishedContent().then(value => {
    current = { value, expiresAt: Date.now() + TTL_MS }
    return value
  }).catch(error => {
    current = undefined
    throw error
  }).finally(() => { pending = undefined })
  return pending
}

export async function isContentPublished(slug: string, type: 'Tool' | 'Article'): Promise<boolean> {
  const snapshot = await getLiveContent()
  return (type === 'Tool' ? snapshot.tools : snapshot.articles).includes(slug)
}

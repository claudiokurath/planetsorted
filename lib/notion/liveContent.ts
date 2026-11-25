import 'server-only'
import { syncPublishedContent } from '@/lib/notion/contentSync'

type Snapshot = { tools: string[]; articles: string[] }
type Scope = 'Tool' | 'Article' | 'all'
const TTL_MS = 30_000
const current = new Map<Scope, { value: Snapshot; expiresAt: number }>()
const pending = new Map<Scope, Promise<Snapshot>>()

/** Coalesce per collection, failing closed only for the source that failed.
 * The unrequested collection in a scoped snapshot is empty, never cached data.
 * Unscoped callers still require both sources to succeed.
 */
export async function getLiveContent(type?: 'Tool' | 'Article'): Promise<Snapshot> {
  const scope = type ?? 'all'
  const cached = current.get(scope)
  if (cached && cached.expiresAt > Date.now()) return cached.value
  const inflight = pending.get(scope)
  if (inflight) return inflight
  const refresh = syncPublishedContent(type).then(value => {
    current.set(scope, { value, expiresAt: Date.now() + TTL_MS })
    return value
  }).catch(error => {
    current.delete(scope)
    throw error
  }).finally(() => { pending.delete(scope) })
  pending.set(scope, refresh)
  return refresh
}

export async function isContentPublished(slug: string, type: 'Tool' | 'Article'): Promise<boolean> {
  const snapshot = await getLiveContent(type)
  return (type === 'Tool' ? snapshot.tools : snapshot.articles).includes(slug)
}

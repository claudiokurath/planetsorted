import 'server-only'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import { parsePublicGammaHtml } from '@/lib/content/gammaDocument'
import type { Presentation } from '@/components/NativePresentation'

type LiveGamma = { presentation: Presentation; sourceId: string; updatedAt: string | null }
const cache = new Map<string, { value: LiveGamma; expiresAt: number }>()
const requests = new Map<string, Promise<LiveGamma | null>>()

/** Only callers with Notion's PUBLIC Gamma / Blog Post Gamma field may use this. */
export async function getLiveGammaPresentation(publicSource: string | null | undefined): Promise<LiveGamma | null> {
  const embed = gammaEmbedUrl(publicSource)
  const sourceId = embed?.match(/^https:\/\/gamma\.app\/embed\/([a-zA-Z0-9]+)$/)?.[1]
  if (!sourceId) return null
  const found = cache.get(sourceId)
  if (found && found.expiresAt > Date.now()) return found.value
  const existing = requests.get(sourceId)
  if (existing) return existing
  const request = (async () => {
    try {
      // Gamma's public reader redirects browser/crawler reads to this public
      // document surface. No account, private API or exported token is used.
      const response = await fetch(`https://gamma.app/docs-robot/${sourceId}`, { cache: 'no-store', signal: AbortSignal.timeout(12000) })
      if (!response.ok || new URL(response.url).hostname !== 'gamma.app') throw new Error('Presentation unavailable')
      const html = await response.text()
      if (html.length > 5_000_000) throw new Error('Presentation too large')
      const value = { ...parsePublicGammaHtml(html, sourceId), sourceId }
      if (cache.size >= 50 && !cache.has(sourceId)) cache.delete(cache.keys().next().value!)
      cache.set(sourceId, { value, expiresAt: Date.now() + 30_000 })
      return value
    } catch (error) {
      // Never silently show a previously imported or expired version instead.
      console.warn('Public Gamma read failed', { sourceId, reason: error instanceof Error ? error.message.slice(0, 180) : 'Unavailable' })
      cache.delete(sourceId)
      return null
    } finally { requests.delete(sourceId) }
  })()
  requests.set(sourceId, request)
  return request
}

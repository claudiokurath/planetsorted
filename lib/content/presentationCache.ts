import 'server-only'
import { createServiceClient } from '@/lib/supabase/server'
import { getLiveContent } from '@/lib/notion/liveContent'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import type { Presentation } from '@/components/NativePresentation'
import { validatePresentation, isCurrentSnapshot } from './presentationData'
export { validatePresentation } from './presentationData'
import versions from './presentationVersions.json'
import localCopy from './nativeGammaCopy.json'

export const PRESENTATION_BUCKET = 'presentation-cache'
export const MAX_PRESENTATION_AGE = 45 * 60_000
export type PresentationSource = { slug: string; type: 'Tool' | 'Article'; sourceId: string }
export type PresentationSnapshot = { version: 1; slug: string; sourceId: string; sourceUpdatedAt: string; checkedAt: string; data?: Presentation; error?: string }
const snapshots = new Map<string, { value: PresentationSnapshot | null; expiresAt: number }>()

export function publicGammaId(source: string | null | undefined): string | null {
  return gammaEmbedUrl(source)?.match(/^https:\/\/gamma\.app\/embed\/([a-zA-Z0-9]{5,80})$/)?.[1] ?? null
}

/** Only the public Tool Gamma and Blog Post Gamma fields leave this server. */
export async function getPresentationSources(): Promise<PresentationSource[]> {
  const published = await getLiveContent()
  const { data, error } = await createServiceClient().from('protocols')
    .select('slug, type, gamma_url, blog_gamma_url').eq('status', 'Published')
  if (error) throw new Error('Published presentations are unavailable')
  return (data ?? []).flatMap(row => {
    const type = row.type === 'Tool' ? 'Tool' : 'Article'
    if (!(type === 'Tool' ? published.tools : published.articles).includes(row.slug)) return []
    const sourceId = publicGammaId(type === 'Tool' ? row.gamma_url : row.blog_gamma_url)
    return sourceId && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) ? [{ slug: row.slug, type, sourceId }] : []
  })
}


function path(source: PresentationSource) { return `${source.slug}/${source.sourceId}.json` }

export async function readPresentationSnapshot(source: PresentationSource): Promise<PresentationSnapshot | null> {
  const key = path(source), cached = snapshots.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.value
  const { data, error } = await createServiceClient().storage.from(PRESENTATION_BUCKET).download(key)
  let value: PresentationSnapshot | null = null
  try {
    if (!error && data) {
      const candidate = JSON.parse(await data.text()) as PresentationSnapshot
      if (candidate.version === 1 && candidate.slug === source.slug && candidate.sourceId === source.sourceId) {
        if (candidate.data) validatePresentation(candidate.data)
        value = candidate
      }
    }
  } catch { value = null }
  if (snapshots.size > 100) snapshots.clear()
  snapshots.set(key, { value, expiresAt: Date.now() + 30_000 })
  return value
}

export async function writePresentationSnapshot(source: PresentationSource, snapshot: PresentationSnapshot) {
  const client = createServiceClient()
  // Private, server-only JSON cache. No new credentials or client storage policies.
  const { data: buckets, error: listError } = await client.storage.listBuckets()
  if (listError) throw new Error('Presentation storage unavailable')
  if (!buckets.some(bucket => bucket.id === PRESENTATION_BUCKET)) {
    const { error } = await client.storage.createBucket(PRESENTATION_BUCKET, { public: false, fileSizeLimit: 1_048_576, allowedMimeTypes: ['application/json'] })
    if (error) throw new Error('Presentation storage unavailable')
  }
  const { error } = await client.storage.from(PRESENTATION_BUCKET).upload(path(source), JSON.stringify(snapshot), { contentType: 'application/json', cacheControl: '0', upsert: true })
  if (error) throw new Error('Presentation could not be saved')
  snapshots.delete(path(source))
}

export async function getCurrentPresentation(slug: string, source: string | null | undefined) {
  const sourceId = publicGammaId(source)
  if (!sourceId) return null
  const entry: PresentationSource = { slug, sourceId, type: 'Tool' }
  const snapshot = await readPresentationSnapshot(entry)
  if (snapshot && isCurrentSnapshot(snapshot, sourceId) && snapshot.data) {
    return { presentation: snapshot.data, sourceId, updatedAt: snapshot.sourceUpdatedAt }
  }
  // Upstream refresh failures must not erase the last verified native preview.
  // The Notion source ID must still match. Health reports staleness separately;
  // an older copy is never labelled as a successfully refreshed snapshot.
  const version = versions[slug as keyof typeof versions] as { id: string; updatedAt: string } | undefined
  if (version?.id === sourceId && Object.hasOwn(localCopy, slug)) {
    return { presentation: localCopy[slug as keyof typeof localCopy], sourceId, updatedAt: version.updatedAt }
  }
  return null
}

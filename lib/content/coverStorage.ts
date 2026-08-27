import { createHash } from 'node:crypto'

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function buildVersionedCoverPath(
  slug: string,
  bytes: Uint8Array,
  contentType: string
): string {
  const mimeType = contentType.split(';', 1)[0].trim().toLowerCase()
  const extension = IMAGE_EXTENSIONS[mimeType] ?? 'img'
  const contentHash = createHash('sha256').update(bytes).digest('hex').slice(0, 16)

  return `notion-files/covers/${slug}/${contentHash}.${extension}`
}

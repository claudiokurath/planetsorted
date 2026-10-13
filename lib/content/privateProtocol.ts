import { createDecipheriv } from 'node:crypto'

export const PRIVATE_PDF_SLUG = 'financial-avoidance-trauma-response'

export function decryptPrivateAsset(payload: Buffer, secret: string): Buffer {
  const key = Buffer.from(secret, 'base64')
  if (key.length !== 32 || payload.length < 29) throw new Error('Private download unavailable')
  const decipher = createDecipheriv('aes-256-gcm', key, payload.subarray(0, 12))
  decipher.setAuthTag(payload.subarray(12, 28))
  return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()])
}

export function canDownloadProtocol(userId: string | undefined, profile: {
  whatsapp_verified?: boolean
  whatsapp_number?: string | null
} | null): boolean {
  return Boolean(userId && profile?.whatsapp_verified && profile.whatsapp_number)
}

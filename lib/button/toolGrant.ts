import { relaySignature, verifyRelay } from '../whatsapp/buttonRelayAuth'

const PURPOSE = 'tool-access'
const ID = 'native-tool-access'
export function createToolGrant(secret: string, slug: string, now = Date.now()): string {
  const timestamp = String(now)
  return `${timestamp}.${relaySignature(secret, PURPOSE, timestamp, ID, slug)}`
}
export function verifyToolGrant(secret: string | undefined, slug: string, grant: string | undefined, now = Date.now()): boolean {
  const [timestamp, signature, extra] = (grant ?? '').split('.')
  if (extra !== undefined || !/^[a-z0-9-]{1,100}$/.test(slug) || Number(timestamp) > now) return false
  return verifyRelay(secret, PURPOSE, timestamp ?? null, ID, slug, signature ?? null, now)
}

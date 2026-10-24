import { createHash } from 'node:crypto'
import { relaySignature, buttonCommand } from './buttonRelayAuth'

type Message = { id?: string; from?: string; type?: string; text?: { body?: string }; context?: { id?: string } }
export function buttonRelayConfigured() {
  return Boolean(process.env.BUTTON_RELAY_URL && process.env.BUTTON_RELAY_SECRET)
}

// Called only AFTER the original Meta signature and crisis checks have passed.
export async function forwardButtonMessage(message: Message) {
  const endpoint = process.env.BUTTON_RELAY_URL
  const secret = process.env.BUTTON_RELAY_SECRET
  if (!endpoint || !secret || !message.id || !message.from || !message.text?.body) return
  const target = new URL(endpoint)
  if (target.protocol !== 'https:' || target.hostname !== 'api.sor7ed.com' || target.pathname !== '/webhook/relay') throw new Error('Button relay target is invalid')
  const id = createHash('sha256').update(message.id).digest('hex')
  const timestamp = String(Date.now())
  const body = JSON.stringify({ mode: buttonCommand(message.text.body) ? 'command' : 'session', message })
  const res = await fetch(target, { method: 'POST', headers: { 'content-type': 'application/json', 'x-sor7ed-id': id, 'x-sor7ed-ts': timestamp, 'x-sor7ed-signature': relaySignature(secret, 'inbound', timestamp, id, body) }, body, signal: AbortSignal.timeout(25_000), redirect: 'error' })
  if (!res.ok) throw new Error('Button relay did not accept the event')
}

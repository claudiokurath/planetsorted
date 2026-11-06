import test from 'node:test'
import assert from 'node:assert/strict'
import { reserveWhatsAppWindow, whatsappWindowUrl } from './window.ts'

test('WhatsApp handoff reserves a separate window before async work and isolates its opener', async () => {
  const events = []
  const child = { opener: {}, location: { replace: url => events.push(url) }, close: () => events.push('closed') }
  const host = { open: (...args) => { events.push(args); return child } }
  const handoff = reserveWhatsAppWindow(host)
  assert.equal(child.opener, null)
  assert.match(events[0][2], /popup=yes/)
  assert.equal(events[0][0], 'about:blank')
  await Promise.resolve()
  assert.equal(handoff.open('https://wa.me/447591922247?text=GET%20IT%20SORTED%20request'), true)
  handoff.close()
  assert.equal(events.length, 2)
  assert.match(events[1], /text=GET%20IT/)
})

test('blocked window leaves caller intact; unused reservations close on failure', () => {
  const blocked = reserveWhatsAppWindow({ open: () => null })
  assert.equal(blocked.open('https://web.whatsapp.com/'), false)
  blocked.close()
  let closed = false
  const unused = reserveWhatsAppWindow({ open: () => ({ opener: {}, location: { replace() {} }, close() { closed = true } }) })
  unused.close()
  assert.equal(closed, true)
})

test('handoff rejects untrusted destinations and malformed WhatsApp URLs', () => {
  for (const url of ['javascript:alert(1)', 'https://evil.example/', 'https://wa.me.evil.example/1234567890', 'https://name:secret@wa.me/1234567890', 'https://wa.me:999/1234567890', 'https://wa.me/not-a-number', 'https://web.whatsapp.com/elsewhere']) {
    assert.throws(() => whatsappWindowUrl(url))
  }
})

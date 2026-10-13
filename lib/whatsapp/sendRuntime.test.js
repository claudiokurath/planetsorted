import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sendWhatsAppContentCard, sendWhatsAppMessage, sendWhatsAppAudio, WhatsAppSendError } from './send.ts'

const card = {
  to: '447000000000', slug: 'test-resource', title: 'A useful resource',
  summary: 'Private summary', imageUrl: 'https://planetsorted.com/images/test.webp',
  url: 'https://planetsorted.com/go/test-resource',
}

async function fixture(run) {
  const originalFetch = globalThis.fetch
  const originalWarn = console.warn
  const environment = Object.fromEntries(['META_PHONE_NUMBER_ID', 'META_WHATSAPP_TOKEN', 'WHATSAPP_CONTENT_CARD_TEMPLATE', 'META_GRAPH_API_VERSION'].map((key) => [key, process.env[key]]))
  process.env.META_PHONE_NUMBER_ID = 'mock-phone'
  process.env.META_WHATSAPP_TOKEN = 'mock-token'
  delete process.env.WHATSAPP_CONTENT_CARD_TEMPLATE
  delete process.env.META_GRAPH_API_VERSION
  const requests = []
  const warnings = []
  console.warn = (...args) => warnings.push(args.join(' '))
  let responder = () => { throw new Error('Unexpected provider request') }
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options, payload: JSON.parse(options.body) })
    return responder(requests.length)
  }
  try { await run({ requests, warnings, respond: (callback) => { responder = callback } }) }
  finally {
    globalThis.fetch = originalFetch
    console.warn = originalWarn
    for (const [key, value] of Object.entries(environment)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

const accepted = (id = 'wamid.accepted') => Response.json({ messages: [{ id }] })
const rejected = (status = 400, message = 'The provider rejected this format') => Response.json({ error: { message } }, { status })

test('a provider-accepted preferred card returns its receipt and sets a bounded timeout', async () => fixture(async ({ requests, respond }) => {
  const originalTimeout = AbortSignal.timeout
  const timeouts = []
  AbortSignal.timeout = (ms) => { timeouts.push(ms); return originalTimeout(ms) }
  try {
    respond(() => accepted('wamid.preferred'))
    assert.deepEqual(await sendWhatsAppContentCard(card), { kind: 'template', messageId: 'wamid.preferred' })
    assert.equal(requests.length, 1)
    assert.equal(requests[0].payload.template.name, 'sor7ed_revisit_card')
    assert.deepEqual(timeouts, [15_000])
    assert.equal(requests[0].options.signal instanceof AbortSignal, true)
  } finally { AbortSignal.timeout = originalTimeout }
}))

test('only definite HTTP400 rejections allow ordered template/interactive/link fallback receipts', async () => {
  for (const [rejectCount, kind] of [[1, 'template'], [2, 'interactive'], [3, 'link']]) {
    await fixture(async ({ requests, respond }) => {
      respond((index) => index <= rejectCount ? rejected() : accepted(`wamid.fallback-${index}`))
      assert.deepEqual(await sendWhatsAppContentCard(card), { kind, messageId: `wamid.fallback-${rejectCount + 1}` })
      assert.equal(requests.length, rejectCount + 1)
      assert.equal(requests[0].payload.template.name, 'sor7ed_revisit_card')
      assert.equal(requests[1].payload.template.name, 'sor7ed_saved_card')
      if (rejectCount >= 2) assert.equal(requests[2].payload.type, 'interactive')
      if (rejectCount >= 3) {
        assert.equal(requests[3].payload.type, 'text')
        assert.equal(requests[3].payload.text.body, card.url)
        assert.equal(requests[3].payload.text.preview_url, true)
      }
    })
  }
})

test('the configured legacy card is not sent twice before interactive fallback', async () => fixture(async ({ requests, respond }) => {
  process.env.WHATSAPP_CONTENT_CARD_TEMPLATE = 'sor7ed_saved_card'
  respond((index) => index === 1 ? rejected() : accepted('wamid.interactive'))
  assert.deepEqual(await sendWhatsAppContentCard(card), { kind: 'interactive', messageId: 'wamid.interactive' })
  assert.deepEqual(requests.map(({ payload }) => payload.type), ['template', 'interactive'])
}))

test('network/timeout/5xx/408/missing-ID responses produce unknown with exactly one request', async () => {
  for (const response of [
    () => { throw new Error('network disconnected') },
    () => { throw new DOMException('Timeout', 'TimeoutError') },
    () => rejected(500),
    () => rejected(503),
    () => rejected(408),
    () => Response.json({ success: true }),
    () => Response.json({ messages: [] }),
    () => Response.json({ messages: [{ id: '' }] }),
    () => Response.json({ messages: [{ id: '   ' }] }),
    () => Response.json({ messages: [{ id: 'one' }, { id: 'two' }] }),
    () => new Response('{invalid-json'),
  ]) {
    await fixture(async ({ requests, respond }) => {
      respond(response)
      await assert.rejects(sendWhatsAppContentCard(card), (error) => error instanceof WhatsAppSendError && error.outcome === 'unknown')
      assert.equal(requests.length, 1)
    })
  }
})

test('HTTP429 and other definite non400 failures never fall back', async () => {
  for (const status of [401, 403, 404, 429]) {
    await fixture(async ({ requests, respond }) => {
      respond(() => rejected(status))
      await assert.rejects(sendWhatsAppContentCard(card), (error) => error instanceof WhatsAppSendError && error.outcome === 'failed' && error.status === status)
      assert.equal(requests.length, 1)
    })
  }
})

test('uncertain legacy fallback stops immediately without interactive/text resend', async () => fixture(async ({ requests, respond }) => {
  respond((index) => index === 1 ? rejected() : rejected(500))
  await assert.rejects(sendWhatsAppContentCard(card), (error) => error instanceof WhatsAppSendError && error.outcome === 'unknown')
  assert.equal(requests.length, 2)
  assert.equal(requests[1].payload.type, 'template')
}))

test('conversation-window rejection after template failures never retries as text', async () => fixture(async ({ requests, respond }) => {
  respond((index) => index < 3 ? rejected() : rejected(400, '131047 outside the 24-hour conversation window'))
  await assert.rejects(sendWhatsAppContentCard(card), (error) => error instanceof WhatsAppSendError && error.outcome === 'failed')
  assert.equal(requests.length, 3)
  assert.equal(requests[2].payload.type, 'interactive')
}))

test('audio and text return the exact accepted message IDs and correct payloads', async () => fixture(async ({ requests, respond }) => {
  respond((index) => accepted(`wamid.message-${index}`))
  assert.deepEqual(await sendWhatsAppMessage(card.to, 'Useful text', card.url), { kind: 'text', messageId: 'wamid.message-1' })
  assert.deepEqual(await sendWhatsAppAudio(card.to, 'https://planetsorted.com/audio/test.mp3'), { kind: 'audio', messageId: 'wamid.message-2' })
  assert.equal(requests[0].payload.text.preview_url, true)
  assert.equal(requests[0].payload.text.body, 'Useful text')
  assert.equal(requests[1].payload.audio.link, 'https://planetsorted.com/audio/test.mp3')
}))

test('missing sender configuration fails closed without making a provider request', async () => fixture(async ({ requests }) => {
  delete process.env.META_WHATSAPP_TOKEN
  await assert.rejects(sendWhatsAppContentCard(card), (error) => error instanceof WhatsAppSendError && error.outcome === 'failed')
  assert.equal(requests.length, 0)
}))

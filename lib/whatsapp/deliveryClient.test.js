import assert from 'node:assert/strict'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const sourceUrl = pathToFileURL(fileURLToPath(new URL('./deliveryClient.ts', import.meta.url)))
let sequence = 0

async function fixture() {
  const storage = new Map()
  const originalWindow = globalThis.window
  const originalFetch = globalThis.fetch
  globalThis.window = { sessionStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
  } }
  const client = await import(`${sourceUrl.href}?test=${++sequence}`)
  return {
    client, storage,
    cleanup() { globalThis.window = originalWindow; globalThis.fetch = originalFetch },
  }
}

function reply(actionId, deliveryStatus, httpStatus = 200) {
  return new Response(JSON.stringify({
    success: deliveryStatus === 'accepted', actionId, saveStatus: 'saved', deliveryStatus, deliveryReason: null,
  }), { status: httpStatus, headers: { 'Content-Type': 'application/json' } })
}

const item = { slug: 'brain-dump-sorter', context: 'tool', includeLink: true }

test('concurrent buttons share one provider request and only accepted means sent', async () => {
  const f = await fixture()
  try {
    let calls = 0
    let unblock
    globalThis.fetch = async (_url, options) => {
      calls++
      const payload = JSON.parse(options.body)
      await new Promise(resolve => { unblock = resolve })
      return reply(payload.idempotencyKey, 'accepted', 201)
    }
    const first = f.client.requestWhatsAppDelivery(item, 'user-one')
    const second = f.client.requestWhatsAppDelivery(item, 'user-one')
    assert.equal(calls, 1)
    unblock()
    assert.deepEqual(await first, await second)
  } finally { f.cleanup() }
})

test('pending, failed, skipped and unknown 2xx responses stay status-only on another click', async () => {
  for (const state of ['pending', 'failed', 'skipped', 'unknown']) {
    const f = await fixture()
    try {
      const actionId = f.client.prepareDeliveryAction(item, 'user-one')
      const methods = []
      globalThis.fetch = async (_url, options = {}) => {
        methods.push(options.method || 'GET')
        return reply(actionId, state, options.method ? 201 : 200)
      }
      assert.equal((await f.client.requestWhatsAppDelivery(item, 'user-one')).success, false)
      assert.equal((await f.client.requestWhatsAppDelivery(item, 'user-one')).deliveryStatus, state)
      assert.deepEqual(methods, ['POST', 'GET'])
      assert.doesNotMatch(f.client.deliveryStatusMessage(await f.client.requestWhatsAppDelivery(item, 'user-one')), /Message sent/)
    } finally { f.cleanup() }
  }
})

test('lost POST response and reload retain the ID and use authenticated status lookup', async () => {
  const f = await fixture()
  try {
    const actionId = f.client.prepareDeliveryAction(item, 'user-one')
    globalThis.fetch = async () => { throw new TypeError('network lost') }
    await assert.rejects(f.client.requestWhatsAppDelivery(item, 'user-one'), /check this request safely/)
    const reloaded = await import(`${sourceUrl.href}?reload=${++sequence}`)
    assert.equal(reloaded.prepareDeliveryAction(item, 'user-one'), actionId)
    globalThis.fetch = async (url, options) => {
      assert.equal(options.method, undefined)
      assert.match(url, new RegExp(`actionId=${actionId}`))
      assert.equal(options.cache, 'no-store')
      return reply(actionId, 'accepted')
    }
    assert.equal((await reloaded.requestWhatsAppDelivery(item, 'user-one')).success, true)
  } finally { f.cleanup() }
})

test('connect navigation preserves the supplied UUID and separates users', async () => {
  const f = await fixture()
  try {
    const anonymousId = f.client.prepareDeliveryAction(item)
    assert.equal(f.client.prepareDeliveryAction(item, 'newly-connected-user', anonymousId), anonymousId)
    assert.notEqual(f.client.prepareDeliveryAction(item, 'different-user'), anonymousId)
    assert.notEqual(f.client.prepareDeliveryAction({ ...item, includeAudio: true }, 'newly-connected-user'), anonymousId)
    assert.equal(f.client.prepareDeliveryAction({ ...item, context: 'article' }, 'newly-connected-user'), anonymousId)
  } finally { f.cleanup() }
})

test('a server 5xx or malformed success response does not lead to another POST', async () => {
  for (const broken of [new Response('error', { status: 503 }), new Response('{}', { status: 201 }), new Response('<html>server failure</html>', { status: 201 })]) {
    const f = await fixture()
    try {
      const actionId = f.client.prepareDeliveryAction(item, 'user-one')
      let postCalls = 0
      globalThis.fetch = async (_url, options = {}) => {
        if (options.method === 'POST') { postCalls++; return broken }
        return reply(actionId, 'unknown')
      }
      await assert.rejects(f.client.requestWhatsAppDelivery(item, 'user-one'), /could not confirm/)
      assert.equal((await f.client.requestWhatsAppDelivery(item, 'user-one')).deliveryStatus, 'unknown')
      assert.equal(postCalls, 1)
    } finally { f.cleanup() }
  }
})

test('status network errors use plain copy and do not reset a submitted action', async () => {
  const f = await fixture()
  try {
    const actionId = f.client.prepareDeliveryAction(item, 'user-one')
    let calls = 0
    globalThis.fetch = async (_url, options = {}) => {
      calls++
      if (options.method === 'POST') return reply(actionId, 'pending')
      throw new TypeError('RAW_NETWORK_EXCEPTION')
    }
    await f.client.requestWhatsAppDelivery(item, 'user-one')
    await assert.rejects(f.client.requestWhatsAppDelivery(item, 'user-one'), /Check your connection/)
    assert.equal(f.client.hasSubmittedDelivery(item, 'user-one'), true)
    assert.equal(calls, 2)
  } finally { f.cleanup() }
})

test('status 404 needs an explicit subsequent click and reuses the same identity', async () => {
  const f = await fixture()
  try {
    const actionId = f.client.prepareDeliveryAction(item, 'user-one')
    const methods = []
    globalThis.fetch = async (_url, options = {}) => {
      methods.push(options.method || 'GET')
      if (methods.length === 1) throw new Error('lost request')
      if (methods.length === 2) return new Response('not found', { status: 404 })
      assert.equal(JSON.parse(options.body).idempotencyKey, actionId)
      return reply(actionId, 'accepted')
    }
    await assert.rejects(f.client.requestWhatsAppDelivery(item, 'user-one'))
    await assert.rejects(f.client.requestWhatsAppDelivery(item, 'user-one'), /Tap again to try safely/)
    assert.deepEqual(methods, ['POST', 'GET'])
    assert.equal((await f.client.requestWhatsAppDelivery(item, 'user-one')).success, true)
    assert.deepEqual(methods, ['POST', 'GET', 'POST'])
  } finally { f.cleanup() }
})

test('a rejected pre-claim request can explicitly retry with its original UUID', async () => {
  const f = await fixture()
  try {
    const actionId = f.client.prepareDeliveryAction(item, 'user-one')
    let calls = 0
    globalThis.fetch = async (_url, options) => {
      assert.equal(JSON.parse(options.body).idempotencyKey, actionId)
      return ++calls === 1 ? new Response('wait', { status: 429 }) : reply(actionId, 'accepted')
    }
    await assert.rejects(f.client.requestWhatsAppDelivery(item, 'user-one'), /wait a moment/)
    assert.equal((await f.client.requestWhatsAppDelivery(item, 'user-one')).success, true)
  } finally { f.cleanup() }
})

test('a 2xx without provider acceptance cannot be called success', async () => {
  const f = await fixture()
  try {
    const actionId = f.client.prepareDeliveryAction(item, 'user-one')
    globalThis.fetch = async () => new Response(JSON.stringify({ actionId, saveStatus: 'saved', success: true, deliveryStatus: 'pending' }))
    await assert.rejects(f.client.requestWhatsAppDelivery(item, 'user-one'), /could not confirm the WhatsApp status/)
  } finally { f.cleanup() }
})

test('only an explicit confirmed failed/skipped recovery creates a replacement action', async () => {
  for (const state of ['pending', 'accepted', 'failed', 'skipped', 'unknown']) {
    const f = await fixture()
    try {
      const originalId = f.client.prepareDeliveryAction(item, 'user-one')
      globalThis.fetch = async () => reply(originalId, state)
      await f.client.requestWhatsAppDelivery(item, 'user-one')
      if (state === 'failed' || state === 'skipped') {
        const replacementId = f.client.startNewDeliveryAction(item, 'user-one')
        assert.notEqual(replacementId, originalId)
        assert.equal(f.client.prepareDeliveryAction(item, 'user-one'), replacementId)
        assert.equal(f.client.hasSubmittedDelivery(item, 'user-one'), false)
      } else {
        assert.throws(() => f.client.startNewDeliveryAction(item, 'user-one'), /Check the status/)
        assert.equal(f.client.prepareDeliveryAction(item, 'user-one'), originalId)
      }
    } finally { f.cleanup() }
  }
})

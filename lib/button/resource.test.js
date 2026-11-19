import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import { relaySignature, verifyRelay } from '../whatsapp/buttonRelayAuth.ts'
import { protocolGammaUrl } from '../content/protocolGamma.ts'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const secret = 'fixture-resource-key'
function load(path, mocks) {
  const filename = fileURLToPath(new URL(path, import.meta.url))
  const mod = new Module(filename)
  mod.filename = filename
  mod.require = name => mocks[name] ?? require(name)
  mod._compile(ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename)
  return mod.exports
}
const grants = load('./toolGrant.ts', { '../whatsapp/buttonRelayAuth': { relaySignature, verifyRelay } })
test('native tool access is signed, slug-bound, short-lived and purpose-separated', () => {
  const now = Date.now(), slug = 'brain-dump-sorter'
  const grant = grants.createToolGrant(secret, slug, now)
  assert.equal(grants.verifyToolGrant(secret, slug, grant, now), true)
  assert.equal(grants.verifyToolGrant(secret, slug, grant, now + 300001), false)
  assert.equal(grants.verifyToolGrant(secret, slug, grant, now - 1), false)
  assert.equal(grants.verifyToolGrant(secret, 'adhd-tax-calculator', grant, now), false)
  assert.equal(grants.verifyToolGrant(undefined, slug, grant, now), false)
  assert.equal(grants.verifyToolGrant(secret, slug, grant + '.extra', now), false)
  assert.equal(grants.verifyToolGrant(secret, slug, `${now}.${relaySignature(secret, 'resource', String(now), 'native-tool-access', slug)}`, now), false)
})
test('resolver requires service authentication, current publication and exact Notion Gamma', async () => {
  const previous = process.env.BUTTON_RELAY_SECRET
  process.env.BUTTON_RELAY_SECRET = secret
  const state = { published: true, reads: 0, failure: false, gamma: '<iframe src="https://gamma.app/embed/exact-protocol"></iframe>' }
  const chain = { select() { state.reads++; return this }, eq() { return this }, async single() { return { data: { title: 'Protocol', gamma_url: state.gamma, slug: 'useful-protocol' } } } }
  const { POST } = load('../../app/api/button/resource/route.ts', {
    '@/lib/whatsapp/buttonRelayAuth': { verifyRelay }, '@/lib/button/toolGrant': grants,
    '@/lib/notion/liveContent': { isContentPublished: async () => { if (state.failure) throw Error('offline'); return state.published } },
    '@/lib/supabase/server': { createServiceClient: () => ({ from: () => chain }) },
    '@/lib/content/protocolGamma': { protocolGammaUrl },
    '@/lib/standaloneRoutes': { INTERACTIVE_TOOL_ROUTES: { 'brain-dump-sorter': '/embed/brain-dump-sorter' } },
  })
  function request(body = { slug: 'useful-protocol', context: 'article' }, valid = true) {
    const raw = JSON.stringify(body), timestamp = String(Date.now()), id = 'resource-fixture-123456'
    return new Request('https://www.planetsorted.com/api/button/resource', { method: 'POST', body: raw, headers: { 'x-sor7ed-ts': timestamp, 'x-sor7ed-id': id, 'x-sor7ed-signature': valid ? relaySignature(secret, 'resource', timestamp, id, raw) : 'invalid' } })
  }
  try {
    assert.equal((await POST(request(undefined, false))).status, 401)
    assert.equal(state.reads, 0)
    state.published = false
    assert.equal((await POST(request())).status, 404)
    assert.equal(state.reads, 0)
    state.published = true
    const response = await POST(request()), value = await response.json()
    assert.equal(value.url, 'https://gamma.app/embed/exact-protocol')
    assert.equal(value.openUrl, value.url)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
    state.gamma = 'https://untrusted.example/protocol'
    assert.equal((await POST(request())).status, 409)
    const native = await (await POST(request({ slug: 'brain-dump-sorter', context: 'tool' }))).json()
    assert.equal(new URL(native.url).origin, 'https://www.sor7ed.com')
    assert.equal(new URL(native.url).searchParams.has('access'), false)
    assert.equal(grants.verifyToolGrant(secret, 'brain-dump-sorter', new URL(native.openUrl).searchParams.get('access')), true)
    state.failure = true
    assert.equal((await POST(request())).status, 503)
  } finally { if (previous === undefined) delete process.env.BUTTON_RELAY_SECRET; else process.env.BUTTON_RELAY_SECRET = previous }
})
test('popup accepts only its own Button-origin, action-matched provider feedback', async () => {
  const originalWindow = globalThis.window, originalLocation = globalThis.location
  let receive
  const popup = { closed: false }
  globalThis.location = { origin: 'https://www.planetsorted.com' }
  globalThis.window = {
    open: () => popup,
    addEventListener: (_type, callback) => { receive = callback },
    removeEventListener: () => {},
  }
  try {
    const { requestButtonResource } = load('./popup.ts', {})
    let completed = false
    const actionId = 'resource-action-12345'
    const pending = requestButtonResource('useful-protocol', 'article', actionId).then(value => { completed = true; return value })
    const value = { source: 'sor7ed-widget', type: 'saved', flowId: actionId, deliveryStatus: 'accepted' }
    receive({ origin: 'https://evil.example', source: popup, data: value })
    receive({ origin: 'https://www.sor7ed.com', source: {}, data: value })
    receive({ origin: 'https://www.sor7ed.com', source: popup, data: { ...value, flowId: 'another-action' } })
    receive({ origin: 'https://www.sor7ed.com', source: popup, data: { ...value, deliveryStatus: 'pending' } })
    await Promise.resolve()
    assert.equal(completed, false)
    receive({ origin: 'https://www.sor7ed.com', source: popup, data: value })
    assert.equal((await pending).deliveryStatus, 'accepted')
  } finally { globalThis.window = originalWindow; globalThis.location = originalLocation }
})

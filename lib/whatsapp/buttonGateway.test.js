import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import { relaySignature, verifyRelay, buttonCommand } from './buttonRelayAuth.ts'
import { createHmac } from 'node:crypto'
import { verifyMetaSignature } from '../crypto/tokens.ts'
import { detectCrisis, CRISIS_RESPONSE } from './crisis.ts'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const secret = 'test-bridge-secret-not-a-production-key'
const id = '11111111-1111-4111-8111-111111111111'
const message = { messaging_product: 'whatsapp', to: '447000000000', type: 'text', text: { body: 'A useful page', preview_url: true } }

function fixture() {
  const rows = new Map()
  let sends = 0
  const client = { from: () => ({
    async insert(row) { if (rows.has(row.id)) return { error: { code: '23505' } }; rows.set(row.id, { ...row, status: 'pending' }); return {} },
    select() { return { eq: (_, key) => ({ single: async () => ({ data: rows.get(key) }) }), lt: () => ({ limit: async () => ({ data: [] }) }) } },
    update(values) { return { eq: async (_, key) => { Object.assign(rows.get(key), values); return {} } } },
  }) }
  const filename = fileURLToPath(new URL('../../app/api/button/whatsapp/route.ts', import.meta.url))
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const mod = new Module(filename); mod.filename = filename
  mod.require = name => name === '@supabase/supabase-js' ? { createClient: () => client } : name === '@/lib/whatsapp/buttonRelayAuth' ? { verifyRelay } : require(name)
  mod._compile(compiled, filename)
  return { post: mod.exports.POST, rows, get sends() { return sends }, fetch: async () => { sends++; return Response.json({ messages: [{ id: 'wamid.fixture' }] }) } }
}
function request(payload = message, overrides = {}) {
  const body = JSON.stringify(payload), timestamp = String(Date.now())
  return new Request('https://www.planetsorted.com/api/button/whatsapp', { method: 'POST', body, headers: { 'x-sor7ed-ts': timestamp, 'x-sor7ed-id': id, 'x-sor7ed-signature': relaySignature(secret, 'outbound', timestamp, id, body), ...overrides } })
}

test('relay HMAC binds purpose, time, action and exact body', () => {
  const time = String(Date.now()), sig = relaySignature(secret, 'outbound', time, id, '{}')
  assert.ok(verifyRelay(secret, 'outbound', time, id, '{}', sig))
  for (const args of [['inbound', time, id, '{}', sig], ['outbound', time, id, '{ }', sig], ['outbound', time, id + 'x', '{}', sig], ['outbound', String(Number(time) - 600_000), id, '{}', sig]]) assert.equal(verifyRelay(secret, ...args), false)
  assert.equal(verifyRelay(undefined, 'outbound', time, id, '{}', sig), false)
  assert.ok(buttonCommand('SIGNIN-' + 'A'.repeat(48)))
  assert.ok(buttonCommand('BUTTON-CONNECT-token'))
  assert.equal(buttonCommand('CONNECT-website-token'), false)
  assert.equal(buttonCommand('STOP'), false)
})

test('gateway authenticates, isolates sends and replays receipts without sending twice', async () => {
  const old = { ...process.env }, fetch = globalThis.fetch
  Object.assign(process.env, { BUTTON_RELAY_SECRET: secret, META_WHATSAPP_TOKEN: 'meta-test-secret', META_PHONE_NUMBER_ID: 'fixture-phone-id', NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'fixture-service-key' })
  try {
    const f = fixture(); globalThis.fetch = f.fetch
    assert.equal((await f.post(request(message, { 'x-sor7ed-signature': 'invalid' }))).status, 401)
    assert.equal((await f.post(request({ ...message, type: 'template' }))).status, 400)
    assert.equal(f.sends, 0)
    const results = await Promise.all([f.post(request()), f.post(request())])
    assert.ok(results.some(r => r.status === 200)); assert.equal(f.sends, 1)
    const repeated = await f.post(request()); assert.equal(repeated.status, 200); assert.equal((await repeated.json()).messages[0].id, 'wamid.fixture'); assert.equal(f.sends, 1)
    assert.equal((await f.post(request({ ...message, text: { body: 'Changed' } }))).status, 409)
    assert.equal(f.sends, 1)
    const unknown = fixture(); let attempts = 0; globalThis.fetch = async () => { attempts++; throw new Error('Timeout after a possible send') }
    assert.equal((await unknown.post(request())).status, 502); assert.equal((await unknown.post(request())).status, 502); assert.equal(attempts, 1)
    const denied = fixture(); attempts = 0; globalThis.fetch = async () => { attempts++; return Response.json({ error: { message: 'private provider detail' } }, { status: 400 }) }
    assert.equal((await denied.post(request())).status, 400); const again = await denied.post(request()); assert.equal(again.status, 400); assert.equal(attempts, 1); assert.ok(!JSON.stringify(await again.json()).includes('private provider detail'))
  } finally { globalThis.fetch = fetch; for (const key of Object.keys(process.env)) if (!(key in old)) delete process.env[key]; Object.assign(process.env, old) }
})

test('existing webhook verifies Meta first, keeps crisis first, and sends one consent acknowledgement', async () => {
  const previous = process.env.META_APP_SECRET
  process.env.META_APP_SECRET = 'fixture-meta-app-secret'
  const tasks = [], forwards = [], sends = [], updates = []
  const filename = fileURLToPath(new URL('../../app/api/whatsapp/webhook/route.ts', import.meta.url))
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const mod = new Module(filename); mod.filename = filename
  mod.require = name => {
    if (name === 'next/server') return { ...require(name), after: fn => tasks.push(fn) }
    if (name === '@/lib/siteUrl') return { websiteSiteUrl: () => 'https://www.planetsorted.com' }
    if (name === '@/lib/crypto/tokens') return { verifyMetaSignature }
    if (name === '@/lib/whatsapp/crisis') return { detectCrisis, CRISIS_RESPONSE }
    if (name === '@/lib/whatsapp/send') return { sendWhatsAppMessage: async (...args) => sends.push(args) }
    if (name === '@/lib/whatsapp/buttonRelay') return { buttonRelayConfigured: () => true, forwardButtonMessage: async m => forwards.push(m) }
    if (name === '@/lib/whatsapp/buttonRelayAuth') return { buttonCommand }
    if (name === '@supabase/supabase-js') return { createClient: () => ({ from: () => ({ update: values => ({ eq: async () => { updates.push(values); return {} } }) }) }) }
    return require(name)
  }
  mod._compile(compiled, filename)
  const post = (text, valid = true) => {
    const raw = JSON.stringify({ object: 'whatsapp_business_account', entry: [{ changes: [{ value: { messages: [{ id: 'wamid.fixture', from: '447000000000', type: 'text', text: { body: text } }] } }] }] })
    return mod.exports.POST(new Request('https://www.planetsorted.com/api/whatsapp/webhook', { method: 'POST', body: raw, headers: { 'x-hub-signature-256': valid ? 'sha256=' + createHmac('sha256', 'fixture-meta-app-secret').update(raw).digest('hex') : 'invalid' } }))
  }
  try {
    assert.equal((await post('SIGNIN-' + 'A'.repeat(48), false)).status, 401); assert.equal(tasks.length, 0)
    assert.equal((await (await post('SIGNIN-' + 'A'.repeat(48))).json()).status, 'button'); assert.equal(sends.length, 0); await tasks.shift()(); assert.equal(forwards.length, 1)
    await post('STOP'); assert.equal(sends.length, 1); assert.deepEqual(updates[0], { whatsapp_opted_out: true }); await tasks.shift()(); assert.equal(forwards.length, 2)
    await post('I am going to kill myself'); assert.equal(sends.at(-1)[1], CRISIS_RESPONSE); assert.equal(tasks.length, 0)
  } finally { if (previous === undefined) delete process.env.META_APP_SECRET; else process.env.META_APP_SECRET = previous }
})

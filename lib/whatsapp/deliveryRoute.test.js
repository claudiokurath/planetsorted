import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import * as send from './send.ts'
import * as actions from './deliveryActions.ts'
import { splitIntoChunks } from './splitIntoChunks.ts'
import { ogImageForContent } from '../og/imageUrl.ts'
import { websiteSiteUrl } from '../siteUrl.js'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const { NextRequest, NextResponse } = require('next/server')
const user = { id: '11111111-1111-4111-8111-111111111111' }
const actionId = '22222222-2222-4222-8222-222222222222'
const otherUser = '33333333-3333-4333-8333-333333333333'
const content = {
  title: 'A useful resource', summary: 'Useful summary', excerpt: 'A preview',
  cover_image: 'https://planetsorted.com/images/resource.webp', protocol: 'One clear next step.',
  audio_url: 'https://planetsorted.com/audio/resource.mp3', slug: 'useful-resource', type: 'Tool', category: 'Mind',
}
const connected = { whatsapp_number: '447000000000', whatsapp_verified: true, whatsapp_opted_out: false }

function loadRoute(auth) {
  const filename = fileURLToPath(new URL('../../app/api/save-to-phone/route.ts', import.meta.url))
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const routeModule = new Module(filename)
  routeModule.filename = filename
  routeModule.paths = Module._nodeModulePaths(fileURLToPath(new URL('../../', import.meta.url)))
  routeModule.require = (id) => {
    if (id === '@/lib/siteUrl') return { websiteSiteUrl }
    if (id === '@/lib/auth/requireUser') return { requireUser: async () => auth }
    if (id === '@/lib/whatsapp/send') return send
    if (id === '@/lib/whatsapp/deliveryActions') return actions
    if (id === '@/lib/whatsapp/splitIntoChunks') return { splitIntoChunks }
    if (id === '@/lib/og/imageUrl') return { ogImageForContent }
    return require(id)
  }
  routeModule._compile(compiled, filename)
  return routeModule.exports
}

function post(body = {}) {
  return new NextRequest('https://planetsorted.com/api/save-to-phone', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify({ slug: content.slug, idempotencyKey: actionId, ...body }),
  })
}
function get(query = `actionId=${actionId}`) {
  return new NextRequest(`https://planetsorted.com/api/save-to-phone?${query}`)
}

function adminFixture(options = {}) {
  const records = new Map()
  const calls = []
  let profileReads = 0
  const admin = {
    rpc: async (name, args) => {
      calls.push({ type: 'rpc', name, args })
      const key = `${args.p_user_id}:${args.p_action_key}`
      if (name === 'claim_whatsapp_delivery_action') {
        if (options.claimError) return { data: null, error: { message: options.claimError } }
        const previous = records.get(key)
        if (previous) {
          if (previous.hash !== args.p_hash) return { data: null, error: { message: 'whatsapp_action_conflict' } }
          return { data: [{ ...previous, created: false }], error: null }
        }
        const row = {
          created: true, hash: args.p_hash, delivery_status: 'pending', delivery_reason: null,
          updated_at: new Date().toISOString(), message_ids: [],
        }
        records.set(key, row)
        return { data: [row], error: null }
      }
      if (name === 'finish_whatsapp_delivery_action') {
        if (options.finishError) return { data: null, error: { message: 'private storage details' } }
        const row = records.get(key)
        if (!row) return { data: false, error: null }
        Object.assign(row, {
          delivery_status: args.p_status, delivery_reason: args.p_reason,
          updated_at: new Date().toISOString(), message_ids: args.p_message_ids,
        })
        return { data: true, error: null }
      }
      throw new Error(`Unexpected RPC ${name}`)
    },
    from: (table) => {
      const filters = []
      const query = {
        select(value) { calls.push({ type: 'select', table, value }); return query },
        eq(column, value) { filters.push([column, value]); return query },
        order() { return query },
        limit() { return query },
        async single() {
          calls.push({ type: 'read', table, filters })
          assert.equal(table, 'protocols')
          assert.deepEqual(filters, [['slug', content.slug], ['status', 'Published']])
          return { data: options.content === undefined ? content : options.content, error: options.contentError || null }
        },
        async maybeSingle() {
          calls.push({ type: 'read', table, filters })
          if (table === 'users') {
            profileReads++
            assert.deepEqual(filters, [['user_id', user.id]])
            return { data: options.profile === undefined ? connected : options.profile, error: options.profileError || null }
          }
          assert.equal(table, 'whatsapp_delivery_actions')
          const owner = filters.find(([column]) => column === 'user_id')?.[1]
          const id = filters.find(([column]) => column === 'action_key')?.[1]
          return { data: records.get(`${owner}:${id}`) || null, error: options.readError || null }
        },
      }
      return query
    },
  }
  return { admin, calls, records, profileReads: () => profileReads }
}

async function fixture(run) {
  const originalFetch = globalThis.fetch
  const originalWarn = console.warn
  const previous = Object.fromEntries(['META_PHONE_NUMBER_ID', 'META_WHATSAPP_TOKEN', 'WHATSAPP_CONTENT_CARD_TEMPLATE'].map((key) => [key, process.env[key]]))
  process.env.META_PHONE_NUMBER_ID = 'mock-phone'
  process.env.META_WHATSAPP_TOKEN = 'mock-token'
  delete process.env.WHATSAPP_CONTENT_CARD_TEMPLATE
  const requests = []
  const warnings = []
  console.warn = (...args) => warnings.push(JSON.stringify(args))
  let provider = () => { throw new Error('Unexpected network request') }
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body))
    return provider(requests.length)
  }
  try { await run({ requests, warnings, respond: (callback) => { provider = callback } }) }
  finally {
    globalThis.fetch = originalFetch
    console.warn = originalWarn
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}
const accepted = (id = 'wamid.accepted') => Response.json({ messages: [{ id }] })
const row = (status, reason = null, hash = actions.deliveryRequestHash(content.slug, true, false, false)) => ({
  hash, delivery_status: status, delivery_reason: reason, updated_at: new Date().toISOString(), message_ids: [],
})

test('delivery response marks only accepted receipts successful and expires stale pending', () => {
  for (const state of ['pending', 'accepted', 'failed', 'skipped', 'unknown']) {
    const result = actions.deliveryResponse(actionId, state, null, new Date().toISOString())
    assert.equal(result.success, state === 'accepted')
    assert.equal(result.saveStatus, 'saved')
  }
  assert.equal(actions.deliveryResponse(actionId, 'pending', null, new Date(Date.now() - 121_000).toISOString()).deliveryStatus, 'unknown')
  assert.equal(actions.deliveryResponse(actionId, 'pending', null, 'invalid').deliveryStatus, 'unknown')
  assert.equal(actions.deliveryResponse(actionId, 'unexpected', null, new Date().toISOString()).deliveryReason, 'unconfirmed')
  assert.notEqual(actions.deliveryRequestHash(content.slug, true, false, false), actions.deliveryRequestHash(content.slug, true, true, false))
  assert.equal(actions.isActionId('not-a-uuid'), false)
})

test('claim/finish helpers fail closed on malformed status and unconfirmed storage writes', async () => {
  const input = { userId: user.id, actionId, hash: 'digest', slug: content.slug, url: 'https://planetsorted.com/r/useful-resource', title: content.title, category: 'Mind' }
  for (const data of [null, [], [{ created: true, delivery_status: 'unexpected' }], [{ created: 'true', delivery_status: 'pending' }]]) {
    await assert.rejects(actions.claimDelivery({ rpc: async () => ({ data, error: null }) }, input))
  }
  await assert.rejects(actions.claimDelivery({ rpc: async () => ({ data: null, error: { message: 'whatsapp_action_conflict' } }) }, input), actions.DeliveryActionConflict)
  for (const data of [null, false]) {
    await assert.rejects(actions.finishDelivery({ rpc: async () => ({ data, error: null }) }, user.id, actionId, 'accepted', null, ['wamid.accepted']))
  }
})

test('GET and POST reject unauthenticated calls before all storage/provider operations', async () => fixture(async ({ requests }) => {
  const route = loadRoute({ user: null, error: NextResponse.json({ error: 'Please sign in' }, { status: 401 }) })
  assert.equal((await route.POST(post())).status, 401)
  assert.equal((await route.GET(get())).status, 401)
  assert.equal(requests.length, 0)
}))

test('POST validates body, slug and action key before reading storage', async () => fixture(async ({ requests }) => {
  const db = adminFixture()
  const route = loadRoute({ user, admin: db.admin })
  for (const body of ['{broken', 'null', '[]', { slug: '' }, { slug: '../private' }, { idempotencyKey: undefined }, { idempotencyKey: 'bad-key' }]) {
    assert.equal((await route.POST(post(body))).status, 400)
  }
  assert.equal(db.calls.length, 0)
  assert.equal(requests.length, 0)
}))

test('POST accepts only a provider receipt and stores one owned action with exact message ID', async () => fixture(async ({ requests, respond }) => {
  const db = adminFixture()
  const route = loadRoute({ user, admin: db.admin })
  respond(() => accepted('wamid.resource'))
  const response = await route.POST(post({ userId: otherUser, whatsappNumber: 'attacker-phone' }))
  const result = await response.json()
  assert.equal(response.status, 201)
  assert.match(response.headers.get('cache-control'), /private.*no-store/)
  assert.equal(result.success, true)
  assert.equal(result.deliveryStatus, 'accepted')
  assert.equal(result.saveStatus, 'saved')
  assert.equal(result.actionId, actionId)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].to, connected.whatsapp_number)
  const rpc = db.calls.filter((call) => call.type === 'rpc')
  assert.equal(rpc.length, 2)
  assert.equal(rpc[0].args.p_user_id, user.id)
  assert.equal(rpc[0].args.p_action_key, actionId)
  assert.equal(rpc[0].args.p_hash, actions.deliveryRequestHash(content.slug, true, false, false))
  assert.deepEqual(rpc[1].args.p_message_ids, ['wamid.resource'])
}))

test('concurrent replay of the same action creates exactly one provider send', async () => fixture(async ({ requests, respond }) => {
  const db = adminFixture()
  const route = loadRoute({ user, admin: db.admin })
  respond(() => accepted())
  const responses = await Promise.all([route.POST(post()), route.POST(post())])
  assert.deepEqual(responses.map((response) => response.status).sort(), [200, 201])
  assert.equal(requests.length, 1)
  assert.equal(db.profileReads(), 1)
  assert.equal(db.calls.filter((call) => call.name === 'finish_whatsapp_delivery_action').length, 1)
}))

test('replayed accepted/failed/skipped/unknown/pending actions never resend or reread profile', async () => fixture(async ({ requests }) => {
  for (const state of ['accepted', 'failed', 'skipped', 'unknown', 'pending']) {
    const db = adminFixture()
    db.records.set(`${user.id}:${actionId}`, row(state))
    const result = await (await loadRoute({ user, admin: db.admin }).POST(post())).json()
    assert.equal(result.deliveryStatus, state)
    assert.equal(result.success, state === 'accepted')
    assert.equal(db.profileReads(), 0)
    assert.equal(db.calls.some((call) => call.name === 'finish_whatsapp_delivery_action'), false)
  }
  assert.equal(requests.length, 0)
}))

test('unconnected or opted-out profiles save the item but skip all provider sending', async () => fixture(async ({ requests }) => {
  for (const [profile, reason] of [[null, 'not_connected'], [{ ...connected, whatsapp_verified: false }, 'not_connected'], [{ ...connected, whatsapp_opted_out: true }, 'opted_out']]) {
    const db = adminFixture({ profile })
    const result = await (await loadRoute({ user, admin: db.admin }).POST(post())).json()
    assert.equal(result.success, false)
    assert.equal(result.saveStatus, 'saved')
    assert.equal(result.deliveryStatus, 'skipped')
    assert.equal(result.deliveryReason, reason)
    assert.equal(db.records.get(`${user.id}:${actionId}`).delivery_status, 'skipped')
  }
  assert.equal(requests.length, 0)
}))

test('definite failed sends and uncertain provider outcomes never become successful', async () => {
  for (const [provider, state, reason] of [
    [() => Response.json({ error: { message: 'private rejection detail' } }, { status: 403 }), 'failed', 'send_failed'],
    [() => Response.json({ error: {} }, { status: 429 }), 'failed', 'send_failed'],
    [() => Response.json({ error: {} }, { status: 500 }), 'unknown', 'unconfirmed'],
    [() => Response.json({ success: true }), 'unknown', 'unconfirmed'],
    [() => { throw new Error('private network detail') }, 'unknown', 'unconfirmed'],
  ]) {
    await fixture(async ({ requests, warnings, respond }) => {
      respond(provider)
      const db = adminFixture()
      const route = loadRoute({ user, admin: db.admin })
      const result = await (await route.POST(post())).json()
      assert.equal(result.success, false)
      assert.equal(result.deliveryStatus, state)
      assert.equal(result.deliveryReason, reason)
      assert.equal(requests.length, 1)
      assert.deepEqual(db.records.get(`${user.id}:${actionId}`).message_ids, [])
      await route.POST(post())
      assert.equal(requests.length, 1)
      assert.equal(warnings.join(' ').includes('private'), false)
    })
  }
})

test('accepted link followed by failed protocol is partial/unknown with no resend', async () => fixture(async ({ requests, respond }) => {
  respond((index) => index === 1 ? accepted('wamid.link') : Response.json({ error: {} }, { status: 403 }))
  const db = adminFixture()
  const route = loadRoute({ user, admin: db.admin })
  const request = { includeProtocol: true }
  const result = await (await route.POST(post(request))).json()
  assert.equal(result.success, false)
  assert.equal(result.deliveryStatus, 'unknown')
  assert.equal(result.deliveryReason, 'partial_send')
  assert.deepEqual(db.records.get(`${user.id}:${actionId}`).message_ids, ['wamid.link'])
  assert.deepEqual(requests.map((request) => request.type), ['template', 'text'])
  await route.POST(post(request))
  assert.equal(requests.length, 2)
}))

test('protocol chunks and audio retain all receipt IDs only after every selected message is accepted', async () => fixture(async ({ requests, respond }) => {
  const db = adminFixture({ content: { ...content, protocol: 'A'.repeat(7000) } })
  respond((index) => accepted(`wamid.chunk-${index}`))
  const result = await (await loadRoute({ user, admin: db.admin }).POST(post({ includeLink: false, includeProtocol: true, includeAudio: true }))).json()
  assert.equal(result.success, true)
  assert.deepEqual(requests.map((request) => request.type), ['text', 'text', 'text', 'audio'])
  for (const request of requests.filter((request) => request.type === 'text')) assert.equal(request.text.body.length <= 3500, true)
  assert.deepEqual(db.records.get(`${user.id}:${actionId}`).message_ids, ['wamid.chunk-1', 'wamid.chunk-2', 'wamid.chunk-3', 'wamid.chunk-4'])
}))

test('a different payload with the same action key returns conflict without another send', async () => fixture(async ({ requests, respond }) => {
  const db = adminFixture()
  const route = loadRoute({ user, admin: db.admin })
  respond(() => accepted())
  assert.equal((await route.POST(post())).status, 201)
  const conflict = await route.POST(post({ includeProtocol: true }))
  assert.equal(conflict.status, 409)
  assert.equal(requests.length, 1)
}))

test('finish storage failure preserves acceptance and replay cannot authorise a second send', async () => fixture(async ({ requests, respond }) => {
  const db = adminFixture({ finishError: true })
  const route = loadRoute({ user, admin: db.admin })
  respond(() => accepted())
  const response = await route.POST(post())
  assert.equal(response.status, 201)
  assert.equal((await response.json()).deliveryStatus, 'accepted')
  assert.equal(db.records.get(`${user.id}:${actionId}`).delivery_status, 'pending')
  const replay = await (await route.POST(post())).json()
  assert.equal(replay.deliveryStatus, 'pending')
  assert.equal(replay.success, false)
  assert.equal(requests.length, 1)
  db.records.get(`${user.id}:${actionId}`).updated_at = new Date(Date.now() - 121_000).toISOString()
  assert.equal((await (await route.GET(get())).json()).deliveryStatus, 'unknown')
}))

test('GET reads only the authenticated owner and ignores caller-supplied user identity', async () => fixture(async ({ requests }) => {
  const db = adminFixture()
  db.records.set(`${otherUser}:${actionId}`, row('accepted'))
  const route = loadRoute({ user, admin: db.admin })
  const hidden = await route.GET(get(`actionId=${actionId}&userId=${otherUser}`))
  assert.equal(hidden.status, 404)
  db.records.set(`${user.id}:${actionId}`, row('failed', 'send_failed'))
  const response = await route.GET(get(`actionId=${actionId}&userId=${otherUser}`))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).deliveryStatus, 'failed')
  assert.match(response.headers.get('cache-control'), /private.*no-store/)
  assert.equal(requests.length, 0)
  for (const read of db.calls.filter((call) => call.type === 'read')) {
    assert.deepEqual(read.filters, [['user_id', user.id], ['action_key', actionId]])
  }
}))

test('GET validates identifiers and shows a plain retry state when storage fails', async () => fixture(async () => {
  const db = adminFixture({ readError: { message: 'private read details' } })
  const route = loadRoute({ user, admin: db.admin })
  assert.equal((await route.GET(get('actionId=invalid'))).status, 400)
  const response = await route.GET(get())
  assert.equal(response.status, 503)
  assert.equal(JSON.stringify(await response.json()).includes('private read'), false)
}))

test('missing/unpublished content, empty selections and claim failures do not send', async () => fixture(async ({ requests }) => {
  for (const [options, request, status] of [
    [{ content: null }, {}, 404],
    [{ contentError: { message: 'private content read detail' } }, {}, 404],
    [{}, { includeLink: false }, 400],
    [{ content: { ...content, protocol: null, audio_url: null } }, { includeLink: false, includeProtocol: true, includeAudio: true }, 400],
    [{ claimError: 'private database credential' }, {}, 503],
  ]) {
    const db = adminFixture(options)
    const response = await loadRoute({ user, admin: db.admin }).POST(post(request))
    assert.equal(response.status, status)
    assert.equal(JSON.stringify(await response.json()).includes('private'), false)
  }
  assert.equal(requests.length, 0)
}))

test('a failed profile read is a safe pre-send failure rather than pretending the user is disconnected', async () => fixture(async ({ requests }) => {
  const db = adminFixture({ profileError: { message: 'profile read unavailable' } })
  const result = await (await loadRoute({ user, admin: db.admin }).POST(post())).json()
  assert.equal(result.deliveryStatus, 'failed')
  assert.equal(result.deliveryReason, 'profile_unavailable')
  assert.equal(result.success, false)
  assert.equal(requests.length, 0)
}))

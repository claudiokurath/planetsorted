import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import * as send from '../whatsapp/send.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const { NextRequest, NextResponse } = require('next/server')
const user = { id: '11111111-1111-4111-8111-111111111111' }
const connected = { whatsapp_number: '447000123456', whatsapp_verified: true, whatsapp_opted_out: false }
const task = 'Private task: deal with my overdue medical paperwork'
const context = 'Private context: my appointment reference is 93741'
const result = 'First step: Put the letter on the table.\n\nThen, if you\'re ready: Find a pen.'
const openaiUrl = 'https://api.openai.com/v1/chat/completions'
const metaUrl = 'https://graph.facebook.com/v23.0/fixture-phone/messages'
const privateValues = [
  task, context, result, connected.whatsapp_number, user.id,
  'fixture-openai-secret', 'fixture-meta-secret', 'private database detail',
  'private provider detail', 'private network detail', 'private sender detail',
]

function loadRoute(auth, sender = send) {
  const filename = fileURLToPath(new URL('../../app/api/tools/task-breakdown/route.ts', import.meta.url))
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const routeModule = new Module(filename)
  routeModule.filename = filename
  routeModule.paths = Module._nodeModulePaths(fileURLToPath(new URL('../../', import.meta.url)))
  routeModule.require = (id) => {
    if (id === '@/lib/auth/requireUser') return { requireUser: async () => auth }
    if (id === '@/lib/whatsapp/send') return sender
    if (id === '@/lib/supabase/server') {
      throw new Error('The route must use the authenticated admin client')
    }
    return require(id)
  }
  routeModule._compile(compiled, filename)
  return routeModule.exports
}

function post(body = { task, context }, raw = false) {
  return new NextRequest('https://planetsorted.com/api/tools/task-breakdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ? body : JSON.stringify(body),
  })
}

function adminFixture(options = {}) {
  const calls = []
  const admin = {
    from(table) {
      calls.push(['from', table])
      assert.equal(table, 'users')
      if (options.throwFrom) throw new Error('private database detail')
      const query = {
        select(columns) {
          calls.push(['select', columns])
          assert.equal(columns, 'whatsapp_number, whatsapp_verified, whatsapp_opted_out')
          return query
        },
        eq(column, value) {
          calls.push(['eq', column, value])
          assert.equal(column, 'user_id')
          assert.equal(value, user.id)
          return query
        },
        async maybeSingle() {
          calls.push(['maybeSingle'])
          if (options.throwRead) throw new Error('private database detail')
          return {
            data: Object.hasOwn(options, 'profile') ? options.profile : connected,
            error: options.error || null,
          }
        },
      }
      return query
    },
  }
  return { admin, calls }
}

const generated = (content = result) => Response.json({ choices: [{ message: { content } }] })
const accepted = () => Response.json({ messages: [{ id: 'wamid.fixture-accepted' }] })

async function fixture(run, options = {}) {
  const previousFetch = globalThis.fetch
  const previousTimeout = AbortSignal.timeout
  const previousLogs = Object.fromEntries(['error', 'warn', 'log', 'info', 'debug'].map((method) => [method, console[method]]))
  const envKeys = ['OPENAI_API_KEY', 'META_PHONE_NUMBER_ID', 'META_WHATSAPP_TOKEN', 'META_GRAPH_API_VERSION']
  const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))
  if (options.noOpenaiKey) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = 'fixture-openai-secret'
  process.env.META_PHONE_NUMBER_ID = 'fixture-phone'
  process.env.META_WHATSAPP_TOKEN = 'fixture-meta-secret'
  delete process.env.META_GRAPH_API_VERSION

  const requests = []
  const logs = []
  const timeouts = []
  const controllers = []
  let openai = () => generated()
  let meta = () => accepted()
  for (const method of Object.keys(previousLogs)) {
    console[method] = (...args) => logs.push(args.map((arg) => arg instanceof Error ? `${arg.message} ${arg.stack}` : JSON.stringify(arg)).join(' '))
  }
  AbortSignal.timeout = (milliseconds) => {
    timeouts.push(milliseconds)
    const controller = new AbortController()
    controllers.push(controller)
    return controller.signal
  }
  globalThis.fetch = async (url, init) => {
    const request = { url: String(url), init, body: JSON.parse(init.body) }
    requests.push(request)
    if (request.url === openaiUrl) return openai(request)
    if (request.url === metaUrl) return meta(request)
    throw new Error('Unexpected network destination')
  }

  try {
    await run({
      requests, logs, timeouts, controllers,
      openaiRespond: (callback) => { openai = callback },
      metaRespond: (callback) => { meta = callback },
    })
    for (const value of privateValues) assert.equal(logs.join('\n').includes(value), false, `Logs exposed ${value}`)
  } finally {
    globalThis.fetch = previousFetch
    AbortSignal.timeout = previousTimeout
    for (const [method, logger] of Object.entries(previousLogs)) console[method] = logger
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

async function assertError(response, status, code) {
  assert.equal(response.status, status)
  const body = await response.json()
  if (code) assert.equal(body.error, code)
  assert.equal(typeof (body.message || body.error), 'string')
  assert.ok((body.message || body.error).trim())
  if (code) assert.ok(body.message?.trim(), 'Coded errors need a plain-English message')
  for (const value of privateValues) assert.equal(JSON.stringify(body).includes(value), false)
  return body
}

test('unauthenticated requests return 401 before parsing, storage, generation or sending', async () => fixture(async ({ requests }) => {
  const db = adminFixture()
  const route = loadRoute({ user: null, admin: db.admin, error: NextResponse.json({ error: 'Please sign in.' }, { status: 401 }) })
  await assertError(await route.POST(post('{broken', true)), 401)
  assert.equal(db.calls.length, 0)
  assert.equal(requests.length, 0)
}))

test('only object bodies with bounded string task/context reach storage', async () => fixture(async ({ requests }) => {
  const db = adminFixture()
  const route = loadRoute({ user, admin: db.admin })
  for (const body of [
    null, [], 'a string', 42, true, {},
    { task: '' }, { task: ' \n\t ' }, { task: null }, { task: 42 }, { task: false }, { task: {} }, { task: [] },
    { task: 'x'.repeat(2001) }, { task, context: 'x'.repeat(2001) },
    { task: ` ${'x'.repeat(2000)} ` }, { task, context: ` ${'x'.repeat(2000)} ` },
    ...[null, 42, true, {}, []].map((invalid) => ({ task, context: invalid })),
  ]) {
    await assertError(await route.POST(post(body)), 400)
  }
  await assertError(await route.POST(post('{broken', true)), 400)
  assert.equal(db.calls.length, 0)
  assert.equal(requests.length, 0)
}))

test('valid input is trimmed, bounded inclusively, and always uses the authenticated phone', async () => fixture(async ({ requests, timeouts, controllers }) => {
  const db = adminFixture()
  const route = loadRoute({ user, admin: db.admin })
  for (const [taskInput, contextInput] of [[' x ', undefined], ['t'.repeat(2000), 'c'.repeat(2000)], [` ${task} `, ` ${context} `]]) {
    const response = await route.POST(post({ task: taskInput, context: contextInput, userId: 'another-user', whatsappNumber: 'attacker-phone' }))
    assert.equal(response.status, 200)
    assert.match(response.headers.get('cache-control'), /private.*no-store/)
    assert.deepEqual(await response.json(), { result, whatsapp: true, deliveryStatus: 'accepted' })
    const [ai, whatsapp] = requests.slice(-2)
    assert.equal(ai.url, openaiUrl)
    assert.equal(ai.init.method, 'POST')
    assert.equal(ai.body.model, 'gpt-4o-mini')
    assert.equal(ai.body.messages.find((message) => message.role === 'user').content, contextInput === undefined ? `Task: ${taskInput.trim()}` : `Task: ${taskInput.trim()}\nContext: ${contextInput.trim()}`)
    assert.equal(whatsapp.body.to, connected.whatsapp_number)
    assert.equal(whatsapp.body.type, 'text')
    assert.ok(whatsapp.body.text.body.includes(result))
    assert.equal(whatsapp.body.text.body.includes('attacker-phone'), false)
    assert.ok(ai.init.signal instanceof AbortSignal)
    assert.equal(ai.init.signal.aborted, false)
  }
  assert.deepEqual(timeouts, [20_000, 15_000, 20_000, 15_000, 20_000, 15_000])
  controllers[0].abort()
  assert.equal(requests[0].init.signal.aborted, true)
  assert.equal(db.calls.filter(([method]) => method === 'maybeSingle').length, 3)
}))

test('missing or unverified WhatsApp profiles stop before generation and sending', async () => fixture(async ({ requests }) => {
  for (const profile of [
    null,
    ...[null, '', 'not-a-phone', '123456789', '1'.repeat(16)].map((number) => ({ ...connected, whatsapp_number: number })),
    ...[false, null, undefined, 'true', 1].map((value) => ({ ...connected, whatsapp_verified: value })),
  ]) {
    const db = adminFixture({ profile })
    await assertError(await loadRoute({ user, admin: db.admin }).POST(post()), 422, 'no_whatsapp')
    assert.equal(db.calls.filter(([method]) => method === 'maybeSingle').length, 1)
  }
  assert.equal(requests.length, 0)
}))

test('generation and sending require explicit active WhatsApp consent', async () => fixture(async ({ requests }) => {
  for (const value of [true, null, undefined, 'true', 'false', 0, 1]) {
    const db = adminFixture({ profile: { ...connected, whatsapp_opted_out: value } })
    await assertError(await loadRoute({ user, admin: db.admin }).POST(post()), 403, 'whatsapp_opted_out')
  }
  assert.equal(requests.length, 0)
  const permitted = adminFixture({ profile: { ...connected, whatsapp_opted_out: false } })
  assert.equal((await loadRoute({ user, admin: permitted.admin }).POST(post())).status, 200)
  assert.equal(requests.length, 2)
}))

test('profile errors and thrown reads return 503 without contacting either provider', async () => fixture(async ({ requests }) => {
  for (const options of [{ error: { message: 'private database detail', code: 'PGRST_PRIVATE' } }, { throwRead: true }, { throwFrom: true }]) {
    const db = adminFixture(options)
    const body = await assertError(await loadRoute({ user, admin: db.admin }).POST(post()), 503)
    assert.equal(JSON.stringify(body).includes('PGRST_PRIVATE'), false)
  }
  assert.equal(requests.length, 0)
}))

test('missing OpenAI configuration returns a plain unavailable response without providers', async () => fixture(async ({ requests }) => {
  const db = adminFixture()
  await assertError(await loadRoute({ user, admin: db.admin }).POST(post()), 503, 'service_unavailable')
  process.env.OPENAI_API_KEY = ' \n '
  await assertError(await loadRoute({ user, admin: db.admin }).POST(post()), 503, 'service_unavailable')
  assert.equal(requests.length, 0)
}, { noOpenaiKey: true }))

test('OpenAI rejections, invalid JSON and invalid results return 502 without WhatsApp', async () => {
  for (const provider of [
    ...[400, 429, 500, 503].map((status) => () => new Response('private provider detail', { status })),
    () => new Response('{private provider detail', { status: 200 }),
    () => Response.json(null), () => Response.json({}),
    ...[null, 42, {}, [], '', ' \n\t ', 'x'.repeat(3501)].map((content) => () => generated(content)),
  ]) {
    await fixture(async ({ requests, openaiRespond }) => {
      openaiRespond(provider)
      const db = adminFixture()
      await assertError(await loadRoute({ user, admin: db.admin }).POST(post()), 502)
      assert.equal(requests.length, 1)
      assert.equal(requests[0].url, openaiUrl)
    })
  }
})

test('generation network failures and aborts return 502 without logging private errors', async () => {
  for (const abort of [false, true]) {
    await fixture(async ({ requests, openaiRespond, controllers, timeouts }) => {
      openaiRespond(() => {
        if (abort) controllers[0].abort()
        throw new Error('private network detail')
      })
      const db = adminFixture()
      await assertError(await loadRoute({ user, admin: db.admin }).POST(post()), 502)
      assert.equal(requests.length, 1)
      assert.deepEqual(timeouts, [20_000])
      assert.equal(requests[0].init.signal.aborted, abort)
    })
  }
})

test('generation trims usable text and accepts the 3500-character result boundary', async () => fixture(async ({ requests, openaiRespond }) => {
  for (const text of [result, 'x'.repeat(3500)]) {
    openaiRespond(() => generated(` \n${text}\n `))
    const db = adminFixture()
    const response = await loadRoute({ user, admin: db.admin }).POST(post())
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { result: text, whatsapp: true, deliveryStatus: 'accepted' })
    assert.ok(requests.at(-1).body.text.body.includes(text))
  }
}))

test('real WhatsApp sender preserves generated text for failed and uncertain deliveries', async () => {
  for (const [provider, deliveryStatus] of [
    [() => new Response('private provider detail', { status: 403 }), 'failed'],
    [() => new Response('private provider detail', { status: 429 }), 'failed'],
    [() => new Response('private provider detail', { status: 408 }), 'unknown'],
    [() => new Response('private provider detail', { status: 500 }), 'unknown'],
    [() => { throw new Error('private network detail') }, 'unknown'],
    [() => new Response('{private provider detail'), 'unknown'],
    ...[{}, { messages: [] }, { messages: [{ id: '' }] }, { messages: [{ id: '   ' }] }, { messages: [{ id: 17 }] }, { messages: [{ id: 'one' }, { id: 'two' }] }].map((body) => [() => Response.json(body), 'unknown']),
  ]) {
    await fixture(async ({ requests, metaRespond }) => {
      metaRespond(provider)
      const db = adminFixture()
      const response = await loadRoute({ user, admin: db.admin }).POST(post())
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), { result, whatsapp: false, deliveryStatus })
      assert.deepEqual(requests.map((request) => request.url), [openaiUrl, metaUrl])
    })
  }
})

test('malformed sender receipts never report WhatsApp acceptance', async () => fixture(async ({ requests }) => {
  for (const receipt of [undefined, null, {}, [], 'wamid.raw', { kind: 'text' }, { kind: 'text', messageId: '' }, { kind: 'text', messageId: '   ' }, { kind: 'text', messageId: 17 }, { kind: 'template', messageId: 'wamid.wrong-kind' }, { messageId: 'wamid.missing-kind' }]) {
    const db = adminFixture()
    const sender = { ...send, sendWhatsAppMessage: async () => receipt }
    const response = await loadRoute({ user, admin: db.admin }, sender).POST(post())
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { result, whatsapp: false, deliveryStatus: 'unknown' })
  }
  assert.equal(requests.every((request) => request.url === openaiUrl), true)
}))

test('sender error classification trusts only definite WhatsAppSendError failures', async () => fixture(async ({ requests }) => {
  for (const [error, deliveryStatus] of [
    [new send.WhatsAppSendError('private sender detail', 403, 'private provider detail', 'failed'), 'failed'],
    [new send.WhatsAppSendError('private sender detail', 403, 'private provider detail', 'unknown'), 'unknown'],
    [new Error('private sender detail'), 'unknown'],
    [{ outcome: 'failed', message: 'private sender detail' }, 'unknown'],
    [null, 'unknown'],
  ]) {
    const db = adminFixture()
    const sender = { ...send, sendWhatsAppMessage: async () => { throw error } }
    const response = await loadRoute({ user, admin: db.admin }, sender).POST(post())
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { result, whatsapp: false, deliveryStatus })
  }
  assert.equal(requests.every((request) => request.url === openaiUrl), true)
}))

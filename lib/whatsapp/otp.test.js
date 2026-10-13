import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import { reserveOtpChallenge, verifyOtpChallenge, sendOtpCode } from './otp.ts'
import { generateOtp, hashOtp } from '../crypto/tokens.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const { NextRequest, NextResponse } = require('next/server')
const user = { id: 'account-one', email: 'member@example.test', user_metadata: { first_name: 'Member' } }
const expiresAt = '2030-10-13T10:10:00.000Z'

function loadRoute(path, auth, sync = () => {}) {
  const filename = fileURLToPath(new URL(path, import.meta.url))
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const routeModule = new Module(filename)
  routeModule.filename = filename
  routeModule.paths = Module._nodeModulePaths(fileURLToPath(new URL('../../', import.meta.url)))
  routeModule.require = (id) => {
    if (id === '@/lib/auth/requireUser') return { requireUser: async () => auth }
    if (id === '@/lib/crypto/tokens') return { generateOtp, hashOtp }
    if (id === '@/lib/whatsapp/otp') return { reserveOtpChallenge, verifyOtpChallenge, sendOtpCode }
    if (id === '@/lib/notion/syncCrmAccount') return { scheduleCrmSync: sync }
    return require(id)
  }
  routeModule._compile(compiled, filename)
  return routeModule.exports.POST
}

function post(body) {
  return new NextRequest('https://planetsorted.com/api/whatsapp/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

async function fixture(run) {
  const originals = {
    fetch: globalThis.fetch,
    error: console.error,
    phone: process.env.META_PHONE_NUMBER_ID,
    token: process.env.META_WHATSAPP_TOKEN,
    secret: process.env.APP_SIGNING_SECRET,
    connectSecret: process.env.CONNECT_TOKEN_SECRET,
  }
  process.env.META_PHONE_NUMBER_ID = 'mock-phone'
  process.env.META_WHATSAPP_TOKEN = 'mock-token'
  process.env.APP_SIGNING_SECRET = 'test-otp-secret'
  delete process.env.CONNECT_TOKEN_SECRET
  const logs = []
  console.error = (...args) => logs.push(args.join(' '))
  globalThis.fetch = async () => { throw new Error('Unexpected network request') }
  try { return await run(logs) }
  finally {
    globalThis.fetch = originals.fetch
    console.error = originals.error
    for (const [key, value] of [
      ['META_PHONE_NUMBER_ID', originals.phone],
      ['META_WHATSAPP_TOKEN', originals.token],
      ['APP_SIGNING_SECRET', originals.secret],
      ['CONNECT_TOKEN_SECRET', originals.connectSecret],
    ]) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

const providerConfig = {
  phoneNumberId: 'mock-phone', token: 'mock-token', templateName: 'sor7ed_auth', language: 'en_GB',
}

test('reservation passes only the authenticated owner and hash to the atomic RPC', async () => {
  const calls = []
  const client = { rpc: async (name, args) => {
    calls.push({ name, args })
    return { data: [{ outcome: 'reserved', expires_at: expiresAt }], error: null }
  } }
  assert.deepEqual(await reserveOtpChallenge(client, 'owner', '447000000000', 'digest'), {
    outcome: 'reserved', expiresAt,
  })
  assert.deepEqual(calls, [{ name: 'reserve_whatsapp_otp', args: {
    p_user_id: 'owner', p_phone: '447000000000', p_otp_hash: 'digest',
  } }])
})

test('reservation fails closed on errors, empty rows and unexpected outcomes', async () => {
  for (const response of [
    { data: null, error: { message: 'private database error' } },
    { data: [], error: null },
    { data: [{ outcome: 'reserved', expires_at: null }], error: null },
    { data: [{ outcome: 'reserved', expires_at: 'invalid' }], error: null },
    { data: [{ outcome: 'unknown' }], error: null },
    { data: [{ outcome: 'reserved', expires_at: expiresAt }, { outcome: 'limit' }], error: null },
  ]) {
    await assert.rejects(reserveOtpChallenge({ rpc: async () => response }, 'owner', '447000000000', 'digest'))
  }
  for (const outcome of ['cooldown', 'limit']) {
    assert.deepEqual(await reserveOtpChallenge({ rpc: async () => ({ data: [{ outcome }], error: null }) }, 'owner', '447000000000', 'digest'), { outcome })
  }
})

test('verification uses one RPC and rejects unknown or malformed database results', async () => {
  const calls = []
  const client = { rpc: async (name, args) => {
    calls.push({ name, args })
    return { data: [{ outcome: 'verified' }], error: null }
  } }
  assert.equal(await verifyOtpChallenge(client, 'owner', 'digest', 'Member', 'member@example.test'), 'verified')
  assert.deepEqual(calls, [{ name: 'verify_whatsapp_otp', args: {
    p_user_id: 'owner', p_otp_hash: 'digest', p_first_name: 'Member', p_email: 'member@example.test',
  } }])
  for (const response of [
    { data: [], error: null },
    { data: [{ outcome: 'mystery' }], error: null },
    { data: [{ outcome: 'verified' }], error: { message: 'database unavailable' } },
  ]) await assert.rejects(verifyOtpChallenge({ rpc: async () => response }, 'owner', 'digest', '', ''))
})

test('OTP sending preserves the approved template and requires a provider message ID', async () => fixture(async () => {
  const requests = []
  const timeoutCalls = []
  const originalTimeout = AbortSignal.timeout
  AbortSignal.timeout = (ms) => { timeoutCalls.push(ms); return originalTimeout(ms) }
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options, payload: JSON.parse(options.body) })
    return Response.json({ messages: [{ id: 'wamid.accepted' }] })
  }
  try {
    assert.equal(await sendOtpCode('447000000000', '001234', providerConfig), 'accepted')
    assert.equal(requests.length, 1)
    assert.deepEqual(timeoutCalls, [15_000])
    assert.equal(requests[0].payload.type, 'template')
    assert.equal(requests[0].payload.template.name, 'sor7ed_auth')
    assert.equal(requests[0].payload.template.components[0].parameters[0].text, '001234')
    assert.equal(requests[0].payload.template.components[1].parameters[0].text, '001234')
    assert.equal(requests[0].options.signal instanceof AbortSignal, true)
  } finally { AbortSignal.timeout = originalTimeout }
}))

test('provider rejection, timeout, network failures and malformed acceptance never auto-retry', async () => fixture(async (logs) => {
  const cases = [
    [() => Response.json({ error: { message: 'private provider data' } }, { status: 400 }), 'rejected'],
    [() => Response.json({ error: {} }, { status: 429 }), 'rejected'],
    [() => Response.json({ error: {} }, { status: 500 }), 'unknown'],
    [() => Response.json({ error: {} }, { status: 408 }), 'unknown'],
    [() => Response.json({ messages: [{ id: '' }] }), 'unknown'],
    [() => Response.json({ messages: [{ id: 'one' }, { id: 'two' }] }), 'unknown'],
    [() => Response.json({ success: true }), 'unknown'],
    [() => new Response('{broken'), 'unknown'],
    [() => { throw new DOMException('timed out', 'TimeoutError') }, 'unknown'],
    [() => { throw new Error('network private data') }, 'unknown'],
  ]
  for (const [result, outcome] of cases) {
    let calls = 0
    globalThis.fetch = async () => { calls++; return result() }
    assert.equal(await sendOtpCode('447000000000', '001234', providerConfig), outcome)
    assert.equal(calls, 1)
  }
  assert.deepEqual(logs, [])
}))

test('OTP routes reject unauthenticated and invalid input before any DB/provider work', async () => fixture(async () => {
  for (const path of ['../../app/api/whatsapp/send-otp/route.ts', '../../app/api/whatsapp/verify-otp/route.ts']) {
    const unauthorized = loadRoute(path, { user: null, error: NextResponse.json({ error: 'Please sign in' }, { status: 401 }) })
    assert.equal((await unauthorized(post({}))).status, 401)
    const route = loadRoute(path, { user, admin: { rpc: async () => { throw new Error('Unexpected DB call') } } })
    for (const body of ['{broken', {}, { otp: 123456, whatsappNumber: 447000000000 }]) {
      assert.equal((await route(post(body))).status, 400)
    }
  }
}))

test('missing provider configuration does not reserve an OTP or consume allowance', async () => fixture(async () => {
  delete process.env.META_WHATSAPP_TOKEN
  let reservations = 0
  const route = loadRoute('../../app/api/whatsapp/send-otp/route.ts', {
    user, admin: { rpc: async () => { reservations++; throw new Error('Unexpected DB call') } },
  })
  assert.equal((await route(post({ whatsappNumber: '447000000000' }))).status, 503)
  assert.equal(reservations, 0)
}))

test('send route respects database send limits and only stores the HMAC', async () => fixture(async () => {
  for (const outcome of ['cooldown', 'limit']) {
    const route = loadRoute('../../app/api/whatsapp/send-otp/route.ts', {
      user, admin: { rpc: async () => ({ data: [{ outcome, expires_at: null }], error: null }) },
    })
    assert.equal((await route(post({ whatsappNumber: '447000000000' }))).status, 429)
  }
  const dbCalls = []
  const providerCalls = []
  const route = loadRoute('../../app/api/whatsapp/send-otp/route.ts', {
    user, admin: { rpc: async (name, args) => {
      dbCalls.push({ name, args })
      return { data: [{ outcome: 'reserved', expires_at: expiresAt }], error: null }
    } },
  })
  globalThis.fetch = async (_url, options) => {
    providerCalls.push(JSON.parse(options.body))
    return Response.json({ messages: [{ id: 'wamid.accepted' }] })
  }
  const response = await route(post({ whatsappNumber: '447000000000', user_id: 'attacker' }))
  const result = await response.json()
  assert.equal(response.status, 200)
  assert.equal(result.state, 'accepted')
  assert.equal(dbCalls.length, 1)
  assert.equal(providerCalls.length, 1)
  const otp = providerCalls[0].template.components[0].parameters[0].text
  assert.equal(dbCalls[0].args.p_user_id, user.id)
  assert.equal(dbCalls[0].args.p_otp_hash, hashOtp(otp, user.id))
  assert.match(dbCalls[0].args.p_otp_hash, /^[a-f0-9]{64}$/)
  assert.equal('otp' in result, false)
  assert.equal(JSON.stringify(result).includes(otp), false)
}))

test('rejected and uncertain sends keep the single reservation and never report delivery', async () => fixture(async (logs) => {
  for (const [provider, status, state] of [
    [() => Response.json({ error: { message: 'sensitive code 001234 phone 447000000000' } }, { status: 400 }), 502, 'rejected'],
    [() => { throw new Error('sensitive network data') }, 503, 'unknown'],
  ]) {
    let reservations = 0
    let sends = 0
    const route = loadRoute('../../app/api/whatsapp/send-otp/route.ts', {
      user, admin: { rpc: async () => {
        reservations++
        return { data: [{ outcome: 'reserved', expires_at: expiresAt }], error: null }
      } },
    })
    globalThis.fetch = async () => { sends++; return provider() }
    const response = await route(post({ whatsappNumber: '447000000000' }))
    const result = await response.json()
    assert.equal(response.status, status)
    assert.equal(result.state, state)
    assert.equal('success' in result, false)
    assert.equal(reservations, 1)
    assert.equal(sends, 1)
  }
  assert.equal(logs.join(' ').includes('sensitive'), false)
  assert.equal(logs.join(' ').includes('447000000000'), false)
}))

test('verification schedules CRM only for the atomic winner, never for replay or conflict', async () => fixture(async () => {
  const synced = []
  let attempts = 0
  const dbCalls = []
  const route = loadRoute('../../app/api/whatsapp/verify-otp/route.ts', {
    user, admin: { rpc: async (name, args) => {
      dbCalls.push({ name, args })
      return { data: [{ outcome: attempts++ === 0 ? 'verified' : 'missing' }], error: null }
    } },
  }, (id) => synced.push(id))
  const requests = await Promise.all([
    route(post({ otp: '001234', whatsappNumber: 'attacker-phone', user_id: 'attacker' })),
    route(post({ otp: '001234' })),
  ])
  assert.deepEqual(requests.map((response) => response.status), [200, 400])
  assert.deepEqual(synced, [user.id])
  assert.equal(dbCalls.length, 2)
  for (const call of dbCalls) {
    assert.equal(call.args.p_user_id, user.id)
    assert.equal(call.args.p_otp_hash, hashOtp('001234', user.id))
    assert.equal('p_phone' in call.args, false)
    assert.equal(call.args.p_first_name, 'Member')
  }
}))

test('verification maps all lockout/expiry/conflict states and database errors safely', async () => fixture(async (logs) => {
  for (const [outcome, status] of [
    ['missing', 400], ['expired', 400], ['limit', 429], ['incorrect', 400], ['conflict', 409],
  ]) {
    const route = loadRoute('../../app/api/whatsapp/verify-otp/route.ts', {
      user, admin: { rpc: async () => ({ data: [{ outcome }], error: null }) },
    }, () => { throw new Error('CRM must not run on failed verification') })
    assert.equal((await route(post({ otp: '001234' }))).status, status)
  }
  for (const path of ['../../app/api/whatsapp/send-otp/route.ts', '../../app/api/whatsapp/verify-otp/route.ts']) {
    const route = loadRoute(path, {
      user, admin: { rpc: async () => ({ data: null, error: { message: 'private database credentials' } }) },
    })
    const response = await route(post({ otp: '001234', whatsappNumber: '447000000000' }))
    assert.equal(response.status, 503)
    assert.equal(JSON.stringify(await response.json()).includes('credentials'), false)
  }
  assert.equal(logs.join(' ').includes('credentials'), false)
}))

test('a background CRM scheduling failure does not undo confirmed verification', async () => fixture(async (logs) => {
  const route = loadRoute('../../app/api/whatsapp/verify-otp/route.ts', {
    user, admin: { rpc: async () => ({ data: [{ outcome: 'verified' }], error: null }) },
  }, () => { throw new Error('private scheduling details') })
  const response = await route(post({ otp: '001234' }))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).success, true)
  assert.equal(logs.join(' ').includes('private'), false)
}))

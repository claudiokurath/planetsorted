import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import * as pendingSignup from './pendingSignup.ts'
import { buildConnectToken, CONNECT_TOKEN_TTL_SECONDS, verifyConnectToken } from '../crypto/tokens.ts'
import { matchesPendingSignInToken, signInTokenDigest } from '../whatsapp/signInLink.ts'
import { safeNext } from '../safeNext.ts'

const require = createRequire(import.meta.url)
const { NextRequest } = require('next/server')
const site = 'https://planetsorted.com'
const userId = '11111111-1111-4111-8111-111111111111'
const phone = '447700900900'
const details = { firstName: 'Member', email: 'member@example.invalid', countryCode: '44', phone: '7700900900', next: '/tools/brain-dump-sorter' }
const previousSecret = process.env.CONNECT_TOKEN_SECRET
const originalFetch = globalThis.fetch
process.env.CONNECT_TOKEN_SECRET = 'isolated-signup-test-secret'
globalThis.fetch = async () => { throw new Error('Unexpected network request in isolated signup tests') }
test.after(() => {
  if (previousSecret === undefined) delete process.env.CONNECT_TOKEN_SECRET
  else process.env.CONNECT_TOKEN_SECRET = previousSecret
  globalThis.fetch = originalFetch
})

function fixture({ users = [], profiles = [], sendFailure = false, emailFailure = sendFailure, emailThrow = false, createError = null } = {}) {
  const state = { users: structuredClone(users), profiles: structuredClone(profiles), sends: [], creates: [], updates: [], links: [], emails: [], profileWrites: [], syncs: [], sendFailure }
  const admin = {
    auth: { admin: {
      createUser: async attributes => {
        state.creates.push(structuredClone(attributes))
        if (createError) return { data: { user: null }, error: createError }
        if (state.users.some(user => user.email === attributes.email)) return { data: { user: null }, error: { code: 'email_exists', status: 422, message: 'A user with this email address has already been registered' } }
        const user = { id: userId, email: attributes.email, email_confirmed_at: null, confirmed_at: null, last_sign_in_at: null, user_metadata: attributes.user_metadata, app_metadata: attributes.app_metadata }
        state.users.push(structuredClone(user))
        return { data: { user: structuredClone(user) }, error: null }
      },
      getUserById: async id => ({ data: { user: structuredClone(state.users.find(user => user.id === id) ?? null) }, error: null }),
      updateUserById: async (id, attributes) => {
        state.updates.push({ id, attributes: structuredClone(attributes) })
        const user = state.users.find(user => user.id === id)
        Object.assign(user, structuredClone(attributes))
        return { data: { user: structuredClone(user) }, error: null }
      },
      generateLink: async attributes => {
        state.links.push(attributes)
        return { data: { properties: { hashed_token: 'fixture-login-hash' } }, error: null }
      },
    } },
    from: table => {
      assert.equal(table, 'users')
      const filters = []
      let changes
      const matching = () => state.profiles.filter(row => filters.every(([column, value]) => row[column] === value))
      const query = {
        select: () => query,
        eq: (column, value) => { filters.push([column, value]); return query },
        maybeSingle: async () => ({ data: structuredClone(matching()[0] ?? null), error: null }),
        update: values => { changes = values; return query },
        then: (resolve, reject) => {
          const rows = matching()
          if (changes) {
            state.profileWrites.push(structuredClone(changes))
            for (const row of rows) Object.assign(row, structuredClone(changes))
          }
          return Promise.resolve({ data: structuredClone(rows), error: null }).then(resolve, reject)
        },
        insert: async values => {
          state.profileWrites.push(structuredClone(values))
          state.profiles.push(structuredClone(values))
          return { error: null }
        },
      }
      return query
    },
  }
  function load(path) {
    const filename = fileURLToPath(new URL(path, import.meta.url))
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText
    const routeModule = new Module(filename)
    routeModule.filename = filename
    routeModule.paths = Module._nodeModulePaths(fileURLToPath(new URL('../../', import.meta.url)))
    routeModule.require = id => {
      if (id === '@/lib/supabase/server') return { createServerClient: () => admin }
      if (id === '@/lib/crypto/tokens') return { buildConnectToken, CONNECT_TOKEN_TTL_SECONDS, verifyConnectToken }
      if (id === '@/lib/auth/pendingSignup') return pendingSignup
      if (id === '@/lib/whatsapp/signInLink') return {
        matchesPendingSignInToken, signInTokenDigest,
        sendWhatsAppSignInLink: async (to, token) => {
          state.sends.push({ to, token })
          if (state.sendFailure) throw new Error('fixture provider failure')
        },
      }
      if (id === '@/lib/safeNext') return { safeNext }
      if (id === '@/lib/siteUrl') return { websiteSiteUrl: () => site }
      if (id === '@/lib/notion/syncCrmAccount') return { scheduleCrmSync: id => state.syncs.push(id) }
      if (id === '@supabase/supabase-js') return { createClient: () => ({ auth: { signInWithOtp: async attributes => { state.emails.push(attributes); if(emailThrow)throw new Error('fixture offline'); return { error: emailFailure ? {message:'fixture rejection'} : null } } } }) }
      if (id === 'next/headers') return { headers: async () => new Headers({ host: 'planetsorted.com' }) }
      if (id === 'next/navigation') return { redirect: location => { throw Object.assign(new Error('fixture redirect'), { location }) } }
      return require(id)
    }
    routeModule._compile(compiled, filename)
    return routeModule.exports
  }
  const start = load('../../app/api/auth/start/route.ts').POST
  const confirm = load('../../app/auth/whatsapp-confirm/page.tsx').default
  async function post(body = details, cookie) {
    return start(new NextRequest(`${site}/api/auth/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: `${pendingSignup.PENDING_SIGNUP_COOKIE}=${cookie}` } : {}) },
      body: JSON.stringify(body),
    }))
  }
  async function confirmation(token = state.sends.at(-1)?.token) {
    try {
      const content = await confirm({ searchParams: Promise.resolve({ token }) })
      return { html: renderToStaticMarkup(content) }
    } catch (error) {
      if (error.location) return { location: error.location }
      throw error
    }
  }
  return { state, post, confirmation }
}

test('brand-new email signup explicitly creates an unconfirmed identity and confirms the phone through its private link', async () => {
  const { state, post, confirmation } = fixture()
  const response = await post()
  assert.equal(response.status, 200)
  assert.equal(state.creates.length, 1)
  assert.equal(state.creates[0].email_confirm, false)
  assert.equal('password' in state.creates[0], false)
  assert.equal(state.links.length, 0)
  assert.equal(state.profiles.length, 0)
  const marker = state.users[0].app_metadata.pending_signup_identity
  assert.equal(marker.phone, phone)
  const cookie = response.cookies.get(pendingSignup.PENDING_SIGNUP_COOKIE)
  assert.ok(cookie.httpOnly)
  assert.ok(cookie.secure)
  assert.equal(cookie.sameSite, 'lax')
  const parsed = pendingSignup.parsePendingSignupCookie(cookie.value)
  assert.equal(parsed.userId, userId)
  assert.ok(pendingSignup.matchesPendingSignupSecret(marker, parsed.secret))
  assert.notEqual(marker.retry_digest, parsed.secret)
  assert.equal(state.emails[0].options.shouldCreateUser, false)
  const result = await confirmation()
  assert.match(result.location, /^\/auth\/callback\?token_hash=fixture-login-hash/)
  assert.equal(state.profiles[0].whatsapp_number, phone)
  assert.equal(state.profiles[0].first_name, 'Member')
  assert.equal(state.profiles[0].whatsapp_verified, true)
  assert.equal(state.users[0].app_metadata.pending_signup_identity, null)
  assert.equal(state.users[0].app_metadata.pending_signin_token_digest, null)
  assert.match((await confirmation()).html, /Link expired/)
})

test('existing confirmed and unconfirmed email identities cannot be claimed by submitting a new phone', async () => {
  for (const confirmed of [false, true]) {
    const user = { id: userId, email: details.email, email_confirmed_at: confirmed ? '2026-01-01' : null, app_metadata: {}, user_metadata: { first_name: 'Original', pending_signup_identity: pendingSignup.createPendingSignup(phone).marker } }
    const profile = { user_id: userId, email: details.email, whatsapp_number: '447700900901', first_name: 'Edited', whatsapp_verified: true, whatsapp_opted_out: true }
    const { state, post } = fixture({ users: [user], profiles: [profile] })
    const original = structuredClone({ users: state.users, profiles: state.profiles })
    const response = await post()
    assert.equal(response.status, 409)
    assert.match((await response.json()).error, /Email to sign in/)
    assert.equal(state.sends.length, 0)
    assert.equal(state.links.length, 0)
    assert.equal(state.updates.length, 0)
    assert.deepEqual({ users: state.users, profiles: state.profiles }, original)
  }
})

test('provider failure retains a phone-bound retry cookie, enforces cooldown, and later retries the same new identity', async () => {
  const { state, post } = fixture({ sendFailure: true })
  const failure = await post()
  assert.equal(failure.status, 502)
  const cookie = failure.cookies.get(pendingSignup.PENDING_SIGNUP_COOKIE).value
  const marker = structuredClone(state.users[0].app_metadata.pending_signup_identity)
  assert.equal((await post(details, cookie)).status, 429)
  assert.equal(state.sends.length, 1)
  state.users[0].app_metadata.signup_links_sent_at = Date.now() - 61_000
  state.sendFailure = false
  assert.equal((await post(details, cookie)).status, 200)
  assert.equal(state.creates.length, 1)
  assert.equal(state.sends.length, 2)
  assert.deepEqual(state.users[0].app_metadata.pending_signup_identity, marker)
})

test('new-identity retry rejects changed phone, forged or absent cookie, expired marker, confirmed identity and existing profile', async () => {
  for (const failure of ['changed-phone', 'forged-cookie', 'absent-cookie', 'expired', 'confirmed', 'profile']) {
    const { state, post } = fixture({ sendFailure: true })
    const response = await post()
    let cookie = response.cookies.get(pendingSignup.PENDING_SIGNUP_COOKIE).value
    state.users[0].app_metadata.signup_links_sent_at = Date.now() - 61_000
    const body = { ...details }
    if (failure === 'changed-phone') body.phone = '7700900902'
    if (failure === 'forged-cookie') cookie = `${userId}.${'0'.repeat(64)}`
    if (failure === 'absent-cookie') cookie = undefined
    if (failure === 'expired') state.users[0].app_metadata.pending_signup_identity.expires_at = Date.now() - 1
    if (failure === 'confirmed') state.users[0].email_confirmed_at = '2026-01-01'
    if (failure === 'profile') state.profiles.push({ user_id: userId, whatsapp_number: '447700900905' })
    const original = structuredClone({ users: state.users, profiles: state.profiles })
    assert.equal((await post(body, cookie)).status, 409, failure)
    assert.equal(state.sends.length, 1, failure)
    assert.equal(state.links.length, 0, failure)
    assert.deepEqual({ users: state.users, profiles: state.profiles }, original, failure)
  }
})

test('pre-fix pending tokens and mismatched or expired creation markers cannot attach an existing email identity', async () => {
  for (const failure of ['no-marker', 'user-metadata-marker', 'changed-phone', 'expired']) {
    const { token } = buildConnectToken(userId)
    const user = { id: userId, email: details.email, user_metadata: { first_name: 'Original' }, app_metadata: { pending_whatsapp_number: phone, pending_signin_token_digest: signInTokenDigest(token) } }
    const { marker } = pendingSignup.createPendingSignup(phone)
    if (failure === 'user-metadata-marker') user.user_metadata.pending_signup_identity = marker
    if (failure === 'changed-phone') user.app_metadata.pending_signup_identity = { ...marker, phone: '447700900901' }
    if (failure === 'expired') user.app_metadata.pending_signup_identity = { ...marker, expires_at: Date.now() - 1 }
    const { state, confirmation } = fixture({ users: [user] })
    const original = structuredClone(state.users)
    assert.match((await confirmation(token)).html, /Use email sign-in/, failure)
    assert.equal(state.profileWrites.length, 0, failure)
    assert.equal(state.links.length, 0, failure)
    assert.equal(state.updates.length, 0, failure)
    assert.deepEqual(state.users, original, failure)
  }
})

test('returning WhatsApp login preserves the edited profile name, including an intentionally blank name, and opt-out', async () => {
  for (const savedName of ['Edited name', '']) {
    const user = { id: userId, email: details.email, email_confirmed_at: '2026-01-01', user_metadata: { first_name: 'Original' }, app_metadata: {} }
    const profile = { user_id: userId, email: details.email, whatsapp_number: phone, first_name: savedName, whatsapp_verified: true, whatsapp_opted_out: true, weekly_opted_in: true }
    const { state, post, confirmation } = fixture({ users: [user], profiles: [profile] })
    assert.equal((await post({ ...details, firstName: 'Unproven submitted name', existingOnly: true })).status, 200)
    assert.equal(state.creates.length, 0)
    assert.equal(state.users[0].user_metadata.first_name, 'Original')
    assert.match((await confirmation()).location, /^\/auth\/callback/)
    assert.equal(state.profiles[0].first_name, savedName)
    assert.equal(state.profiles[0].whatsapp_opted_out, true)
    assert.equal(state.profiles[0].weekly_opted_in, true)
  }
})

test('an old signup link cannot replace a phone and name already saved through authenticated verification', async () => {
  const { state, post, confirmation } = fixture()
  assert.equal((await post()).status, 200)
  state.users[0].email_confirmed_at = '2026-01-01'
  state.profiles.push({ user_id: userId, email: details.email, whatsapp_number: '447700900905', first_name: 'Edited after signup', whatsapp_verified: true })
  const original = structuredClone({ users: state.users, profiles: state.profiles })
  assert.match((await confirmation()).html, /Use email sign-in/)
  assert.equal(state.profileWrites.length, 0)
  assert.equal(state.links.length, 0)
  assert.deepEqual({ users: state.users, profiles: state.profiles }, original)
})

test('a brand-new email-backup member can confirm the email before completing the originally bound WhatsApp link', async () => {
  const { state, post, confirmation } = fixture()
  assert.equal((await post()).status, 200)
  state.users[0].email_confirmed_at = '2026-01-01'
  state.users[0].last_sign_in_at = '2026-01-01'
  assert.match((await confirmation()).location, /^\/auth\/callback/)
  assert.equal(state.profiles[0].whatsapp_number, phone)
})

test('phone-only signup keeps magic-link authentication without an email backup', async () => {
  const { state, post, confirmation } = fixture()
  assert.equal((await post({ ...details, email: '' })).status, 200)
  assert.equal(state.users[0].email, `${phone}@users.planetsorted.com`)
  assert.equal(state.emails.length, 0)
  assert.match((await confirmation()).location, /^\/auth\/callback/)
})

test('unknown returning phones and backend creation failures never dispatch messages', async () => {
  const returning = fixture()
  assert.equal((await returning.post({ ...details, existingOnly: true })).status, 404)
  assert.equal(returning.state.creates.length, 0)
  const unavailable = fixture({ createError: { status: 500, message: 'Database unavailable' } })
  assert.equal((await unavailable.post()).status, 502)
  assert.equal(unavailable.state.sends.length, 0)
})


test('WhatsApp provider failure does not suppress a working email backup or verify the phone', async () => {
  const {state,post}=fixture({sendFailure:true,emailFailure:false})
  const response=await post()
  assert.equal(response.status,200)
  const body=await response.json()
  assert.equal(body.sent,true)
  assert.equal(body.emailSent,true)
  assert.equal(body.whatsappSent,false)
  assert.equal(state.profiles.length,0)
  assert.equal(state.emails.length,1)
  assert.equal(state.emails[0].options.shouldCreateUser,false)
})

test('email network failure is caught and cannot masquerade as a successful sign-in request',async()=>{
  const {post}=fixture({sendFailure:true,emailFailure:false,emailThrow:true})
  const response=await post()
  assert.equal(response.status,502)
  assert.match((await response.json()).error,/temporarily unavailable/)
})

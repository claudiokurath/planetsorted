import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import * as billing from './accountDeletion.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const { NextRequest, NextResponse } = require('next/server')
const userId = '11111111-1111-4111-8111-111111111111'
const reference = { status: 'active', stripe_customer_id: 'cus_owned', stripe_subscription_id: 'sub_owned' }
const state = status => ({ id: 'sub_owned', customer: 'cus_owned', status })

function captureErrors(t) {
  const logs = []
  t.mock.method(console, 'error', (...args) => logs.push(args))
  return logs
}

function assertPrivateDetailsOmitted(logs) {
  assert.doesNotMatch(JSON.stringify(logs), /private|11111111|cus_|sub_/)
}

function stripeFixture({ initial = 'active', cancelError = false, afterError = 'active', customer = 'cus_owned', subscriptionId = 'sub_owned', onCall = () => {} } = {}) {
  const calls = []
  let status = initial
  const record = call => { calls.push(call); onCall(call) }
  const client = { subscriptions: {
    retrieve: async id => {
      record({ type: 'retrieve', id })
      return { ...state(status), id: subscriptionId, customer }
    },
    cancel: async (id, params) => {
      record({ type: 'cancel', id, params })
      status = cancelError ? afterError : 'canceled'
      if (cancelError) throw new Error('private Stripe failure details')
      return { ...state(status), customer }
    },
  } }
  return { client, calls }
}

test('deletion immediately ends linked active, trialing, overdue and paused subscriptions without an extra invoice', async () => {
  for (const status of ['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete']) {
    const { client, calls } = stripeFixture({ initial: status })
    await billing.cancelAccountSubscriptions(client, [{ ...reference, status }])
    assert.deepEqual(calls, [
      { type: 'retrieve', id: 'sub_owned' },
      { type: 'cancel', id: 'sub_owned', params: { invoice_now: false, prorate: false } },
    ])
  }
})

test('deletion checks Stripe instead of trusting a canceled local entitlement and deduplicates links', async () => {
  const { client, calls } = stripeFixture()
  await billing.cancelAccountSubscriptions(client, [{ ...reference, status: 'canceled' }, reference])
  assert.equal(calls.filter(call => call.type === 'cancel').length, 1)
})

test('already ended subscriptions and a response lost after successful cancellation are safe to retry', async () => {
  for (const initial of ['canceled', 'incomplete_expired']) {
    const { client, calls } = stripeFixture({ initial })
    await billing.cancelAccountSubscriptions(client, [reference])
    assert.equal(calls.length, 1)
  }
  const { client, calls } = stripeFixture({ cancelError: true, afterError: 'canceled' })
  await billing.cancelAccountSubscriptions(client, [reference])
  await billing.cancelAccountSubscriptions(client, [reference])
  assert.equal(calls.filter(call => call.type === 'cancel').length, 1)
})

test('failed or uncertain cancellation and mismatched ownership block deletion with a plain error', async () => {
  for (const options of [{ cancelError: true }, { customer: 'cus_someone_else' }, { subscriptionId: 'sub_someone_else' }]) {
    const { client } = stripeFixture(options)
    await assert.rejects(billing.cancelAccountSubscriptions(client, [reference]), error => {
      assert.ok(error instanceof billing.AccountDeletionBillingError)
      assert.match(error.message, /Your account has not been deleted/)
      assert.doesNotMatch(error.message, /private Stripe/)
      return true
    })
  }
  await assert.rejects(billing.cancelAccountSubscriptions({ subscriptions: {
    retrieve: async () => { throw new Error('No such subscription') },
    cancel: async () => { throw new Error('Should not cancel') },
  } }, [reference]), billing.AccountDeletionBillingError)
})

test('expanded Stripe customers are checked against the linked owner', async () => {
  const { client } = stripeFixture({ customer: { id: 'cus_owned' } })
  await billing.cancelAccountSubscriptions(client, [reference])
  const other = stripeFixture({ customer: { id: 'cus_someone_else' } })
  await assert.rejects(billing.cancelAccountSubscriptions(other.client, [reference]), billing.AccountDeletionBillingError)
})

test('missing customers and conflicting duplicate links block all billing effects', async () => {
  const { client, calls } = stripeFixture()
  for (const references of [
    [{ ...reference, stripe_customer_id: null }],
    [reference, { ...reference, stripe_customer_id: 'cus_someone_else' }],
  ]) {
    await assert.rejects(billing.cancelAccountSubscriptions(client, references), billing.AccountDeletionBillingError)
  }
  assert.equal(calls.length, 0)
})

test('missing subscription IDs block billing effects even for locally ended entitlements', async () => {
  const { client, calls } = stripeFixture()
  for (const status of ['active', 'trialing', 'past_due', 'canceled', 'incomplete_expired']) {
    await assert.rejects(billing.cancelAccountSubscriptions(client, [reference, {
      ...reference, status, stripe_subscription_id: null,
    }]), billing.AccountDeletionBillingError)
  }
  await billing.cancelAccountSubscriptions(client, [])
  assert.equal(calls.length, 0)
})

test('a mismatched or unfinished cancellation response needs a fresh verified terminal state', async () => {
  for (const canceled of [
    { ...state('canceled'), id: 'sub_someone_else' },
    { ...state('canceled'), customer: 'cus_someone_else' },
    state('active'),
  ]) {
    const calls = []
    const client = { subscriptions: {
      retrieve: async () => { calls.push('retrieve'); return state('active') },
      cancel: async () => { calls.push('cancel'); return canceled },
    } }
    await assert.rejects(billing.cancelAccountSubscriptions(client, [reference]), billing.AccountDeletionBillingError)
    assert.deepEqual(calls, ['retrieve', 'cancel', 'retrieve'])
  }
})

function routeFixture({ entitlements = [], readError, deleteError, authError, stripeOptions, throwAt } = {}) {
  const calls = []
  const rows = {
    entitlements: entitlements.map(row => ({ user_id: userId, ...row })),
    tool_requests: [{ id: 'owned-request', user_id: userId }, { id: 'other-request', user_id: 'someone-else' }],
    tool_runs: [{ tool_request_id: 'owned-request' }, { tool_request_id: 'other-request' }],
    saved_items: [{ user_id: userId }, { user_id: 'someone-else' }],
    credits_ledger: [{ user_id: userId }, { user_id: 'someone-else' }],
    users: [{ user_id: userId }, { user_id: 'someone-else' }],
  }
  let authDeleted = false
  let entitlementsAtAuthDelete
  const stripe = stripeFixture({ ...stripeOptions, onCall: call => calls.push({ ...call, type: `stripe-${call.type}` }) })
  const admin = {
    auth: { admin: { deleteUser: async id => {
      calls.push({ type: 'auth-delete', id })
      entitlementsAtAuthDelete = structuredClone(rows.entitlements)
      if (throwAt === 'auth') throw new Error('private connection details')
      if (authError) return { error: { message: 'private auth details' } }
      authDeleted = true
      return { error: null }
    } } },
    from: table => {
      const filters = []
      let action = 'read'
      const query = {
        select: () => query,
        delete: () => { action = 'delete'; return query },
        eq: (column, value) => { filters.push([column, [value]]); return query },
        in: (column, values) => { filters.push([column, values]); return query },
        then: (resolve, reject) => {
          calls.push({ type: action, table, filters })
          if (throwAt === table && action === 'delete') return Promise.reject(new Error('private connection details')).then(resolve, reject)
          const matches = row => filters.every(([column, values]) => values.includes(row[column]))
          const error = action === 'read' && readError === table || action === 'delete' && deleteError === table
          const data = rows[table].filter(matches)
          if (action === 'delete' && !error) {
            rows[table] = rows[table].filter(row => !matches(row))
            // Match the verified tool_runs -> tool_requests ON DELETE CASCADE FK.
            if (table === 'tool_requests') {
              rows.tool_runs = rows.tool_runs.filter(row => !data.some(request => request.id === row.tool_request_id))
            }
          }
          return Promise.resolve({ data: error ? null : data, error: error ? { message: 'private database details' } : null }).then(resolve, reject)
        },
      }
      return query
    },
  }
  function load(auth = { user: { id: userId }, admin }) {
    const filename = fileURLToPath(new URL('../../app/api/account/delete/route.ts', import.meta.url))
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText
    const routeModule = new Module(filename)
    routeModule.filename = filename
    routeModule.paths = Module._nodeModulePaths(fileURLToPath(new URL('../../', import.meta.url)))
    routeModule.require = id => {
      if (id === '@/lib/auth/requireUser') return { requireUser: async () => auth }
      if (id === '@/lib/stripe') return { stripe: stripe.client }
      if (id === '@/lib/billing/accountDeletion') return billing
      return require(id)
    }
    routeModule._compile(compiled, filename)
    return routeModule.exports.POST
  }
  const post = (body = { confirm: 'DELETE' }, handler = load()) => handler(new NextRequest('https://planetsorted.com/api/account/delete', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }))
  return { post, load, calls, rows, stripeCalls: stripe.calls, authDeleted: () => authDeleted, entitlementsAtAuthDelete: () => entitlementsAtAuthDelete }
}

test('authentication and explicit invalid confirmation prevent all deletion operations', async () => {
  const fixture = routeFixture()
  const unauthorized = fixture.load({ user: null, error: NextResponse.json({ error: 'Please sign in.' }, { status: 401 }) })
  assert.equal((await fixture.post({}, unauthorized)).status, 401)
  assert.equal((await fixture.post({ confirm: 'keep' })).status, 400)
  assert.equal(fixture.calls.length, 0)
  assert.equal(fixture.stripeCalls.length, 0)
})

test('billing lookup and cancellation failures preserve data, billing links and authentication', async t => {
  const logs = captureErrors(t)
  for (const options of [
    { readError: 'entitlements' },
    { entitlements: [reference], stripeOptions: { cancelError: true } },
    { entitlements: [{ ...reference, stripe_subscription_id: null }] },
  ]) {
    const fixture = routeFixture(options)
    const before = structuredClone(fixture.rows)
    const response = await fixture.post()
    assert.equal(response.status, 500)
    assert.doesNotMatch((await response.json()).error, /private/)
    assert.deepEqual(fixture.rows, before)
    assert.equal(fixture.authDeleted(), false)
    assert.equal(fixture.calls.some(call => call.type === 'delete'), false)
  }
  assertPrivateDetailsOmitted(logs)
})

test('deletion uses the authenticated owner even when another user ID is submitted', async () => {
  const fixture = routeFixture()
  const response = await fixture.post({ user_id: 'someone-else', confirm: 'DELETE' })
  assert.equal(response.status, 200)
  assert.equal(fixture.authDeleted(), true)
  assert.deepEqual(fixture.rows.tool_requests, [{ id: 'other-request', user_id: 'someone-else' }])
  assert.deepEqual(fixture.rows.tool_runs, [{ tool_request_id: 'other-request' }])
  for (const table of ['saved_items', 'credits_ledger', 'users']) {
    assert.deepEqual(fixture.rows[table], [{ user_id: 'someone-else' }])
  }
  assert.equal(fixture.calls.find(call => call.type === 'auth-delete').id, userId)
})

test('Stripe cancellation finishes before any erase and billing references outlive Auth deletion', async () => {
  const otherReference = { ...reference, user_id: 'someone-else', stripe_subscription_id: 'sub_other', stripe_customer_id: 'cus_other' }
  const fixture = routeFixture({ entitlements: [reference, otherReference] })
  const response = await fixture.post()
  assert.equal(response.status, 200)
  assert.equal((await response.json()).success, true)
  const cancelIndex = fixture.calls.findIndex(call => call.type === 'stripe-cancel')
  const firstEraseIndex = fixture.calls.findIndex(call => call.type === 'delete')
  const authIndex = fixture.calls.findIndex(call => call.type === 'auth-delete')
  const billingEraseIndex = fixture.calls.findIndex(call => call.type === 'delete' && call.table === 'entitlements')
  assert.ok(cancelIndex >= 0 && cancelIndex < firstEraseIndex)
  assert.ok(authIndex > firstEraseIndex && billingEraseIndex > authIndex)
  assert.equal(fixture.entitlementsAtAuthDelete().some(row => row.user_id === userId), true)
  assert.deepEqual(fixture.rows.entitlements, [otherReference])
  assert.deepEqual(fixture.stripeCalls.map(call => call.id), ['sub_owned', 'sub_owned'])
})

test('each public-data failure stops before Auth deletion and retains billing references for retry', async t => {
  const logs = captureErrors(t)
  for (const table of ['tool_requests', 'saved_items', 'credits_ledger', 'users']) {
    const fixture = routeFixture({ entitlements: [reference], deleteError: table })
    const response = await fixture.post()
    assert.equal(response.status, 500)
    assert.doesNotMatch((await response.json()).error, /private/)
    assert.equal(fixture.authDeleted(), false)
    assert.deepEqual(fixture.rows.entitlements, [{ user_id: userId, ...reference }])
    assert.equal(fixture.calls.some(call => call.type === 'auth-delete'), false)
    assert.equal(fixture.calls.at(-1).table, table)
  }
  assertPrivateDetailsOmitted(logs)
})

test('returned and thrown Auth failures retain billing references and can retry canceled subscriptions', async t => {
  const logs = captureErrors(t)
  for (const options of [{ authError: true }, { throwAt: 'auth' }]) {
    const fixture = routeFixture({ ...options, entitlements: [reference] })
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fixture.post()
      assert.equal(response.status, 500)
      assert.doesNotMatch((await response.json()).error, /private/)
      assert.equal(fixture.authDeleted(), false)
      assert.deepEqual(fixture.rows.entitlements, [{ user_id: userId, ...reference }])
    }
    assert.equal(fixture.stripeCalls.filter(call => call.type === 'cancel').length, 1)
  }
  assertPrivateDetailsOmitted(logs)
})

test('failed final billing cleanup reports the deleted sign-in account without claiming complete erasure', async t => {
  const logs = captureErrors(t)
  for (const options of [{ deleteError: 'entitlements' }, { throwAt: 'entitlements' }]) {
    const fixture = routeFixture({ ...options, entitlements: [reference] })
    const response = await fixture.post()
    assert.equal(response.status, 500)
    const body = await response.json()
    assert.equal(body.success, undefined)
    assert.equal(body.accountDeleted, true)
    assert.equal(body.dataCleanupPending, true)
    assert.match(body.error, /sign-in account has been deleted/)
    assert.doesNotMatch(body.error, /private/)
    assert.equal(fixture.authDeleted(), true)
    assert.deepEqual(fixture.rows.entitlements, [{ user_id: userId, ...reference }])
  }
  assert.deepEqual(logs, [
    ['[account deletion]', { phase: 'billing-reference-cleanup', status: 'reconciliation-required' }],
    ['[account deletion]', { phase: 'billing-reference-cleanup', status: 'reconciliation-required' }],
  ])
  assertPrivateDetailsOmitted(logs)
})

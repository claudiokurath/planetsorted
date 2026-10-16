import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import { websiteSiteUrl } from '../siteUrl.js'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const { NextRequest } = require('next/server')
const cronSecret = 'weekly-fixture-secret'
const protocol = { title: 'A useful weekly resource', summary: 'One clear next step.', slug: 'weekly-resource' }
const subscriber = {
  id: 'owned-profile', user_id: '11111111-1111-4111-8111-111111111111',
  whatsapp_number: '447000000000', last_weekly_sent_at: null,
}

async function withEnvironment(values, run) {
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]))
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  try { await run() }
  finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

function broadcastFixture(users = []) {
  const calls = []
  const database = {
    from(table) {
      const filters = []
      const exclusions = []
      let action = 'read'
      let columns, values, ordering, maximum
      const record = () => {
        const call = { type: action, table, filters: [...filters], exclusions: [...exclusions] }
        if (action === 'update') call.values = values
        else Object.assign(call, { columns, ordering, maximum })
        calls.push(call)
      }
      const query = {
        select(value) { columns = value; return query },
        eq(column, value) { filters.push([column, value]); return query },
        not(...args) { exclusions.push(args); return query },
        order(column, options) { ordering = [column, options]; return query },
        limit(count) { maximum = count; return query },
        update(value) { action = 'update'; values = value; return query },
        async single() {
          assert.equal(table, 'protocols')
          record()
          return { data: protocol, error: null }
        },
        then(resolve, reject) {
          assert.equal(table, 'users')
          record()
          return Promise.resolve({ data: action === 'update' ? null : users, error: null }).then(resolve, reject)
        },
      }
      return query
    },
  }

  // Compile the actual handler while replacing every DB/sender dependency.
  const filename = fileURLToPath(new URL('../../app/api/cron/weekly-broadcast/route.ts', import.meta.url))
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const routeModule = new Module(filename)
  routeModule.filename = filename
  routeModule.paths = Module._nodeModulePaths(fileURLToPath(new URL('../../', import.meta.url)))
  routeModule.require = id => {
    if (id === '@/lib/siteUrl') return { websiteSiteUrl }
    if (id === '@/lib/supabase/server') return {
      createServerClient() { calls.push({ type: 'client' }); return database },
    }
    if (id === '@/lib/whatsapp/send') return {
      async sendWhatsAppMessage(...args) {
        calls.push({ type: 'send', args })
        return { kind: 'text', messageId: 'wamid.weekly-accepted' }
      },
    }
    if (id.startsWith('@/')) throw new Error(`Unexpected route dependency: ${id}`)
    return require(id)
  }
  routeModule._compile(compiled, filename)

  const get = authorization => routeModule.exports.GET(new NextRequest('https://www.planetsorted.com/api/cron/weekly-broadcast', {
    headers: authorization === undefined ? {} : { authorization },
  }))
  return { get, calls }
}

test('an unset or empty cron secret rejects Bearer undefined before database or sender access', async () => {
  for (const CRON_SECRET of [undefined, '']) {
    await withEnvironment({ CRON_SECRET }, async () => {
      const fixture = broadcastFixture([subscriber])
      const response = await fixture.get('Bearer undefined')
      assert.equal(response.status, 401)
      assert.deepEqual(await response.json(), { error: 'Unauthorized' })
      assert.deepEqual(fixture.calls, [])
    })
  }
})

test('missing, wrong and malformed bearer authorization cannot start a weekly broadcast', async () => {
  await withEnvironment({ CRON_SECRET: cronSecret }, async () => {
    for (const header of [undefined, 'Bearer wrong-secret', 'Bearer undefined', `Basic ${cronSecret}`, `Bearer ${cronSecret} extra`]) {
      const fixture = broadcastFixture([subscriber])
      const response = await fixture.get(header)
      assert.equal(response.status, 401)
      assert.deepEqual(fixture.calls, [])
    }
  })
})

test('an authorized empty selection requires weekly consent, verified WhatsApp and no opt-out without sending', async () => {
  await withEnvironment({ CRON_SECRET: cronSecret }, async () => {
    const fixture = broadcastFixture()
    const response = await fixture.get(`Bearer ${cronSecret}`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { sent: 0, skipped: 0, message: 'No opted-in subscribers.' })
    assert.deepEqual(fixture.calls, [
      { type: 'client' },
      {
        type: 'read', table: 'protocols', filters: [['status', 'Published']], exclusions: [],
        columns: 'title, summary, slug', ordering: ['updated_at', { ascending: false }], maximum: 1,
      },
      {
        type: 'read', table: 'users',
        filters: [['weekly_opted_in', true], ['whatsapp_verified', true], ['whatsapp_opted_out', false]],
        exclusions: [['whatsapp_number', 'is', null]],
        columns: 'id, user_id, whatsapp_number, last_weekly_sent_at', ordering: undefined, maximum: undefined,
      },
    ])
  })
})

for (const [SITE_URL, user, owner] of [
  ['https://sor7ed.com', subscriber, ['id', subscriber.id]],
  ['https://www.sor7ed.com', { ...subscriber, id: null }, ['user_id', subscriber.user_id]],
]) {
  test(`an accepted weekly message uses the canonical website URL and stamps only its ${owner[0]} owner`, async () => {
    await withEnvironment({ CRON_SECRET: cronSecret, SITE_URL }, async () => {
      const fixture = broadcastFixture([user])
      const earliestStamp = Date.now()
      const response = await fixture.get(`Bearer ${cronSecret}`)
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), { sent: 1, skipped: 0, total: 1 })
      const link = 'https://www.planetsorted.com/r/weekly-resource'
      assert.deepEqual(fixture.calls.filter(call => call.type === 'send'), [{
        type: 'send', args: [user.whatsapp_number, `*${protocol.title}*\n\n${protocol.summary}\n\nGet it sorted here 👇\n${link}`, link],
      }])
      const updates = fixture.calls.filter(call => call.type === 'update')
      assert.equal(updates.length, 1)
      assert.equal(updates[0].table, 'users')
      assert.deepEqual(updates[0].filters, [owner])
      assert.deepEqual(Object.keys(updates[0].values), ['last_weekly_sent_at'])
      const stamp = Date.parse(updates[0].values.last_weekly_sent_at)
      assert.ok(stamp >= earliestStamp && stamp <= Date.now())
      assert.ok(fixture.calls.findIndex(call => call.type === 'send') < fixture.calls.findIndex(call => call.type === 'update'))
    })
  })
}

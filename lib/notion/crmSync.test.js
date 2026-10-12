import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Module, { createRequire } from 'node:module'
import ts from 'typescript'
import { toCrmContact, newCrmStatus } from './crmContact.ts'

// Compile the real writer in isolation; its relative TS dependency is supplied
// explicitly because node --strip-types does not resolve extensionless imports.
const require = createRequire(import.meta.url)
const filename = fileURLToPath(new URL('./syncUserToCrm.ts', import.meta.url))
const compiled = new Module(filename)
compiled.require = name => name === './crmContact' ? { newCrmStatus } : require(name)
compiled._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename)
const { syncUserToCrm } = compiled.exports
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'member@example.invalid', created_at: '2026-05-01T12:00:00Z', user_metadata: { first_name: 'Member' } }
const contact = toCrmContact(user)
const fullPage = properties => ({ object: 'page', id: 'notion-existing', archived: false, properties })

function mockClient({ results = [], legacy = [], page } = {}) {
  const calls = { queries: [], created: [], updated: [] }
  const client = {
    databases: { query: async request => { calls.queries.push(request); return { results: calls.queries.length === 1 ? results : legacy } } },
    pages: {
      retrieve: async () => page,
      create: async request => { calls.created.push(request); return { id: 'notion-new' } },
      update: async request => { calls.updated.push(request); return { id: request.page_id } },
    },
  }
  return { client, calls }
}

test('email-only signups retain the actual join date and remain pending until confirmed', () => {
  assert.equal(contact.signedUp, '2026-05-01T12:00:00.000Z')
  assert.equal(newCrmStatus(contact), 'Pending')
  assert.equal(contact.whatsappNumber, null)
  assert.equal(newCrmStatus(toCrmContact({ ...user, email_confirmed_at: '2026-05-02T00:00:00Z' })), 'Active')
})

test('phone-only accounts do not expose synthetic emails and never imply unverified numbers are verified', () => {
  const pending = toCrmContact({ ...user, email: '447000000000@users.planetsorted.com', app_metadata: { pending_whatsapp_number: '447000000000' } })
  assert.equal(pending.email, null)
  assert.equal(pending.whatsappNumber, '+447000000000')
  assert.equal(pending.whatsappVerified, false)
  assert.equal(pending.source, 'Phone')
  assert.equal(newCrmStatus({ ...pending, optedOut: true }), 'Unsubscribed')
})

test('creates a missing contact with stable identity and actual creation date', async () => {
  const { client, calls } = mockClient()
  assert.equal(await syncUserToCrm(contact, { client }), 'notion-new')
  assert.equal(calls.created.length, 1)
  const p = calls.created[0].properties
  assert.equal(p['Supabase User ID'].rich_text[0].text.content, user.id)
  assert.equal(p['Signed Up'].date.start, contact.signedUp)
  assert.equal(p.Status.select.name, 'Pending')
})

test('updates existing contacts while preserving manual notes, source, country and unsubscribe decisions', async () => {
  const { client, calls } = mockClient({ page: fullPage({ Status: { type: 'select', select: { name: 'Unsubscribed' } } }) })
  await syncUserToCrm({ ...contact, confirmed: true }, { client, pageId: 'notion-existing' })
  assert.equal(calls.created.length, 0)
  assert.equal(calls.queries.length, 0)
  const p = calls.updated[0].properties
  for (const key of ['Status', 'Notes', 'Source', 'Country']) assert.equal(key in p, false)
  assert.equal(p['Account Confirmed'].checkbox, true)
})

test('confirmation promotes Pending, while explicit opt-out always records Unsubscribed', async () => {
  const first = mockClient({ page: fullPage({ Status: { type: 'select', select: { name: 'Pending' } } }) })
  await syncUserToCrm({ ...contact, confirmed: true }, { client: first.client, pageId: 'notion-existing' })
  assert.equal(first.calls.updated[0].properties.Status.select.name, 'Active')
  const second = mockClient({ page: fullPage({ Status: { type: 'select', select: { name: 'Active' } } }) })
  await syncUserToCrm({ ...contact, optedOut: true }, { client: second.client, pageId: 'notion-existing' })
  assert.equal(second.calls.updated[0].properties.Status.select.name, 'Unsubscribed')
})

test('legacy matching links an existing contact instead of creating a duplicate', async () => {
  const { client, calls } = mockClient({ legacy: [fullPage({})] })
  await syncUserToCrm(contact, { client })
  assert.equal(calls.created.length, 0)
  assert.equal(calls.updated.length, 1)
  assert.equal(calls.queries.length, 2)
})

test('ambiguous matches and records assigned to another account fail closed', async () => {
  const duplicate = mockClient({ legacy: [fullPage({}), fullPage({})] })
  await assert.rejects(syncUserToCrm(contact, { client: duplicate.client }), /identity conflict/)
  assert.equal(duplicate.calls.created.length, 0)
  const other = mockClient({ legacy: [fullPage({ 'Supabase User ID': { type: 'rich_text', rich_text: [{ plain_text: 'another-account' }] } })] })
  await assert.rejects(syncUserToCrm(contact, { client: other.client }), /identity conflict/)
  assert.equal(other.calls.updated.length, 0)
})

function compiledModule(name, dependencies) {
  const file = fileURLToPath(new URL(name, import.meta.url))
  const fixtureModule = new Module(file)
  fixtureModule.require = specifier => dependencies[specifier] || require(specifier)
  fixtureModule._compile(ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file)
  return fixtureModule.exports
}

function syncHarness(writer) {
  let state
  const deferred = []
  const admin = {
    auth: { admin: { getUserById: async () => ({ data: { user }, error: null }) } },
    from(table) {
      if (table === 'users') return { select() { return this }, eq() { return this }, maybeSingle: async () => ({ data: null, error: null }) }
      assert.equal(table, 'notion_crm_sync')
      let values, conditional = false
      const filters = []
      const q = {
        upsert: async (data, options) => { assert.equal(options.ignoreDuplicates, true);state ||= { user_id: data.user_id, notion_page_id: null, contact_hash: null, lock_until: null, lock_token: null };return {error:null} },
        update(data) { values=data;return q },
        eq(key,value) {filters.push([key,value]);return q},
        or() {conditional=true;return q},
        select() {return q},
        maybeSingle: async () => {
          if ((conditional && state.lock_until && Date.parse(state.lock_until)>Date.now()) || filters.some(([k,v])=>state[k]!==v)) return {data:null,error:null}
          Object.assign(state,values);return {data:{...state},error:null}
        },
        then(resolve,reject) {return q.maybeSingle().then(resolve,reject)},
      }
      return q
    },
  }
  const syncFunctions = compiledModule('./syncCrmAccount.ts', {
    'next/server': {after: fn => deferred.push(fn)},
    '@/lib/supabase/server': {createServiceClient:()=>admin},
    '@/lib/notion/crmContact': {toCrmContact},
    '@/lib/notion/syncUserToCrm': {syncUserToCrm:writer},
  })
  return {...syncFunctions,deferred,state:()=>state}
}

test('an atomic ledger lock permits one writer; unchanged reads do not resend or create contacts', async () => {
  let finish, calls=0
  const held = new Promise(resolve=>{finish=resolve})
  const h=syncHarness(async()=>{calls++;await held;return 'notion-page'})
  const first=h.syncCrmAccount(user.id)
  while(!calls) await new Promise(resolve=>setImmediate(resolve))
  assert.equal(await h.syncCrmAccount(user.id),'busy')
  finish()
  assert.equal(await first,'synced')
  assert.equal(await h.syncCrmAccount(user.id),'unchanged')
  assert.equal(calls,1)
  assert.equal(h.state().lock_token,null)
})

test('failed sync records a retry without private details, releases the lock and later succeeds', async () => {
  let failed=true
  const h=syncHarness(async()=>{if(failed)throw new Error('private upstream payload');return 'notion-page'})
  await assert.rejects(h.syncCrmAccount(user.id))
  assert.ok(h.state().last_error.includes('retry'))
  assert.ok(!h.state().last_error.includes('private'))
  assert.equal(h.state().lock_until,null)
  failed=false
  assert.equal(await h.syncCrmAccount(user.id),'synced')
  assert.equal(h.state().last_error,null)
})

test('signup synchronization is scheduled after the response, not on the login critical path', async () => {
  let calls=0
  const h=syncHarness(async()=>{calls++;return 'notion-page'})
  h.scheduleCrmSync(user.id)
  assert.equal(calls,0)
  assert.equal(h.deferred.length,1)
  await h.deferred[0]()
  assert.equal(calls,1)
})

test('reconciliation rejects missing authorization before accessing accounts, and persists its cursor', async () => {
  let accessed=0, savedPage
  const admin={
    from:()=>({select:()=>({eq:()=>({single:async()=>({data:{next_page:4},error:null})})}),update:value=>({eq:async()=>{savedPage=value.next_page;return{error:null}}})}),
    auth:{admin:{listUsers:async options=>{assert.equal(options.page,4);return{data:{users:[{id:'a'},{id:'b'}]},error:null}}}},
  }
  const route=compiledModule('../../app/api/cron/sync-crm/route.ts',{
    '@/lib/supabase/server':{createServiceClient:()=>{accessed++;return admin}},
    '@/lib/notion/syncCrmAccount':{syncCrmAccount:async()=> 'unchanged'},
  })
  const old=process.env.CRON_SECRET
  process.env.CRON_SECRET='test-cron-secret'
  try{
    const denied=await route.GET({headers:new Headers(),nextUrl:new URL('https://example.invalid/api/cron/sync-crm')})
    assert.equal(denied.status,401);assert.equal(accessed,0)
    const accepted=await route.GET({headers:new Headers({authorization:'Bearer test-cron-secret'}),nextUrl:new URL('https://example.invalid/api/cron/sync-crm')})
    assert.equal(accepted.status,200);assert.equal((await accepted.json()).unchanged,2);assert.equal(savedPage,1)
  }finally{if(old===undefined)delete process.env.CRON_SECRET;else process.env.CRON_SECRET=old}
})

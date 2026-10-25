import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createHmac } from 'node:crypto'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const { NextRequest } = require('next/server')

function loadRoute(status, { archived = false } = {}) {
  const updates = [], upserts = []
  class Notion {
    pages = { retrieve: async () => ({ archived, properties: { Slug: { type: 'rich_text', rich_text: [{ plain_text: 'example-tool' }] }, Status: { status: { name: status } }, Name: { type: 'title', title: [{ plain_text: 'Example' }] } } }) }
  }
  const client = { from: (table) => ({
    update: (data) => { const entry = { table, data, filters: {} }; updates.push(entry); const q = { eq: (k,v) => { entry.filters[k]=v; return q }, then: (resolve) => Promise.resolve({ error: null }).then(resolve) }; return q },
    upsert: async (row) => { upserts.push(row); return { error: null } },
    insert: async () => ({ error: null }),
  }) }
  const filename = fileURLToPath(new URL('../../app/api/webhooks/notion/route.ts', import.meta.url))
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const mod = new Module(filename); mod.filename = filename; mod.paths = Module._nodeModulePaths(fileURLToPath(new URL('../../', import.meta.url)))
  mod.require = (id) => {
    if (id === '@notionhq/client') return { Client: Notion }
    if (id === '@supabase/supabase-js') return { createClient: () => client }
    if (id === '@/lib/content/coverStorage') return { buildVersionedCoverPath: () => 'unused' }
    if (id === '@/lib/content/notionProperties') return { getNotionProperty: (props, name) => props[name] }
    return require(id)
  }
  mod._compile(compiled, filename)
  return { ...mod.exports, updates, upserts }
}

test('verified Notion update withdraws tools leaving Published and preserves source boundaries', async () => {
  const old = { key: process.env.NOTION_SIGNING_SECRET, db: process.env.NOTION_TOOLS_DB_ID }
  process.env.NOTION_SIGNING_SECRET = 'local-notion-test-key'
  process.env.NOTION_TOOLS_DB_ID = 'tools-db'
  try {
    for (const status of ['In progress', 'Draft', 'Not started', undefined, 'Published']) {
      const route = loadRoute(status)
      const body = JSON.stringify({ object:'database', type:'database.sync', data:{ id:'page-one', parent:{ database_id:'tools-db' } } })
      const timestamp = String(Date.now())
      const signature = 'v0=' + createHmac('sha256',process.env.NOTION_SIGNING_SECRET).update(`${timestamp}.${body}`).digest('hex')
      const response = await route.POST(new NextRequest('https://planetsorted.com/api/webhooks/notion',{method:'POST',body,headers:{'x-notion-signature':signature,'x-notion-request-time-ms':timestamp}}))
      assert.equal(response.status,200)
      if (status === 'Published') { assert.equal(route.upserts.length,1); assert.equal(route.updates.length,0) }
      else { assert.equal(route.upserts.length,0); assert.equal(route.updates.length,1); assert.equal(route.updates[0].data.status,'Draft'); assert.deepEqual(route.updates[0].filters,{slug:'example-tool',type:'Tool'}) }
    }
    const route = loadRoute('Draft')
    const response = await route.POST(new NextRequest('https://planetsorted.com/api/webhooks/notion',{method:'POST',body:'{}'}))
    assert.equal(response.status,401); assert.equal(route.updates.length,0)
  } finally {
    if (old.key === undefined) delete process.env.NOTION_SIGNING_SECRET; else process.env.NOTION_SIGNING_SECRET = old.key
    if (old.db === undefined) delete process.env.NOTION_TOOLS_DB_ID; else process.env.NOTION_TOOLS_DB_ID = old.db
  }
})

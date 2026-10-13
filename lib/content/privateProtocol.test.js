import test from 'node:test'
import assert from 'node:assert/strict'
import { createCipheriv, randomBytes } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Module, { createRequire } from 'node:module'
import ts from 'typescript'
import { canDownloadProtocol, decryptPrivateAsset, PRIVATE_PDF_SLUG } from './privateProtocol.ts'

const require = createRequire(import.meta.url)
const { NextRequest } = require('next/server')
const key = randomBytes(32)
const plain = Buffer.from('%PDF-1.7\nPrivate test protocol\n%%EOF')
function encrypt(bytes) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv)
  const payload = Buffer.concat([cipher.update(bytes), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), payload])
}
let state
const filename = fileURLToPath(new URL('../../app/api/protocols/[slug]/route.ts', import.meta.url))
const compiled = new Module(filename)
compiled.require = name => {
  if (name === 'node:fs/promises') return { readFile: async () => { state.reads++; return state.payload } }
  if (name === '@/lib/content/privateProtocol') return { canDownloadProtocol, decryptPrivateAsset, PRIVATE_PDF_SLUG }
  if (name === '@/lib/supabase/server') return {
    createSessionClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.user } }) } }),
    createServiceClient: () => ({ from: table => {
      const query = { select: () => query, eq: (column, value) => { state.filters.push([table, column, value]); return query }, single: async () => ({ data: table === 'users' ? state.profile : state.published }) }
      return query
    } }),
  }
  return require(name)
}
compiled._compile(ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename)
const { GET } = compiled.exports
async function download(overrides = {}, slug = PRIVATE_PDF_SLUG, query = '') {
  state = { user: { id: 'member-one' }, profile: { whatsapp_verified: true, whatsapp_number: '+447000000000' }, published: { slug: PRIVATE_PDF_SLUG }, payload: encrypt(plain), reads: 0, filters: [], ...overrides }
  return GET(new NextRequest(`https://planetsorted.com/api/protocols/${slug}${query}`), { params: Promise.resolve({ slug }) })
}
const previousKey = process.env.PRIVATE_PROTOCOL_KEY
process.env.PRIVATE_PROTOCOL_KEY = key.toString('base64')
test.after(() => { if (previousKey === undefined) delete process.env.PRIVATE_PROTOCOL_KEY; else process.env.PRIVATE_PROTOCOL_KEY = previousKey })

test('anonymous and forged access_token requests cannot read the PDF', async () => {
  for (const query of ['', '?access_token=granted']) {
    const response = await download({ user: null }, PRIVATE_PDF_SLUG, query)
    assert.equal(response.status, 307)
    assert.match(response.headers.get('location'), /\/signup\?next=/)
    assert.equal(state.reads, 0)
    assert.match(response.headers.get('cache-control'), /private, no-store/)
  }
})
test('unverified accounts and missing numbers must connect before any bytes are read', async () => {
  for (const profile of [null, { whatsapp_verified: false, whatsapp_number: '+447000000000' }, { whatsapp_verified: true, whatsapp_number: null }]) {
    const response = await download({ profile })
    assert.equal(response.status, 307)
    assert.match(response.headers.get('location'), /\/connect\?next=/)
    assert.equal(state.reads, 0)
  }
})
test('verified member gets the original PDF as an uncached attachment', async () => {
  const response = await download()
  assert.equal(response.status, 200)
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), plain)
  assert.equal(response.headers.get('content-type'), 'application/pdf')
  assert.match(response.headers.get('content-disposition'), /attachment; filename="FINANCIAL-AVOIDANCE PROTOCOL.pdf"/)
  assert.match(response.headers.get('x-robots-tag'), /noindex/)
  assert.match(response.headers.get('cache-control'), /no-store/)
  assert.ok(state.filters.some(([table, column, value]) => table === 'users' && column === 'user_id' && value === 'member-one'))
})
test('unknown or withdrawn protocols cannot expose files', async () => {
  let response = await download({}, '../financial-avoidance')
  assert.equal(response.status, 404)
  assert.equal(state.reads, 0)
  response = await download({ published: null })
  assert.equal(response.status, 404)
  assert.equal(state.reads, 0)
})
test('corruption and missing keys fail closed with a plain-language response', async () => {
  const corrupted = encrypt(plain); corrupted[30] ^= 1
  let response = await download({ payload: corrupted })
  assert.equal(response.status, 503)
  assert.doesNotMatch(await response.text(), /PDF|decrypt|cipher|secret/i)
  delete process.env.PRIVATE_PROTOCOL_KEY
  response = await download()
  assert.equal(response.status, 503)
  assert.equal(state.reads, 0)
  process.env.PRIVATE_PROTOCOL_KEY = key.toString('base64')
})
test('AES authentication rejects tampered ciphertext and the wrong key', () => {
  const payload = encrypt(plain)
  assert.deepEqual(decryptPrivateAsset(payload, key.toString('base64')), plain)
  assert.throws(() => decryptPrivateAsset(payload, randomBytes(32).toString('base64')))
  payload[28] ^= 1
  assert.throws(() => decryptPrivateAsset(payload, key.toString('base64')))
})
test('committed private assets are encrypted and public pages never select protocol text', () => {
  const root = new URL('../../', import.meta.url)
  for (const name of readdirSync(new URL('private/protocols/', root))) {
    assert.ok(name.endsWith('.enc'))
    assert.notEqual(readFileSync(new URL('private/protocols/' + name, root)).subarray(0, 4).toString(), '%PDF')
  }
  const article = readFileSync(new URL('app/intelligence/[slug]/page.tsx', root), 'utf8')
  assert.doesNotMatch(article, /item\.protocol|actionProtocolText/)
  const copy = JSON.parse(readFileSync(new URL('lib/content/nativeGammaCopy.json', root), 'utf8'))
  assert.equal(Object.keys(copy).length, 13)
  assert.doesNotMatch(JSON.stringify(copy[PRIVATE_PDF_SLUG]), /THE FINANCIAL AVOIDANCE PROTOCOL|WRITE A SHORT SCRIPT|GATHER SUPPORTING INFORMATION/)
})

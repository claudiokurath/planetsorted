import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Module, { createRequire } from 'node:module'
import ts from 'typescript'
import { protocolGammaUrl } from './protocolGamma.ts'
import { canDownloadProtocol, PRIVATE_PDF_SLUG } from './privateProtocol.ts'

const require = createRequire(import.meta.url)
let state
const filename = fileURLToPath(new URL('../../app/protocols/[slug]/page.tsx', import.meta.url))
const mod = new Module(filename)
mod.require = name => {
  if (name === 'next/navigation') return { notFound: () => { throw Error('NOT_FOUND') }, redirect: href => { throw Error('REDIRECT '+href) } }
  if (name === 'next/link') return { default: 'a' }
  if (name === '@/lib/content/protocolGamma') return {protocolGammaUrl}
  if (name === '@/lib/content/privateProtocol') return { canDownloadProtocol, PRIVATE_PDF_SLUG }
  if (name === '@/lib/notion/liveContent') return { getLiveContent: async () => {
    state.events.push('refresh')
    if(state.refreshError) throw Error('Notion unavailable')
    state.item.gamma_url = state.currentGamma
    return { tools: [], articles: state.published ? [state.slug] : [] }
  } }
  if (name === '@/lib/supabase/server') return {
    createSessionClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.user } }) } }),
    createServiceClient: () => ({ from: table => { const q = {
      select: () => q, eq: () => q, single: async () => {
        if(table==='users') return { data: state.profile }
        state.events.push('read-protocol');return { data: state.item }
      },
    };return q } }),
  }
  if (name === '@/components/ProtocolDeck') return { ProtocolDeck: 'protocol-deck' }
  if (name === '@/lib/protocolDeck') return { buildProtocolDeck: input => { state.deck=input;return input } }
  if (name === '@/components/PrintPageButton') return { PrintPageButton: 'print-button' }
  if (name.startsWith('node:fs')) throw Error('Old private files must not override Notion')
  return require(name)
}
mod._compile(ts.transpileModule(readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename)
async function page(overrides={}) {
  state={user:{id:'fixture-member'},profile:{whatsapp_verified:true,whatsapp_number:'447000000000'},slug:'fixture-protocol',published:true,item:{title:'A current protocol',category:'Mind',protocol:'Old stored copy',gamma_url:'https://old.example'},currentGamma:'https://current-protocol.gamma.site/',events:[],...overrides}
  return mod.exports.default({params:Promise.resolve({slug:state.slug})})
}
test('private protocol compatibility page refreshes Notion then redirects to its exact current Gamma slides',async()=>{
  await assert.rejects(page(),/REDIRECT https:\/\/current-protocol.gamma.site\//)
  assert.deepEqual(state.events,['refresh','read-protocol'])
  assert.equal(state.deck,undefined)
})
test('Financial Avoidance uses its Notion Gamma URL without a text or PDF override',async()=>{
  await assert.rejects(page({slug:PRIVATE_PDF_SLUG}),/REDIRECT https:\/\/current-protocol.gamma.site\//)
})
test('anonymous and unverified members cannot read private Gamma links',async()=>{
  await assert.rejects(page({user:null}),/REDIRECT \/signup\?next=/)
  assert.deepEqual(state.events,[])
  await assert.rejects(page({profile:{whatsapp_verified:false}}),/REDIRECT \/connect\?next=/)
  assert.deepEqual(state.events,[])
})
test('withdrawn, unavailable or missing Gamma links never fall back to text, PDFs or old copies',async()=>{
  await assert.rejects(page({published:false}),/NOT_FOUND/)
  assert.deepEqual(state.events,['refresh'])
  await assert.rejects(page({currentGamma:null}),/NOT_FOUND/)
  await assert.rejects(page({currentGamma:'javascript:alert(1)'}),/NOT_FOUND/)
  await assert.rejects(page({refreshError:true}),/Notion unavailable/)
})

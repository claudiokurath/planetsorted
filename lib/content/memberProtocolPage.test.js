import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Module, { createRequire } from 'node:module'
import ts from 'typescript'
import { canDownloadProtocol, PRIVATE_PDF_SLUG } from './privateProtocol.ts'

const require = createRequire(import.meta.url)
let state
const filename = fileURLToPath(new URL('../../app/protocols/[slug]/page.tsx', import.meta.url))
const mod = new Module(filename)
mod.require = name => {
  if (name === 'next/navigation') return { notFound: () => { throw Error('NOT_FOUND') }, redirect: href => { throw Error('REDIRECT '+href) } }
  if (name === 'next/link') return { default: 'a' }
  if (name === '@/lib/content/privateProtocol') return { canDownloadProtocol, PRIVATE_PDF_SLUG }
  if (name === '@/lib/notion/liveContent') return { getLiveContent: async () => {
    state.events.push('refresh')
    if(state.refreshError) throw Error('Notion unavailable')
    state.item.protocol = state.currentProtocol
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
  state={user:{id:'fixture-member'},profile:{whatsapp_verified:true,whatsapp_number:'447000000000'},slug:'fixture-protocol',published:true,item:{title:'A current protocol',category:'Mind',protocol:'Old stored copy',gamma_url:'https://old.example'},currentProtocol:'CURRENT NOTION PROTOCOL\n\nOne new step.',events:[],...overrides}
  return mod.exports.default({params:Promise.resolve({slug:state.slug})})
}
function deck(element) {
  if(!element||typeof element!=='object')return
  if(element.type==='protocol-deck')return element
  const children=element.props?.children
  for(const child of Array.isArray(children)?children:[children]) {const found=deck(child);if(found)return found}
}
test('private protocol page refreshes Notion and renders its exact current text instead of an archive',async()=>{
  const result=await page()
  assert.deepEqual(state.events,['refresh','read-protocol'])
  assert.equal(deck(result).props.bodyText,state.currentProtocol)
  assert.equal(state.deck.body,state.currentProtocol)
  assert.equal(state.deck.coverImage,null)
})
test('Financial Avoidance uses its current Notion protocol and keeps the original PDF optional and private',async()=>{
  const result=await page({slug:PRIVATE_PDF_SLUG})
  assert.equal(deck(result).props.bodyText,state.currentProtocol)
  assert.equal(result.props['data-protocol-source'],'notion-protocol')
})
test('anonymous and unverified members cannot read protocol content or refresh private sources',async()=>{
  await assert.rejects(page({user:null}),/REDIRECT \/signup\?next=/)
  assert.deepEqual(state.events,[])
  await assert.rejects(page({profile:{whatsapp_verified:false}}),/REDIRECT \/connect\?next=/)
  assert.deepEqual(state.events,[])
})
test('withdrawn, unavailable or empty Notion protocols do not fall back to an old presentation',async()=>{
  await assert.rejects(page({published:false}),/NOT_FOUND/)
  assert.deepEqual(state.events,['refresh'])
  await assert.rejects(page({currentProtocol:''}),/NOT_FOUND/)
  await assert.rejects(page({refreshError:true}),/Notion unavailable/)
})

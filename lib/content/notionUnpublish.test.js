import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createHmac } from 'node:crypto'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const { NextRequest } = require('next/server')
const pageId='11111111-1111-4111-8111-111111111111'
const key='isolated-notion-webhook-key'

function fixture({parent='tools-db',missing=false,fail=false}={}) {
  const state={syncs:0,events:[]}
  class Notion { pages={retrieve:async()=>{
    if(missing)throw {status:404}
    return {parent:{type:'database_id',database_id:parent}}
  }} }
  const filename=fileURLToPath(new URL('../../app/api/webhooks/notion/route.ts',import.meta.url))
  const compiled=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const mod=new Module(filename);mod.filename=filename;mod.paths=Module._nodeModulePaths(fileURLToPath(new URL('../../',import.meta.url)))
  mod.require=id=>{
    if(id==='@notionhq/client')return {Client:Notion}
    if(id==='@/lib/notion/contentSync')return {syncPublishedContent:async()=>{state.syncs++;if(fail)throw new Error('fixture sync failure');return {tools:[],articles:[]}}}
    if(id==='@/lib/supabase/server')return {createServiceClient:()=>({from:()=>({insert:async row=>{state.events.push(row);return {error:null}}})})}
    return require(id)
  }
  mod._compile(compiled,filename)
  return {state,post:async({type='page.properties_updated',signed=true,body}={})=>{
    body??=JSON.stringify({id:'fixture-event',type,entity:{type:'page',id:pageId},data:{}})
    const signature='sha256='+createHmac('sha256',key).update(body).digest('hex')
    return mod.exports.POST(new NextRequest('https://www.planetsorted.com/api/webhooks/notion',{method:'POST',body,headers:signed?{'x-notion-signature':signature}:{}}))
  }}
}
const previous={secret:process.env.NOTION_SIGNING_SECRET,tools:process.env.NOTION_TOOLS_DB_ID}
process.env.NOTION_SIGNING_SECRET=key;process.env.NOTION_TOOLS_DB_ID='tools-db'
test.after(()=>{for(const [env,value] of [['NOTION_SIGNING_SECRET',previous.secret],['NOTION_TOOLS_DB_ID',previous.tools]]){if(value===undefined)delete process.env[env];else process.env[env]=value}})

test('real Notion signature and entity-based event reconcile using the common live publication reader',async()=>{
  const f=fixture();assert.equal((await f.post()).status,200)
  assert.equal(f.state.syncs,1);assert.equal(f.state.events[0].source_type,'Tool')
})
test('unsigned and malformed signed requests cannot alter publication',async()=>{
  const f=fixture();assert.equal((await f.post({signed:false})).status,401)
  assert.equal((await f.post({body:'{broken'})).status,400)
  assert.equal(f.state.syncs,0)
})
test('unrelated CRM pages and non-page events do not trigger content writes',async()=>{
  const f=fixture({parent:'crm-db'});assert.equal((await f.post()).status,200);assert.equal(f.state.syncs,0)
  const g=fixture();await g.post({type:'comment.created'});assert.equal(g.state.syncs,0)
})
test('deleted or moved inaccessible pages reconcile current sources rather than trusting old payload properties',async()=>{
  for(const type of ['page.deleted','page.moved']){
    const f=fixture({missing:true});assert.equal((await f.post({type})).status,200);assert.equal(f.state.syncs,1)
  }
})
test('failed reconciliation returns retryable failure rather than a false queued/success response',async()=>{
  const f=fixture({fail:true});assert.equal((await f.post()).status,503);assert.equal(f.state.events.length,0)
})

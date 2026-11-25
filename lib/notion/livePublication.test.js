import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
const require=createRequire(import.meta.url)
const ts=require('typescript')
function load(file,stubs){
 const name=fileURLToPath(new URL(file,import.meta.url))
 const compiled=ts.transpileModule(readFileSync(name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
 const mod=new Module(name);mod.filename=name;mod.paths=Module._nodeModulePaths(fileURLToPath(new URL('../../',import.meta.url)))
 mod.require=id=>id==='server-only'?{}:stubs[id]??require(id)
 mod._compile(compiled,name);return mod.exports
}

test('live publication coalesces reads, removes unpublished tools after expiry and never serves expired content on failure',async t=>{
 const realNow=Date.now;let now=100000,calls=0,fail=false,value={tools:['one','two','three'],articles:['guide']}
 Date.now=()=>now;t.after(()=>{Date.now=realNow})
 const live=load('./liveContent.ts',{'@/lib/notion/contentSync':{syncPublishedContent:async()=>{calls++;if(fail)throw Error('unavailable');return value}}})
 const [a,b]=await Promise.all([live.getLiveContent(),live.getLiveContent()]);assert.deepEqual(a,b);assert.equal(calls,1)
 value={tools:['one','three'],articles:['guide']};now+=30001
 assert.equal(await live.isContentPublished('two','Tool'),false);assert.equal(calls,2)
 fail=true;now+=30001;await assert.rejects(live.getLiveContent(),/unavailable/)
 await assert.rejects(live.isContentPublished('one','Tool'),/unavailable/);assert.equal(calls,4)
})

test('Notion publication reconciliation handles new, republished, edited and removed pages without changing other source types',async t=>{
 const before={secret:process.env.NOTION_SECRET,tools:process.env.NOTION_TOOLS_DB_ID,blogs:process.env.NOTION_BLOG_DB_ID}
 Object.assign(process.env,{NOTION_SECRET:'test',NOTION_TOOLS_DB_ID:'tools',NOTION_BLOG_DB_ID:'blogs'})
 t.after(()=>{for(const[k,v]of Object.entries({NOTION_SECRET:before.secret,NOTION_TOOLS_DB_ID:before.tools,NOTION_BLOG_DB_ID:before.blogs})){if(v===undefined)delete process.env[k];else process.env[k]=v}})
 const time=new Date().toISOString()
 const rows=new Map([
  ['one',{slug:'one',type:'Tool',status:'Draft',last_synced_at:time,sync_status:'synced'}],
  ['removed',{slug:'removed',type:'Tool',status:'Published',last_synced_at:time}],
  ['other',{slug:'other',type:'Article',status:'Published',last_synced_at:time,sync_status:'synced'}],
 ])
 const page=(slug,title)=>({last_edited_time:time,properties:{Slug:{type:'rich_text',rich_text:[{plain_text:slug}]},Name:{type:'title',title:[{plain_text:title}]},Title:{type:'title',title:[{plain_text:title}]}}})
 let tools=[page('one','Republished'),page('new','New tool')],failInsert=false,failBlogs=false
 const queried=[]
 class Notion{databases={query:async q=>{queried.push(q.database_id);if(failBlogs&&q.database_id==='blogs')throw Error('Blog access denied');return {results:q.database_id==='tools'?tools:[page('other','Article')],has_more:false}}}}
 const db={from:()=>{
  let filters=[],update=null
  const q={select:()=>q,eq:(k,v)=>{filters.push(row=>row[k]===v);return q},in:(k,v)=>{filters.push(row=>v.includes(row[k]));return q},
   single:async()=>({data:[...rows.values()].find(row=>filters.every(f=>f(row)))??null,error:null}),
   update:data=>{update=data;return q},
   upsert:async row=>{if(failInsert)return {error:Error('failed')};rows.set(row.slug,{...rows.get(row.slug),...row});return {error:null}},
   then:resolve=>{const data=[...rows.values()].filter(row=>filters.every(f=>f(row)));if(update)data.forEach(row=>Object.assign(row,update));return Promise.resolve({data,error:null}).then(resolve)}
  };return q
 }}
 const sync=load('./contentSync.ts',{'@notionhq/client':{Client:Notion},'@supabase/supabase-js':{createClient:()=>db},'@/lib/content/coverStorage':{},'@/lib/content/notionProperties':{getNotionProperty:(p,n)=>p[n]}})
 const first=await sync.syncPublishedContent();assert.deepEqual(first.tools,['one','new']);assert.equal(rows.get('one').status,'Published');assert.equal(rows.get('new').status,'Published');assert.equal(rows.get('removed').status,'Draft');assert.equal(rows.get('other').status,'Published')
 tools=[page('new','New tool')];await sync.syncPublishedContent();assert.equal(rows.get('one').status,'Draft')
 failBlogs=true;queried.length=0
 const isolated=await sync.syncPublishedContent('Tool');assert.deepEqual(isolated,{tools:['new'],articles:[]});assert.deepEqual(queried,['tools'])
 await assert.rejects(sync.syncPublishedContent('Article'),/Blog access denied/);assert.equal(rows.get('new').status,'Published')
 delete process.env.NOTION_BLOG_DB_ID
 const oldArticles=process.env.NOTION_ARTICLES_DB_ID;delete process.env.NOTION_ARTICLES_DB_ID
 try {assert.deepEqual((await sync.syncPublishedContent('Tool')).tools,['new'])} finally {process.env.NOTION_BLOG_DB_ID='blogs';if(oldArticles!==undefined)process.env.NOTION_ARTICLES_DB_ID=oldArticles}
 failBlogs=false
 tools=[page('brand-new','Brand new')];failInsert=true;await assert.rejects(sync.syncPublishedContent(),/could not be synced/);assert.equal(rows.get('new').status,'Draft')
})

test('source-specific publication reads isolate Blog outages without serving stale or cross-type decisions', async t => {
 const realNow = Date.now
 let now = 100000, tools = ['one', 'two'], failTools = false
 const calls = { Tool: 0, Article: 0, all: 0 }
 Date.now = () => now
 t.after(() => { Date.now = realNow })
 const live = load('./liveContent.ts', { '@/lib/notion/contentSync': { syncPublishedContent: async type => {
  calls[type ?? 'all']++
  if (type !== 'Tool') throw Error('Blog unavailable')
  if (failTools) throw Error('Tools unavailable')
  return { tools, articles: [] }
 } } })
 const results = await Promise.allSettled([live.getLiveContent('Tool'), live.getLiveContent('Tool'), live.getLiveContent('Article')])
 assert.equal(results[0].status, 'fulfilled')
 assert.equal(results[1].status, 'fulfilled')
 assert.equal(results[2].status, 'rejected')
 assert.equal(calls.Tool, 1)
 assert.deepEqual(results[0].value, { tools: ['one', 'two'], articles: [] })
 assert.equal(await live.isContentPublished('two', 'Tool'), true)
 await assert.rejects(live.getLiveContent(), /Blog unavailable/)
 assert.equal(await live.isContentPublished('two', 'Tool'), true)
 assert.equal(calls.Tool, 1)
 tools = ['one']; now += 30001
 assert.equal(await live.isContentPublished('two', 'Tool'), false)
 failTools = true; now += 30001
 await assert.rejects(live.isContentPublished('one', 'Tool'), /Tools unavailable/)
 await assert.rejects(live.getLiveContent('Tool'), /Tools unavailable/)
 assert.equal(calls.Tool, 4)
})

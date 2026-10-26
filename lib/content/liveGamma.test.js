import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import { parseGammaDocument, parsePublicGammaHtml } from './gammaDocument.ts'
import { gammaEmbedUrl } from './gammaEmbed.ts'
const require=createRequire(import.meta.url),ts=require('typescript')
const text=t=>({type:'text',text:t})
const card=(nodes,attrs={})=>({type:'card',attrs,content:nodes})
const doc=nodes=>({content:{type:'doc',content:[{type:'document',content:nodes}]}})
const html=(id,title)=>`<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({props:{pageProps:{doc:{id,updatedTime:'2026-10-26T22:00:00Z'},...doc([card([{type:'title',content:[text(title)]}])])}}})}</script>`

test('public Gamma parser keeps text, emoji, diagram labels and approved art while excluding hidden cards',()=>{
 const p=parseGammaDocument(doc([
  card([{type:'title',content:[text('A & B')]},{type:'paragraph',content:[text('First'),{type:'hardBreak'},{type:'emoji',attrs:{native:'🧠'}}]},
   {type:'smartDiagram',attrs:{data:{step:[{text:'<h3>Choose &amp; start</h3><p>One<br>step</p>'}]}}},
   {type:'image',attrs:{src:'https://cdn.gamma.app/example.webp',meta:{width:600,height:400}}},
   {type:'image',attrs:{src:'https://cdn.gamma.app/example.webp'}},
   {type:'image',attrs:{src:'https://example.invalid/private.png'}}]),
  card([{type:'paragraph',content:[text('Hidden private draft')]}],{hidden:true}),
 ]))
 assert.deepEqual(p.cards[0].blocks.map(b=>b.text),['A & B','First\n🧠','Choose & start','One\nstep'])
 assert.equal(p.cards.length,1);assert.equal(p.cards[0].images.length,1)
 assert.equal(p.cards[0].images[0].width,600)
 assert.throws(()=>parseGammaDocument({content:{content:[]}}),/Unsupported/)
})

test('a public source response must identify exactly the requested Gamma document',()=>{
 assert.equal(parsePublicGammaHtml(html('doc1','Current title'),'doc1').presentation.cards[0].blocks[0].text,'Current title')
 assert.throws(()=>parsePublicGammaHtml(html('doc2','Wrong document'),'doc1'),/source mismatch/)
 assert.throws(()=>parsePublicGammaHtml('<p>Sign in</p>','doc1'),/unavailable/)
})

test('Gamma read-through refreshes edits, rejects foreign sources and never substitutes an expired snapshot after a failed read',async t=>{
 const file=fileURLToPath(new URL('./liveGamma.ts',import.meta.url)),mod=new Module(file)
 mod.require=id=>id==='server-only'?{}:id==='@/lib/content/gammaEmbed'?{gammaEmbedUrl}:id==='@/lib/content/gammaDocument'?{parsePublicGammaHtml}:require(id)
 mod._compile(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file)
 const realFetch=global.fetch,realNow=Date.now;let now=1000,calls=0,title='First version',failed=false
 Date.now=()=>now;global.fetch=async url=>{calls++;if(failed)throw Error('network');return{ok:true,url,text:async()=>html('doc1',title)}}
 t.after(()=>{global.fetch=realFetch;Date.now=realNow})
 const load=mod.exports.getLiveGammaPresentation
 assert.equal(await load('https://example.invalid/docs/doc1'),null);assert.equal(calls,0)
 const [a,b]=await Promise.all([load('https://gamma.app/embed/doc1'),load('https://gamma.app/docs/title-doc1')])
 assert.equal(calls,1);assert.deepEqual(a,b)
 title='Edited version';now+=30001
 assert.equal((await load('https://gamma.app/embed/doc1')).presentation.cards[0].blocks[0].text,'Edited version')
 failed=true;now+=30001;assert.equal(await load('https://gamma.app/embed/doc1'),null)
 assert.equal(await load('https://gamma.app/embed/doc2'),null)
})

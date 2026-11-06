import test from 'node:test'
import assert from 'node:assert/strict'
import {seoText,brandedTitle,publicPageMetadata,contentStructuredData,structuredDataJson,publishedSeoEntries} from './seo.ts'

test('search snippets remove formatting and titles include one brand suffix',()=>{
 assert.equal(seoText('<b>Hello</b> **world** &amp; [a guide](https://example.com)'), 'Hello world & a guide')
 assert.equal(brandedTitle('ADHD Tax — PLANET SOR7ED'),'ADHD Tax | PLANET SOR7ED')
 assert.ok(seoText('word '.repeat(100)).length<=160)
})
test('canonical and social identities stay on the content website',()=>{
 const m=publicPageMetadata({title:'Guidebooks',path:'/guidebooks',description:'Read it here'})
 assert.equal(m.alternates.canonical,'https://www.planetsorted.com/guidebooks')
 assert.equal(m.openGraph.url,m.alternates.canonical)
 assert.equal(m.openGraph.title,m.title)
 for(const path of ['https://sor7ed.com','//example.com','/\\example.com'])assert.throws(()=>publicPageMetadata({title:'Bad',path}))
 assert.equal(publicPageMetadata({title:'Account',path:'/dashboard',noIndex:true}).robots.index,false)
})
test('public content schema is safe against script termination and has real breadcrumbs',()=>{
 const schema=contentStructuredData('</script><script>unsafe</script>','Public text','/tools/example','Tool')
 assert.ok(!structuredDataJson(schema).includes('<'))
 assert.equal(schema['@graph'][1].itemListElement[1].item,'https://www.planetsorted.com/tools')
})
test('search entries cannot resurrect withdrawn tools or private protocol records',()=>{
 const rows=[{slug:'one',type:'Tool'},{slug:'old',type:'Tool'},{slug:'article',type:'Article'},{slug:'private',type:'Protocol'},{slug:'../bad',type:'Tool'}]
 assert.deepEqual(publishedSeoEntries(rows,{tools:['one','../bad'],articles:['article','private']}),[rows[0],rows[2]])
})

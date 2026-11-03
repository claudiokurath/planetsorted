import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire,Module} from 'node:module'
import {fileURLToPath} from 'node:url'
import {websiteReplyLink,isWebsiteReplyLink} from './replyLink.js'
import {deliveryResponse} from './deliveryActions.ts'
import {WhatsAppSendError} from './send.ts'
const require=createRequire(import.meta.url),ts=require('typescript')
const userId='11111111-1111-4111-8111-111111111111',actionId='22222222-2222-4222-8222-222222222222',phone='447000000000'
function fixture(options={}) {
 const rows=new Map(),calls=[]
 const profile={user_id:userId,whatsapp_number:phone,whatsapp_verified:true,whatsapp_opted_out:false,...options.profile}
 const content={slug:'useful-guide',title:'A useful guide',category:'Mind',protocol:'One useful step.',summary:'Summary',excerpt:'Summary',cover_image:null,audio_url:null}
 const admin={from(table){
  let mode='read',values={},filters=[]
  const q={select(){return q},eq(k,v){filters.push([k,v]);return q},update(v){mode='update';values=v;return q},single:run,maybeSingle:run,then(resolve,reject){return run().then(resolve,reject)}}
  async function run(){
   if(table==='users') return {data:filters.some(([k,v])=>k==='whatsapp_number'&&v!==profile.whatsapp_number)?null:profile,error:null}
   if(table==='protocols')return {data:content,error:null}
   if(table!=='whatsapp_delivery_actions')throw Error(table)
   const row=rows.get(actionId)
   if(!row || filters.some(([k,v])=>row[k]!==v))return {data:null,error:null}
   if(mode==='update'){if(options.updateError)return {data:null,error:{message:'unavailable'}};Object.assign(row,values);return {data:{...row},error:null}}
   return {data:{...row},error:null}
  }
  return q
 }}
 const filename=fileURLToPath(new URL('./websiteReplyDelivery.ts',import.meta.url));const compiled=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
 const m=new Module(filename);m.filename=filename;m.require=id=>{
  if(id==='@/lib/notion/liveContent')return {getLiveContent:async()=>({tools:[],articles:options.withdrawn?[]:[content.slug]})}
  if(id==='@/lib/siteUrl')return {websiteSiteUrl:()=> 'https://www.planetsorted.com'}
  if(id==='./deliveryActions')return {
   isActionId:v=>v===actionId,deliveryRequestHash:()=> 'hash',
   claimDelivery:async(_a,input)=>{const row=rows.get(input.actionId);if(row)return {...row,created:false};const value={user_id:userId,action_key:actionId,slug:content.slug,delivery_status:'pending',delivery_reason:null,updated_at:new Date().toISOString(),awaiting_reply:false};rows.set(actionId,value);return {...value,created:true}},
   deliveryResponse:(id,status,reason)=>({actionId:id,deliveryStatus:status,deliveryReason:reason,whatsappUrl:reason==='awaiting_reply'?websiteReplyLink(id):undefined}),
   finishDelivery:async(_a,_u,id,status,reason,ids)=>{Object.assign(rows.get(id),{delivery_status:status,delivery_reason:reason,message_ids:ids});calls.push(['finish',status,reason])},
  }
  if(id==='./send')return {WhatsAppSendError,sendWhatsAppContentCard:async c=>{calls.push(['card',c]);if(options.sendError)throw options.sendError;return {messageId:'fixture-card'}},sendWhatsAppMessage:async(to,text)=>{calls.push(['text',to,text]);return {messageId:'fixture-text'}},sendWhatsAppAudio:async()=>({messageId:'fixture-audio'})}
  if(id==='./splitIntoChunks')return {splitIntoChunks:(s)=>[s]}
  if(id==='@/lib/og/imageUrl')return {ogImageForContent:()=> 'https://www.planetsorted.com/image.png'}
  return require(id)
 };m._compile(compiled,filename)
 return {...m.exports,admin,rows,calls,content}
}
const payload={includeLink:true,includeProtocol:true,includeAudio:false}
test('request stages only; verified inbound reply sends protocol once despite concurrent retries',async()=>{
 const f=fixture();const staged=await f.stageWebsiteReply(f.admin,userId,actionId,f.content.slug,payload)
 assert.equal(staged.deliveryReason,'awaiting_reply');assert.ok(isWebsiteReplyLink(staged.whatsappUrl));assert.equal(f.calls.length,0)
 await Promise.all([f.fulfilWebsiteReply(f.admin,phone,'GET IT SORTED '+actionId),f.fulfilWebsiteReply(f.admin,phone,'GET IT SORTED '+actionId)])
 assert.equal(f.calls.filter(x=>x[0]==='card').length,1);assert.equal(f.calls.filter(x=>x[0]==='text').length,1)
 assert.equal(f.rows.get(actionId).delivery_status,'accepted')
 await f.fulfilWebsiteReply(f.admin,phone,'GET IT SORTED '+actionId)
 assert.equal(f.calls.filter(x=>x[0]==='card').length,1)
})
test('wrong sender, expired requests, STOP and unpublished content never send',async()=>{
 const f=fixture();await f.stageWebsiteReply(f.admin,userId,actionId,f.content.slug,payload)
 assert.equal(await f.fulfilWebsiteReply(f.admin,phone,'STOP'),false)
 await f.fulfilWebsiteReply(f.admin,'447000000001','GET IT SORTED '+actionId);assert.equal(f.calls.length,0)
 f.rows.get(actionId).reply_expires_at=new Date(0).toISOString();await f.fulfilWebsiteReply(f.admin,phone,'GET IT SORTED '+actionId)
 assert.equal(f.rows.get(actionId).delivery_reason,'request_expired');assert.ok(!f.calls.some(x=>x[0]==='card'))
 const stopped=fixture({profile:{whatsapp_opted_out:true}});await assert.rejects(stopped.stageWebsiteReply(stopped.admin,userId,actionId,'useful-guide',payload),/paused/)
 const withdrawn=fixture({withdrawn:true});await assert.rejects(withdrawn.stageWebsiteReply(withdrawn.admin,userId,actionId,'useful-guide',payload),/no longer/)
})
test('uncertain provider outcome remains unknown and duplicate inbound never retries it',async()=>{
 const f=fixture({sendError:new WhatsAppSendError('Timeout')});await f.stageWebsiteReply(f.admin,userId,actionId,f.content.slug,payload)
 await f.fulfilWebsiteReply(f.admin,phone,'GET IT SORTED '+actionId);await f.fulfilWebsiteReply(f.admin,phone,'GET IT SORTED '+actionId)
 assert.equal(f.rows.get(actionId).delivery_status,'unknown');assert.equal(f.calls.filter(x=>x[0]==='card').length,1)
})
test('WhatsApp links cannot navigate to arbitrary hosts',()=>{
 assert.equal(isWebsiteReplyLink('https://evil.example/447000000000'),false);assert.equal(isWebsiteReplyLink('javascript:alert(1)'),false)
 assert.match(decodeURIComponent(websiteReplyLink(actionId).replace(/\+/g,' ')),/GET IT SORTED/)
})

test('waiting-for-reply survives normal processing timeout but expires safely after fifteen minutes',()=>{
 const fresh=deliveryResponse(actionId,'pending','awaiting_reply',new Date(Date.now()-3*60_000).toISOString());assert.equal(fresh.deliveryStatus,'pending');assert.ok(fresh.whatsappUrl);
 const expired=deliveryResponse(actionId,'pending','awaiting_reply',new Date(Date.now()-16*60_000).toISOString());assert.equal(expired.deliveryStatus,'failed');assert.equal(expired.deliveryReason,'request_expired');assert.equal(expired.whatsappUrl,undefined);
});

test('an empty delivery intent cannot be reported as a send',async()=>{const f=fixture();await assert.rejects(f.stageWebsiteReply(f.admin,userId,actionId,f.content.slug,{includeLink:false,includeProtocol:false,includeAudio:false}),/Choose an item/);assert.equal(f.calls.length,0)});

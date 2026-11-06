import test from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose'
import { verifyAutomationPublisher, GAMMA_SYNC_AUDIENCE, CRM_SYNC_AUDIENCE } from './automationPublisher.ts'
import { validatePresentation, isCurrentSnapshot } from './presentationData.ts'

test('only the signed main-branch repository workflow can publish; tokens are audience-bound and expire', async () => {
 const {privateKey,publicKey}=await generateKeyPair('RS256')
 const key=await exportJWK(publicKey);key.kid='test'
 const keys=createLocalJWKSet({keys:[key]})
 const claims={repository:'claudiokurath/planetsorted',ref:'refs/heads/main',workflow_ref:'claudiokurath/planetsorted/.github/workflows/sync-gamma.yml@refs/heads/main',event_name:'schedule'}
 const token=(patch={},aud=GAMMA_SYNC_AUDIENCE,issued=Math.floor(Date.now()/1000))=>new SignJWT({...claims,...patch}).setProtectedHeader({alg:'RS256',kid:'test'}).setIssuer('https://token.actions.githubusercontent.com').setAudience(aud).setIssuedAt(issued).setExpirationTime(issued+300).sign(privateKey)
 await verifyAutomationPublisher(await token(),GAMMA_SYNC_AUDIENCE,keys)
 await verifyAutomationPublisher(await token({},CRM_SYNC_AUDIENCE),CRM_SYNC_AUDIENCE,keys)
 await assert.rejects(()=>verifyAutomationPublisher('invalid',GAMMA_SYNC_AUDIENCE,keys))
 for(const patch of [{repository:'someone/planetsorted'},{ref:'refs/pull/1/merge'},{workflow_ref:'claudiokurath/planetsorted/.github/workflows/other.yml@refs/heads/main'},{event_name:'pull_request'}]){
  await assert.rejects(async()=>verifyAutomationPublisher(await token(patch),GAMMA_SYNC_AUDIENCE,keys))
 }
 await assert.rejects(async()=>verifyAutomationPublisher(await token({},CRM_SYNC_AUDIENCE),GAMMA_SYNC_AUDIENCE,keys))
 await assert.rejects(async()=>verifyAutomationPublisher(await token({},GAMMA_SYNC_AUDIENCE,Math.floor(Date.now()/1000)-3600),GAMMA_SYNC_AUDIENCE,keys))
})

test('presentation snapshots accept React text and approved public art, rejecting executable or unbounded inputs',()=>{
 const valid={cards:[{blocks:[{kind:'h1',text:'Current source title'},{kind:'p',text:'<script>Shown as text only</script>'}],images:[{src:'https://cdn.gamma.app/example.png',width:600,height:400}]}]}
 assert.doesNotThrow(()=>validatePresentation(valid))
 for(const src of ['javascript:alert(1)','http://cdn.gamma.app/a.png','https://private.example/a.png','https://cdn.gamma.app@private.example/a.png']){
  const bad=structuredClone(valid);bad.cards[0].images[0].src=src;assert.throws(()=>validatePresentation(bad))
 }
 const bad=structuredClone(valid);bad.cards[0].blocks[0].kind='iframe';assert.throws(()=>validatePresentation(bad))
 assert.throws(()=>validatePresentation({cards:[]}))
})

test('changed sources, failed refreshes and expired snapshots never qualify as current',()=>{
 const now=Date.now();const valid={sourceId:'current',checkedAt:new Date(now).toISOString(),data:{cards:[]}}
 assert.equal(isCurrentSnapshot(valid,'current',now),true)
 assert.equal(isCurrentSnapshot(valid,'replacement',now),false)
 assert.equal(isCurrentSnapshot({...valid,error:'Refresh failed'},'current',now),false)
 assert.equal(isCurrentSnapshot({...valid,checkedAt:new Date(now-45*60_000).toISOString()},'current',now),false)
 assert.equal(isCurrentSnapshot({...valid,checkedAt:'invalid'},'current',now),false)
 assert.equal(isCurrentSnapshot({...valid,checkedAt:new Date(now+60_000).toISOString()},'current',now),false)
})

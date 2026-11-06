import test from 'node:test'
import assert from 'node:assert/strict'
import { buttonRelayPayload } from './buttonRelayPayload.ts'
const card={messaging_product:'whatsapp',to:'447000000000',type:'interactive',interactive:{type:'cta_url',header:{type:'image',image:{link:'https://api.sor7ed.com/api/card-images/abc123def456?signature='+'a'.repeat(64)}},body:{text:'Original page\n\nexample.com'},action:{name:'cta_url',parameters:{display_text:'Open',url:'https://example.com/page?q=1#section'}}}}
test('only narrow image CTA fields and original destination survive the relay',()=>{
 const result=buttonRelayPayload({...card,token:'never-forward',interactive:{...card.interactive,footer:{text:'not allowed'}}})
 assert.equal(result.interactive.action.parameters.url,card.interactive.action.parameters.url)
 assert.equal(result.interactive.header.image.link,card.interactive.header.image.link)
 assert.equal(result.token,undefined);assert.equal(result.interactive.footer,undefined)
})
test('rejects arbitrary media origins, unsigned images and unsafe Open destinations',()=>{
 for(const link of ['https://evil.example/image.png','https://api.sor7ed.com/arbitrary?signature='+'a'.repeat(64),'https://api.sor7ed.com/api/card-images/abc123def456','https://api.sor7ed.com/api/card-images/abc123def456?signature='+'a'.repeat(64)+'&url=http://localhost/']) assert.equal(buttonRelayPayload({...card,interactive:{...card.interactive,header:{type:'image',image:{link}}}}),null)
 for(const url of ['javascript:alert(1)','https://user:pass@example.com/','http://127.0.0.1/','http://localhost/'])assert.equal(buttonRelayPayload({...card,interactive:{...card.interactive,action:{name:'cta_url',parameters:{display_text:'Open',url}}}}),null)
 assert.equal(buttonRelayPayload({...card,interactive:{...card.interactive,type:'button'}}),null)
 assert.equal(buttonRelayPayload({...card,interactive:{...card.interactive,body:{text:'a'.repeat(1025)}}}),null)
})

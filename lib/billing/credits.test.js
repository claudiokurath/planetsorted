import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { paywallMessage, SIGNUP_CREDITS, SIGNUP_REASON, RUN_REASON } from './credits.ts'

describe('credits constants', () => {
  it('grants 5 signup credits', () => {
    assert.equal(SIGNUP_CREDITS, 5)
  })
  it('uses stable reason keys', () => {
    assert.equal(SIGNUP_REASON, 'signup_grant')
    assert.equal(RUN_REASON, 'whatsapp_run')
  })
})

describe('paywallMessage', () => {
  it('mentions free runs exhausted and upgrade URL', () => {
    const msg = paywallMessage('https://planetsorted.com/r/upgrade', 0)
    assert.match(msg, /5 free WhatsApp tool runs/)
    assert.match(msg, /planetsorted\.com\/r\/upgrade/)
    assert.match(msg, /SAVE/)
    assert.match(msg, /Plus/)
  })

  it('reports remaining balance when > 0', () => {
    const msg = paywallMessage('https://planetsorted.com/r/upgrade', 2)
    assert.match(msg, /2 free runs left/)
  })

  it('singular when balance is 1', () => {
    const msg = paywallMessage('https://example.com', 1)
    assert.match(msg, /1 free run left/)
  })
})

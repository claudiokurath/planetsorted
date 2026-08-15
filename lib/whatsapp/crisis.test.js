import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { detectCrisis, CRISIS_RESPONSE } from './crisis.ts'

describe('detectCrisis', () => {
  it('flags clear crisis phrases', () => {
    assert.equal(detectCrisis('I want to kill myself'), true)
    assert.equal(detectCrisis('thinking about suicide'), true)
  })

  it('does not flag ordinary messages', () => {
    assert.equal(detectCrisis('TAX'), false)
    assert.equal(detectCrisis('how do I save money'), false)
    assert.equal(detectCrisis('HELP'), false)
  })

  it('exports a non-empty crisis response', () => {
    assert.ok(typeof CRISIS_RESPONSE === 'string' && CRISIS_RESPONSE.length > 20)
  })
})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getContentDeliveryUrl } from './deliveryUrl.ts'

describe('getContentDeliveryUrl', () => {
  it('uses the Gamma presentation for an article', () => {
    assert.equal(
      getContentDeliveryUrl('https://planetsorted.com', {
        slug: 'decision-fatigue',
        type: 'Article',
        gammaUrl: 'https://gamma.app/docs/decision-fatigue',
      }),
      'https://gamma.app/docs/decision-fatigue'
    )
  })

  it('keeps the SOR7ED short link for tools', () => {
    assert.equal(
      getContentDeliveryUrl('https://planetsorted.com', {
        slug: 'adhd-tax-calculator',
        type: 'Tool',
        gammaUrl: 'https://gamma.app/docs/ignored',
      }),
      'https://planetsorted.com/r/adhd-tax-calculator'
    )
  })

  it('falls back when an article has no safe Gamma URL', () => {
    assert.equal(
      getContentDeliveryUrl('https://planetsorted.com/', {
        slug: 'medical-trauma',
        type: 'Article',
        gammaUrl: 'javascript:alert(1)',
      }),
      'https://planetsorted.com/r/medical-trauma'
    )
  })
})

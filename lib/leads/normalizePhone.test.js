import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizePhone,
  normalizePartnerSlug,
  normalizeToolSlug,
} from './normalizePhone.ts'

describe('normalizePhone', () => {
  it('strips formatting and keeps digits', () => {
    assert.equal(normalizePhone('+44 7591 922247'), '447591922247')
    assert.equal(normalizePhone('(415) 555-2671'), '4155552671')
  })
  it('rejects too short / too long / junk', () => {
    assert.equal(normalizePhone('123'), null)
    assert.equal(normalizePhone('1'.repeat(16)), null)
    assert.equal(normalizePhone('0000000000'), null)
    assert.equal(normalizePhone(null), null)
  })
})

describe('normalizePartnerSlug', () => {
  it('accepts kebab slugs', () => {
    assert.equal(normalizePartnerSlug('Acme-Clinic'), 'acme-clinic')
    assert.equal(normalizePartnerSlug('partner_01'), 'partner_01')
  })
  it('rejects empty / symbols', () => {
    assert.equal(normalizePartnerSlug(''), null)
    assert.equal(normalizePartnerSlug('a'), null)
    assert.equal(normalizePartnerSlug('../evil'), null)
  })
})

describe('normalizeToolSlug', () => {
  it('accepts known tool slugs', () => {
    assert.equal(normalizeToolSlug('adhd-tax-calculator'), 'adhd-tax-calculator')
  })
  it('rejects bad input', () => {
    assert.equal(normalizeToolSlug(''), null)
    assert.equal(normalizeToolSlug('has spaces'), null)
  })
})

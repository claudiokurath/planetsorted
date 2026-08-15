import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  timingSafeEqualHex,
  buildConnectToken,
  verifyConnectToken,
  signConnectToken,
  buildStandaloneAccessToken,
  verifyStandaloneAccessToken,
  generateOtp,
  verifyMetaSignature,
} from './tokens.ts'

// Provide a stable signing secret for the test process.
process.env.CONNECT_TOKEN_SECRET = 'test-signing-secret-not-for-production'
process.env.META_APP_SECRET = 'meta-app-secret-for-tests'
process.env.NODE_ENV = 'test'

describe('timingSafeEqualHex', () => {
  it('returns true for identical strings', () => {
    assert.equal(timingSafeEqualHex('abc123', 'abc123'), true)
  })
  it('returns false for different strings of equal length', () => {
    assert.equal(timingSafeEqualHex('abc123', 'abc124'), false)
  })
  it('returns false for different lengths', () => {
    assert.equal(timingSafeEqualHex('abc', 'abcd'), false)
  })
})

describe('CONNECT tokens', () => {
  it('round-trips a freshly built token', () => {
    const { token } = buildConnectToken('user-uuid-123')
    const result = verifyConnectToken(token)
    assert.deepEqual(result, { ok: true, userId: 'user-uuid-123' })
  })

  it('rejects a tampered signature', () => {
    const { token } = buildConnectToken('user-uuid-123')
    const [userId, expiry] = token.split('.')
    const tampered = `${userId}.${expiry}.${'0'.repeat(32)}`
    assert.equal(verifyConnectToken(tampered).ok, false)
  })

  it('rejects an expired token', () => {
    const expiry = Math.floor(Date.now() / 1000) - 10
    const sig = signConnectToken('user-uuid-123', expiry)
    const token = `user-uuid-123.${expiry}.${sig}`
    const result = verifyConnectToken(token)
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.reason, 'expired')
  })

  it('rejects malformed tokens', () => {
    assert.equal(verifyConnectToken('not-a-token').ok, false)
    assert.equal(verifyConnectToken('').ok, false)
    assert.equal(verifyConnectToken('a.b').ok, false)
  })
})

describe('standalone access tokens', () => {
  it('round-trips a freshly built token for a slug', () => {
    const { token } = buildStandaloneAccessToken('adhd-tax-calculator')
    assert.equal(verifyStandaloneAccessToken('adhd-tax-calculator', token), true)
  })

  it('rejects a token issued for a different slug', () => {
    const { token } = buildStandaloneAccessToken('adhd-tax-calculator')
    assert.equal(verifyStandaloneAccessToken('other-tool', token), false)
  })

  it('rejects the legacy "granted" sentinel', () => {
    assert.equal(verifyStandaloneAccessToken('adhd-tax-calculator', 'granted'), false)
  })

  it('rejects missing / empty tokens', () => {
    assert.equal(verifyStandaloneAccessToken('adhd-tax-calculator', null), false)
    assert.equal(verifyStandaloneAccessToken('adhd-tax-calculator', ''), false)
  })
})

describe('generateOtp', () => {
  it('returns a 6-digit zero-padded string', () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateOtp()
      assert.match(otp, /^\d{6}$/)
    }
  })
})

describe('verifyMetaSignature', () => {
  it('accepts a correctly signed body', async () => {
    const crypto = await import('node:crypto')
    const body = '{"entry":[]}'
    const sig =
      'sha256=' +
      crypto.createHmac('sha256', process.env.META_APP_SECRET).update(body).digest('hex')
    assert.equal(verifyMetaSignature(body, sig), true)
  })

  it('rejects a bad signature', () => {
    assert.equal(
      verifyMetaSignature('{"entry":[]}', 'sha256=' + 'a'.repeat(64)),
      false
    )
  })

  it('rejects a missing header', () => {
    assert.equal(verifyMetaSignature('{"entry":[]}', null), false)
  })
})

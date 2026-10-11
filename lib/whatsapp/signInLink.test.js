import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSignInLinkPayload, matchesPendingSignInToken, signInTokenDigest, sendWhatsAppSignInLink } from './signInLink.ts'

test('sign-in uses the approved template with a private confirmation URL, never free-form text', () => {
  const token = 'member.expiry.signature'
  const payload = buildSignInLinkPayload('447000000000', token, 'https://planetsorted.com')
  assert.equal(payload.type, 'template')
  assert.equal(payload.template.name, 'sor7ed_saved_card')
  assert.equal(payload.template.components[2].parameters[0].text, `auth/whatsapp-confirm?token=${token}`)
  assert.equal(payload.template.components[0].parameters[0].image.link, 'https://planetsorted.com/images/tangle-yellow.png')
  assert.equal('text' in payload, false)
})

test('only the currently pending link matches, and consumed or older links fail closed', () => {
  const digest = signInTokenDigest('latest-link')
  assert.ok(matchesPendingSignInToken('latest-link', digest))
  assert.equal(matchesPendingSignInToken('older-link', digest), false)
  for (const consumed of [null, undefined, '', 'malformed']) assert.equal(matchesPendingSignInToken('latest-link', consumed), false)
})

test('rejected template delivery never silently falls back to text or reports success', async () => {
  const originalFetch = globalThis.fetch
  const previousPhone = process.env.META_PHONE_NUMBER_ID
  const previousToken = process.env.META_WHATSAPP_TOKEN
  process.env.META_PHONE_NUMBER_ID = 'mock-phone'
  process.env.META_WHATSAPP_TOKEN = 'mock-token'
  const calls = []
  globalThis.fetch = async (_url, options) => {
    calls.push(JSON.parse(options.body))
    return Response.json({ error: { code: 132001 } }, { status: 400 })
  }
  try {
    await assert.rejects(sendWhatsAppSignInLink('447000000000', 'private-link', 'https://planetsorted.com'))
    assert.equal(calls.length, 1)
    assert.equal(calls[0].type, 'template')
    globalThis.fetch = async () => Response.json({ messages: [{ id: 'mock-accepted-message' }] })
    await sendWhatsAppSignInLink('447000000000', 'private-link', 'https://planetsorted.com')
  } finally {
    globalThis.fetch = originalFetch
    if (previousPhone === undefined) delete process.env.META_PHONE_NUMBER_ID
    else process.env.META_PHONE_NUMBER_ID = previousPhone
    if (previousToken === undefined) delete process.env.META_WHATSAPP_TOKEN
    else process.env.META_WHATSAPP_TOKEN = previousToken
  }
})

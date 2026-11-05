import test from 'node:test'
import assert from 'node:assert/strict'
import { protocolGammaUrl } from './protocolGamma.ts'

test('Notion Gamma destinations retain their exact presentation and support pasted embed snippets', () => {
  for (const url of ['https://a-protocol.gamma.site/', 'https://gamma.app/docs/My-Protocol-abc123456', 'https://gamma.app/embed/abc123456?mode=present']) assert.equal(protocolGammaUrl(url), url)
  assert.equal(protocolGammaUrl('<iframe src="https://gamma.app/embed/abc123456" title="Protocol"></iframe>'), 'https://gamma.app/embed/abc123456')
})
test('missing or unsafe sources never become delivery redirects', () => {
  for (const value of [null, '', 'not a URL', 'javascript:alert(1)', 'http://a.gamma.site/', 'https://gamma.app.evil.example/', 'https://evilgamma.site/', 'https://name:password@a.gamma.site/', 'https://example.org/file.pdf']) assert.equal(protocolGammaUrl(value), null)
})

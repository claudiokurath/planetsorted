import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { proxiedCoverImage, brandedOgImage, ogImageForContent } from './imageUrl.ts'

describe('proxiedCoverImage', () => {
  it('wraps http covers in image-proxy', () => {
    const url = proxiedCoverImage(
      'https://wyxvbzbqbznqjftbgcxc.supabase.co/storage/v1/object/public/public/notion-files/covers/adhd-tax-calculator.jpg'
    )
    assert.ok(url)
    assert.match(url, /\/api\/image-proxy\?url=/)
    assert.match(url, /adhd-tax-calculator\.jpg/)
  })

  it('rejects empty / non-http', () => {
    assert.equal(proxiedCoverImage(null), null)
    assert.equal(proxiedCoverImage(''), null)
    assert.equal(proxiedCoverImage('/local.png'), null)
  })

  it('keeps first-party public images direct', () => {
    const url = 'https://planetsorted.com/images/sor7ed-logo-white.png'
    assert.equal(proxiedCoverImage(url), url)
  })
})

describe('ogImageForContent', () => {
  it('prefers proxy over branded card when cover exists', () => {
    const url = ogImageForContent('https://example.com/x.jpg', 'Title', 'Desc')
    assert.match(url, /image-proxy/)
  })

  it('falls back to branded /api/og card', () => {
    const url = ogImageForContent(null, 'ADHD Tax', 'Hidden cost')
    assert.match(url, /\/api\/og\?/)
    assert.match(url, /title=ADHD/)
    assert.doesNotMatch(url, /image-proxy/)
  })
})

describe('brandedOgImage', () => {
  it('encodes title', () => {
    const url = brandedOgImage('Hello World')
    assert.match(url, /title=Hello/)
  })
})

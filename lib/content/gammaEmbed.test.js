import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { gammaEmbedUrl } from './gammaEmbed.ts'

describe('gammaEmbedUrl', () => {
  it('passes an embed link straight through', () => {
    assert.equal(
      gammaEmbedUrl('https://gamma.app/embed/j0qerwqt20826zx'),
      'https://gamma.app/embed/j0qerwqt20826zx'
    )
  })

  it('converts a doc share link to an embed link', () => {
    assert.equal(
      gammaEmbedUrl('https://gamma.app/docs/MASKING-IN-INTIMACY-j0qerwqt20826zx'),
      'https://gamma.app/embed/j0qerwqt20826zx'
    )
  })

  it('extracts the src from a full iframe snippet', () => {
    const snippet =
      '<iframe src="https://gamma.app/embed/j0qerwqt20826zx" style="width: 700px; max-width: 100%; height: 450px" allow="fullscreen" title="MASKING IN INTIMACY"></iframe>'
    assert.equal(gammaEmbedUrl(snippet), 'https://gamma.app/embed/j0qerwqt20826zx')
  })

  it('returns null for non-gamma or empty input', () => {
    assert.equal(gammaEmbedUrl(''), null)
    assert.equal(gammaEmbedUrl(null), null)
    assert.equal(gammaEmbedUrl('https://planetsorted.com/r/x'), null)
  })
})

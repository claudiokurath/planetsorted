import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildVersionedCoverPath } from './coverStorage.ts'

describe('buildVersionedCoverPath', () => {
  it('keeps identical image bytes on the same immutable path', () => {
    const bytes = new TextEncoder().encode('same image')
    const first = buildVersionedCoverPath('article-slug', bytes, 'image/png')
    const second = buildVersionedCoverPath('article-slug', bytes, 'image/png')

    assert.equal(first, second)
    assert.match(first, /^notion-files\/covers\/article-slug\/[a-f0-9]{16}\.png$/)
  })

  it('moves changed image bytes to a new path', () => {
    const oldPath = buildVersionedCoverPath(
      'article-slug',
      new TextEncoder().encode('old image'),
      'image/png'
    )
    const newPath = buildVersionedCoverPath(
      'article-slug',
      new TextEncoder().encode('new image'),
      'image/png'
    )

    assert.notEqual(oldPath, newPath)
  })

  it('normalises jpeg content types', () => {
    const path = buildVersionedCoverPath(
      'article-slug',
      new TextEncoder().encode('jpeg image'),
      'image/jpeg; charset=binary'
    )

    assert.match(path, /\.jpg$/)
  })
})

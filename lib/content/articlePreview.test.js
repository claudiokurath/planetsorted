import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { extractArticlePreview } from './articlePreview.ts'

describe('extractArticlePreview', () => {
  it('returns only the text below TL;DR and before the next section', () => {
    const body = [
      '## TL;DR',
      '',
      'This is the useful short answer.',
      '',
      'It can use two paragraphs.',
      '',
      '## THE REST OF THE POST',
      '',
      'This must stay hidden.',
    ].join('\n')

    assert.equal(
      extractArticlePreview(body),
      'This is the useful short answer.\n\nIt can use two paragraphs.'
    )
  })

  it('removes links and markdown formatting from the preview', () => {
    const body = '## TLDR\n\nRead **this** [guide](https://example.com) at https://example.com/extra.'

    assert.equal(extractArticlePreview(body), 'Read this guide at')
  })

  it('uses the supplied fallback when no TLDR section exists', () => {
    assert.equal(extractArticlePreview('A full article.', 'Short summary.'), 'Short summary.')
  })
})

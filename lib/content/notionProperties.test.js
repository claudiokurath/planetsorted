import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getNotionProperty } from './notionProperties.ts'

describe('Notion property names', () => {
  it('reads the current Blog Post Gamma property rather than dropping its embed', () => {
    const embed = { type: 'url', url: '<iframe src="https://gamma.app/embed/example"></iframe>' }
    assert.equal(getNotionProperty({ 'Blog Post Gamma': embed }, 'Blog post Gamma'), embed)
  })
  it('prefers an exact match and does not confuse the protocol field with the article', () => {
    const properties = { 'Blog Post Gamma': 'article', 'Blog post Gamma': 'legacy', 'Protocol Gamma': 'protocol' }
    assert.equal(getNotionProperty(properties, 'Blog Post Gamma'), 'article')
    assert.equal(getNotionProperty(properties, 'Missing Gamma'), undefined)
  })
})

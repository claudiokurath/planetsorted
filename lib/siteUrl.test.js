import { test } from 'node:test'
import assert from 'node:assert/strict'
import { websiteSiteUrl, normaliseWebsiteResourceUrl, CANONICAL_WEBSITE_URL } from './siteUrl.js'

test('website links cannot inherit the retired Button hostname from SITE_URL', () => {
  for (const value of ['https://sor7ed.com', 'https://www.sor7ed.com/', 'https://planetsorted.com', 'https://www.planetsorted.com/']) {
    assert.equal(websiteSiteUrl(value), CANONICAL_WEBSITE_URL)
  }
  for (const value of ['', 'not a URL', 'javascript:alert(1)', 'https://user:secret@example.test']) {
    assert.equal(websiteSiteUrl(value), CANONICAL_WEBSITE_URL)
  }
  assert.equal(websiteSiteUrl('http://localhost:3000/'), 'http://localhost:3000')
  assert.equal(websiteSiteUrl('https://planetsorted-preview.vercel.app/path'), 'https://planetsorted-preview.vercel.app')
})

test('historical website saves and images retain their path, query and hash', () => {
  assert.equal(normaliseWebsiteResourceUrl('https://www.sor7ed.com/r/brain-dump-sorter?mode=full#tool'), `${CANONICAL_WEBSITE_URL}/r/brain-dump-sorter?mode=full#tool`)
  assert.equal(normaliseWebsiteResourceUrl('https://sor7ed.com/images/logo.png'), `${CANONICAL_WEBSITE_URL}/images/logo.png`)
  assert.equal(normaliseWebsiteResourceUrl('https://planetsorted.com/tools/example'), `${CANONICAL_WEBSITE_URL}/tools/example`)
  for (const url of ['https://sor7ed.com/s/partner-link', 'https://external.example/r/resource', 'https://sor7ed.com.evil.example/r/resource', '/relative/resource', 'javascript:alert(1)']) {
    assert.equal(normaliseWebsiteResourceUrl(url), url)
  }
})

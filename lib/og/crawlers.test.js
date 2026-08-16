import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isOgCrawler } from './crawlers.ts'

describe('isOgCrawler', () => {
  it('detects WhatsApp and Facebook scrapers', () => {
    assert.equal(isOgCrawler('WhatsApp/2.23.20.0 A'), true)
    assert.equal(
      isOgCrawler('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'),
      true
    )
    assert.equal(isOgCrawler('Facebot'), true)
  })

  it('detects other common link unfurlers', () => {
    assert.equal(isOgCrawler('Twitterbot/1.0'), true)
    assert.equal(isOgCrawler('Slackbot-LinkExpanding 1.0'), true)
    assert.equal(isOgCrawler('Discordbot/2.0'), true)
    assert.equal(isOgCrawler('TelegramBot (like TwitterBot)'), true)
  })

  it('rejects normal browsers and empty UA', () => {
    assert.equal(
      isOgCrawler(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
      ),
      false
    )
    assert.equal(isOgCrawler(null), false)
    assert.equal(isOgCrawler(''), false)
  })
})

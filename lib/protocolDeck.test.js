import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildProtocolDeck, parseArticleSections } from './protocolDeck.ts'

describe('parseArticleSections', () => {
  it('splits markdown headings into sections', () => {
    const sections = parseArticleSections(
      '# STEP 0: Pick the exit\n\nBody one.\n\n# STEP 1: Name the blast\n\nBody two.'
    )
    assert.equal(sections.length, 2)
    assert.match(sections[0].heading, /STEP 0/i)
    assert.match(sections[1].heading, /STEP 1/i)
  })

  it('strips a leading title when provided', () => {
    const sections = parseArticleSections(
      'THE RELATIONSHIP KIT\n\nIntro paragraph here.\n\n# STEP 0\n\nDetail.',
      'THE RELATIONSHIP KIT'
    )
    assert.ok(sections.length >= 1)
    assert.ok(!sections[0].text.toUpperCase().startsWith('THE RELATIONSHIP KIT'))
  })
})

describe('buildProtocolDeck', () => {
  it('builds cover metadata + step slides + protocol slide', () => {
    const deck = buildProtocolDeck({
      title: 'The Relationship Harm-Reduction Kit',
      lede: 'Shame is paralysing. Accountability is a practical tool.',
      category: 'Connection',
      readTime: '8 min',
      coverImage: 'https://example.com/cover.jpg',
      body: [
        '## STEP 0: Pick the exit (not villain, not exemption)',
        '',
        'VILLAIN DOOR',
        "I'm a monster. I ruin everything.",
        '',
        'EXEMPTION DOOR',
        "It's my ADHD. I can't help it.",
        '',
        '## STEP 1: Name the blast radius',
        '',
        'List who was hit and how.',
      ].join('\n'),
      protocol: [
        '1. Pause before you explain.',
        '2. Name the specific harm.',
        '3. Offer one concrete repair.',
      ].join('\n'),
    })

    assert.equal(deck.title, 'The Relationship Harm-Reduction Kit')
    assert.equal(deck.category, 'Connection')
    assert.equal(deck.coverImage, 'https://example.com/cover.jpg')
    assert.ok(deck.slides.length >= 2)

    const step0 = deck.slides[0]
    assert.equal(step0.badge, 'STEP 0')
    assert.match(step0.title, /PICK THE EXIT/i)
    assert.ok(step0.titleMuted || step0.title.includes('EXIT'))

    // ALL-CAPS subheads become kit cards
    const cardsBlock = step0.blocks.find((b) => b.kind === 'cards')
    assert.ok(cardsBlock, 'expected cards block from VILLAIN/EXEMPTION doors')
    assert.ok(cardsBlock.items.length >= 2)

    assert.ok(deck.protocolSlide)
    assert.equal(deck.protocolSlide.badge, 'PROTOCOL')
    assert.ok(
      deck.protocolSlide.blocks.some((b) => b.kind === 'list' || b.kind === 'paragraph')
    )
  })

  it('falls back to a single overview slide for plain body text', () => {
    const deck = buildProtocolDeck({
      title: 'Plain piece',
      body: 'Just a short paragraph with no headings at all.',
    })
    assert.equal(deck.slides.length, 1)
    assert.equal(deck.slides[0].badge, '01')
    assert.equal(deck.protocolSlide, null)
  })
})

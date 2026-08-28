import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildWhatsAppInteractiveCardPayload,
  buildWhatsAppTemplateCardPayload,
} from './send.ts'

const card = {
  to: '+447700900000',
  slug: 'burnout-anhedonia',
  title: 'Burnout anhedonia is not laziness',
  summary: 'It is depletion — here is what is really going on.',
  imageUrl: 'https://planetsorted.com/api/image-proxy?url=cover',
  url: 'https://planetsorted.com/go/burnout-anhedonia',
}

test('builds the clean image-header template card', () => {
  const payload = buildWhatsAppTemplateCardPayload(card, 'sor7ed_revisit_card')

  assert.equal(payload.type, 'template')
  assert.equal(payload.template.name, 'sor7ed_revisit_card')
  assert.equal(payload.template.components[0].parameters[0].image.link, card.imageUrl)
  assert.equal(payload.template.components[1].parameters.length, 1)
  assert.equal(payload.template.components[1].parameters[0].text, card.title.toUpperCase())
  assert.equal(payload.template.components[2].parameters[0].text, `go/${card.slug}`)
})

test('keeps the approved legacy template as a compatible fallback', () => {
  const payload = buildWhatsAppTemplateCardPayload(card, 'sor7ed_saved_card')

  assert.equal(payload.template.components[1].parameters[0].text, 'SOR7ED')
  assert.equal(payload.template.components[1].parameters[1].text, card.title.toUpperCase())
})

test('builds an immediate image CTA card with the delivery URL', () => {
  const payload = buildWhatsAppInteractiveCardPayload(card)

  assert.equal(payload.type, 'interactive')
  assert.equal(payload.interactive.type, 'cta_url')
  assert.equal(payload.interactive.header.image.link, card.imageUrl)
  assert.equal(payload.interactive.body.text, `*${card.title.toUpperCase()}*\n\nType below to revisit.`)
  assert.equal(payload.interactive.footer, undefined)
  assert.equal(payload.interactive.action.parameters.url, card.url)
  assert.equal(payload.interactive.action.parameters.display_text, 'Open protocol')
})

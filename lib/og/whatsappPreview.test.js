import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('./whatsappPreview.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText
  .replace("'./imageUrl'", JSON.stringify(new URL('./imageUrl.ts', import.meta.url).href))
  .replace("'../siteUrl.js'", JSON.stringify(new URL('../siteUrl.js', import.meta.url).href))
const { whatsappPreviewMetadata } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('WhatsApp preview has the original artwork and title, with no description', () => {
  const cover = 'https://planetsorted.com/images/cover.webp'
  const metadata = whatsappPreviewMetadata('Financial avoidance', 'financial-avoidance', cover)
  assert.equal(metadata.openGraph.title, 'Financial avoidance')
  assert.equal(metadata.openGraph.images[0].url, 'https://www.planetsorted.com/images/cover.webp')
  assert.equal(metadata.description, null)
  assert.equal(metadata.openGraph.description, undefined)
  assert.equal(metadata.twitter.description, undefined)
  assert.match(metadata.openGraph.url, /\/r\/financial-avoidance$/)
})

test('missing artwork uses the logo instead of baking a second title or summary into the image', () => {
  const metadata = whatsappPreviewMetadata('Title', 'example', null)
  assert.match(metadata.openGraph.images[0].url, /\/images\/sor7ed-logo-white\.png$/)
  assert.doesNotMatch(metadata.openGraph.images[0].url, /title=|description=|api\/og/)
})

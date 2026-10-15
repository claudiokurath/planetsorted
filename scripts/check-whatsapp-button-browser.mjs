/**
 * Actual React components, isolated development fixture, mocked auth/delivery.
 * Run with Playwright installed, or set PLAYWRIGHT_MODULE to its package path.
 * Example: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/check-whatsapp-button-browser.mjs
 * The temporary route is removed on exit; no messages or remote writes occur.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile, unlink, rmdir } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const root = fileURLToPath(new URL('../', import.meta.url))
const port = Number(process.env.BUTTON_TEST_PORT || 3211)
const origin = `http://127.0.0.1:${port}`
const fixtureDir = resolve(root, 'app/button-reliability-check')
const fixtureFile = resolve(fixtureDir, 'page.tsx')
const userId = '00000000-0000-4000-8000-000000000001'
let server
let browser
let passed = 0
let createdFixture = false
const pageErrors = []

function sessionCookie() {
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url')
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })}.test`
  return {
    name: 'sb-button-fixture-auth-token', domain: '127.0.0.1', path: '/',
    value: `base64-${encode({ access_token: token, refresh_token: 'fixture-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, token_type: 'bearer', user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.invalid' } })}`,
  }
}

function result(actionId, deliveryStatus) {
  return { success: deliveryStatus === 'accepted', actionId, saveStatus: 'saved', deliveryStatus, deliveryReason: null }
}

async function context({ auth = true, profile = { whatsapp_verified: true, whatsapp_opted_out: false } } = {}) {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
  if (auth) await ctx.addCookies([sessionCookie()])
  await ctx.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/profile') return route.fulfill({ status: 200, json: profile })
    if (url.hostname.includes('supabase')) return route.fulfill({ status: 200, json: { id: userId, email: 'fixture@example.invalid' } })
    if (url.hostname === '127.0.0.1' && !url.pathname.startsWith('/api/')) return route.continue()
    // Every unmatched API/external call is blocked, including message providers.
    return route.abort()
  })
  const page = await ctx.newPage()
  page.on('pageerror', error => pageErrors.push(error.message))
  return { ctx, page }
}

async function open(page, mode = 'button', suffix = '') {
  await page.goto(`${origin}/button-reliability-check?mode=${mode}${suffix}`, { waitUntil: 'networkidle', timeout: 120_000 })
}

async function scenario(name, run) {
  await run()
  passed++
  console.log(`PASS ${name}`)
}

try {
  await mkdir(fixtureDir)
  createdFixture = true
  await writeFile(fixtureFile, `
import { ToolWhatsAppCta } from '@/components/ToolWhatsAppCta'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'
import { ConnectWhatsAppForm } from '@/app/connect/ConnectWhatsAppForm'
import { DashboardClient } from '@/components/DashboardClient'
import { Suspense } from 'react'
export default async function Check({searchParams}:{searchParams:Promise<{mode?:string;actionId?:string}>}) {
 const p=await searchParams;const mode=p.mode||'button'
 if(mode==='returned')return <p data-testid="returned">Returned to browsing</p>
 if(mode==='dashboard')return <Suspense><DashboardClient/></Suspense>
 if(mode.startsWith('connect'))return <ConnectWhatsAppForm userId="${userId}" nextPath="/button-reliability-check?mode=returned" slug={mode==='connect-general'?undefined:'brain-dump-sorter'} context={mode==='connect-general'?undefined:'tool'} alreadyConnected={mode==='connect-ready'} actionId={p.actionId}/>
 if(mode==='legacy')return <SaveToPhoneButton slug="brain-dump-sorter" context="tool" isLoggedIn whatsappVerified/>
 return <section><div data-testid="first"><ToolWhatsAppCta slug="brain-dump-sorter"/></div>{mode==='duplicate'?<div data-testid="second"><ToolWhatsAppCta slug="brain-dump-sorter"/></div>:null}</section>
}`)
  const log = createWriteStream('/tmp/planetsorted-button-browser-server.log')
  server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: root,
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: 'https://button-fixture.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fixture-anon', NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.pipe(log); server.stderr.pipe(log)
  let available = false
  for (let i = 0; i < 100; i++) {
    try { const response = await fetch(`${origin}/button-reliability-check?mode=returned`); if (response.ok) { available = true; break } } catch { /* startup */ }
    if (server.exitCode !== null) throw new Error('Fixture server exited; see /tmp/planetsorted-button-browser-server.log')
    await new Promise(resolveWait => setTimeout(resolveWait, 250))
  }
  assert.ok(available, 'Fixture server did not become ready')
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] })

  await scenario('rapid clicks and duplicate controls create one accepted request', async () => {
    const { ctx, page } = await context()
    let posts = 0
    await ctx.route('**/api/save-to-phone*', async route => {
      assert.equal(route.request().method(), 'POST')
      posts++
      const body = route.request().postDataJSON()
      assert.match(body.idempotencyKey, /^[0-9a-f-]{36}$/)
      await new Promise(resolveWait => setTimeout(resolveWait, 250))
      return route.fulfill({ status: 201, json: result(body.idempotencyKey, 'accepted') })
    })
    await open(page, 'duplicate')
    await page.getByTestId('first').getByRole('button', { name: 'Get this tool via WhatsApp — SOR7ED' }).waitFor()
    await page.evaluate(() => { for (let i = 0; i < 20; i++) document.querySelector('[data-testid="first"] button').click(); document.querySelector('[data-testid="second"] button').click() })
    await page.getByTestId('first').locator('.sb__label--lead').filter({ hasText: 'Message sent' }).waitFor()
    await page.getByTestId('second').locator('.sb__label--lead').filter({ hasText: 'Message sent' }).waitFor()
    assert.equal(posts, 1)
    assert.equal(await page.getByTestId('first').locator('.sb').evaluate(node => node.style.getPropertyValue('--t')), '1.000')
    assert.match(await page.getByTestId('first').innerText(), /delivery is not yet confirmed/)
    await ctx.close()
  })

  for (const state of ['pending', 'failed', 'skipped', 'unknown']) {
    await scenario(`${state} HTTP201 never animates success; next click only checks`, async () => {
      const { ctx, page } = await context()
      let posts = 0; let gets = 0; let actionId
      await ctx.route('**/api/save-to-phone*', route => {
        if (route.request().method() === 'POST') { posts++; actionId = route.request().postDataJSON().idempotencyKey }
        else { gets++; assert.equal(new URL(route.request().url()).searchParams.get('actionId'), actionId) }
        return route.fulfill({ status: 201, json: result(actionId, state) })
      })
      await open(page)
      await page.getByTestId('first').getByRole('button', { name: 'Get this tool via WhatsApp — SOR7ED' }).click()
      const check = page.getByTestId('first').getByRole('button', { name: 'Check WhatsApp status — SOR7ED' })
      await check.waitFor()
      assert.equal(await page.getByTestId('first').locator('.sb').evaluate(node => Number(node.style.getPropertyValue('--t'))), 0)
      assert.doesNotMatch(await page.getByTestId('first').innerText(), /Message sent|Delivered/)
      assert.equal(await page.getByTestId('first').getByRole('button', { name: 'Try sending again' }).count(), state === 'failed' || state === 'skipped' ? 1 : 0)
      await check.click()
      await page.waitForFunction(() => !document.querySelector('[data-testid="first"] button').disabled)
      assert.equal(posts, 1); assert.equal(gets, 1)
      await ctx.close()
    })
  }

  await scenario('lost response plus reload checks original action without resending', async () => {
    const { ctx, page } = await context()
    let posts = 0; let gets = 0; let actionId
    await ctx.route('**/api/save-to-phone*', route => {
      if (route.request().method() === 'POST') { posts++; actionId = route.request().postDataJSON().idempotencyKey; return route.abort() }
      gets++; assert.equal(new URL(route.request().url()).searchParams.get('actionId'), actionId)
      return route.fulfill({ status: 200, json: result(actionId, 'accepted') })
    })
    await open(page)
    await page.getByTestId('first').getByRole('button', { name: 'Get this tool via WhatsApp — SOR7ED' }).click()
    await page.getByTestId('first').getByRole('alert').waitFor()
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByTestId('first').getByRole('button', { name: 'Get this tool via WhatsApp — SOR7ED' }).click()
    await page.getByTestId('first').locator('.sb__label--lead').filter({ hasText: 'Message sent' }).waitFor()
    assert.equal(posts, 1); assert.equal(gets, 1)
    await ctx.close()
  })

  await scenario('legacy account button rejects 2xx failed confirmation', async () => {
    const { ctx, page } = await context()
    await ctx.route('**/api/save-to-phone*', route => route.fulfill({ status: 201, json: result(route.request().postDataJSON().idempotencyKey, 'failed') }))
    await open(page, 'legacy')
    await page.getByRole('button', { name: 'SEND TO MY WHATSAPP →' }).click()
    await page.getByRole('button', { name: 'Check WhatsApp status →' }).waitFor()
    assert.doesNotMatch(await page.locator('#main-content').innerText(), /Message sent/)
    await ctx.close()
  })

  await scenario('a deliberate failed-send recovery uses a fresh ID once and keeps it after acceptance', async () => {
    const { ctx, page } = await context()
    const ids = []
    let gets = 0
    await ctx.route('**/api/save-to-phone*', route => {
      if (route.request().method() === 'POST') {
        const id = route.request().postDataJSON().idempotencyKey
        ids.push(id)
        return route.fulfill({ status: 201, json: result(id, ids.length === 1 ? 'failed' : 'accepted') })
      }
      gets++
      assert.equal(new URL(route.request().url()).searchParams.get('actionId'), ids[1])
      return route.fulfill({ status: 200, json: result(ids[1], 'accepted') })
    })
    await open(page)
    await page.getByTestId('first').getByRole('button', { name: 'Get this tool via WhatsApp — SOR7ED' }).click()
    await page.getByTestId('first').getByRole('button', { name: 'Try sending again' }).click()
    await page.getByTestId('first').locator('.sb__label--lead').filter({ hasText: 'Message sent' }).waitFor()
    assert.equal(ids.length, 2); assert.notEqual(ids[0], ids[1])
    await page.getByTestId('first').getByRole('button', { name: 'Get this tool via WhatsApp — SOR7ED' }).waitFor()
    await page.getByTestId('first').getByRole('button', { name: 'Get this tool via WhatsApp — SOR7ED' }).click()
    await page.getByTestId('first').locator('.sb__label--lead').filter({ hasText: 'Message sent' }).waitFor()
    assert.equal(ids.length, 2); assert.equal(gets, 1)
    await ctx.close()
  })

  await scenario('connect recovery updates the URL before sending and survives reload', async () => {
    const { ctx, page } = await context()
    const originalId = '20000000-0000-4000-8000-000000000002'
    const ids = []
    let gets = 0
    await ctx.route('**/api/save-to-phone*', route => {
      if (route.request().method() === 'POST') {
        const id = route.request().postDataJSON().idempotencyKey
        ids.push(id)
        assert.equal(new URL(page.url()).searchParams.get('actionId'), id)
        return route.fulfill({ status: 201, json: result(id, ids.length === 1 ? 'skipped' : 'pending') })
      }
      gets++
      assert.equal(new URL(route.request().url()).searchParams.get('actionId'), ids[1])
      return route.fulfill({ status: 200, json: result(ids[1], 'accepted') })
    })
    await open(page, 'connect-ready', `&actionId=${originalId}`)
    await page.getByRole('button', { name: 'Get this tool via WhatsApp →' }).click()
    await page.getByRole('button', { name: 'Try sending again' }).click()
    await page.getByRole('button', { name: 'Check my request status →' }).waitFor()
    assert.equal(ids.length, 2); assert.notEqual(ids[0], ids[1])
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Check my request status →' }).click()
    await page.getByTestId('returned').waitFor()
    assert.equal(ids.length, 2); assert.equal(gets, 1)
    await ctx.close()
  })

  await scenario('signed-out and unverified navigation carries one action UUID', async () => {
    for (const auth of [false, true]) {
      const { ctx, page } = await context({ auth, profile: { whatsapp_verified: false } })
      await open(page)
      const link = page.getByTestId('first').getByRole('link', { name: 'Get this tool via WhatsApp — SOR7ED' })
      await link.waitFor()
      let url = new URL(await link.getAttribute('href'), origin)
      if (!auth) { assert.equal(url.pathname, '/signup'); url = new URL(url.searchParams.get('next'), origin) }
      assert.equal(url.pathname, '/connect')
      assert.match(url.searchParams.get('actionId'), /^[0-9a-f-]{36}$/)
      const initial = url.searchParams.get('actionId')
      await page.reload({ waitUntil: 'networkidle' })
      const restored = new URL(await page.getByTestId('first').getByRole('link').getAttribute('href'), origin)
      const setup = auth ? restored : new URL(restored.searchParams.get('next'), origin)
      assert.equal(setup.searchParams.get('actionId'), initial)
      await ctx.close()
    }
  })

  await scenario('OTP and verification submit guards; pending send only checks status', async () => {
    const { ctx, page } = await context()
    const actionId = '10000000-0000-4000-8000-000000000001'
    let codes = 0; let verifies = 0; let posts = 0; let gets = 0
    await ctx.route('**/api/whatsapp/send-otp', async route => {
      codes++; await new Promise(resolveWait => setTimeout(resolveWait, 200))
      return route.fulfill({ status: 200, json: { success: true, state: 'accepted' } })
    })
    await ctx.route('**/api/whatsapp/verify-otp', async route => {
      verifies++; await new Promise(resolveWait => setTimeout(resolveWait, 200))
      return route.fulfill({ status: 200, json: { success: true } })
    })
    await ctx.route('**/api/save-to-phone*', route => {
      if (route.request().method() === 'POST') { posts++; assert.equal(route.request().postDataJSON().idempotencyKey, actionId); return route.fulfill({ status: 201, json: result(actionId, 'pending') }) }
      gets++; return route.fulfill({ status: 200, json: result(actionId, 'accepted') })
    })
    await open(page, 'connect', `&actionId=${actionId}`)
    await page.locator('#whatsapp-number').fill('7700900000')
    await page.evaluate(() => { const form = document.querySelector('#whatsapp-number').closest('form'); for (let i = 0; i < 20; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    await page.locator('#whatsapp-code').waitFor()
    assert.equal(codes, 1)
    await page.locator('#whatsapp-code').fill('123456')
    await page.evaluate(() => { const form = document.querySelector('#whatsapp-code').closest('form'); for (let i = 0; i < 20; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    await page.getByRole('button', { name: 'Check my request status →' }).waitFor()
    assert.equal(verifies, 1); assert.equal(posts, 1)
    assert.match(await page.locator('#main-content').innerText(), /Saved. WhatsApp sending is still in progress/)
    assert.ok(!page.url().includes('mode=returned'))
    await page.getByRole('button', { name: 'Check my request status →' }).click()
    await page.getByTestId('returned').waitFor()
    assert.equal(posts, 1); assert.equal(gets, 1)
    await ctx.close()
  })

  await scenario('ambiguous OTP response accepts an arriving code without minting another', async () => {
    const { ctx, page } = await context()
    let calls = 0
    await ctx.route('**/api/whatsapp/send-otp', route => { calls++; return route.fulfill({ status: 503, json: { state: 'unknown' } }) })
    await open(page, 'connect')
    await page.locator('#whatsapp-number').fill('7700900000')
    await page.getByRole('button', { name: 'Send my code →' }).click()
    await page.locator('#whatsapp-code').waitFor()
    assert.match(await page.locator('#main-content').getByRole('alert').innerText(), /If it arrives, enter it/)
    assert.equal(calls, 1)
    await ctx.close()
  })

  await scenario('OTP configuration failure stays on number form', async () => {
    const { ctx, page } = await context()
    await ctx.route('**/api/whatsapp/send-otp', route => route.fulfill({ status: 503, json: { error: 'RAW_PRIVATE_CONFIG' } }))
    await open(page, 'connect')
    await page.locator('#whatsapp-number').fill('7700900000')
    await page.getByRole('button', { name: 'Send my code →' }).click()
    await page.locator('#main-content').getByRole('alert').waitFor()
    assert.equal(await page.locator('#whatsapp-code').count(), 0)
    assert.doesNotMatch(await page.locator('#main-content').innerText(), /RAW_PRIVATE_CONFIG/)
    await ctx.close()
  })

  await scenario('account settings also accept an ambiguous OTP and guard duplicate submits', async () => {
    const profile = { whatsapp_verified: false, whatsapp_opted_out: false, whatsapp_number: '', first_name: 'Fixture', weekly_opted_in: false }
    const { ctx, page } = await context({ profile })
    let codes = 0; let verifies = 0
    await ctx.route('**/api/saved-items', route => route.fulfill({ status: 200, json: [] }))
    await ctx.route('**/api/billing/status', route => route.fulfill({ status: 200, json: { plan: 'Free', unlimited: false } }))
    await ctx.route('**/api/whatsapp/send-otp', async route => {
      codes++; await new Promise(resolveWait => setTimeout(resolveWait, 200))
      return route.fulfill({ status: 503, json: { state: 'unknown' } })
    })
    await ctx.route('**/api/whatsapp/verify-otp', async route => {
      verifies++; await new Promise(resolveWait => setTimeout(resolveWait, 200))
      profile.whatsapp_verified = true; profile.whatsapp_number = '447700900000'
      return route.fulfill({ status: 200, json: { success: true } })
    })
    await open(page, 'dashboard', '&tab=settings')
    await page.locator('#whatsapp').fill('447700900000')
    await page.evaluate(() => { const form = document.querySelector('#whatsapp').closest('form'); for (let i = 0; i < 20; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    await page.locator('#otp').waitFor()
    assert.equal(codes, 1)
    assert.match(await page.locator('#otp').locator('..').locator('..').getByRole('alert').innerText(), /If it arrives, enter it/)
    await page.locator('#otp').fill('123456')
    await page.evaluate(() => { const form = document.querySelector('#otp').closest('form'); for (let i = 0; i < 20; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    await page.getByText('Linked Phone Number:').waitFor()
    assert.equal(verifies, 1)
    await ctx.close()
  })

  await scenario('general connection does not send an unspecified resource', async () => {
    const { ctx, page } = await context()
    let deliveries = 0
    await ctx.route('**/api/whatsapp/send-otp', route => route.fulfill({ status: 200, json: { success: true, state: 'accepted' } }))
    await ctx.route('**/api/whatsapp/verify-otp', route => route.fulfill({ status: 200, json: { success: true } }))
    await ctx.route('**/api/save-to-phone*', route => { deliveries++; return route.abort() })
    await open(page, 'connect-general')
    await page.locator('#whatsapp-number').fill('7700900000')
    await page.getByRole('button', { name: 'Send my code →' }).click()
    await page.locator('#whatsapp-code').fill('123456')
    await page.getByRole('button', { name: 'Connect WhatsApp →' }).click()
    await page.getByTestId('returned').waitFor()
    assert.equal(deliveries, 0)
    await ctx.close()
  })

  await scenario('small screens and reduced motion preserve accessible control', async () => {
    const { ctx, page } = await context()
    await open(page)
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      assert.ok(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `overflow at ${width}`)
      const control = page.getByTestId('first').getByRole('button', { name: 'Get this tool via WhatsApp — SOR7ED' })
      assert.ok(await control.isEnabled())
      await control.focus(); assert.ok(await control.evaluate(node => node === document.activeElement))
      const box = await control.boundingBox(); assert.ok(box.width >= 44 && box.height >= 44)
    }
    await ctx.close()
  })
  assert.deepEqual(pageErrors, [])
  console.log(`${passed} browser scenarios passed; all delivery calls were mocked.`)
} finally {
  if (browser) await browser.close()
  if (server) {
    server.kill('SIGTERM')
    await new Promise(resolveWait => { const timer = setTimeout(() => { server.kill('SIGKILL'); resolveWait() }, 2_000); server.once('exit', () => { clearTimeout(timer); resolveWait() }) })
  }
  if (createdFixture) {
    await unlink(fixtureFile).catch(() => undefined)
    await rmdir(fixtureDir).catch(() => undefined)
  }
}

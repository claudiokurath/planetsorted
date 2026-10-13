import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import test, { after } from 'node:test'

// These tests deliberately use a real, disposable PostgreSQL database. They
// never read DATABASE_URL, Supabase credentials or production environment files.
// Requires pg available to Node (a local installation or NODE_PATH is enough).
const require = createRequire(import.meta.url)
const { Client } = require('pg')
const raw = process.env.SOR7ED_TEST_ADMIN_URL
if (!raw) throw new Error('Set SOR7ED_TEST_ADMIN_URL for disposable local PostgreSQL.')
const adminUrl = new URL(raw)
if (!['localhost', '127.0.0.1'].includes(adminUrl.hostname) ||
    adminUrl.username !== 'sor7ed_test' || adminUrl.pathname !== '/postgres') {
  throw new Error('Only localhost, user sor7ed_test and the postgres admin database are allowed.')
}
const database = 'planet_button_tests'
const root = new URL('../', import.meta.url)
const migration = new URL('supabase/migrations/20261013162726_website_whatsapp_actions.sql', root)
const challengeMigration = new URL('supabase/migrations/20260918082537_whatsapp_otp_challenges.sql', root)
const setup = new Client({ connectionString: adminUrl.href })
await setup.connect()
try {
  // Fixed name: cannot target any other local or remote database.
  await setup.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`)
  await setup.query(`CREATE DATABASE "${database}"`)
} finally {
  await setup.end()
}
const testUrl = new URL(adminUrl)
testUrl.pathname = `/${database}`
const admin = new Client({ connectionString: testUrl.href })
await admin.connect()
await admin.query(`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      CREATE ROLE anon NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      CREATE ROLE authenticated NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
      CREATE ROLE service_role NOLOGIN BYPASSRLS;
    END IF;
  END $$;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users (id uuid PRIMARY KEY);
  GRANT USAGE ON SCHEMA auth TO service_role;
  CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    whatsapp_number text NOT NULL UNIQUE,
    email text UNIQUE,
    first_name text,
    created_at timestamptz DEFAULT now(),
    whatsapp_verified boolean NOT NULL DEFAULT false,
    whatsapp_opted_out boolean NOT NULL DEFAULT false,
    weekly_opted_in boolean NOT NULL DEFAULT false
  );
  CREATE TABLE public.saved_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    phone text,
    url text NOT NULL,
    title text,
    category text DEFAULT 'General',
    saved_at timestamptz DEFAULT now()
  );
  GRANT SELECT, INSERT, UPDATE ON public.users, public.saved_items TO service_role;
  -- Reproduce Supabase's historically broad defaults, then check revocation.
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;
`)
await admin.query(await readFile(challengeMigration, 'utf8'))
await admin.query(await readFile(migration, 'utf8'))
after(async () => { await admin.end() })

async function asService(operation) {
  const client = new Client({ connectionString: testUrl.href })
  await client.connect()
  try {
    await client.query('SET ROLE service_role')
    return await operation(client)
  } finally {
    await client.end()
  }
}
async function user() {
  const id = randomUUID()
  await admin.query('INSERT INTO auth.users (id) VALUES ($1)', [id])
  return id
}
async function claim(id, key, hash = 'fixture-digest', slug = 'fixture-tool', title = 'Fixture tool') {
  return asService(async client => (await client.query(
    'SELECT * FROM public.claim_whatsapp_delivery_action($1,$2,$3,$4,$5,$6,$7)',
    [id, key, hash, slug, `https://planetsorted.com/r/${slug}`, title, 'Mind']
  )).rows[0])
}
async function finish(id, key, status = 'accepted', reason = null, ids = ['wamid.fixture']) {
  return asService(async client => (await client.query(
    'SELECT public.finish_whatsapp_delivery_action($1,$2,$3,$4,$5) AS completed',
    [id, key, status, reason, ids]
  )).rows[0].completed)
}
async function reserve(id, phone = '+447000000001', hash = 'otp-digest') {
  return asService(async client => (await client.query(
    'SELECT * FROM public.reserve_whatsapp_otp($1,$2,$3)', [id, phone, hash]
  )).rows[0])
}
async function verify(id, hash = 'otp-digest', name = 'Fixture', email = '') {
  return asService(async client => (await client.query(
    'SELECT * FROM public.verify_whatsapp_otp($1,$2,$3,$4)', [id, hash, name, email]
  )).rows[0].outcome)
}
async function challenge(id) {
  return (await admin.query('SELECT * FROM public.whatsapp_otp_challenges WHERE user_id = $1', [id])).rows[0]
}

test('service-only tables and invoker RPCs have no browser grants', async () => {
  const tables = ['whatsapp_delivery_actions', 'whatsapp_otp_challenges']
  for (const table of tables) {
    const result = (await admin.query(`
      SELECT c.relrowsecurity AS rls,
        has_table_privilege('anon', c.oid, 'SELECT') AS anon_read,
        has_table_privilege('authenticated', c.oid, 'SELECT') AS user_read,
        has_table_privilege('service_role', c.oid, 'SELECT') AS service_read,
        (SELECT count(*)::int FROM pg_policy WHERE polrelid = c.oid) AS policies
      FROM pg_class c WHERE c.oid = $1::regclass`, [`public.${table}`])).rows[0]
    assert.deepEqual(result, { rls: true, anon_read: false, user_read: false, service_read: true, policies: 0 })
  }
  const functions = (await admin.query(`
    SELECT p.proname, p.prosecdef,
      has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
      has_function_privilege('authenticated', p.oid, 'EXECUTE') AS user_execute,
      has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_execute
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN (
      'claim_whatsapp_delivery_action', 'finish_whatsapp_delivery_action',
      'reserve_whatsapp_otp', 'verify_whatsapp_otp')`)).rows
  assert.equal(functions.length, 4)
  for (const row of functions) {
    assert.equal(row.prosecdef, false)
    assert.equal(row.anon_execute, false)
    assert.equal(row.user_execute, false)
    assert.equal(row.service_execute, true)
  }
  await asService(client => assert.rejects(client.query('SELECT * FROM auth.users'), { code: '42501' }))
  const browser = new Client({ connectionString: testUrl.href })
  await browser.connect()
  try {
    await browser.query('SET ROLE authenticated')
    await assert.rejects(browser.query('SELECT * FROM public.whatsapp_delivery_actions'), { code: '42501' })
    await assert.rejects(browser.query('SELECT * FROM public.reserve_whatsapp_otp($1,$2,$3)',
      [randomUUID(), '+447000000001', 'hash']), { code: '42501' })
  } finally { await browser.end() }
})

test('concurrent same-key claims create exactly one action and Account backup', async () => {
  const id = await user(), key = randomUUID()
  const rows = await Promise.all(Array.from({ length: 12 }, () => claim(id, key)))
  assert.equal(rows.filter(row => row.created).length, 1)
  assert.equal(new Set(rows.map(row => row.action_id)).size, 1)
  assert.ok(rows.every(row => row.delivery_status === 'pending'))
  const backup = (await admin.query('SELECT * FROM public.saved_items WHERE user_id = $1', [id])).rows
  assert.equal(backup.length, 1)
  assert.equal(backup[0].url, 'https://planetsorted.com/r/fixture-tool')
  assert.equal(backup[0].phone, null)
})

test('different action keys for one resource keep one backup; users stay separate', async () => {
  const id = await user(), other = await user()
  const rows = await Promise.all(Array.from({ length: 6 }, () => claim(id, randomUUID())))
  assert.ok(rows.every(row => row.created))
  await claim(other, randomUUID())
  const backups = (await admin.query('SELECT user_id, count(*)::int AS count FROM public.saved_items GROUP BY user_id HAVING user_id IN ($1,$2)', [id, other])).rows
  assert.equal(backups.length, 2)
  assert.ok(backups.every(row => row.count === 1))
})

test('same action key with a different request hash conflicts without side effects', async () => {
  const id = await user(), key = randomUUID()
  const original = await claim(id, key)
  await assert.rejects(claim(id, key, 'different-digest', 'other-tool'), {
    code: 'P0001', message: 'whatsapp_action_conflict',
  })
  assert.equal((await claim(id, key)).action_id, original.action_id)
  const count = (await admin.query('SELECT count(*)::int AS count FROM public.saved_items WHERE user_id = $1', [id])).rows[0].count
  assert.equal(count, 1)
})

test('Account backup failure rolls the action claim back', async () => {
  const id = await user(), key = randomUUID()
  await admin.query("ALTER TABLE public.saved_items ADD CONSTRAINT fixture_backup_check CHECK (title <> 'ROLLBACK_TEST')")
  try {
    await assert.rejects(claim(id, key, 'digest', 'rollback-tool', 'ROLLBACK_TEST'), { code: '23514' })
    const count = (await admin.query('SELECT count(*)::int AS count FROM public.whatsapp_delivery_actions WHERE user_id = $1', [id])).rows[0].count
    assert.equal(count, 0)
  } finally { await admin.query('ALTER TABLE public.saved_items DROP CONSTRAINT fixture_backup_check') }
  assert.equal((await claim(id, key)).created, true)
})

test('unknown identities fail FK validation without reading Auth records', async () => {
  await assert.rejects(claim(randomUUID(), randomUUID()), { code: '23503' })
  await assert.rejects(reserve(randomUUID()), { code: '23503' })
})

test('finish accepts one terminal transition and never another owner', async () => {
  const id = await user(), other = await user(), key = randomUUID()
  await claim(id, key)
  assert.equal(await finish(other, key), false)
  const outcomes = await Promise.all([
    finish(id, key, 'accepted', null, ['wamid.one']),
    finish(id, key, 'failed', 'provider_rejected', []),
  ])
  assert.equal(outcomes.filter(Boolean).length, 1)
  assert.equal(await finish(id, key, 'unknown'), false)
  const replay = await claim(id, key)
  assert.equal(replay.created, false)
  assert.ok(['accepted', 'failed'].includes(replay.delivery_status))
  await assert.rejects(finish(id, key, 'pending'), { code: '22023' })
})

test('concurrent OTP requests reserve one digest and obey cooldown', async () => {
  const id = await user()
  const rows = await Promise.all(Array.from({ length: 12 }, (_, n) => reserve(id, '+447000000011', `digest-${n}`)))
  assert.equal(rows.filter(row => row.outcome === 'reserved').length, 1)
  assert.equal(rows.filter(row => row.outcome === 'cooldown').length, 11)
  const stored = await challenge(id)
  assert.equal(stored.send_count, 1)
  assert.equal(stored.attempts, 0)
  assert.ok(stored.otp_hash.startsWith('digest-'))
  assert.ok(Math.abs(stored.expires_at.getTime() - stored.last_sent_at.getTime() - 600_000) < 1)
})

test('five sends per hour remain exhausted after a successful verification', async () => {
  const id = await user()
  for (let n = 0; n < 5; n++) {
    await admin.query("UPDATE public.whatsapp_otp_challenges SET last_sent_at = clock_timestamp() - interval '61 seconds' WHERE user_id = $1", [id])
    assert.equal((await reserve(id, '+447000000012')).outcome, 'reserved')
  }
  assert.equal((await reserve(id)).outcome, 'limit')
  assert.equal(await verify(id), 'verified')
  const stored = await challenge(id)
  assert.equal(stored.send_count, 5)
  assert.ok(stored.send_window_start)
  assert.ok(stored.last_sent_at)
  assert.equal(stored.otp_hash, null)
  assert.equal(stored.phone, null)
  assert.equal(stored.expires_at, null)
  assert.equal((await reserve(id)).outcome, 'limit')
})

test('expired hourly window resets only when the next send is reserved', async () => {
  const id = await user()
  await reserve(id)
  await admin.query("UPDATE public.whatsapp_otp_challenges SET send_count = 5, send_window_start = clock_timestamp() - interval '61 minutes', last_sent_at = clock_timestamp() - interval '61 seconds' WHERE user_id = $1", [id])
  assert.equal((await reserve(id)).outcome, 'reserved')
  assert.equal((await challenge(id)).send_count, 1)
})

test('concurrent wrong codes cannot exceed or evade the five-attempt limit', async () => {
  const id = await user()
  await reserve(id)
  const outcomes = await Promise.all(Array.from({ length: 12 }, () => verify(id, 'wrong-digest')))
  assert.equal(outcomes.filter(result => result === 'incorrect').length, 5)
  assert.equal(outcomes.filter(result => result === 'limit').length, 7)
  assert.equal((await challenge(id)).attempts, 5)
  assert.equal(await verify(id), 'limit')
  assert.equal((await admin.query('SELECT * FROM public.users WHERE user_id = $1', [id])).rows.length, 0)
})

test('one concurrent correct verification consumes the challenge once', async () => {
  const id = await user()
  await reserve(id, '+447000000013')
  const outcomes = await Promise.all(Array.from({ length: 10 }, () => verify(id)))
  assert.equal(outcomes.filter(result => result === 'verified').length, 1)
  assert.equal(outcomes.filter(result => result === 'missing').length, 9)
  const rows = (await admin.query('SELECT * FROM public.users WHERE user_id = $1', [id])).rows
  assert.equal(rows.length, 1)
  assert.equal(rows[0].whatsapp_number, '+447000000013')
  assert.equal(rows[0].whatsapp_verified, true)
  assert.equal((await challenge(id)).send_count, 1)
  assert.equal((await reserve(id)).outcome, 'cooldown')
})

test('two users verifying the same phone cannot reassign its owner', async () => {
  const first = await user(), second = await user()
  await reserve(first, '+447000000021')
  await reserve(second, '+447000000021')
  const outcomes = await Promise.all([verify(first), verify(second)])
  assert.equal(outcomes.filter(outcome => outcome === 'verified').length, 1)
  assert.equal(outcomes.filter(outcome => outcome === 'conflict').length, 1)
  const rows = (await admin.query('SELECT * FROM public.users WHERE whatsapp_number = $1', ['+447000000021'])).rows
  assert.equal(rows.length, 1)
  const losingId = outcomes[0] === 'conflict' ? first : second
  assert.notEqual(rows[0].user_id, losingId)
  assert.ok((await challenge(losingId)).otp_hash)
})

test('expired and absent challenges cannot link a number', async () => {
  const id = await user()
  assert.equal(await verify(id), 'missing')
  await reserve(id)
  await admin.query("UPDATE public.whatsapp_otp_challenges SET expires_at = clock_timestamp() - interval '1 second' WHERE user_id = $1", [id])
  assert.equal(await verify(id), 'expired')
  assert.ok((await challenge(id)).otp_hash)
})

test('phone collision preserves challenge and existing profile inside rollback', async () => {
  const id = await user(), owner = await user()
  await admin.query('INSERT INTO public.users (user_id, whatsapp_number) VALUES ($1,$2)', [owner, '+447000000014'])
  await admin.query('INSERT INTO public.users (user_id, whatsapp_number, first_name, weekly_opted_in) VALUES ($1,$2,$3,true)', [id, '+447000000015', 'Keep me'])
  await reserve(id, '+447000000014')
  const before = await challenge(id)
  assert.equal(await verify(id), 'conflict')
  const after = await challenge(id)
  assert.equal(after.otp_hash, before.otp_hash)
  assert.equal(after.phone, before.phone)
  assert.equal(after.send_count, before.send_count)
  const row = (await admin.query('SELECT * FROM public.users WHERE user_id = $1', [id])).rows[0]
  assert.equal(row.whatsapp_number, '+447000000015')
  assert.equal(row.whatsapp_verified, false)
  assert.equal(row.first_name, 'Keep me')
  assert.equal(row.weekly_opted_in, true)
})

test('email collision when inserting a missing profile leaves code reusable', async () => {
  const id = await user(), owner = await user()
  await admin.query('INSERT INTO public.users (user_id, whatsapp_number, email) VALUES ($1,$2,$3)', [owner, '+447000000016', 'owned@example.invalid'])
  await reserve(id, '+447000000017')
  assert.equal(await verify(id, 'otp-digest', 'Fixture', 'owned@example.invalid'), 'conflict')
  assert.ok((await challenge(id)).otp_hash)
  assert.equal(await verify(id, 'otp-digest', 'Fixture', 'new@example.invalid'), 'verified')
})

test('reverification preserves profile fields and weekly consent', async () => {
  const id = await user()
  await admin.query('INSERT INTO public.users (user_id, whatsapp_number, first_name, email, weekly_opted_in, whatsapp_opted_out) VALUES ($1,$2,$3,$4,true,true)', [id, '+447000000018', 'Original', 'original@example.invalid'])
  await reserve(id, '+447000000019')
  assert.equal(await verify(id, 'otp-digest', 'Ignored', 'ignored@example.invalid'), 'verified')
  const row = (await admin.query('SELECT * FROM public.users WHERE user_id = $1', [id])).rows[0]
  assert.equal(row.first_name, 'Original')
  assert.equal(row.email, 'original@example.invalid')
  assert.equal(row.weekly_opted_in, true)
  assert.equal(row.whatsapp_opted_out, false)
  assert.equal(row.whatsapp_number, '+447000000019')
})

test('delivery claim waits for the same user OTP transaction but not a different user', async () => {
  const id = await user(), other = await user()
  await asService(async client => {
    await client.query('BEGIN')
    await client.query('SELECT * FROM public.reserve_whatsapp_otp($1,$2,$3)', [id, '+447000000020', 'hash'])
    let settled = false
    const blocked = claim(id, randomUUID()).then(row => { settled = true; return row })
    try {
      const independent = await claim(other, randomUUID())
      assert.equal(independent.created, true)
      assert.equal(settled, false)
    } finally { await client.query('COMMIT') }
    assert.equal((await blocked).created, true)
  })
})

test('OTP expiry is measured after a blocked transaction acquires its lock', async () => {
  const id = await user()
  await reserve(id, '+447000000022')
  await admin.query("UPDATE public.whatsapp_otp_challenges SET expires_at = clock_timestamp() + interval '200 milliseconds' WHERE user_id = $1", [id])
  await asService(async client => {
    await client.query('BEGIN')
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended('website-whatsapp-user:' || $1::uuid::text, 0))", [id])
    const blocked = verify(id)
    // This is a small, deterministic database time fixture, not a network retry.
    await client.query('SELECT pg_sleep(0.35)')
    await client.query('COMMIT')
    assert.equal(await blocked, 'expired')
  })
  assert.ok((await challenge(id)).otp_hash)
})

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import test from 'node:test'

// Run against the dedicated, disposable local Postgres database only:
// NODE_PATH=/workspace/sor7ed-button/node_modules \
// PLANETSORTED_PERMISSION_TEST_DATABASE_URL=postgres://sor7ed_test:local-test-only@127.0.0.1:55437/planet_permissions_tests \
// node scripts/test-website-permissions.mjs
const require = createRequire(import.meta.url)
const { Client } = require('pg')
const databaseUrl = process.env.PLANETSORTED_PERMISSION_TEST_DATABASE_URL
assert.ok(databaseUrl, 'Set PLANETSORTED_PERMISSION_TEST_DATABASE_URL to the disposable local database')
const parsedUrl = new URL(databaseUrl)
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(parsedUrl.hostname), 'Only local Postgres is allowed')
assert.equal(parsedUrl.pathname, '/planet_permissions_tests', 'Only the dedicated permission-test database is allowed')

const alice = '10000000-0000-4000-8000-000000000001'
const bob = '10000000-0000-4000-8000-000000000002'
const carol = '10000000-0000-4000-8000-000000000003'
const aliceRequest = '20000000-0000-4000-8000-000000000001'
const bobRequest = '20000000-0000-4000-8000-000000000002'
const aliceRun = '30000000-0000-4000-8000-000000000001'
const bobRun = '30000000-0000-4000-8000-000000000002'
const rpcSignatures = [
  'public.claim_whatsapp_delivery_action(uuid,uuid,text,text,text,text,text)',
  'public.finish_whatsapp_delivery_action(uuid,uuid,text,text,text[])',
  'public.reserve_whatsapp_otp(uuid,text,text)',
  'public.verify_whatsapp_otp(uuid,text,text,text)',
]

async function asRole(role, userId, operation) {
  assert.ok(['anon', 'authenticated', 'service_role'].includes(role))
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    await client.query('BEGIN')
    await client.query(`SET LOCAL ROLE ${role}`)
    await client.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [userId || ''])
    await client.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: userId, role })])
    return await operation(client)
  } finally {
    await client.query('ROLLBACK')
    await client.end()
  }
}

async function denied(role, userId, query, values = []) {
  await assert.rejects(asRole(role, userId, client => client.query(query, values)), error => error.code === '42501')
}

async function claim(client, userId, slug, url, actionKey = randomUUID(), hash = 'request-hash') {
  return client.query('SELECT * FROM public.claim_whatsapp_delivery_action($1,$2,$3,$4,$5,$6,$7)',
    [userId, actionKey, hash, slug, url, 'Test title', 'Mind'])
}

const bootstrap = new Client({ connectionString: new URL('/postgres', parsedUrl).href })
await bootstrap.connect()
try {
  const found = await bootstrap.query("SELECT 1 FROM pg_database WHERE datname = 'planet_permissions_tests'")
  if (!found.rowCount) await bootstrap.query('CREATE DATABASE planet_permissions_tests')
} finally {
  await bootstrap.end()
}

const admin = new Client({ connectionString: databaseUrl })
await admin.connect()
try {
  await admin.query(`
    DROP SCHEMA IF EXISTS public CASCADE;
    DROP SCHEMA IF EXISTS auth CASCADE;
    CREATE SCHEMA public;
    CREATE SCHEMA auth;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
    END $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.sub', true), ''),
        NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid;
    $$;
    CREATE TABLE public.users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE,
      whatsapp_number text NOT NULL UNIQUE, created_at timestamptz DEFAULT now(),
      first_name text, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      whatsapp_onboarded boolean DEFAULT false, whatsapp_onboarded_at timestamptz,
      wa_verify_code text, whatsapp_verified boolean NOT NULL DEFAULT false,
      whatsapp_opted_out boolean NOT NULL DEFAULT false, weekly_opted_in boolean NOT NULL DEFAULT false,
      weekly_opted_in_at timestamptz, last_weekly_sent_at timestamptz, last_inbound_at timestamptz
    );
    CREATE INDEX idx_users_user_id ON public.users (user_id);
    CREATE TABLE public.saved_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      phone text, url text NOT NULL, title text, category text DEFAULT 'General', saved_at timestamptz DEFAULT now()
    );
    CREATE TABLE public.tool_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      keyword text NOT NULL, input_text text, channel text NOT NULL, status text NOT NULL
    );
    CREATE TABLE public.tool_runs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(),
      tool_request_id uuid NOT NULL REFERENCES public.tool_requests(id) ON DELETE CASCADE,
      tool_slug text NOT NULL, model text NOT NULL, output_text text NOT NULL,
      success boolean NOT NULL DEFAULT true, latency_ms integer
    );
    CREATE TABLE public.protocols (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, slug text NOT NULL UNIQUE,
      category text, keyword text, tldr text, problem text, cta text, excerpt text, seo_title text,
      meta_description text, read_time text, created_at timestamptz NOT NULL DEFAULT now(),
      status text, protocol text, gamma_url text
    );
    CREATE VIEW public.public_protocols AS
      SELECT id, title, slug, category AS branch, keyword, tldr, problem, cta, excerpt,
        seo_title, meta_description, read_time, created_at FROM public.protocols;
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.tool_requests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.tool_runs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON public.users, public.saved_items, public.tool_requests, public.tool_runs,
      public.protocols, public.public_protocols TO anon, authenticated, service_role;
    CREATE POLICY "Service role can manage users" ON public.users TO public USING (true) WITH CHECK (true);
    CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can view own profile" ON public.users FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users see own saves" ON public.saved_items FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Protocols are publicly readable" ON public.protocols FOR SELECT USING (true);
    -- Deliberately include independent legacy column grants to check revocation.
    GRANT UPDATE (whatsapp_verified, user_id), INSERT (whatsapp_number) ON public.users TO PUBLIC;
    GRANT UPDATE (user_id) ON public.tool_requests TO authenticated;
    GRANT UPDATE (tool_request_id) ON public.tool_runs TO authenticated;
    GRANT SELECT (title), UPDATE (title) ON public.public_protocols TO PUBLIC;
    INSERT INTO auth.users VALUES ('${alice}'), ('${bob}'), ('${carol}');
    INSERT INTO public.users (user_id, whatsapp_number, email, first_name) VALUES
      ('${alice}', '+447700900001', 'alice@example.test', 'Alice'),
      ('${bob}', '+447700900002', 'bob@example.test', 'Bob'),
      (NULL, '+447700900004', 'unlinked@example.test', 'Unlinked');
    INSERT INTO public.tool_requests (id, user_id, keyword, input_text, channel, status) VALUES
      ('${aliceRequest}', '${alice}', 'brain-dump-sorter', 'Alice private input', 'web', 'complete'),
      ('${bobRequest}', '${bob}', 'brain-dump-sorter', 'Bob private input', 'web', 'complete');
    INSERT INTO public.tool_runs (id, tool_request_id, tool_slug, model, output_text) VALUES
      ('${aliceRun}', '${aliceRequest}', 'brain-dump-sorter', 'local', 'Alice private output'),
      ('${bobRun}', '${bobRequest}', 'brain-dump-sorter', 'local', 'Bob private output');
    INSERT INTO public.protocols (title, slug, status, protocol, gamma_url) VALUES
      ('Published title', 'published-test', 'Published', 'Private protocol', 'https://private.example.test/published'),
      ('Draft title', 'draft-test', 'Draft', 'Private draft protocol', 'https://private.example.test/draft');
  `)
  await admin.query(await readFile(new URL('../supabase/migrations/20260918082537_whatsapp_otp_challenges.sql', import.meta.url), 'utf8'))
  await admin.query(await readFile(new URL('../supabase/migrations/20261012200808_private_protocol_content.sql', import.meta.url), 'utf8'))
  await admin.query(await readFile(new URL('../supabase/migrations/20261013162726_website_whatsapp_actions.sql', import.meta.url), 'utf8'))

  await test('fixture reproduces exposed profiles, draft view, and blocked history before repair', async () => {
    assert.equal((await asRole('anon', null, client => client.query('SELECT * FROM public.users'))).rowCount, 3)
    assert.equal((await asRole('anon', null, client => client.query('SELECT * FROM public.public_protocols'))).rowCount, 2)
    assert.equal((await asRole('authenticated', alice, client => client.query('SELECT * FROM public.tool_runs'))).rowCount, 0)
    await denied('authenticated', alice, 'INSERT INTO public.tool_requests (user_id,keyword,channel,status) VALUES ($1,$2,$3,$4)',
      [alice, 'test', 'web', 'complete'])
  })

  const migration = await readFile(new URL('../supabase/migrations/20261015235922_website_access_permissions.sql', import.meta.url), 'utf8')
  await admin.query('BEGIN')
  await admin.query(migration)
  await admin.query('COMMIT')

  await test('anonymous roles cannot read, mutate, or truncate private tables or the legacy view', async () => {
    for (const table of ['users', 'tool_requests', 'tool_runs', 'public_protocols']) {
      await denied('anon', null, `SELECT * FROM public.${table}`)
      await denied('anon', null, `DELETE FROM public.${table}`)
      if (table !== 'public_protocols') await denied('anon', null, `TRUNCATE public.${table} CASCADE`)
    }
    await denied('anon', null, 'SELECT title FROM public.public_protocols')
  })

  await test('authenticated members can read only their own profiles; empty identities see none', async () => {
    for (const [id, name] of [[alice, 'Alice'], [bob, 'Bob']]) {
      const result = await asRole('authenticated', id, client => client.query('SELECT first_name FROM public.users'))
      assert.deepEqual(result.rows, [{ first_name: name }])
    }
    assert.equal((await asRole('authenticated', null, client => client.query('SELECT * FROM public.users'))).rowCount, 0)
  })

  await test('browser profile writes, verification spoofing, reassignment, deletion, and truncation are denied', async () => {
    await denied('authenticated', alice, 'UPDATE public.users SET whatsapp_verified=true WHERE user_id=$1', [alice])
    await denied('authenticated', alice, 'UPDATE public.users SET user_id=$1 WHERE user_id=$2', [bob, alice])
    await denied('authenticated', alice, "INSERT INTO public.users (whatsapp_number) VALUES ('+447700900005')")
    await denied('authenticated', alice, 'DELETE FROM public.users WHERE user_id=$1', [alice])
    await denied('authenticated', alice, 'TRUNCATE public.users CASCADE')
  })

  await test('both members can read only their own requests and joined tool outputs', async () => {
    for (const [id, requestId, runId] of [[alice, aliceRequest, aliceRun], [bob, bobRequest, bobRun]]) {
      const result = await asRole('authenticated', id, async client => ({
        requests: await client.query('SELECT id FROM public.tool_requests'),
        runs: await client.query('SELECT id FROM public.tool_runs'),
        joined: await client.query('SELECT r.id FROM public.tool_runs r JOIN public.tool_requests q ON q.id=r.tool_request_id'),
      }))
      assert.deepEqual(result.requests.rows, [{ id: requestId }])
      assert.deepEqual(result.runs.rows, [{ id: runId }])
      assert.deepEqual(result.joined.rows, [{ id: runId }])
    }
    for (const table of ['tool_requests', 'tool_runs']) {
      assert.equal((await asRole('authenticated', null, client => client.query(`SELECT * FROM public.${table}`))).rowCount, 0)
    }
  })

  await test('members can insert and return their own request and output', async () => {
    await asRole('authenticated', alice, async client => {
      const request = await client.query('INSERT INTO public.tool_requests (user_id,keyword,input_text,channel,status) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [alice, 'weekly-wins-generator', 'My own input', 'web', 'complete'])
      const run = await client.query('INSERT INTO public.tool_runs (tool_request_id,tool_slug,model,output_text) VALUES ($1,$2,$3,$4) RETURNING id',
        [request.rows[0].id, 'weekly-wins-generator', 'local', 'My own output'])
      assert.equal(request.rowCount, 1)
      assert.equal(run.rowCount, 1)
    })
  })

  await test('forged parent ownership and cross-member output insertion fail', async () => {
    await denied('authenticated', alice, 'INSERT INTO public.tool_requests (user_id,keyword,channel,status) VALUES ($1,$2,$3,$4)',
      [bob, 'test', 'web', 'complete'])
    await denied('authenticated', alice, 'INSERT INTO public.tool_runs (tool_request_id,tool_slug,model,output_text) VALUES ($1,$2,$3,$4)',
      [bobRequest, 'test', 'local', 'Forged output'])
    await denied('authenticated', null, 'INSERT INTO public.tool_requests (user_id,keyword,channel,status) VALUES ($1,$2,$3,$4)',
      [alice, 'test', 'web', 'complete'])
  })

  await test('requests and outputs cannot be updated, reassigned, or truncated through browser roles', async () => {
    await denied('authenticated', alice, 'UPDATE public.tool_requests SET user_id=$1 WHERE id=$2', [bob, aliceRequest])
    await denied('authenticated', alice, 'UPDATE public.tool_runs SET tool_request_id=$1 WHERE id=$2', [bobRequest, aliceRun])
    for (const table of ['tool_requests', 'tool_runs']) await denied('authenticated', alice, `TRUNCATE public.${table} CASCADE`)
  })

  await test('own history deletion succeeds; another member’s deletion has no effect', async () => {
    await asRole('authenticated', alice, async client => {
      assert.equal((await client.query('DELETE FROM public.tool_runs WHERE id=$1', [bobRun])).rowCount, 0)
      assert.equal((await client.query('DELETE FROM public.tool_requests WHERE id=$1', [bobRequest])).rowCount, 0)
      assert.equal((await client.query('DELETE FROM public.tool_runs WHERE id=$1', [aliceRun])).rowCount, 1)
      assert.equal((await client.query('DELETE FROM public.tool_requests WHERE id=$1', [aliceRequest])).rowCount, 1)
    })
    await asRole('authenticated', alice, async client => {
      assert.equal((await client.query('DELETE FROM public.tool_requests WHERE id=$1', [aliceRequest])).rowCount, 1)
      assert.equal((await client.query('SELECT * FROM public.tool_runs WHERE id=$1', [aliceRun])).rowCount, 0)
    })
    assert.equal((await admin.query('SELECT * FROM public.tool_runs WHERE id=$1', [bobRun])).rowCount, 1)
  })

  await test('legacy view is invoker-only, browser-denied, and base published previews remain available', async () => {
    assert.deepEqual((await admin.query("SELECT reloptions FROM pg_class WHERE oid='public.public_protocols'::regclass")).rows[0].reloptions,
      ['security_invoker=true'])
    for (const [role, id] of [['anon', null], ['authenticated', alice]]) {
      await denied(role, id, 'SELECT title FROM public.public_protocols')
      await denied(role, id, 'SELECT protocol, gamma_url FROM public.protocols')
      const previews = await asRole(role, id, client => client.query('SELECT title, slug FROM public.protocols'))
      assert.deepEqual(previews.rows, [{ title: 'Published title', slug: 'published-test' }])
    }
    await asRole('service_role', null, async client => {
      assert.equal((await client.query('SELECT * FROM public.protocols')).rowCount, 2)
      assert.equal((await client.query('SELECT * FROM public.public_protocols')).rowCount, 2)
    })
  })

  await test('existing private WhatsApp RPCs remain invoker functions callable only by service role', async () => {
    for (const signature of rpcSignatures) {
      const result = await admin.query(`SELECT p.prosecdef,
        has_function_privilege('anon',p.oid,'EXECUTE') AS anon,
        has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated,
        has_function_privilege('service_role',p.oid,'EXECUTE') AS service_role
        FROM pg_proc p WHERE p.oid=$1::regprocedure`, [signature])
      assert.deepEqual(result.rows, [{ prosecdef: false, anon: false, authenticated: false, service_role: true }])
    }
    for (const role of ['anon', 'authenticated']) {
      await denied(role, alice, 'SELECT * FROM public.claim_whatsapp_delivery_action($1,$2,$3,$4,$5,$6,$7)',
        [alice, randomUUID(), 'hash', 'test', 'https://www.planetsorted.com/r/test', 'Title', 'Mind'])
      await denied(role, alice, 'SELECT * FROM public.reserve_whatsapp_otp($1,$2,$3)', [alice, '+447700900001', 'otp'])
      await denied(role, alice, 'SELECT * FROM public.whatsapp_delivery_actions')
      await denied(role, alice, 'SELECT * FROM public.whatsapp_otp_challenges')
    }
  })

  await test('service-role claim, retry, finish, profile edits and server history access work after hardening', async () => {
    await asRole('service_role', null, async client => {
      await assert.rejects(client.query('SELECT * FROM auth.users'), error => error.code === '42501')
    })
    await asRole('service_role', null, async client => {
      const key = randomUUID()
      const first = await claim(client, alice, 'claim-test', 'https://www.planetsorted.com/r/claim-test', key)
      assert.equal(first.rows[0].created, true)
      const retry = await claim(client, alice, 'claim-test', 'https://www.planetsorted.com/r/claim-test', key)
      assert.equal(retry.rows[0].created, false)
      assert.equal(retry.rows[0].action_id, first.rows[0].action_id)
      assert.equal((await client.query('SELECT * FROM public.saved_items WHERE user_id=$1', [alice])).rowCount, 1)
      assert.equal((await client.query('SELECT public.finish_whatsapp_delivery_action($1,$2,$3,$4,$5) AS done',
        [alice, key, 'accepted', null, ['local-message']])).rows[0].done, true)
      assert.equal((await client.query('SELECT public.finish_whatsapp_delivery_action($1,$2,$3,$4,$5) AS done',
        [alice, key, 'failed', null, []])).rows[0].done, false)
      assert.equal((await client.query('UPDATE public.users SET first_name=$1 WHERE user_id=$2 RETURNING id', ['Alice edited', alice])).rowCount, 1)
      assert.equal((await client.query('SELECT * FROM public.tool_runs')).rowCount, 2)
      assert.equal((await client.query('DELETE FROM public.tool_requests WHERE id=$1', [bobRequest])).rowCount, 1)
    })
  })

  await test('service-role OTP reservation and verification update the owned profile and consume the challenge', async () => {
    await asRole('service_role', null, async client => {
      assert.equal((await client.query('SELECT * FROM public.reserve_whatsapp_otp($1,$2,$3)',
        [alice, '+447700900001', 'local-otp-hash'])).rows[0].outcome, 'reserved')
      assert.equal((await client.query('SELECT * FROM public.verify_whatsapp_otp($1,$2,$3,$4)',
        [alice, 'wrong-hash', 'Alice', 'alice@example.test'])).rows[0].outcome, 'incorrect')
      assert.equal((await client.query('SELECT * FROM public.verify_whatsapp_otp($1,$2,$3,$4)',
        [alice, 'local-otp-hash', 'Alice', 'alice@example.test'])).rows[0].outcome, 'verified')
      assert.equal((await client.query('SELECT whatsapp_verified FROM public.users WHERE user_id=$1', [alice])).rows[0].whatsapp_verified, true)
      assert.equal((await client.query('SELECT * FROM public.verify_whatsapp_otp($1,$2,$3,$4)',
        [alice, 'local-otp-hash', 'Alice', 'alice@example.test'])).rows[0].outcome, 'missing')
      assert.equal((await client.query('SELECT * FROM public.reserve_whatsapp_otp($1,$2,$3)',
        [carol, '+447700900003', 'new-member-otp-hash'])).rows[0].outcome, 'reserved')
      assert.equal((await client.query('SELECT * FROM public.verify_whatsapp_otp($1,$2,$3,$4)',
        [carol, 'new-member-otp-hash', 'Carol', 'carol@example.test'])).rows[0].outcome, 'verified')
      assert.equal((await client.query('SELECT whatsapp_verified FROM public.users WHERE user_id=$1', [carol])).rows[0].whatsapp_verified, true)
    })
  })

  await test('canonical and historical website aliases share one backup without rewriting history', async () => {
    const hosts = ['www.planetsorted.com', 'planetsorted.com', 'www.sor7ed.com', 'sor7ed.com']
    for (const host of hosts) {
      for (const prefix of ['r', 'go']) {
        await asRole('service_role', null, async client => {
          const historicalUrl = `https://${host}/${prefix}/alias-test`
          const original = await client.query('INSERT INTO public.saved_items (user_id,url,title) VALUES ($1,$2,$3) RETURNING id',
            [alice, historicalUrl, 'Original title'])
          await claim(client, alice, 'alias-test', 'https://www.planetsorted.com/r/alias-test')
          const backup = await client.query('SELECT id,url,title FROM public.saved_items WHERE user_id=$1', [alice])
          assert.deepEqual(backup.rows, [{ id: original.rows[0].id, url: historicalUrl, title: 'Original title' }])
          await claim(client, bob, 'alias-test', 'https://www.planetsorted.com/r/alias-test')
          assert.equal((await client.query('SELECT * FROM public.saved_items WHERE user_id=$1', [bob])).rowCount, 1)
        })
      }
    }
  })

  await test('different resources and external hosts remain distinct; exact external retries deduplicate', async () => {
    await asRole('service_role', null, async client => {
      await client.query('INSERT INTO public.saved_items (user_id,url) VALUES ($1,$2),($1,$3)',
        [alice, 'https://external.example.test/r/distinct-test', 'https://www.sor7ed.com/r/another-test'])
      await claim(client, alice, 'distinct-test', 'https://www.planetsorted.com/r/distinct-test')
      assert.equal((await client.query('SELECT * FROM public.saved_items WHERE user_id=$1', [alice])).rowCount, 3)
      await claim(client, alice, 'distinct-test', 'https://external.example.test/r/distinct-test')
      assert.equal((await client.query('SELECT * FROM public.saved_items WHERE user_id=$1', [alice])).rowCount, 3)
    })
  })
} finally {
  await admin.end()
}

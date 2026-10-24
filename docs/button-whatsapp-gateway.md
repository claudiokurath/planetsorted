# Shared-number Button relay

PlanetSorted retains the existing Meta token, app secret, sender and webhook.
The Button API does not receive those secrets or PlanetSorted account records.
Its Neon database, cookies and user history remain separate. A dedicated random
`BUTTON_RELAY_SECRET` / `WHATSAPP_RELAY_SECRET` authenticates the two services.

The owner asked to finish the Button using the existing WhatsApp connection.
The gateway avoids exporting sensitive variables or reconfiguring Meta's
working callback. All functionality is off unless the two relay variables are
configured; removing them restores the previous website routing.

The original raw Meta signature and crisis checks precede forwarding. SIGNIN,
BUTTON-CONNECT, LIBRARY and HELP go exclusively to Button; other messages only
refresh its known accounts' session time and shared opt-out state. PlanetSorted
still sends the single STOP/START acknowledgement and manages weekly consent.
Private protocol delivery remains unchanged. No website account is created or
linked by a Button sign-in.

Outbound relay requests carry a purpose-bound HMAC, timestamp and action ID.
The server permits only bounded text messages to E.164 digits through the
existing sender. It never forwards caller-chosen URLs, credentials or templates.
A unique receipt claim prevents duplicate sends, including concurrent requests;
uncertain outcomes are not retried. No phone, text, code or token is stored in
the receipt table. Receipt records expire via bounded opportunistic cleanup.
Inbound IDs use Meta's message ID; Button claims them in its existing private
Postgres counters before processing. Background processing uses platform
lifecycle hooks, not a durable job queue; transient failures require the user
to start a fresh sign-in, never an automatic uncertain send.

## Database migration

Register this additive migration as `button_whatsapp_gateway` through Supabase
MCP apply_migration. No existing tables or rows are changed. The local Supabase
CLI could not generate a file in this execution environment; this exact SQL is
kept here for review and the remote migration history records the application.

```sql
create table public.button_whatsapp_requests (
  id text primary key,
  body_hash text not null,
  status text not null default 'pending' check (status in ('pending','accepted','failed','unknown')),
  response_status integer not null default 502,
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index button_whatsapp_requests_created_idx on public.button_whatsapp_requests(created_at);
alter table public.button_whatsapp_requests enable row level security;
revoke all on public.button_whatsapp_requests from public, anon, authenticated;
grant select, insert, update, delete on public.button_whatsapp_requests to service_role;
```

## Deployment settings

PlanetSorted: `BUTTON_RELAY_URL=https://api.sor7ed.com/webhook/relay`, and the
new dedicated `BUTTON_RELAY_SECRET` (server-side secret).

Button API: `WHATSAPP_TRANSPORT=relay`,
`WHATSAPP_RELAY_URL=https://www.planetsorted.com/api/button/whatsapp`, matching
`WHATSAPP_RELAY_SECRET`, and the existing business number as
`META_WHATSAPP_DISPLAY_NUMBER`. Other lean auth/database settings stay in the
API project. No Google, new number, Redis or paid template is needed.

After both builds and tests pass, deploy the API and its domain, deploy the
gateway, and check HTTPS health and the public sign-in flow. Real receipt of
a sign-in code and saved card still needs the owner's own WhatsApp action.

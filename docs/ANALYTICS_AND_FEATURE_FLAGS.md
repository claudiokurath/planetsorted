# Analytics Dashboard & Feature Flags — Architecture & Runbook

**Status:** ✅ COMPLETE  
**Initiative:** Architecture Improvement #3 (Observability, Telemetry & Controlled Rollouts)  
**Impact:** Zero-downtime feature experimentation, full operational visibility, sub-millisecond flag evaluation.

---

## 1. Overview

This architecture delivers a complete observability and experimentation framework for **PLANET SOR7ED**:

1. **Instrumentation & Telemetry Layer** (`lib/analytics/`):
   - Structured logging to `tool_runs` for all interactive calculations.
   - User journey tracking and event ingestion via `analytics_events`.
   - Lightweight client endpoint `POST /api/analytics/event` for non-blocking browser telemetry.

2. **Feature Flags Engine** (`lib/flags/`):
   - Staged percentage rollouts (0–100%) with deterministic user hashing.
   - User ID / email whitelisting for beta cohorts.
   - In-memory short-TTL caching (30s) for ultra-fast evaluations without database bottlenecks.

3. **Admin Dashboard** (`app/admin/`):
   - Live KPI cards: Total tool runs, success rate (%), avg latency (ms), active subscriptions.
   - Tool performance breakdown table sorted by volume.
   - Real-time execution stream with status indicators.
   - Interactive feature flag management with live toggles and rollout sliders.

---

## 2. Database Schema

Execute the migration in the Supabase SQL editor:
`supabase/migrations/add_feature_flags_and_analytics.sql`

### `feature_flags` Table

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary Key |
| `flag_key` | text | Unique identifier (e.g. `beta_pricing_table`) |
| `description` | text | Human-readable explanation of the flag |
| `enabled` | boolean | Global switch |
| `rollout_percentage` | integer | Staged rollout (0–100) |
| `allowed_user_ids` | text[] | Array of whitelisted user IDs / emails |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last updated timestamp |

### `analytics_events` Table

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary Key |
| `event_name` | text | Name of the event (e.g. `save_item_clicked`) |
| `user_id` | uuid (nullable) | Foreign Key to `auth.users` |
| `properties` | jsonb | Structured payload (e.g. `{ tool: 'adhd-tax', source: 'web' }`) |
| `created_at` | timestamptz | Event timestamp |

---

## 3. How to Use Feature Flags in Code

### In Server Components & API Routes:

```typescript
import { isFeatureEnabled } from '@/lib/flags/featureFlags'

export default async function PricingPage() {
  const isBetaPricing = await isFeatureEnabled('beta_pricing_table', {
    userId: currentUser?.id,
    userEmail: currentUser?.email,
  })

  if (isBetaPricing) {
    return <NewPricingExperiment />
  }

  return <StandardPricing />
}
```

### Deterministic Rollout Logic:
When `rollout_percentage` is set to e.g. `25%`:
- The user ID is deterministically hashed into a 0–99 bucket.
- The same user **always** sees the same variation across multiple requests and devices.
- If no user ID is present, partial rollouts gracefully default to `false`.

---

## 4. How to Record Telemetry

### Client-Side Components:

Non-blocking reporting from any React component or interactive tool:

```typescript
fetch('/api/analytics/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'tool_run',
    toolSlug: 'adhd-tax-calculator',
    success: true,
    latencyMs: 142,
  }),
}).catch(() => {})
```

### Server-Side Functions:

```typescript
import { logToolRun, logAnalyticsEvent } from '@/lib/analytics/events'

// Record a tool execution
await logToolRun({
  toolSlug: 'decision-paralysis-solver',
  success: true,
  latencyMs: 85,
  userId: user.id,
})

// Record a custom business event
await logAnalyticsEvent('protocol_exported', {
  slug: 'brain-dump-sorter',
  format: 'pdf',
}, user.id)
```

---

## 5. Admin Dashboard Access & Security

The Admin Dashboard is located at `/admin`.

### Access Controls:

1. **Email Whitelist**:
   Set `ADMIN_EMAILS` in `.env.local` or Vercel environment:
   ```bash
   ADMIN_EMAILS="claudio@planetsorted.com,admin@sor7ed.com"
   ```
   Users logged in via magic link with matching emails receive immediate access.

2. **Operational Key Bypass**:
   Set `ADMIN_SECRET` in `.env.local` or Vercel environment:
   ```bash
   ADMIN_SECRET="your-high-entropy-random-secret"
   ```
   Access the dashboard directly via query parameter or header:
   ```
   https://planetsorted.com/admin?admin_key=your-high-entropy-random-secret
   ```

3. **Development Mode**:
   In local development (`NODE_ENV !== 'production'`), if neither `ADMIN_EMAILS` nor `ADMIN_SECRET` is defined, the dashboard allows access automatically for rapid iteration.

---

## 6. Verification & Health Checklist

- [x] Database migration created (`add_feature_flags_and_analytics.sql`)
- [x] TypeScript database schema updated in `lib/types/database.ts`
- [x] Non-blocking telemetry wired into `components/toolEngine/ToolConfigClient.tsx`
- [x] Admin metrics API implemented (`/api/admin/metrics`)
- [x] Feature flags API implemented (`/api/admin/flags`)
- [x] Admin UI styled with SOR7ED black/gold design system at `/admin`
- [x] Zero modification to immutable files in `AGENTS.md`

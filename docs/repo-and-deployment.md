# SOR7ED — Repo & Deployment (Single Source of Truth)

> **Scope of this page:** GitHub repo identity, branching/PRs, CI, Vercel deploy, env/secrets, and release QA.
>
> **Not this page:** product rules, brand voice, schema, WhatsApp commands, monetization.
> Those live in **`docs/planet-sorted-master.md`** (product master) and win on product questions.
>
> **Conflict rule:** if GitHub, Vercel, Slack, Notion, or memory disagree on *repo/deploy*, **this page wins**.
> If they disagree on *product/brand/schema*, **`planet-sorted-master.md` wins**.

---

## 📋 Table of contents

1. [Executive summary](#1-executive-summary)
2. [Authority & conflict resolution](#2-authority--conflict-resolution)
3. [The repo reality (what exists today)](#3-the-repo-reality-what-exists-today)
4. [How changes ship (end-to-end)](#4-how-changes-ship-end-to-end)
5. [Branching & PR rules](#5-branching--pr-rules)
6. [CI gates](#6-ci-gates)
7. [Deployment (Vercel)](#7-deployment-vercel)
8. [Environment variables & secrets](#8-environment-variables--secrets)
9. [Post-deploy smoke test](#9-post-deploy-smoke-test)
10. [Repo health checklist](#10-repo-health-checklist)
11. [Incident runbooks (minimum)](#11-incident-runbooks-minimum)
12. [Known gaps (track here)](#12-known-gaps-track-here)
13. [Changelog](#13-changelog)
14. [References](#14-references)

---

## 1. Executive summary

| Item | Value |
| --- | --- |
| **Canonical GitHub repo** | `claudiokurath/planetsorted` |
| **Default branch** | `main` |
| **Production URL (primary)** | https://planetsorted.com |
| **Legacy domain** | `sor7ed.com` → **301** to `planetsorted.com` |
| **Host** | Vercel (Production from `main`) |
| **Runtime** | Node **22**, Next.js App Router |
| **Visible brand** | SOR7ED / PLANET SOR7ED |
| **Legal entity** | SOR7ED LIMITED (trading as Planet Sorted) |
| **Messaging** | Meta WhatsApp Cloud API (`+44 7591 922247`) |
| **Product master (separate)** | `docs/planet-sorted-master.md` in the same repo |

**What “done” means for a deploy**

1. PR CI green (typecheck + tests blocking)
2. Vercel Preview QA’d (if UI/API behaviour changed)
3. Squash-merged to `main`
4. Vercel Production deploy succeeded
5. [Post-deploy smoke test](#9-post-deploy-smoke-test) checked off

---

## 2. Authority & conflict resolution

| Topic | Source of truth |
| --- | --- |
| Repo identity, branches, PR/merge policy | **This page** |
| Vercel project, domains, envs, crons | **This page** |
| Env var *names* + where they live | **This page** (+ keep `.env.example` in sync when it exists) |
| Product, brand, schema, WA commands, paywall | **`docs/planet-sorted-master.md`** |
| Immutable code files (do not edit without explicit order) | **`AGENTS.md`** |
| Live runtime behaviour | Production at `planetsorted.com` (verify; then fix docs if wrong) |

**Rule:** docs lag code sometimes. If production behaviour disagrees with this page, **fix the page the same day** after verifying the live system — do not “win” by ignoring production.

---

## 3. The repo reality (what exists today)

### ✅ Canonical production repo (active)

| Field | Value |
| --- | --- |
| GitHub | https://github.com/claudiokurath/planetsorted |
| Package name in repo | `sor7ed` (`package.json`) — historical; **not** the public domain |
| Must match live site | https://planetsorted.com |

### 🎯 Target consolidated repo (planned — not canonical)

| Field | Value |
| --- | --- |
| GitHub | `claudiokurath/sor7ed` |
| Status | **Not** production until this page explicitly promotes it |
| Promotion checklist | (1) code + history migrated, (2) Vercel re-pointed, (3) domains verified, (4) this page updated, (5) old repo archived/read-only |

### 📦 What lives where

| Concern | Where |
| --- | --- |
| Website, tools, intelligence, dashboard, WA webhook, Stripe, crons | **Canonical repo** (`planetsorted`) |
| Product rules / brand / schema narrative | `docs/planet-sorted-master.md` |
| Content authoring workflow | `docs/content-workflow-runbook.md` + Notion CMS |
| Partner embed widget | `public/widget.js` + `/api/widget-config` (same repo) |
| Shared tooling / future monorepo packages | Consolidated repo **only after** promotion |

### 🏷️ Domains & brand (non-negotiable)

| Surface | Rule |
| --- | --- |
| **Primary public domain** | `planetsorted.com` |
| **`sor7ed.com`** | 301 permanent redirect → `planetsorted.com` (DNS/Vercel). **Never** use as primary URL in code, OG tags, or copy |
| **Email** | `hello@planetsorted.com` (keep `hello@sor7ed.com` forwarding during transition) |
| **UI / WA copy brand** | SOR7ED / PLANET SOR7ED |
| **Legal (footer, Terms, Privacy)** | Planet Sorted / SOR7ED LIMITED |

> ⚠️ Older Notion drafts that say “www.sor7ed.com is production” are **stale**. Primary is `planetsorted.com`.

### 🧰 Stack snapshot (deploy-relevant)

- **App:** Next.js (App Router), React 19, TypeScript
- **Data:** Supabase (Postgres + Auth magic link)
- **CMS:** Notion → Supabase via cron
- **Payments:** Stripe
- **WhatsApp:** Meta Cloud API (not Twilio for core Lab send path)
- **Optional container:** `Dockerfile` multi-stage standalone (Node 22 Alpine) — secondary to Vercel

---

## 4. How changes ship (end-to-end)

```
1) Branch from latest main
2) Implement + local checks (see below)
3) Open PR → GitHub Actions CI runs
4) Vercel Preview deploy (automatic)
5) QA Preview URL (UI / API / OG if relevant)
6) Squash-merge to main
7) Vercel Production deploy (automatic)
8) Post-deploy smoke test on planetsorted.com
9) If behaviour or env changed → update this page or product master same day
```

### Local minimum before PR

```bash
npm ci
npx tsc --noEmit
npm test
npm run lint          # currently non-blocking in CI; still fix new issues you introduce
npm run build         # required if you touched config, deps, or routing
```

### “Done” definition (release)

- [ ] CI typecheck + tests green on the PR
- [ ] Preview QA done (link in PR) when behaviour/UI changed
- [ ] Production deploy green on Vercel
- [ ] Smoke test (section 9) passed
- [ ] Secrets only in Vercel / local `.env*` (never committed)
- [ ] Docs updated if repo/deploy/product contract changed

---

## 5. Branching & PR rules

### Branch naming

| Type | Pattern | Example |
| --- | --- | --- |
| Default | `main` | production |
| Feature | `feature/<scope>-<slug>` | `feature/blog-taxonomy` |
| Fix | `fix/<scope>-<slug>` | `fix/og-image-proxy` |
| AI / assisted lane | `genspark_ai_developer` (or short-lived `feature/*` off main) | keep rebased/synced with `main` before PR |

**Do not** commit directly to `main` except true break-glass (document in changelog).

### Pull request minimum

- **Title:** clear, conventional (`feat:`, `fix:`, `chore:`, `docs:`) — no bare “updates” / “wip”
- **Body must include:**
  - **What changed**
  - **Why**
  - **Test plan** (bullets; Preview URL if UI)
  - **Risk / rollback** (one line is enough)
- Keep PRs small. Split “mega PRs”.
- Call out any **env var**, **cron**, or **immutable file** touch explicitly.

### Merge policy

- Prefer **squash merge** (clean `main` history)
- Rebase/sync with `main` before merge; resolve conflicts preferring **remote `main`** unless the PR’s change is essential
- After merge: confirm Vercel Production deploy, then smoke test

### Commit message style

```
feat(scope): short imperative summary
fix(scope): short imperative summary
chore(scope): short imperative summary
docs(scope): short imperative summary
```

If deploy-sensitive, add a body line: `Verify: <smoke items>`.

### Immutable files (do not edit without explicit human instruction)

Listed in `AGENTS.md`. Includes WhatsApp core paths and Save-to-Phone. **PRs that touch these need an explicit “approved to edit immutable file X” note.**

---

## 6. CI gates

Workflow: `.github/workflows/ci.yml`  
Triggers: every **pull_request**, and **push to `main`**.

| Check | Command | Gate |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | **Blocking** |
| Tests | `npm test` | **Blocking** |
| Lint | `npm run lint` | **Non-blocking today** (`continue-on-error: true`) — fix new issues; backlog exists |

Node version in CI: **22** (matches Dockerfile / Vercel target).

**Why CI exists:** Vercel used to be the only build check *after* merge; type errors could ship and leave production on a stale build. CI blocks that class of failure pre-merge.

---

## 7. Deployment (Vercel)

### Environments

| Env | Source | URL use |
| --- | --- | --- |
| **Production** | `main` | https://planetsorted.com |
| **Preview** | PR / branch | Vercel Preview URL — QA here first |
| **Local** | developer machine | `localhost:3000` + `.env.local` |

### Project conventions (non-negotiable)

- **One** canonical Vercel project for this app (no duplicate projects that drift)
- Production domain: **`planetsorted.com`** (+ `www` if configured → apex or vice versa; document the canonical host)
- `sor7ed.com` remains redirect-only
- Vercel env vars set per environment (Production / Preview / Development as needed)
- `NEXT_PUBLIC_SITE_URL` in Production must be `https://planetsorted.com` (no trailing slash inconsistency in new code)

### Crons (`vercel.json`)

| Schedule (UTC) | Path | Purpose |
| --- | --- | --- |
| `0 0 * * *` | `/api/cron/sync-notion` | Notion → Supabase sync (daily on Hobby) |
| `0 10 * * 2` | `/api/cron/weekly-broadcast` | Tuesday weekly WA broadcast |

- Auth: `Authorization: Bearer ${CRON_SECRET}`
- **Hobby limit:** one invocation/day per cron — `*/5` schedules are rejected at deploy. For 5-minute Notion sync: upgrade to Pro **or** external pinger (GitHub Actions / cron-job.org) hitting the same route with `CRON_SECRET`.

### Docker (optional / secondary)

- `Dockerfile`: Node 22 Alpine, `output: "standalone"`
- Not a substitute for the Vercel production path unless explicitly cut over in this doc

### Release checklist (quick)

- [ ] Required env vars present in Vercel **Production** (and Preview if needed)
- [ ] CI green on PR
- [ ] `npm run build` sanity if deps/config changed
- [ ] Preview QA (link in PR)
- [ ] Merge → Production deploy success
- [ ] Smoke test (section 9)

---

## 8. Environment variables & secrets

### Storage rules

| Do | Don’t |
| --- | --- |
| Store secrets in **Vercel env vars** | Commit `.env`, `.env.local`, `.env.production` |
| Use gitignored local `.env.local` for dev | Paste tokens into Slack/Notion/PRs |
| Keep a root **`.env.example`** with placeholders only | Put real DB IDs *secrets* in git (public IDs OK if already public) |
| Rotate on any suspected leak | Reuse production secrets in screenshots |

### Variable inventory (code-referenced)

Grouped by area. **Required in Production** unless marked optional.

#### Site / public

| Variable | Client? | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Production: `https://planetsorted.com` |
| `NEXT_PUBLIC_WA_NUMBER` | yes | E.164 / wa.me builder number |
| `NEXT_PUBLIC_API_BASE_URL` | yes | Optional legacy/alternate API base — avoid new uses |
| `NEXT_PUBLIC_WEB_BASE_URL` | yes | Optional alternate web base — prefer `NEXT_PUBLIC_SITE_URL` |

#### Supabase

| Variable | Client? | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Anon key (RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Never expose to browser |

#### Notion CMS

| Variable | Notes |
| --- | --- |
| `NOTION_SECRET` | Integration token (sync) |
| `NOTION_ARTICLES_DB_ID` | Articles DB |
| `NOTION_TOOLS_DB_ID` | Tools DB (if used by sync) |
| `NOTION_BLOG_DB_ID` | Blog DB (if used) |
| `NOTION_CRM_SECRET` | CRM integration (may equal or differ from `NOTION_SECRET`) |
| `NOTION_CRM_DB_ID` | CRM database (optional default exists in code/docs) |

#### WhatsApp (Meta Cloud API)

| Variable | Notes |
| --- | --- |
| `META_PHONE_NUMBER_ID` | Phone number ID |
| `META_WHATSAPP_TOKEN` | Cloud API token |
| `META_APP_SECRET` | Webhook `X-Hub-Signature-256` — **required in production** |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification challenge |

> Core Lab messaging is **Meta**, not Twilio. Ignore older drafts that list `TWILIO_*` as the primary path unless a separate Twilio integration is reintroduced and documented here.

#### Auth / signing

| Variable | Notes |
| --- | --- |
| `CONNECT_TOKEN_SECRET` | HMAC for CONNECT / access tokens (preferred) |
| `APP_SIGNING_SECRET` | Alternate/general signing secret if used |
| *(fallback)* | Some paths may fall back to service-role material — prefer explicit secrets |

#### Stripe

| Variable | Notes |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature |
| `STRIPE_PRICE_ID_PLUS_MONTHLY` | Plus plan price id |

#### Ops

| Variable | Notes |
| --- | --- |
| `CRON_SECRET` | Bearer for `/api/cron/*` |
| `NODE_ENV` | Set by platform |

### Secret leak minimum response

1. **Rotate** the secret at the provider immediately  
2. Update **Vercel** Production (+ Preview if needed)  
3. Revoke old credential; check logs/git history for exposure  
4. If committed to git: remove from tree, rotate, consider history purge  
5. Log date + what rotated in [Changelog](#13-changelog)

---

## 9. Post-deploy smoke test

Run against **https://planetsorted.com** after every production deploy that could affect users.

### Always

- [ ] Homepage renders (hero + main sections)
- [ ] `/tools` index + **one** tool page
- [ ] `/intelligence` index + **one** article (teaser locked state OK)
- [ ] `/r/<known-slug>` as a normal browser → redirects to tool/article
- [ ] `/privacy`, `/terms` load
- [ ] No obvious 500 on `/dashboard` (auth gate OK)

### When WhatsApp / rich links / OG touched

- [ ] `curl -A 'facebookexternalhit/1.1' https://planetsorted.com/r/<slug>` returns HTML with `og:image` → `/api/image-proxy` (or branded `/api/og`), **1200×630**
- [ ] Image proxy returns JPEG quickly for a known cover URL
- [ ] Send or save-to-phone path still delivers **one** rich card (if you are allowed to test production WA)

### When auth / billing touched

- [ ] Magic link request does not 500
- [ ] Stripe webhook endpoint up (signature failure on garbage POST is OK; 404 is not)
- [ ] Cron routes reject missing/wrong `CRON_SECRET`

### When Notion sync touched

- [ ] `GET /api/cron/sync-notion` with bearer secret succeeds or fails loudly with plain logs (no silent crash)
- [ ] A recently published Notion row appears in Supabase within the expected cadence

---

## 10. Repo health checklist

### Required

- [x] Canonical remote = `claudiokurath/planetsorted`
- [x] CI workflow present (typecheck + test)
- [x] `docs/planet-sorted-master.md` product SoT
- [x] `AGENTS.md` persistent agent rules
- [x] `vercel.json` crons defined
- [x] `.env*` gitignored
- [ ] Root **`.env.example`** with full placeholder inventory *(gap — see §12)*
- [ ] **README.md** replaced (still create-next-app boilerplate) *(gap)*
- [ ] Node version pinned visibly (`.nvmrc` or `package.json#engines` → 22) *(gap)*
- [ ] `LICENSE` / `CONTRIBUTING.md` if external collaborators expected *(gap / optional)*

### Fresh clone should be able to

```bash
git clone git@github.com:claudiokurath/planetsorted.git
cd planetsorted
cp .env.example .env.local   # once example exists
# fill values…
npm ci
npm run dev
```

---

## 11. Incident runbooks (minimum)

### Production is serving stale / wrong build

1. Open Vercel → Production deployment for `main`  
2. Confirm latest commit SHA matches GitHub `main`  
3. If deploy failed: read build log, fix forward on a PR, do not “hot edit” Vercel  
4. If deploy succeeded but CDN looks old: hard-refresh; check domain project binding  

### WhatsApp webhook failing

1. Meta developer console → webhook delivery errors  
2. Verify `META_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `META_WHATSAPP_TOKEN`  
3. Confirm route `/api/whatsapp/webhook` is reachable and not auth-gated by Vercel Deployment Protection  

### Cron not running

1. Vercel → Crons / Logs for `/api/cron/*`  
2. Confirm `CRON_SECRET` matches caller  
3. Remember Hobby daily limit for sync frequency  

---

## 12. Known gaps (track here)

| Gap | Impact | Owner action |
| --- | --- | --- |
| README is still `create-next-app` stub | Onboarding friction | Replace with setup + link to this doc + product master |
| No root `.env.example` | Secret drift / missed vars | Add placeholders matching §8 |
| No `.nvmrc` / `engines` | Node version drift | Pin Node 22 |
| Lint non-blocking in CI | Style/bug debt can merge | Clear backlog → make lint blocking |
| Notion sync daily on Hobby | Content lag up to ~24h | Pro cron or external pinger if 5‑min needed |
| `claudiokurath/sor7ed` not promoted | Name confusion | Only promote via §3 checklist |

---

## 13. Changelog

| Date | Change |
| --- | --- |
| 2026-05-14 | Initial Notion “Master Doc” style for repo/deploy conventions. |
| 2026-08-21 | Full rewrite: primary domain corrected to **planetsorted.com**; Meta WA (not Twilio) as core path; aligned with live `planetsorted` repo, CI, `vercel.json` crons, env inventory from code; split product SoT vs deploy SoT; added smoke tests, gaps, incident minimums. |

---

## 14. References

| Doc | Role |
| --- | --- |
| `docs/planet-sorted-master.md` | Product / brand / schema / WA commands SoT |
| `docs/content-workflow-runbook.md` | Content pipeline operations |
| `AGENTS.md` | Agent + immutable file rules |
| `.github/workflows/ci.yml` | CI definition |
| `vercel.json` | Cron schedules |
| Notion: SOR7ED — Repo Consolidation Plan | Future `sor7ed` repo promotion planning |

---

### Copy-paste blurb for PR template (optional)

```markdown
## What
## Why
## Test plan
- [ ] tsc + npm test
- [ ] Preview URL:
- [ ] Smoke (if prod-bound):
## Env / cron / immutable files
- [ ] None
- [ ] Listed here:
## Rollback
```

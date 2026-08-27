# Planet Sorted – Master Document

## 📋 Table of Contents
- [Executive Summary](#executive-summary)
- [Goals for this Build](#goals-for-this-build)
- [Product Architecture: The Planet Sorted Ecosystem](#product-architecture-the-planet-sorted-ecosystem)
- [Strategic Direction](#strategic-direction)
- [Brand & Tone](#brand--tone)
- [Category Taxonomy](#category-taxonomy)
- [The Two-Layer Model](#the-two-layer-model)
- [WhatsApp as Remote Control](#whatsapp-as-remote-control)
- [The SOR7ED Button](#the-sor7ed-button)
- [Sorted Lab — Standard Results Page (Tool OS)](#sorted-lab--standard-results-page-tool-os)
- [Sorted Lab — Featured & Priority Tools](#sorted-lab--featured--priority-tools)
- [Monetization & Paywall Rules](#monetization--paywall-rules)
- [Technical Stack & Architecture](#technical-stack--architecture)
- [Database Schema](#database-schema)
- [Notion CMS & Content Workflow](#notion-cms--content-workflow)
- [WhatsApp Messaging Integration](#whatsapp-messaging-integration)
- [Auth & Accounts](#auth--accounts)
- [SEO Strategy](#seo-strategy)
- [Cron Jobs](#cron-jobs)
- [Legal Pages](#legal-pages)
- [Environment Variables](#environment-variables)
- [Company Details](#company-details)
- [Definition of Done](#definition-of-done)
- [Engineering Roadmap](#engineering-roadmap)
- [Reference Map](#reference-map)
- [Version & History](#version--history)

---

## Executive Summary
**Planet Sorted** is the mother brand and main website — the umbrella everything else sits under. The current build is **Sorted Lab**: practical protocols, templates, and tools for neurodivergent adults, delivered via a website and remote-controlled through WhatsApp. Content is authored in Notion, synced to Supabase every 5 minutes, and surfaced on the website as public articles and member tools. The website delivers the value; WhatsApp is the remote control — users save content, run tools, and return to results with one text message, no new app required. Beyond Sorted Lab, Planet Sorted is built to house further divisions over time — **Sorted Concierge** (the original "we do it for you" idea, reinstated as a future line) and whatever else comes next — without being capped at a fixed number.

---

## Goals for this Build
- `planetsorted.com` live as the fast, reliable mother site.
- Sorted Lab shipped as the first division: Notion → Supabase sync powering articles and tools.
- WhatsApp as the remote control: public tool and article pages prepare users for WhatsApp delivery; the replacement send control is currently being redesigned.
- GDPR/PECR consent, crisis detection, STOP/START unsubscribes, opt-in weekly broadcasts.
- Clear free → paid conversion path (free = insight, paid = deliverable + continuity).
- SEO surfacing "sorted," "planet sorted," and neurodivergent search terms.

---

## Product Architecture: The Planet Sorted Ecosystem

### The Umbrella
Planet Sorted is the mother brand and the primary domain. It is **not** structured around a fixed number of anything — the previous "7 branches of life" framing exists purely as background storytelling in the About Us section (already written, not repeated here) and has no bearing on the product, the database, or the navigation.

### Divisions
| Division | Status | What it is |
|---|---|---|
| **Sorted Lab** | This build | Tools, templates, and articles — everything currently specified in this document |
| **Sorted Concierge** | Future | The original "we do tasks for you" concept, reinstated as a named division once Sorted Lab proves demand |
| **Further divisions** | Open | New "Sorted ___" lines can be added later with no hard cap; none are architected yet beyond being reserved as a naming pattern |

Everything below this point in the document describes **Sorted Lab** specifically, running on Planet Sorted's shared infrastructure (auth, WhatsApp remote, Notion/Supabase pipeline). Future divisions will get their own sections when they're actually built.

### What Sorted Lab Is
- A content site (public) + tools platform (public free / paid gated), running under Planet Sorted.
- A WhatsApp remote control system — not a WhatsApp chatbot.
- A Notion-powered CMS with Supabase as the live database.
- Practical tools and templates for neurodivergent adults; plain-English protocols that turn chaos into a next step.

### What Sorted Lab Is Not
- Not therapy or clinical treatment. Not medical, legal, or financial advice. Not a crisis service.
- Not a WhatsApp chatbot (WhatsApp is the remote, not the experience).
- Not productivity shame. Not another app people have to remember to open.

### Product Non-negotiables (Platform-wide, all divisions)
- No passwords — magic link only.
- Every article/tool ends with a practical next step.
- Do **not** paywall the basic answer.
- Paywall deliverables, saved history, exports, full plans, comparison, and continuity.
- Keep core help accessible and shame-free.
- Do not sell user data. Do not use aggressive upselling. Do not make people feel broken for needing help.

---

## Strategic Direction

### The Pivot
- **Original plan:** WhatsApp concierge service — "we do tasks for you," as the entire company.
- **Current plan:** Planet Sorted launches with Sorted Lab — tools + content first, website-first, WhatsApp as the remote. Concierge becomes a named future division rather than the starting point.
- **Why this still works:** lower risk (no human-fulfilment infrastructure needed up front), audience-first trust building, a content flywheel (articles → tools → saved results → return usage), real proof of demand before Concierge gets built, and an architecture that scales to more divisions without needing to be redesigned each time.

### Long-Game Vision
1. **Sorted Lab proves demand** through free tools and articles.
2. **Content builds authority** across whatever topics matter, without being boxed into exactly seven categories.
3. **Audience trusts the system** through saved history, comparisons, and continuity.
4. **Paid deliverables feel natural** once trust is established.
5. **Sorted Concierge, and any further division, becomes an optional extension** — added only when a real division-worthy need shows up, not pre-built on spec.

---

## Brand & Tone

### Tone Rules
- Direct and plain English. Shame-free and practical. No fluff, no "just do it," no inspiration porn. Competent-colleague style, warm and specific.

### Brand Phrases
- "Templates, not inspiration." "Worry less, live more." "Built for ADHD brains." "No app. No spam. Just what works." "One clear next step."

### Homepage Hero
- **Headline:** "Practical tools for neurodivergent life admin."
- **Body:** "PLANET SOR7ED helps you turn overwhelm into one clear, manageable next step — with templates, protocols, and plain-English tools built for brains that already have enough going on."
- **Closing line:** "No app. No spam. Just what works."
- **Visual direction:** One simple contained 16:9 image banner aligned to the same maximum page width as the sections below. The supplied mixed-media collage fills the banner, with the existing hero copy over a dark readability gradient. The headline uses the same uppercase Bebas Neue size and treatment as the homepage section titles. No split-screen panels or additional hero elements.

### Homepage Section Headers
- "HOW IT WORKS," "TOOLBOX," and "GUIDEBOOK" use the same uppercase Bebas Neue display treatment, responsive size and left alignment.
- HOW IT WORKS has no decorative red rule and shares the continuous beige section background with TOOLBOX; GUIDEBOOK remains on black. TOOLBOX and GUIDEBOOK retain their red rules.

### Homepage Scroll Snap
- The homepage uses three vertical snap points: Hero; HOW IT WORKS + TOOLBOX as one combined stop; GUIDEBOOK as the final stop.
- The sticky navigation height is included in the snap offset. Scroll snapping and smooth scrolling are disabled when the visitor requests reduced motion.

### Global Header
- The sticky header uses a compact, centred SOR7ED logo on its own top row, with the navigation centred directly underneath.
- Visible navigation is limited to ABOUT, GUIDEBOOK and TOOLBOX on every screen size. SOUNDS and ACCOUNT are not shown in the header, and the separate phone bottom-tab bar is disabled.

### Global Disclaimers
Use across site footer, sensitive tool pages, WhatsApp HELP/MENU, and relevant outputs:
- Planet Sorted provides educational information, templates, and practical tools.
- It is not medical, clinical, legal, or financial advice, and not a substitute for professional support.
- It is not a crisis service.
- If someone is in immediate danger in the UK, call 999. If at risk of harming themselves, text SHOUT to 85258.
- GDPR: no selling/sharing user data; deletion on request.

---

## Category Taxonomy

The seven newer branch names (Keep Going, Spend Smart, Feel Good, Plan Ahead, Be Connected, Be Yourself, Level Up) are **retired** — not renamed, not kept as an alternate structure, just gone from the product and the database. The original one-word categories are back as the working taxonomy, and are deliberately kept lightweight: a tag for organizing content, not a load-bearing structural constraint on anything.

- **Mind**
- **Wealth**
- **Body**
- **Tech**
- **Connection**
- **Impression**
- **Growth**

These are used to tag articles and tools (e.g., "this tool lives mostly in Wealth") and may support filters or collections on the site. They are **not** mandatory, not enforced as an exhaustive set anywhere in code, and carry no pricing or permission logic. The broader "7 areas of life" narrative already has its own explanation in the About Us section — that's where it stays; this document doesn't re-explain it.

### Reversing the Previous Migration

An earlier iteration of this document introduced the newer descriptive names and ran a backfill to rename existing rows. That direction is now reversed. If any production data was ever migrated to the new names, run the inverse migration below — each pairing is the exact reverse of the original mapping, verified one-to-one with no overlaps:

```sql
UPDATE protocols SET branch = 'Mind'       WHERE branch = 'Keep Going';
UPDATE protocols SET branch = 'Wealth'     WHERE branch = 'Spend Smart';
UPDATE protocols SET branch = 'Body'       WHERE branch = 'Feel Good';
UPDATE protocols SET branch = 'Tech'       WHERE branch = 'Plan Ahead';
UPDATE protocols SET branch = 'Connection' WHERE branch = 'Be Connected';
UPDATE protocols SET branch = 'Impression' WHERE branch = 'Be Yourself';
UPDATE protocols SET branch = 'Growth'     WHERE branch = 'Level Up';

-- Rename the column so it no longer collides in name with the new
-- "Sorted Lab / Sorted Concierge" division terminology:
ALTER TABLE protocols RENAME COLUMN branch TO category;
```

### Optional Taglines (UI-only — not stored, not required)

You floated keeping the newer phrases as a tagline underneath the old one-word labels. That's fine as a purely visual, minimal-effort pattern — a static lookup used only in display code (e.g. a category badge on an article card), never written to the database and never referenced by any handler or paywall logic:

```typescript
// lib/categoryTaglines.ts — optional, display-only, not a DB concept
export const CATEGORY_TAGLINES: Record<string, string> = {
  Mind: 'Keep Going',
  Wealth: 'Spend Smart',
  Body: 'Feel Good',
  Tech: 'Plan Ahead',
  Connection: 'Be Connected',
  Impression: 'Be Yourself',
  Growth: 'Level Up',
}
```

Use it or don't, per page — it exists only so the pattern is available without ever becoming structural again.

---

## The Two-Layer Model

**Website = discovery + reading + running tools + results + account history**
**WhatsApp = the remote control**

WhatsApp is NOT the delivery channel. The website delivers the value. WhatsApp launches tools, saves content, opens last results, and lets users return to anything at any time — on a low-energy day, without remembering a URL.

What must always be true:
- Every WhatsApp reply can deep-link to a specific web screen.
- Every web screen has a SOR7ED send-to-WhatsApp button to continue in WhatsApp.
- Users can always text: MENU / HELP / LOGIN / STOP / START / STOPWEEKLY / STARTWEEKLY.

---

## WhatsApp as Remote Control

### Core Concept
WhatsApp is the remote control and permanent personal library for the user's saved tools and results. The website delivers the value (tool results pages, articles, dashboard); WhatsApp is how users return to it instantly, from any conversation, with one keyword.

### Command System

| Command | Behaviour |
|---------|-----------|
| `SAVE <slug>` | Save content/tool to personal WhatsApp library (always free) |
| `RUN <tool-slug>` | Execute a tool — this is what gets metered/paywalled |
| `ARTICLE <slug>` | Retrieve an article with its protocol |
| `LIBRARY` | Reprint all saved items with their links |
| `LOGIN` | Receive a magic link to the web dashboard |
| `HELP` / `MENU` | See available commands |
| `STOP` | Unsubscribe from all WhatsApp messages (`whatsapp_opted_out = true`) |
| `STOPWEEKLY` | Unsubscribe from weekly broadcast only (`weekly_opted_in = false`) |
| `START` | Re-subscribe to all messages (`whatsapp_opted_out = false`) |
| `STARTWEEKLY` | Re-subscribe to Tuesday broadcast (`weekly_opted_in = true`) |

### Tool Shorthand Triggers
- `TAX` → ADHD Tax Calculator · `AUTOPILOT` → Financial Autopilot · `CLARITY` → Decision Paralysis Solver · `DOPAMINE` → Dopamine Menu Generator · `TRIAGE` → Task Triage · `RSD` → RSD Response Scripts · `SENSORY` → Sensory Audit · `BURNOUT` → Burnout Assessment

### Rich Preview System
- Every outbound WhatsApp message with a URL uses `preview_url: true`.
- Bot responses use `planetsorted.com/r/[slug]` or `planetsorted.com/s/[id]` URLs — these serve full OG metadata (title, description, 1200×630 image). Humans are 307-redirected to the tool/article; **OG crawlers stay on `/r/[slug]`** so WhatsApp scrapes the sharp image-proxy card (following the redirect was the blur bug).
- OG images: always via `/api/image-proxy` → wsrv 1200×630 JPEG q=82 + sharpen, public URL, typically under 250KB. Never point og:image at raw tiny Notion covers or `/api/og?image=` (that path just embeds the source and looks soft). Cache-bust stale previews by versioning image filenames/URLs.
- Website "SOR7ED" / Save-to-phone default: **one** rich-link card only. Full protocol text dump is opt-in (`includeProtocol: true`).

### Save-to-Phone (dashboard only)
Inside `/dashboard`, logged-in users with a verified WhatsApp number get a separate "SEND TO MY WHATSAPP" button that silently POSTs to `/api/save-to-phone`, pushing content via the Meta API without opening WhatsApp manually. This remains a dashboard convenience feature while the replacement public-page send control is being redesigned.

---

## The SOR7ED Button

**Correction (14 August 2026):** this section previously described `GetSortedButton.tsx` as the live button, "temporarily not rendered." That was already stale — verified directly against the running code, not against this doc. `GetSortedButton.tsx` is **not rendered anywhere** and has not been for some time. It is dead code, confirmed by grep across every `.tsx` file in the app. **Deleted** via `git rm components/buttons/GetSortedButton.tsx` (2026-08-15). **Do not restore it.** Live button is `Sor7edButton.tsx`.

**The actual live button is `Sor7edButton.tsx`**, rendered on every article page (`app/intelligence/[slug]/page.tsx`) and every tool page (`components/ToolClient.tsx`). It has three states:
- Not signed in → "SOR7ED — SIGN IN FIRST" → `/signup?next=<returnPath>`.
- Signed in, WhatsApp not verified → "CONNECT WHATSAPP →" → `/dashboard?tab=settings`. `DashboardClient` honours `?tab=` (tools | library | settings).
- Signed in + WhatsApp verified → "SOR7ED" button → `POST /api/save-to-phone` → sends the rich link + full protocol text (+ audio, if present) via the Meta API.

This is a **sign-in + verification gated** flow — the opposite of what the 0.4.1 changelog entry below describes fixing (`GetSortedButton` was meant to be the *ungated*, no-signup `wa.me` replacement). Whether `Sor7edButton`'s gated flow is the intended current design or unintentional drift back toward the pre-0.4.1 problem has not been resolved — flag before changing either way.

**A third, separate thing exists and must not be confused with the above:** `public/widget.js` + `app/api/widget-config/route.ts` is the "SOR7ED BUTTON" **partner widget** — a real, working, self-contained embeddable script (`<script src="https://planetsorted.com/widget.js" data-tool="...">`) meant for *third-party* sites, not Sorted Lab's own pages. Removed from this site's own root layout back in 0.4.1 for exactly that reason (see changelog). As of 15 August 2026, clicking it opens `https://wa.me/447591922247?text=https://planetsorted.com/r/<tool-slug>` — the visitor's own WhatsApp, addressed directly to SOR7ED's number, with that tool's rich-link URL pre-filled (not a bare slug — a bare slug is just text and WhatsApp won't unfurl it into a card). It no longer navigates to planetsorted.com in the browser at all. The visitor taps Send and the rich card (image, title, description, pulled from `/r/[slug]`'s Open Graph tags) lands in their thread with the business. **As of 0.4.18, lead capture is optional:** set `data-partner="your-slug"` on the script tag and the button opens a phone panel that POSTs to `/api/leads` (stored in `partner_leads` under that partner slug) before opening WhatsApp. Without `data-partner`, behaviour is unchanged (direct `wa.me`). Full partner accounts, dashboards, and billing are still a later product — v1 is capture + store only. A live test embed is at `/widget-test`.

**The real vision for that widget, per the founder (14 August 2026):** a standalone, licensable product — other websites embed the button, it collects their visitors' WhatsApp numbers, and those numbers/leads belong to that partner site (something other businesses would pay to install). This does not exist yet in any form. Building it is a genuinely large, separate build (partner accounts, per-partner data model, WhatsApp Business template-message compliance, billing) — not a small addition to the current widget.

**Also found this session, for context — do not conflate with the above:** a separate, complete, historical Next.js project exists locally at `~/Desktop/Private & Shared/sor7ed-app-fresh` (469 commits, last touched 18 April 2026, currently behind a "Coming Soon" redirect). It represents an earlier product direction — password auth, the retired 7-domains structure, a Twilio+n8n WhatsApp bot — superseded by this repo's current direction. Decision made: not revived as a competing live site; may be mined later for reusable pieces (5 additional standalone tools it contains that don't exist here: Dopamine Menu, Decision Clarity Tool, Sensory Audit, Spoon Theory Tracker, Time Blindness Calculator).

**Public detail-page layout, still in the temporary minimal state first noted 10 August 2026:**
- Tool: dark-overlay image banner with title + short description, followed by one compact Summary explanation, followed by the `Sor7edButton` described above.
- Article: dark-overlay image banner with title + description, followed by the public `Blog Post` content, followed by the `Sor7edButton` described above.

**Key files:**
- `components/buttons/Sor7edButton.tsx` — the actual live button on public article/tool pages. See states above.
- `components/buttons/GetSortedButton.tsx` — **deleted** (was dead code). Live button is `Sor7edButton.tsx`.
- `public/widget.js` + `app/api/widget-config/route.ts` — the separate partner-widget product. Real, working, currently embedded nowhere. Not the same thing as `Sor7edButton`.
- `components/ContentHero.tsx` — shared dark-overlay banner for article and tool detail pages.
- `components/SaveToPhoneButton.tsx` — separate, dashboard-only smart button (wa.me fallback / silent API push for verified users). No longer used on public post pages — see [Save-to-Phone (dashboard only)](#whatsapp-as-remote-control).
- `app/api/save-to-phone/route.ts` — authenticated push to user's WhatsApp, used by both the dashboard button above and `Sor7edButton`'s verified-send state.

---

## Sorted Lab — Standard Results Page (Tool OS)

Every tool outputs results using this standard layout:
1. **Hero Result** — the main number, score, or recommendation
2. **Breakdown** — where the result came from (transparent logic + category splits; the trust layer)
3. **Action Plan** — next 24 hours + next 7 days. Small. Doable.
4. **Artifacts** — scripts, checklists, rules, mini-protocols (copy/paste ready)
5. **Save + Compare** — save this run, view history, compare to previous runs
6. **Rerun loop** — suggested cadence + one-click rerun

**Paid-tier features (consistent across all tools):**
- PDF exports · Saved run history (timestamped) · Compare mode · Full 7-day + 30-day action plans · Full scripts/templates packs · Advanced variants (conservative/realistic/aggressive)

---

## Sorted Lab — Featured & Priority Tools

### 1) ADHD Tax Calculator
- **Slug:** `adhd-tax-calculator` · **Remote trigger:** `TAX` · **Category tag:** Wealth
- **Promise:** "In 3 minutes, find your ADHD Tax and get a 30-day plan to cut it."
- **Deliverable:** PDF: "My ADHD Tax Leak Map + 30-Day Plan."
- **Paywall split:** Free = headline + basic breakdown. Paid = full plan + rules artifact + export + history/compare.

### 2) Financial Autopilot
- **Slug:** `financial-autopilot` · **Remote trigger:** `AUTOPILOT` · **Category tag:** Wealth
- **Promise:** "Set up your finances to run on autopilot in 15 minutes."
- **Deliverable:** PDF: "Financial Autopilot Setup Pack."
- **Paywall split:** Free = snapshot + high-level split. Paid = transfer plan + checklist + projection + export + history/compare.

### 3) Decision Paralysis Solver
- **Slug:** `decision-paralysis-solver` · **Remote trigger:** `CLARITY` · **Category tag:** Mind
- **Promise:** "Get unstuck in 5 minutes: decision + guardrails + next step."
- **Deliverable:** PDF: "Decision Brief."
- **Paywall split:** Free = score + top blocker. Paid = full brief + scripts + export + history/compare.

---

## Monetization & Paywall Rules

**Principle: Don't paywall the basic answer. Free = insight. Paid = deliverable + continuity.**

### Free Tier (always)
- Run all tools + view headline result + basic breakdown. Read all articles. SAVE unlimited; 5 free WhatsApp RUN commands. No exports, no history, no compare.

### Plus — Founding Member (£5.99/month or £49/year)
- Save run history + compare mode, PDF exports, full 7-day + 30-day plans, full scripts/templates packs, advanced variants, unlimited WhatsApp RUN commands.

### Supporter (£9.99–£12.99/month)
- Same features as Plus, "pay it forward" framing — subsidises scholarships.

### Scholarships / Pay What You Can
- £0–£2/month, trust-based, no proof needed.

### Credits vs. Entitlements
`entitlements` is checked first and is the source of truth for subscription state. `credits_ledger` only matters with no active entitlement, and exists **specifically to meter WhatsApp `RUN` commands** — website tool usage is never metered; the web-side gate is output tier (basic vs. full), not run count.

$$\text{Can Run (WhatsApp)} = (\text{entitlements.status} = \text{'active'}) \lor \left(\sum \text{credits\_ledger.delta} > 0\right)$$

### Stripe Webhook Lifecycle
The first `entitlements` row must be created on `checkout.session.completed`, which links `user_id` (via `client_reference_id`) to the new `stripe_customer_id`. Only then can later `customer.subscription.updated`/`deleted` events resolve the user correctly.

---

## Technical Stack & Architecture

### Stack
- **Framework:** Next.js App Router · **Auth & DB:** Supabase (magic link only, PostgreSQL, Storage) · **CMS:** Notion API · **Hosting:** Vercel (Vercel Cron) · **Languages:** TypeScript, React 19, TailwindCSS · **Messaging:** Meta WhatsApp Business API · **Payments:** Stripe

### Architecture Loop
```
Notion (CMS)
   ↓  every 5 min (Vercel Cron)
Supabase `protocols` table
   ↓  Next.js reads
Planet Sorted website — Sorted Lab (articles + tools + result pages)
   ↓  Sor7edButton (sign-in + WhatsApp-verified) → /api/save-to-phone → Meta API
   ↓  (GetSortedButton.tsx is dead code, not in this loop — see "The SOR7ED Button")
wa.me link → WhatsApp → user sends command
   ↓
Meta WABA → /api/whatsapp/webhook → command parser → handler
   ↓
Bot reply: rich link card (planetsorted.com/r/[slug]) → redirect to page
```

### Key Directories & Files
```
app/
  api/
    cron/
      sync-notion/        ← Notion → Supabase sync (every 5 min)
      weekly-broadcast/   ← Tuesday 10am opt-in broadcast
    whatsapp/webhook/     ← inbound handler (SAVE/RUN/ARTICLE/LIBRARY/LOGIN/STOP/START)
    save-to-phone/        ← authenticated push to user's WhatsApp
    account/delete/       ← GDPR account deletion
  intelligence/           ← public article pages (Sorted Lab)
  tools/                  ← tool pages + result pages (Sorted Lab)
  r/[slug]/               ← rich link redirect (OG metadata + redirect)
  s/[id]/                 ← save card URLs (OG metadata + redirect)
  dashboard/              ← member area (saved items, history, settings)
  signup/                 ← auth flow (magic link only, no passwords)
  privacy/, terms/, cookies/
components/
  buttons/Sor7edButton.tsx     ← the actual live send-to-WhatsApp button on article/tool pages
  buttons/GetSortedButton.tsx  ← deleted; live button is Sor7edButton.tsx
  ContentHero.tsx              ← shared article/tool image banner
  SaveToPhoneButton.tsx        ← dashboard-only direct-push button (auth + WhatsApp-verified users)
  SmartNav.tsx                 ← nav bar, strictly ABOUT/GUIDEBOOK/TOOLBOX, no auth-conditional links (per 0.4.14)
  SiteFooter.tsx                ← footer with legal links
  DashboardClient.tsx           ← dashboard with Tools/Library/Settings tabs
```

---

## Database Schema

### `protocols` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| slug | text | unique, URL-safe |
| title | text | article title |
| category | text | one of Mind, Wealth, Body, Tech, Connection, Impression, Growth (renamed from `branch`; see Category Taxonomy) |
| type | text | `Article` (default) or `Tool` |
| status | text | `Published` / `Draft` |
| summary | text | short summary |
| excerpt | text | article intro |
| problem | text | article body (markdown) |
| cta | text | call to action copy |
| protocol | text | actual protocol (WhatsApp delivery) |
| keyword | text | WhatsApp trigger keyword |
| cover_image | text | URL — Storage or external |
| read_time | text | e.g. "3 min" |
| meta_description | text | SEO meta description |
| seo_title | text | SEO page title override |
| updated_at | timestamptz | set on upsert |

### `users` table
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK → auth.users |
| first_name | text | |
| email | text | |
| whatsapp_number | text | E.164 format |
| whatsapp_verified | boolean | set true only after OTP confirmation |
| weekly_opted_in | boolean | weekly broadcast consent |
| whatsapp_opted_out | boolean | STOP unsubscribe flag |
| created_at | timestamptz | |

### `saved_items` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| created_at | timestamptz | |
| type | text | `tool` / `blog` / `external` |
| source_id | uuid | link to protocols / tools |
| source_url | text | URL |
| title | text | |
| description | text | |
| og_image_url | text | |
| target_url | text | |

### `tool_requests` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| created_at | timestamptz | |
| user_id | uuid | FK |
| keyword | text | trigger keyword |
| input_text | text | |
| channel | text | e.g., WhatsApp |
| status | text | |

### `tool_runs` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| created_at | timestamptz | |
| tool_request_id | uuid | FK → tool_requests |
| tool_slug | text | |
| model | text | |
| output_text | text | result, or error detail on failure |
| success | boolean | false on failure |
| latency_ms | integer | |

### `credits_ledger` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| created_at | timestamptz | |
| user_id | uuid | FK |
| delta | integer | positive = grant, negative = deduction |
| reason | text | |
| source | text | e.g. `signup`, `whatsapp` |

### `entitlements` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK |
| plan | text | active tier |
| stripe_customer_id | text | set on `checkout.session.completed` |
| stripe_subscription_id | text | |
| status | text | Stripe subscription status |
| current_period_end | timestamptz | |

### `rich_links` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| slug | text | unique, used in `/r/[slug]` URL |
| title | text | OG title |
| description | text | OG description |
| target_url | text | |
| image_url | text | OG image |
| created_at | timestamptz | |

### `rich_link_clicks` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| link_id | uuid | FK → rich_links |
| clicked_at | timestamptz | |
| user_agent | text | |

### `stripe_events` table
| Column | Type | Notes |
|--------|------|-------|
| event_id | text | PK — Stripe event id |
| event_type | text | e.g. checkout.session.completed |
| status | text | processing / done / failed |
| error_detail | text | optional |
| received_at | timestamptz | default now() |
| processed_at | timestamptz | set on done/failed |

Service-role only (RLS on, no public policies). Claimed at start of webhook; duplicates return 200.

### `partner_leads` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| created_at | timestamptz | |
| partner_slug | text | from widget `data-partner` |
| phone | text | digits-only E.164-ish |
| tool_slug | text | optional |
| source_host / source_path | text | embed page context |
| user_agent | text | |
| ip_hash | text | salted hash, not raw IP |
| status | text | new / contacted / converted / spam |

Service-role only. Apply via `supabase/migrations/20260815_billing_leads.sql`.


### Security & RLS
RLS enabled on all tables; service role for admin actions backend-only; client access restricted to the authenticated user.

---

## Notion CMS & Content Workflow

1. Author creates a row in the **Notion Blog database** (`3b30d6014acc80c9bee6d95709efd209`) or **Tools database** (`08ac767d313845ca91886ce45c379b99`).
2. Set `Status` = `Published` in Notion.
3. Cron runs every 5 min (or trigger manually via `scratch/sync-and-check.js`) → upserts row in Supabase `protocols` by `slug`.
4. **Cover images:** auto-downloaded to Supabase Storage (`notion-files/covers/{slug}.jpg`); skipped on subsequent syncs if the file exists.
5. Articles appear on `/intelligence/{slug}` and Tools appear on `/tools` and `/dashboard` within 5 minutes.
6. WhatsApp keywords dynamically match `protocols.keyword` (e.g. sending `TAX`, `CLARITY`, `DOPAMINE`) and return rich link cards via `/r/{slug}`. For detailed step-by-step procedures, see [Content & Tools Workflow Runbook](docs/content-workflow-runbook.md).
7. Every published blog post must include a `Gamma` URL. The Sorted-button delivery path shares that Gamma link with the customer.

### Notion DB Property Mappings
| Notion Property | Maps to | Notes |
|----------------|---------|-------|
| Title | `title` | |
| Slug | `slug` | unique URL identifier |
| Category | `category` | Mind, Wealth, Body, Tech, Connection, Impression, Growth |
| Type | `type` | Article / Tool |
| Status | `status` | Published/Draft |
| Summary | `summary` | short meta blurb |
| Excerpt | `excerpt` | intro text block |
| Blog Post | `problem` | markdown page content |
| CTA | `cta` | page footer action |
| Cover Image | `cover_image` | downloaded to Supabase Storage |
| Gamma | `gamma_url` | customer-facing Sorted-button destination; database field required before delivery wiring |
| Protocol | `protocol` | WhatsApp text delivery |
| WhatsApp Trigger | `keyword` | trigger keyword |
| Cover Image 1 | `cover_image` | |
| Read Time | `read_time` | e.g. "3 min" |
| Meta Description | `meta_description` | SEO snippet |
| SEO Title | `seo_title` | page title override |

*Note: the Notion property was previously labelled "Branch." Live synced data shows every row already carrying a correct category (see "Taxonomy Migration — Complete" in the Engineering Roadmap), which is strong indirect evidence this has already been renamed to "Category" in Notion — not independently confirmed this session, so worth a quick visual check next time someone is in the Notion UI.*

---

## WhatsApp Messaging Integration

- **Inbound:** `POST /api/whatsapp/webhook` — parses payloads into `{ verb, arg }`.
- **SAVE handler:** writes to `rich_links` and `saved_items`; responds with `planetsorted.com/r/[slug]` rich card.
- **RUN handler:** `lib/billing/credits.ts` — active entitlement → unlimited; else debit 1 from `credits_ledger` (5 free on signup). Paywall reply → `/r/upgrade`. Bare tool keywords (TAX, CLARITY, …) are metered the same as `RUN <tool>`.
- **ARTICLE handler:** delivers article + protocol, paginated for long text, link back to the web page.
- **LOGIN handler:** generates magic link → sends to WhatsApp thread.
- **Crisis detection:** intercepts crisis keywords before any other handler.
- **STOP / STOPWEEKLY / START / STARTWEEKLY:** as specified in the Command System table above, each with its own confirmation message.
- **Weekly broadcasts:** opt-in only, Tuesdays 10am via Vercel Cron.
- **Rich previews:** `preview_url: true` on every outbound URL; all bot URLs go via `/r/[slug]` or `/s/[id]`.
- **Compliance:** all messages logged.

---

## Auth & Accounts

- Magic link auth only — no passwords. WhatsApp `LOGIN` sends a magic link directly to the user's thread.
- `/dashboard` contains Overview (saved items, history, compare) and Settings (name, email, WhatsApp, weekly toggle, verification, deletion).

### WhatsApp Number Verification
1. User enters number (E.164) in Settings.
2. Server sends a 6-digit OTP via the Meta API.
3. User enters the code on the dashboard.
4. Server sets `whatsapp_verified = true`.
5. Until step 4, `Sor7edButton` shows "CONNECT WHATSAPP →" instead of the send button — see "The SOR7ED Button" (the `?tab=settings` deep-link is fixed).

### Notion CRM Sync
Every new signup (WhatsApp-first or email/dashboard) is mirrored, best-effort, into the Notion `CRM` database (properties: Name, Email, WhatsApp, Status, Source, Signed Up) via `lib/notion/syncUserToCrm.ts`. A Notion outage never blocks account creation — sync failures are logged, not surfaced to the user.

### GDPR Deletion
Wipes `saved_items`, `credits_ledger`, `entitlements`, `tool_requests` (cascading to `tool_runs` via `tool_request_id`, since that table has no direct `user_id`), and the `users` row, then deletes the corresponding Supabase auth user.

---

## SEO Strategy
- **Primary domain:** `planetsorted.com`. `sor7ed.com` → 301 permanent redirect to `planetsorted.com` (DNS/Vercel level) — this is a **flip** of the previous direction.
- `Organization` + `WebSite` schema JSON-LD in `<head>` with `alternateName: ['sorted', 'Sorted', 'planet sorted']`.
- Dynamic `sitemap.xml` fetching live `Published` slugs; `robots.txt` blocking `/api/`, `/dashboard`, `/signup`.
- `metadataBase` = `NEXT_PUBLIC_SITE_URL`. Logo alt text updated to reference Planet Sorted.

---

## Cron Jobs
| Schedule | Path | Purpose |
|----------|------|---------|
| `*/5 * * * *` | `/api/cron/sync-notion` | Notion → Supabase sync |
| `0 10 * * 2` | `/api/cron/weekly-broadcast` | Tuesday 10am opt-in WhatsApp broadcast |

*Protected by `Authorization: Bearer ${CRON_SECRET}`.*

---

## Legal Pages
- `/privacy`, `/terms`, `/cookies` — content unchanged in substance; update brand references to Planet Sorted (trading name) with SOR7ED LIMITED as the legal entity. Linked in `SiteFooter`. No cookie banner needed — only strictly necessary cookies are used.

---

## Cron schedule

- **Notion → Supabase sync** is on a **once-daily** Vercel cron (`vercel.json` → `/api/cron/sync-notion` at 00:00 UTC). Vercel Hobby only allows one cron invocation per day — `*/5` schedules are rejected at deploy time.
- For the master-spec **every-5-minutes** cadence: either upgrade to Vercel Pro and set the schedule to `*/5 * * * *`, or add an external pinger (GitHub Actions / cron-job.org) that `GET`s `/api/cron/sync-notion` with `Authorization: Bearer $CRON_SECRET`.
- **Weekly broadcast** remains a Vercel cron: Tuesdays 10:00 UTC.

## Environment Variables

| Variable | Used in |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (admin operations) |
| `NOTION_SECRET` | Notion sync cron |
| `NOTION_BLOG_DB_ID` | Notion blog DB (`3b30d6014acc80c9bee6d95709efd209`) |
| `NOTION_CRM_SECRET` | Notion CRM sync (new signups → CRM database) |
| `NOTION_CRM_DB_ID` | Notion CRM database (`35e0d6014acc80ff8761c320c06835ee`) — optional, defaults to this ID |
| `CRON_SECRET` | Cron route auth |
| `NEXT_PUBLIC_SITE_URL` | Now defaults to `planetsorted.com` |
| `NEXT_PUBLIC_WA_NUMBER` | GET IT SORTED button (wa.me links) |
| `META_PHONE_NUMBER_ID` / `META_WHATSAPP_TOKEN` | WhatsApp send API |
| `META_APP_SECRET` | Meta webhook `X-Hub-Signature-256` verification (required in production) |
| `WHATSAPP_VERIFY_TOKEN` | WhatsApp webhook verification |
| `CONNECT_TOKEN_SECRET` (or `APP_SIGNING_SECRET`) | HMAC for CONNECT QR tokens + standalone access cookies (falls back to service-role key) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Payments |
| `STRIPE_PRICE_ID_PLUS_MONTHLY` | Stripe Price ID for Plus checkout |

---

## Company Details
- **Registered Name:** SOR7ED LIMITED (trading as SOR7ED)
- **Company Number:** 16398701 (UK) · **Founded:** 2025 · **Location:** London, UK
- **WhatsApp:** +44 7591 922247
- **Email:** hello@planetsorted.com *(keep hello@sor7ed.com forwarding to it during transition)*
- **Website:** planetsorted.com

---

## Definition of Done
Unchanged from prior versions — clear promise, manageable inputs, hero result, breakdown, action plan, take-home artifact, save/export path, rerun loop, WhatsApp trigger, legal/safety copy, analytics event, mobile-friendly result page, and standardised failure/empty-state handling logged to `tool_runs` with `success: false`.

---

## Engineering Roadmap

### Sprint 0 (Phase 1 & 1B) — GET IT SORTED, OG previews, article delivery
`wa.me` builders, `/api/save-to-phone`, `/r/[slug]` redirects on planetsorted.com, `ARTICLE <slug>` dispatch with pagination.

### Sprint 1 (Phase 2) — Saved library & accounts
`saved_items` integration, `/s/[id]` redirects, idempotent `SAVE`, WhatsApp OTP verification flow.

### Sprint 2 (Phase 3) — Metering & paywalls
`credits_ledger` + `entitlements` checks **shipped (0.4.18)** for WhatsApp RUN. Stripe checkout inside WhatsApp still open. Webhook sync + `stripe_events` idempotency shipped.

### Taxonomy Migration — Complete
The reverse SQL migration (branch → category) has been run and verified
live against Supabase: all 154 `protocols` rows carry canonical
one-word categories (Mind: 68, Body: 38, Connection: 12, Impression: 10,
Wealth: 10, Growth: 9, Tech: 7) — zero empty values, zero retired names.
`lib/types/database.ts` and `app/api/cron/sync-notion/route.ts` already
use `category` throughout; the `LEGACY_CATEGORIES` map in the sync route
is a defensive shim that normalises any stray retired names at sync
time and is confirmed working, not a bug. The Notion property itself
could not be checked directly this session, but clean data across
every row is strong indirect evidence it has already been renamed
from "Branch" to "Category" — worth a quick visual confirmation next
time someone is in the Notion UI.

---

## Reference Map
- **This Document:** Current master specification — source of truth.
- **Repository Truth:** SOR7ED MASTER DOC — Repo & Deployment (Notion; rename display title to "PLANET SORTED MASTER DOC" going forward, same URL).
- **WhatsApp Save Architecture:** REFERENCE — WhatsApp + Save System Architecture (Notion).
- **Implementation Snippets:** REFERENCE — Website Code Archive / Implementation Snippets (Notion).

---

## Version & History
- **Current Version:** 0.4.21
- **Notes (0.4.21):** Guidebook ProtocolDeck. Unlocked `/intelligence/[slug]` no longer renders a grey wall of prose — body + protocol are parsed into kit-style black/yellow presentation slides (cover split, STEP badges, yellow card grids, numbered rails, callouts, stats) matching the Relationship Harm-Reduction Kit visual language. Print/Save-as-PDF uses A4 landscape (`ProtocolDeckPrint.css`). Locked visitors still see teaser + SOR7ED WhatsApp CTA only. Parser: `lib/protocolDeck.ts`; UI: `components/ProtocolDeck.tsx`.
- **Notes (0.4.20):** Article teaser gate. Public `/intelligence/[slug]` shows only excerpt/summary teaser + SOR7ED CTA — full `problem` body and `protocol` unlock only when the visitor arrives via the WhatsApp rich link (`/r/[slug]` mints a 7-day HMAC `access_token`, same pattern as standalone tools). Signed-in website session is no longer a shortcut. Guessable `access_token=granted` removed.
- **Notes (0.4.19):** WhatsApp rich-link quality fix. (1) `/r/[slug]` no longer 307-redirects OG crawlers (WhatsApp/Facebook/etc.) — they stay on the page and scrape sharp `image-proxy` 1200×630 JPEGs; humans still redirect. Root cause of blur: destination standalone pages used `/api/og?image=` which embedded tiny Notion covers (~624×352). (2) All OG surfaces (standalone, tools, intelligence, `/r/`) route covers through `/api/image-proxy` (`q=82` + sharpen). (3) `POST /api/save-to-phone` defaults to **one** rich-link message only — protocol text dump and audio are opt-in (`includeProtocol` / `includeAudio`), fixing the dual-bubble send.
- **Notes (0.4.18):** Deferred product pack shipped. (1) WhatsApp RUN metering — `lib/billing/credits.ts` gates TOOL/RUN keywords against active entitlements or `credits_ledger` balance (5 free signup credits via `ensureSignupCredits` + optional DB trigger); paywall reply links to `/r/upgrade`; dashboard shows live balance via `GET /api/billing/status`. (2) Stripe event idempotency — `stripe_events` table + claim/done/release in webhook. (3) Partner widget lead capture v1 — `data-partner` opens phone panel → `POST /api/leads` → `partner_leads` (service-role only); without partner, legacy direct WhatsApp. SQL: `supabase/migrations/20260815_billing_leads.sql` (apply in Supabase before prod use). Full partner accounts/billing still later.
- **Consolidation Date:** 2026-08-15
- **Notes (0.4.17):** Security + reliability pack. Meta webhook HMAC (`META_APP_SECRET`), CSPRNG OTP, signed CONNECT/standalone tokens, service-role no longer used to identify callers (`lib/auth/requireUser` + session client on upgrade). Stripe period_end no longer falls back to "now"; weekly broadcast uses real newlines + `last_weekly_sent_at` skip; image-proxy timeout/size caps; WhatsApp SAVE/LIBRARY commands; deleted dead `GetSortedButton.tsx`; Docker standalone + Node 22; env table + WA number corrected to +44 7591 922247; `?tab=settings` deep-link fixed.
- **Notes (0.4.16):** Corrected "The GET IT SORTED Button" section (renamed
  "The SOR7ED Button"), which had gone stale relative to the running code:
  `GetSortedButton.tsx` was described as the live button but is actually
  unused dead code (confirmed by repo-wide grep), pending deletion.
  `Sor7edButton.tsx` — undocumented until now — is the actual live button
  on article/tool pages, with a sign-in + WhatsApp-verification gate and a
  `?tab=settings` deep-link into the dashboard (now fixed).
  Documented the separate partner-widget product (`public/widget.js` +
  `app/api/widget-config/route.ts`) as distinct from `Sor7edButton` — real,
  working, embedded nowhere, and not a WhatsApp-number collector as
  currently built, versus the founder's stated vision for it as a
  licensable per-partner lead-capture product (not yet built, large
  separate scope). Also logged the discovery of a separate, complete,
  historical project at `sor7ed-app-fresh` (469 commits, last touched
  18 April 2026, superseded product direction) — decision made not to
  revive it as a competing site.
- **Notes (0.4.15):** Confirmed the taxonomy migration is complete —
  verified live against Supabase (154 protocols rows, all canonical
  one-word categories, zero retired names) — and updated the
  Engineering Roadmap and Category Taxonomy footnote to reflect this
  rather than listing it as pending. Removed the auth-conditional
  Account/Sign In/Sign Out links from SmartNav header nav per the
  0.4.14 spec (commit 1c1af10). Added category taglines to
  ContentCard and ContentHero badges using the existing
  lib/categoryStyles.ts field (commit a1d574d).
- **Notes (0.4.14):** Reduced and centred the header logo, moved navigation into a separate row underneath, limited visible links to ABOUT, GUIDEBOOK and TOOLBOX, and removed the phone bottom-tab bar together with the SOUNDS and ACCOUNT tabs.
- **Notes (0.4.13):** Replaced the rejected split-screen hero with one simple contained 16:9 image banner at the shared page width, retaining the approved copy as an overlay.
- **Notes (0.4.12):** Replaced the full-bleed image-overlay homepage hero with a page-width 50/50 split screen: copy on pitch black, artwork in its own panel, and headline typography matched to the other homepage section titles.
- **Notes (0.4.11):** Moved HOW IT WORKS onto the same continuous beige background as TOOLBOX, removed its decorative red rule, and kept GUIDEBOOK on black.
- **Notes (0.4.10):** Added homepage-only vertical scroll snapping with three stops: Hero; HOW IT WORKS plus TOOLBOX; and GUIDEBOOK. Added sticky-nav offset handling and a reduced-motion fallback.
- **Notes (0.4.9):** Moved the homepage hero copy block into the visual centre of the banner, kept its text left-aligned, and removed the red rule above the headline.
- **Notes (0.4.8):** Replaced the homepage artwork with the supplied 1582×890 version, which natively matches the 16:9 hero frame and therefore requires almost no desktop cropping.
- **Notes (0.4.7):** Changed the full-width homepage hero frame from 2:1 to 16:9 and kept the artwork in cover mode so it fills the complete banner area.
- **Notes (0.4.6):** Converted the homepage hero from a constrained rounded card into a full-bleed banner. The image now spans the viewport edge to edge and preserves its natural 2:1 composition on desktop, while the text remains aligned with the main content grid.
- **Notes (0.4.5):** Standardised the homepage section headers so HOW IT WORKS, TOOLBOX and GUIDEBOOK share the same Bebas Neue typeface, size, red rule spacing and left alignment.
- **Notes (0.4.4):** Replaced the generated homepage hero artwork with the supplied upscaled WhatsApp collage while retaining the approved hero copy, responsive crop and dark readability overlays. The previous generated image remains in the project as an unused alternative rather than being overwritten.
- **Notes (0.4.3):** Rewrote the homepage hero around the clearer promise "Practical tools for neurodivergent life admin." and added an original wide mixed-media hero image derived from the supplied visual reference. The artwork uses a dark copy area and carries no embedded text so the accessible page copy remains the source of truth.
- **Notes (0.4.2):** Simplified public detail pages while the new SOR7ED send control is being designed. Tools now show a dark-overlay image banner with uppercase title and short description, followed only by a compact Summary explanation; the old interactive forms, results, and all public CTA placements were removed. Articles use the same shared banner and continue with the public `Blog Post` content, without the temporary "Want the solution?" CTA box. The homepage now shows up to six compact Tools and six compact Guidebook cards and adds a three-circle Choose → Send → Receive explanation. `GetSortedButton.tsx` remains unchanged for the future replacement.
- **Notes (0.4.1):** Consolidated the GET IT SORTED button to a single behaviour for every visitor: `components/buttons/GetSortedButton.tsx` (plain `wa.me` deep link, no sign-in required) now renders on every article (`app/intelligence/[slug]/page.tsx`) and every tool CTA (`components/ToolClient.tsx`), replacing the sign-in-gated `SaveToPhoneButton`, which had been silently blocking most visitors from receiving anything. `SaveToPhoneButton` + `/api/save-to-phone` are retained but scoped to `/dashboard` only, for already-verified users who want a silent direct push. Also removed a stray embed of the separate, unrelated "SOR7ED BUTTON" partner-widget product (`widget.js`, pointed at `localhost:3000`) that had been added to the root layout — that is a different product for third-party partner sites, not part of Sorted Lab.
- **Notes (0.4.0):** Major pivot. Planet Sorted established as the mother brand and primary domain (`planetsorted.com`); `sor7ed.com` now redirects to it — a flip of the previous direction. Introduced open-ended divisional architecture: **Sorted Lab** (this build, tools + content) and **Sorted Concierge** (reinstated as a named future division), with room for further "Sorted ___" lines without a fixed cap. Retired the "7 Branches" concept entirely as product/database structure; reverted `protocols.branch` (renamed `category`) to the original one-word taxonomy (Mind, Wealth, Body, Tech, Connection, Impression, Growth) and reversed the prior backfill via explicit SQL. Added an optional, UI-only tagline lookup pairing old one-word categories with the retired descriptive names, non-mandatory and not stored in the database. Renamed the primary CTA to "GET IT SORTED" and updated all outbound URLs, SEO schema, and Company Details to planetsorted.com. Restored the Reference Map section. Legal entity retained as SOR7ED LIMITED, trading as Planet Sorted.
TED" and updated all outbound URLs, SEO schema, and Company Details to planetsorted.com. Restored the Reference Map section. Legal entity retained as SOR7ED LIMITED, trading as Planet Sorted.

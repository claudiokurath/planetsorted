# Handoff: Evidence Bundle Organiser

## Overview

The Evidence Bundle Organiser turns a chaotic pile of screenshots, emails, PDFs and notes into a clean, chronological, exhibit-referenced bundle that a tribunal, adviser, ombudsman or small claims court can actually use. It is **deliberately not a legal advice engine** — it never tells a user what the law says or what they will win. It is an **organisation and preparation tool** that reduces the executive-function load of assembling a case.

The design is neurodivergent-first: short chunks of information, validating copy ("this is messy, and that's normal — we'll organise it"), few visible choices per step, and colour used as a **semantic language** (green = strong, orange = needs review, red = risk) rather than decoration. The interface stays premium and serious — dark charcoal surfaces, restrained yellow for primary actions only, clean tabular data — because it has to feel credible enough to sit next to a court bundle.

## About the Design Files

The material in this handoff was delivered as a **product/architecture spec** rather than a rendered HTML prototype. That spec (the full text, verbatim) is included as `SPEC.md` — it is the contract. This README summarises it for a developer and lifts the key implementation details (schema, tokens, logic) into a form they can act on directly.

The task is to **build the Evidence Bundle Organiser in the target codebase's existing environment** (Next.js / Remix / plain React / etc.) using its established patterns and component library. If no environment exists yet, a reasonable default stack is: **Next.js 14 (App Router) + TypeScript + Tailwind + Supabase**. The spec is already written with that stack in mind — Tailwind classes and Supabase SQL are inline.

Notably:
- Local React state drives the MVP; every write-path in the spec is annotated with where the Supabase call will go later. Do not skip the local-state phase — it lets the UI ship without a backend.
- Yellow (`#f5c518`) is reserved for primary actions only. Green/orange/red are reserved strictly for evidence status and risk severity. Do not repurpose these as decorative colours.
- Two pieces of legal/privacy copy are **mandatory** and must appear at every point a user is about to add sensitive material or act on the tool's output — see "Safety, Privacy & Disclosure" below and in `SPEC.md`.

## Fidelity

**Medium-fidelity spec + component sketches.** The spec includes real Tailwind JSX for `LandingPage`, `CaseSetupForm`, `EvidenceEntryForm` (excerpt), `EvidenceDashboard`, and the `UpgradeGate` pattern, plus complete design tokens, data types, Supabase DDL, and business logic (strength score, exhibit categorisation, readiness formula, risk detection, missing-evidence checklists per case type).

The developer should recreate the UI **faithfully to the tokens and layout patterns** in the spec, using the codebase's existing component library for form primitives, buttons, and modals. Don't hand-roll a button system if one exists — just apply the tokens.

## Screens / Views

The step machine in `App.tsx`:

```
'landing' | 'setup' | 'entry' | 'dashboard' | 'export'
```

### 1. Landing (`landing`)
- **Purpose:** Set expectations and start a case.
- **Layout:** `max-w-6xl`, `grid md:grid-cols-2 gap-10`, `px-4 py-16`. Left: headline + supporting copy + primary yellow CTA "Start new case". Right: a `#151515` bordered card showing "What you get" (Timeline · Exhibit index · Strongest evidence · Gaps & risks · Export cover sheet). Bottom (full-width, `md:col-span-2`): the two mandatory legal notices in muted text, above a `border-t border-[#2a2a2a]`.
- See `SPEC.md` for the exact JSX and copy.

### 2. Case setup (`setup`)
- **Purpose:** Collect the case metadata the readiness score and templates depend on.
- **Layout:** `max-w-2xl`, single column, `space-y-5`.
- **Fields (all editable via `set(patch)`):** `caseType` (select — 9 options), `caseName`, `opponent`, `whatHappened` (textarea), `desiredOutcome` (textarea), `mainArgument`, `keyDate` (date), `deadline` (date), `stressLevel` (1-10 slider), `purpose` (select: court / tribunal / complaint / adviser / not sure).
- **CTA:** yellow "Save and add evidence" → advances to `entry`.

### 3. Evidence entry (`entry`)
- **Purpose:** Add each document. Repeat for every item.
- **Fields:** `title`, `documentType`, `date`, `createdBy`, `receivedBy`, `summary`, `provesWhat`, `supportsIssue`, `importance` (core / supporting / background / risky / duplicate / not_sure), `isSensitive`, `problem` (missing_page / unclear_date / not_your_name / contradiction / duplicate / low_quality / not_sure / null).
- **Upload block:** dashed-border `#333` panel, currently a placeholder. Include the sensitive-info notice inside the panel. Two `// TODO` markers for later work:
  - connect to Supabase Storage for real file uploads
  - connect AI OCR (Textract / GPT-Vision) to pre-fill title, date, sender, summary — always for user confirmation, never auto-submit.

### 4. Evidence dashboard (`dashboard`)
The composition heart of the app. Order:
1. **HeroSummary** — case name, opponent, readiness score chip (colour band per label), and one-line explanation.
2. **StrongestEvidence** — sorted by `strengthScore` desc. Free: top 5. Paid: full list.
3. **Timeline** — chronological events by `date`. Free: first 8. Paid: full.
4. **ExhibitIndex** *(paid)* — grouped by category A/B/C/D with renameable headings, each row shows `exhibitRef`, title, date, summary.
5. **KeepMaybeRemoveSorter** *(paid)* — three columns. Move buttons per row. Helper text on the "Remove" column: *"Removing a document from the main bundle does not delete it or hide it — for court/tribunal you may still need to disclose it."* This wording is a safety requirement, not a suggestion.
6. **MissingEvidenceChecklist** — case-type-specific list from `MISSING_EVIDENCE`. Free: top 3. Paid: full, with tick-off state persisted per case.
7. **RiskReview** *(paid)* — sorted by severity (critical → high → medium → low). Always ends with the disclosure reminder.
8. **NextSteps** — always visible, tickable list with priority labels.
9. **Header controls:** "Unlock full bundle" (yellow, opens `UpgradeModal`) and "Export bundle" (yellow, → `export`).

**Gating pattern (`UpgradeGate`):** wraps paid content; when `plan === 'free'`, renders children at `opacity-30 pointer-events-none blur-sm` and overlays a dark panel with "{feature} is available on the paid plan" and a yellow "Unlock full access" button. See `SPEC.md` for the exact JSX.

### 5. Export (`export`)
- Print-ready cover page + timeline table + exhibit table + missing-evidence table + next steps.
- **Both mandatory legal notices are repeated on the printed page.**
- Uses `@media print` to hide the app chrome.

## Interactions & Behavior

- **Step machine:** simple string state in `App.tsx`. Production should map to real routes: `/`, `/case/new`, `/case/[id]/evidence`, `/case/[id]`, `/case/[id]/export`. Preserve URL state so browser Back works.
- **All computed views are pure** — re-compute on every render from `caseData` + `evidence`. Memoize with `useMemo` keyed on those two inputs in production.
- **Persistence:** MVP is local state; every mutation is annotated in the spec with the corresponding Supabase call.
- **No file uploads in MVP.** Manual description only. Upload is a `// TODO` marker.
- **Modal:** `UpgradeModal` is triggered from any `UpgradeGate` or the dashboard header's "Unlock full bundle" button. Contents = the free-vs-paid table below.
- **Motion:** kept minimal — the interface is intentionally serious. No confetti, no gamified score animations. A subtle number tick on readiness score is acceptable.

## State Management

Top-level state in `App.tsx`:

```typescript
step:     'landing' | 'setup' | 'entry' | 'dashboard' | 'export'
caseData: CaseSetup
evidence: EvidenceItem[]
plan:     'free' | 'paid'
```

Derived per render (memoize in production):

```typescript
scored       = evidence.map(e => ({ ...e, strengthScore: computeStrengthScore(e) }))
exhibitItems = assignExhibitRefs(scored)
readiness    = computeReadinessScore(caseData, scored)
risks        = generateRisks(scored, caseData)
missing      = MISSING_EVIDENCE[caseData.caseType]
```

## Data Model

Full TypeScript types and Supabase DDL are in `SPEC.md`. Summary:

- `users` (id, email, plan, created_at)
- `cases` (id, user_id, case_type, case_name, opponent, what_happened, desired_outcome, key_date, deadline, main_argument, stress_level, purpose, timestamps)
- `evidence_items` (id, case_id, title, document_type, document_date, created_by, received_by, summary, proves_what, supports_issue, file_url, importance, is_sensitive, problem, exhibit_category, exhibit_ref, kmr_status, created_at)
- `case_runs` (id, case_id, readiness_score, readiness_label, created_at) — one row per re-analysis, enables version history later.
- `bundle_exports` (id, case_id, run_id, format, created_at)

RLS: every table should be `user_id`-scoped via a `cases.user_id = auth.uid()` join once auth is wired.

## Core Business Logic (port verbatim)

`SPEC.md` contains the full source for:

- `computeStrengthScore(item)` — 0-100, additive by importance + date + provesWhat length + no-problem + document type.
- `defaultExhibitCategory(item)` — **driven by `documentType`, not `importance`** (this is a deliberate correction in the spec).
- `assignExhibitRefs(items)` — sorts by date ascending, then labels A1, A2, B1, C1, D1… per category counter.
- `computeReadinessScore(caseData, evidence)` — the formula and worked example are in the spec. Bands: 0-29 Messy (red) / 30-54 Usable (orange) / 55-79 Strong (green) / 80-100 Nearly ready (bright green).
- `generateRisks(evidence, caseData)` — flags risky items, contradictions, not-your-name docs, duplicates, and a low-severity high-stress note.
- Next-steps and adviser-email generators — deterministic templates, seeded from the outputs of the above.
- `MISSING_EVIDENCE` — full per-`CaseType` checklist (7 case types + `other`), each item flagged `critical` or not, with a one-line `hint`.

**Do not modify the logic without product sign-off** — the readiness formula in particular was tuned against the worked example in the spec.

## Design Tokens

From `SPEC.md`, in CSS custom-property form (drop into `:root` or lift into `tailwind.config.js` `extend.colors`):

```css
:root {
  --bg-primary:  #0d0d0d;   /* page background */
  --bg-surface:  #151515;   /* cards */
  --bg-elevated: #1e1e1e;   /* inputs, hovered rows */
  --border:      #2a2a2a;

  --yellow: #f5c518;   /* primary actions ONLY */
  --green:  #22c55e;   /* strong / core evidence */
  --orange: #f97316;   /* needs review */
  --red:    #ef4444;   /* risk / urgent */

  --text-primary: #f0f0f0;
  --text-muted:   #8a8a8a;

  --radius-md: 10px;
  --radius-lg: 16px;
}
```

**Semantic colour discipline is a product requirement.** Yellow is CTA only; green/orange/red are status only. Users depend on colour as a literal signal.

### Typography
Not fixed in the spec. Recommend a neutral sans (Inter / Geist / system UI) at:
- Display: 30-36px semibold (`text-3xl md:text-4xl font-semibold`)
- H2: 20px semibold
- Body: 14-16px regular
- Micro / eyebrows: 12px uppercase, `text-gray-500`

### Spacing
8px scale. Card interiors `p-5` to `p-6`. Section vertical rhythm `space-y-6` on the dashboard.

## Free vs Paid Enforcement

| Feature | Free | Paid |
|---|---|---|
| Readiness score | ✅ | ✅ |
| Top 5 strongest documents | ✅ | Full list |
| Basic timeline (first 8 events) | ✅ | Full timeline |
| Top 3 missing items | ✅ | Full checklist |
| Full exhibit index (A/B/C/D) | 🔒 | ✅ |
| Keep/Maybe/Remove sorter | 🔒 | ✅ |
| Risk & contradiction review | 🔒 | ✅ |
| Adviser email draft | 🔒 | ✅ |
| Export / print bundle | 🔒 | ✅ |
| Saved cases, duplicate detection, version history | 🔒 | ✅ (via `case_runs` + `bundle_exports`) |

## Safety, Privacy & Disclosure — MANDATORY

Two pieces of copy must appear at every point where a user is about to add sensitive material or act on the tool's output:

> **"Documents may contain sensitive personal information. Do not upload anything unless you trust the service and understand how it is stored."**

> **"For formal legal/court disclosure, you may need to disclose relevant documents even if they do not help you. This tool helps organise evidence but does not replace legal advice."**

Placement:
1. Landing page footer.
2. Directly above the file-upload placeholder in `EvidenceEntryForm`.
3. Inside `RiskReview` (the screen where a user might be tempted to hide a weak document).
4. On the printed `ExportPage`.

Additional safety wording:
- The Keep/Maybe/Remove sorter's third column is labelled **"Remove from main bundle"** (not "Delete"), with helper text stating that removing something from the working bundle does not exempt the user from any formal duty of disclosure. This is non-negotiable — the tool must never encourage hiding harmful evidence.

## AI / OCR Integration Points (Future Work)

Mark these with explicit `// TODO` comments in the MVP so the upgrade path is obvious:

```typescript
// TODO: When a file is uploaded, send it to an OCR/AI extraction service
// (e.g. AWS Textract, GPT-Vision) to pre-fill: date, sender, recipient,
// a draft summary, and a suggested "what does it prove?" for the user to
// confirm or edit — never to auto-submit without user review.
```

Human-in-the-loop is a product requirement, not an implementation detail.

## Files

| File | Purpose |
|---|---|
| `SPEC.md` | The full original product spec — the source of truth. Contains verbatim types, SQL DDL, Tailwind JSX component sketches, `MISSING_EVIDENCE` catalogue, and readiness formula with worked example. |
| `README.md` (this file) | Developer-oriented summary and implementation guidance. |

## Recommended Implementation Notes

- **Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Supabase. `SPEC.md` is already written for this stack.
- **File layout:** follow `SPEC.md` §"Application Architecture" exactly — it maps 1:1 to the components in this doc.
- **Testing:** the logic module (`logic.ts`) is pure and easy to unit test. Snapshot-test `computeReadinessScore` against the worked example in `SPEC.md` (n=8, c=4, f=6, q=7, b=10, p=0 → 93). Bake this in as a regression test — the formula is product-tuned.
- **Accessibility:** contrast on `#8a8a8a` against `#0d0d0d` is ~7.1:1 (AA body). Semantic colours must have a text/icon partner (never colour alone) — e.g. "Strong" chip has both green fill and the word "Strong". Sliders need `aria-valuemin/max/now`.
- **Copy:** do not rewrite. Every piece of user-facing copy in `SPEC.md` has been chosen to reduce shame and set correct legal expectations.

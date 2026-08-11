# Decision Paralysis Solver

> Break free from decision paralysis. Clarify options, boost confidence, and execute.

A single-page static web app that helps people move past being "stuck" on a decision. It combines a scored readiness assessment, a weighted options-comparison matrix, a toolkit of quick-decide tools for low-stakes calls, and a persistent Decision Journal for tracking outcomes over time.

Built from the project spec "DECISION PARALYSIS SOLVER" (category: Keep Going), whose provided input schema is implemented exactly:
- `risk_tolerance` — slider 1–10, "Risk Tolerance (1=Low, 10=High)", default 5
- `impact_magnitude` — slider 1–10, "Potential Impact (1=Low, 10=High)", default 5
- `information_sufficiency` — slider 1–10, "Information Sufficiency (1=Lacking, 10=Abundant)", default 5
- `reversibility` — toggle, "Decision Reversible?", default true

---

## ✅ Currently Completed Features

### 1. Decision Readiness Assessment (`#assessment-section`)
- Form capturing: decision title, category, and the four spec'd signals (risk tolerance, potential impact, information sufficiency, reversibility toggle).
- **Decision Confidence Score (0–100)** computed from a weighted blend of:
  - Information Sufficiency (45%)
  - Risk/Impact Fit — how well your risk appetite matches the stakes (30%)
  - Safety/Reversibility (25%) — irreversible + high-impact decisions are penalized unless information is strong
- Animated circular score gauge + count-up number.
- Verdict tiers with color coding: **Green Light – Decide Now**, **Lean In**, **Proceed with Caution**, **Pump the Brakes**.
- "One-way door / two-way door" badge (Bezos-style reversibility framing).
- Personalized, situational advice list (varies based on which signal is weakest).
- Save any assessment to the **Decision Journal** with one click.

### 2. Clarify Your Options — Weighted Comparison Matrix (`#compare-section`)
- Add unlimited options (e.g. "Job A", "Job B") and unlimited weighted criteria (e.g. "Salary", "Growth", "Commute") with a 1–5 importance weight per criterion.
- Rate every option against every criterion (1–10 sliders) in a live matrix table.
- Automatically computes a weighted score per option, ranks them, and highlights the front-runner with a trophy card and animated ranking bars.

### 3. Quick Decide Toolkit (`#quick-decide-section`)
For low-stakes decisions that don't need a full framework:
- **Coin Flip** — animated 3D coin flip for binary choices.
- **Random Picker** — add any list of options, animated "spin" highlights a random winner.
- **Gut-Check Timer** — 5-second countdown; forces an instinctive pick between two typed options.
- **10-10-10 Rule** — reflection prompts ("will this matter in 10 minutes / 10 months / 10 years?") to defuse over-thinking on small stuff.

### 4. Decision Journal (`#journal-section`)
- Every saved assessment is stored via the RESTful Table API (table: `decisions`).
- Filterable by status: All / Open / Decided / Reviewed.
- Click any card to open a detail modal where you can record the **chosen option**, **notes**, **status**, and an **outcome/reflection** — turning the journal into a feedback loop for improving future judgment.
- Delete entries from the modal.

### Design
- Dark, modern UI with purple/teal gradient accents, Space Grotesk + Inter typography, Font Awesome icons.
- Fully responsive (desktop, tablet, mobile) with a collapsible mobile nav.

---

## 🔗 Functional Entry Points

Single page app — all functionality lives on `index.html`, navigable via in-page anchors:

| Path / Anchor | Purpose |
|---|---|
| `index.html#top` | Hero / landing |
| `index.html#assessment-section` | Decision Readiness Assessment (Step 1) |
| `index.html#compare-section` | Weighted options comparison matrix (Step 2) |
| `index.html#quick-decide-section` | Quick-decide toolkit (Step 3) |
| `index.html#journal-section` | Decision Journal (Step 4) |

### Data API (RESTful Table API — table `decisions`)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `tables/decisions?sort=-created_at&limit=100` | List saved decisions for the journal |
| POST | `tables/decisions` | Save a new assessment result |
| PATCH | `tables/decisions/{id}` | Update status / chosen option / notes / outcome |
| DELETE | `tables/decisions/{id}` | Remove a journal entry |

---

## 🗄️ Data Model — `decisions` table

| Field | Type | Notes |
|---|---|---|
| `id` | text | Auto-generated record id |
| `title` | text | Short description of the decision |
| `category` | text | Career / Money & Purchases / Relationships / Health / Life Direction / Other |
| `risk_tolerance` | number | 1–10 |
| `impact_magnitude` | number | 1–10 |
| `information_sufficiency` | number | 1–10 |
| `reversible` | bool | Two-way door (true) vs one-way door (false) |
| `confidence_score` | number | 0–100 computed score |
| `verdict` | text | Verdict tier label |
| `chosen_option` | text | What was ultimately chosen |
| `notes` | rich_text | Free-form context |
| `status` | text | Open / Decided / Reviewed |
| `outcome` | rich_text | Post-decision reflection |

The Compare Matrix (options/criteria/ratings) and the Quick Decide tools are intentionally session-only (in-memory) — they're meant for fast, in-the-moment use and are not persisted, keeping the journal focused on decisions worth tracking long-term.

---

## 🚧 Not Yet Implemented / Possible Enhancements
- Persisting Compare Matrix sessions (options/criteria/ratings) to the journal for later review.
- Editing a saved assessment's original inputs (currently only status/chosen option/notes/outcome are editable after saving).
- Charting confidence-score trends over time (e.g. with Chart.js) once enough journal entries exist.
- Sharing/exporting a decision summary (e.g. as a copyable text block) since this is a static site with no server-side file generation.
- Optional reminder/deadline field with browser notification support.

---

## 🧭 Recommended Next Steps
1. Use the app for a handful of real decisions to populate the Journal with real data.
2. If trend charts are wanted, add Chart.js and a "Confidence over time" view fed by the `decisions` table.
3. Consider letting users tag a criterion set as a reusable template (e.g. "Job Offer Criteria") for the Compare Matrix.
4. When ready to go live, use the **Publish tab** to deploy.

---

## 🛠️ Tech Stack
- HTML5 / CSS3 (custom, no framework) + Font Awesome icons + Google Fonts (Space Grotesk, Inter)
- Vanilla JavaScript (no build step)
- RESTful Table API for the Decision Journal (`decisions` table)

## 📁 File Structure
```
index.html          Main single-page app (all 4 sections + modal)
css/style.css        All styling (dark theme, responsive)
js/main.js           All interactivity: assessment engine, compare matrix,
                      quick-decide tools, journal CRUD, modal
README.md            This file
```

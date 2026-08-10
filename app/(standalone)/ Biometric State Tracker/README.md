# Biometric State Tracker

> Optimize cognitive & physical performance with personalized hydration. AI-powered daily biometric check-ins, instant insights, and trend tracking.

A single-page, static web app for logging daily biometric data (weight, activity, caffeine, alcohol, temperature, sleep, heart rate, stress, hydration, mood) and receiving an instantly computed **personalized hydration target**, an overall **Biometric State Score**, and **AI-style recommendations** — plus historical trend charts.

- **Category:** Plan Ahead
- **Slug:** `biometric-state-tracker`
- **Status:** Built (draft spec → fully implemented)

---

## ✅ Currently Completed Features

### 1. Landing / Hero
- Branded header with sticky nav (Log Entry / Insights / History & Trends / About)
- Hero section with live stats: total entries logged, average biometric score, average hydration target
- "Today's Snapshot" card with an animated score gauge, hydration target, and mood, updated after each check-in

### 2. Daily Check-In Form (`#entry-form`)
Captures the full spec'd data model, extended with sensible additional biometric fields:
- **Weight (kg)** — number, 40–200
- **Activity Level (1–5)** — slider with labels (Sedentary → Very Intense)
- **Caffeine (mg)** — number, 0–500 (with quick-reference hint text)
- **Alcohol (units)** — number, 0–5
- **Ambient Temperature (°C)** — number
- **Sleep Hours** — number, 0–12
- **Sleep Quality (1–5)** — slider (Poor → Great)
- **Resting Heart Rate (bpm)** — number
- **Stress Level (1–5)** — slider (None → Severe)
- **Water Consumed Today (ml)** — number
- **Mood** — dropdown (Energized, Balanced, Tired, Foggy, Anxious, Low)
- **Notes** — free text

### 3. Calculation Engine (client-side JS, `js/main.js`)
- **Personalized Hydration Target**: derived from body weight, activity level, caffeine (diuretic offset), alcohol (diuretic offset), and ambient temperature. Clamped to a safe 1500–5000ml range.
- **Biometric State Score (0–100)**: weighted rule-based scoring across sleep duration/quality, stress, activity level, caffeine, alcohol, resting heart rate, and hydration progress. Labeled Peak State / Strong / Balanced / Needs Attention / Low.
- **AI-style Recommendations**: a rule-based engine that reviews each input and produces color-coded (good / warning / critical) actionable tips — e.g. hydration pacing, sleep hygiene, stress management, caffeine ceiling warnings, alcohol offset guidance, heart rate flags, heat-adjusted hydration advice.

### 4. Insights Panel (`#results`)
- Biometric State Score with label
- Personalized hydration target (ml/day)
- Hydration progress ring (今日 water consumed vs target)
- Full recommendations list with icons and severity coloring

### 5. History & Trends (`#history`)
- **4 Chart.js line charts**: Biometric Score trend, Hydration (actual vs target), Sleep & Stress, Heart Rate & Weight
- **Entry Log table**: date, score, hydration target, weight, sleep, mood, notes, delete action
- Manual refresh button
- All data persisted via the RESTful Table API (`tables/biometric_entries`)

### 6. About section
Three feature highlight cards summarizing the value proposition (personalized hydration, AI-style insights, trend tracking).

### 7. Responsive, health-tech dark UI
- Custom dark theme (`#050b14` base) with cyan/violet gradient accents, glassmorphism cards, glowing radial backgrounds
- Space Grotesk (display) + Inter (body) fonts, Font Awesome icons
- Fully responsive — verified on desktop (1280px) and mobile (390px) viewports

---

## 🌐 Functional Entry Points

Single page app — all sections are on `index.html`, linked via in-page anchors:

| Path / Anchor | Description |
|---|---|
| `index.html` or `index.html#hero` | Landing hero + live snapshot |
| `index.html#entry-form` | Daily check-in form |
| `index.html#results` | Insights & recommendations (appears after first submission) |
| `index.html#history` | Trend charts + entry log table |
| `index.html#about` | Feature highlights |

### Data API (RESTful Table API)
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `tables/biometric_entries?sort=entry_date&limit=200` | Load all check-ins for stats/charts/table |
| `POST` | `tables/biometric_entries` | Save a new check-in (with computed score/hydration/recommendations) |
| `DELETE` | `tables/biometric_entries/{id}` | Remove an entry from the log |

---

## 🗄️ Data Model — `biometric_entries` table

| Field | Type | Notes |
|---|---|---|
| `id` | text | Auto-generated record ID |
| `entry_date` | datetime | Timestamp of the check-in |
| `weight` | number | kg, 40–200 |
| `activity_level` | number | 1–5 (Sedentary…Very Intense) |
| `caffeine_intake` | number | mg, 0–500 |
| `alcohol_intake` | number | units, 0–5 |
| `temperature` | number | °C ambient |
| `sleep_hours` | number | hours, 0–12 |
| `sleep_quality` | number | 1–5 |
| `heart_rate` | number | resting bpm |
| `stress_level` | number | 1–5 |
| `water_intake` | number | ml consumed so far that day |
| `mood` | text (enum) | Energized / Balanced / Tired / Foggy / Anxious / Low |
| `notes` | rich_text | free-form |
| `hydration_target` | number | computed ml/day target |
| `biometric_score` | number | computed 0–100 score |
| `recommendations` | rich_text | JSON string of the generated recommendation list |

Sample seed data (4 days) has been added to the **preview** data store so charts/table are populated for demo purposes. This is separate from the live production database — see note below.

---

## 🧩 Tech Stack
- HTML5 (semantic structure)
- Tailwind CSS (via CDN) + custom CSS (`css/style.css`) for the glassmorphism/dark theme
- Vanilla JavaScript (`js/main.js`) — no framework, all calculation & rendering logic client-side
- Chart.js 4 for gauges and trend line charts
- Font Awesome 6 for icons, Google Fonts (Space Grotesk + Inter)
- RESTful Table API for persistence

---

## 🚧 Not Yet Implemented / Possible Enhancements
- Real AI/LLM-generated narrative recommendations (currently a deterministic rule-based engine — this agent cannot call external LLM APIs from a static site)
- User accounts / multi-user login (would require server-side auth, outside static-site scope)
- Push/email reminders for hydration (would require a backend notification service)
- Data export (CSV/PDF) of the entry log
- Editing existing entries (currently create + delete only, no update UI)
- Weekly/monthly aggregate reports or streak tracking
- Integration with wearables (Apple Health, Fitbit, etc. — requires OAuth/backend, out of scope for a static site)

## 🔭 Recommended Next Steps
1. Add an "edit entry" flow (PUT to `tables/biometric_entries/{id}`) for correcting past check-ins
2. Add date-range filters to the history charts (7 days / 30 days / all time)
3. Add CSV export of the entry log for users who want to analyze data elsewhere
4. Consider adding a "streak" or "consistency" badge to encourage daily logging
5. If moving to production with real users, seed the **live hosted database** (via Hosted Deploy) — preview rows added here do not automatically appear on a hosted deployment; use the Publish flow and, if needed, ask to have production data seeded separately

---

## 🚀 Deployment
This is a static site ready to deploy. To make it live, use the **Publish tab** in the project — it will handle deployment automatically and provide a live URL.

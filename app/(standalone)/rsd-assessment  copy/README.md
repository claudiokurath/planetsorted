# RSD Reality Check

A static web app that helps people pause and reframe their reaction to a triggering
message before replying — especially useful for anyone prone to Rejection Sensitive
Dysphoria (RSD)-style over-reading of ambiguous or terse communication.

## Goal

Give managers, sales professionals, remote workers, educators, and customer-service
agents a fast (under 2 minutes), structured way to:
1. Get three neutral reinterpretations of a triggering message.
2. Get three ready-to-use reply scripts (neutral / warm / firm tone).
3. Get a personalized recommendation on how long to wait before replying.

## ✅ Currently completed features

- **Landing page** with hero, "how it works" (5-step) explainer, audience section,
  and sticky nav.
- **Assessment form** (`#assessment-form-section`):
  - Message / situation textarea (required)
  - Optional additional-context textarea
  - Intensity slider (1–10) with live label (Calm → Overwhelmed)
  - "Suggest a waiting period?" toggle
  - Client-side validation on the required message field
- **Instant rule-based reality-check engine** (`js/rsd-engine.js`, fully client-side,
  no external AI/API calls):
  - Keyword/pattern signal detection (short replies, "we need to talk", silence,
    exclusion, criticism, cancellations, all-caps/exclamation urgency, bare
    questions, missing greetings, strong emotion words) blended with generic
    always-true reframes to always produce **3 interpretations**.
  - Context-aware **3 reply scripts** (neutral / warm / firm), adapting to whether
    the message is a question, critical feedback, or a meeting request, and
    referencing user-supplied context when present.
  - **Wait-time recommendation** engine that scales suggested pause length with
    the 1–10 intensity rating (from "no wait needed" up to "24–48 hours + talk
    it through"), with a separate message path when the wait-suggestion toggle
    is off.
- **Results view** (`#results-section`): wait-recommendation card, 3 interpretation
  cards, tabbed tone switcher (Neutral/Warm/Firm) with copy-to-clipboard buttons,
  "Save to History" and "Start a New Check" actions.
- **Persistent history** (`#history-section`) backed by the RESTful Table API
  (table `assessments`): list of past assessments with intensity badge, date,
  and wait recommendation; click an item to view full detail in a modal; delete
  button per item.
- Responsive, accessible layout (Tailwind + custom CSS), Font Awesome icons,
  Google Fonts, toast notifications, no console errors.

## 🔗 Functional entry points

- `index.html` — single-page app; internal anchors:
  - `#hero`
  - `#how-it-works`
  - `#assessment-form-section` — the input form
  - `#results-section` — hidden until first submission, then shown in-place
  - `#history-section` — persisted assessment history
  - `#about-section` — RSD explainer + audience info
- **Table API** (relative, same-origin):
  - `GET tables/assessments?sort=-created_at&limit=50` — load history
  - `POST tables/assessments` — save a completed assessment
  - `DELETE tables/assessments/{id}` — remove a saved assessment

## 🗂 Data model — table `assessments`

| Field | Type | Description |
|---|---|---|
| id | text | Unique record id (system) |
| message | rich_text | The triggering message / situation as entered |
| context | rich_text | Optional extra context |
| intensity | number | 1–10 reaction intensity rating |
| suggest_wait | bool | Whether user wanted a wait-time suggestion |
| interpretations | array | The 3 generated reframe strings ("Title: text") |
| reply_neutral | rich_text | Neutral-tone reply script |
| reply_warm | rich_text | Warm-tone reply script |
| reply_firm | rich_text | Firm-tone reply script |
| wait_recommendation | text | Short headline, e.g. "Suggested wait: 24 hours" |
| wait_detail | rich_text | Full explanation of the wait recommendation |
| title | text | Short snippet used in the history list |

Data lives in the preview Table API store while editing here. On a Hosted Deploy,
the deployed site gets its own live D1 database seeded from this schema — the two
never sync automatically.

## 🚧 Not yet implemented

- User accounts / multi-user separation (history is currently global to the
  deployed site, not per-visitor).
- Editing an existing saved assessment (currently create + delete only).
- Export/share of a reality check (e.g. PDF or shareable link).
- Deeper NLP/sentiment analysis — current engine is deterministic keyword-based,
  not a true language model, by design (this is a static site with no
  authorization-free LLM API available to call).
- Search/filter within history (by intensity, date range, keyword).

## 🔮 Recommended next steps

1. Add simple client-side history filters (by intensity range, date, keyword).
2. Add an "edit & re-save" flow for saved assessments.
3. Consider adding a lightweight local tagging system (e.g. "work", "personal")
   stored as an extra field.
4. If genuine AI-generated interpretations/scripts are desired later, that would
   require a user-supplied, CORS-enabled, authorization-free API endpoint (per
   this project's static-site constraints) — happy to wire that in if provided.

## 📌 Notes

- This tool provides general communication-reframing guidance only — it is
  explicitly **not** medical, psychological, or legal advice, and does not
  diagnose RSD or any condition (stated in the footer and About section).
- All logic runs in the browser; no server-side processing is used, consistent
  with this being a static website.

# Handoff: Doom Box Decoder — SOR7ED

## Overview

Doom Box Decoder is the second tool in the SOR7ED Toolkit — a **sibling** of Life Admin Inbox that solves a very specific neurodivergent / burnt-out-brain failure mode: **panic-tidying things into a random box, then losing them permanently because "out of sight = ceases to exist".**

The user snaps a photo, dictates a rapid list, or types the contents. The app gives them:
1. A **printable label** (big number + QR-style glyph + human summary) they tape to the outside of the box.
2. A **searchable memory** — six months later, they search "spare phone charger" and get "Box 04, spare room, packed March".

The audience is the same as Life Admin Inbox: neurodivergent / overwhelmed users who need executive-function scaffolding, not another to-do app. The value prop is **stop replacing things you already own** and **stop feeling stupid about panic-tidying**.

Three input modes because the "fastest capture in the moment" varies:
- **Photo** — snap the open box before you close it, edit the auto-listed contents.
- **Voice** — dictate hands-free while you're actively packing.
- **Type** — for anyone who just wants a plain list.

All three funnel into the same review-and-seal flow.

## About the Design Files

`index.html` is a **complete, working single-file HTML prototype** — zero dependencies, zero build step. Open it in Chrome/Safari/Edge and every screen works end-to-end, including the demo dataset (5 realistic boxes) via the "See a demo" button.

Treat it as a **design reference**, not shipping code. The search scoring, contents parser, and label generator are all in the file and should be **ported verbatim** — the heuristics have been tuned. The DOM/CSS layer should be **re-implemented in the target codebase's component library** (React + Tailwind is a natural fit; the CSS variable set drops straight into `:root` or `tailwind.config.js`).

If no environment exists yet, recommended stack: **Next.js 14 (App Router) + TypeScript + Tailwind**, mirroring the state machine in the prototype's `state` object — identical to Life Admin Inbox for consistency.

## Fidelity

**High-fidelity, fully-interactive prototype.** Every screen, transition, empty state, gated-feature overlay, capture mode, search behaviour, and print layout is final. Copy is final. Colours, spacing, radii, motion are final.

The developer should recreate the UI **pixel-faithfully** using the codebase's existing patterns and lift the client-side logic modules (search scoring, contents parsing, label generation) into a `lib/` directory as pure functions.

## Screens / Views

Screen switcher: `showScreen(id)` toggles `.active` on `<div class="screen">`. Nav buttons show/hide based on screen + `isPaid` + whether the user has any boxes yet. In production these map to real routes.

### 1. `#landing` — Landing / pricing
- Sticky top nav (`Doom Box Decoder` brand + `part of SOR7ED` mark + Free counter chip + Demo / Upgrade / New box buttons).
- Hero: teal pill "✦ Never lose a spare charger again", H1 "Photograph a box. **Find what's in it, months later.**", supporting paragraph, two CTAs (teal primary "Log a box →", ghost "See a demo").
- **How-it-works strip** (3 numbered steps) — new to Doom Box, doesn't exist in Life Admin Inbox. Sets expectation before the feature grid.
- 6-card feature grid (`repeat(auto-fit, minmax(240px, 1fr))`): Snap it / Say it / Type it / Printable labels / Instant search / Never buy twice.
- Pricing: 2-card grid (max-width 620px). Free (£0 / forever, **3 boxes** unlocked + advanced features locked) vs Premium (**£4 / month**, unlimited boxes + label sheets + export + photo attachments).
- **Route mapping:** `/`.

### 2. `#capture` — Add a new box
- Segmented control at top: **📸 Photo** (default) / **🎙️ Voice** / **⌨️ Type**.
- **Photo mode:** click/drag dropzone using native `<input type="file" accept="image/*" capture="environment">`. Reads via FileReader → data URL preview. Seeds an initial contents list from filename heuristics (very light — user's expected to edit).
- **Voice mode:** uses `window.SpeechRecognition || window.webkitSpeechRecognition`. Continuous, interim results, `en-GB`. Splits transcript on commas / periods / "and" into individual items and dedupes. Graceful fallback banner for unsupported browsers (Firefox, older Safari) directing them to Photo or Type. Mic button pulses red while recording.
- **Type mode:** freeform textarea. Parser splits on newlines OR commas, capitalises the first letter, and reconciles bidirectionally with the chips row (removing a chip strips it from the textarea).
- **Contents review** (below all three modes): editable chip list with a "+ Add another item" row. This is the source of truth — all three modes write to it.
- **Box meta grid:** room (with datalist suggestions), auto-filled short summary (users can override; the app respects manual edits via a `data-manual` flag).
- **Footer:** "Box 07 · packed today" + Cancel / **Seal this box →** (teal primary, disabled with 0 items).
- **Free-tier gate:** trying to seal box #4 opens the upgrade modal instead.
- **Route mapping:** `/box/new`.

### 3. `#box-saved` — Post-seal confirmation
- Big tick, "Sealed. You'll never lose it now.", the rendered label (white card on dark bg, ready to print), three actions (Print this label / + Log another box / 🔎 Search my boxes).
- Print uses a scoped `@media print` style block injected on the fly so only the label prints, not the app chrome.
- **Route mapping:** `/box/:id/saved`.

### 4. `#search` — The killer feature
- Big search input with a magnifier icon. Autofocuses on entry.
- Live results (`oninput="runSearch()"`), grouped as a list of result cards. Each card shows the box number tag, human summary, room, all items as chips (matching items highlighted teal), packed date, item count.
- Empty states are content-aware: no boxes yet vs no query vs no matches for query.
- **Route mapping:** `/search`.

### 5. `#boxes` — All boxes grid
- Header with Print all labels / Export manifest buttons (both paid).
- Grid of box cards, sorted newest → oldest. Each card: big teal number, room, summary, item count + packed date.
- Click a card → box detail.
- **Route mapping:** `/boxes`.

### 6. `#box-detail` — Single-box view
- 2-column: photo (if paid + captured) + label preview on the left, box metadata + contents list + actions on the right.
- Actions: Print label / Delete box (opens confirm modal).
- **Route mapping:** `/boxes/:id`.

### 7. `#print-sheet` — A4 label sheet *(paid)*
- Toolbar (Print / Back). Renders every box as a 2-col grid on a white A4-sized sheet. `@media print` strips app chrome and prints on white.
- Uses `page-break-inside: avoid` on each label to keep them intact across pages.
- **Route mapping:** `/boxes/print`.

### 8. `#upgrade-modal` — Upgrade modal
- Dimmed overlay + centred card. Restates the paid feature list. Teal "Upgrade for £4 / month" primary, close button. In the prototype, "Upgrade" flips `state.isPaid = true` and persists — production wires this to a Stripe checkout session.
- Triggered from: the nav Upgrade button, hitting the 3-box free limit on seal, opening `#print-sheet` while free, clicking Export while free.

### 9. `#confirm-modal` — Delete confirmation
- Dedicated confirm dialog (the destructive action deserves it). "Delete this box? This removes it from your search. The physical box is your problem." — voice is intentionally dry, not preachy.

## Interactions & Behavior

- **Client-side state:** single `state` object:
  ```js
  {
    isPaid: false,
    currentScreen: 'landing',
    boxes: [],
    nextNumber: 1,
    draft: { mode: 'photo', contents: [], photoDataUrl: null, room: '', summary: '' },
    query: '',
    selectedBoxId: null,
    pendingDeleteId: null,
  }
  ```
- **Persistence:** localStorage key `sor7ed.doombox.v1`. Boxes, `nextNumber`, and `isPaid` all persist. Refresh doesn't lose anything.
- **Navigation:** `showScreen(id)` toggles `.active` on `.screen`. Nav buttons show/hide based on `id`, `isPaid`, and `state.boxes.length > 0`.
- **Capture modes are unified downstream:** all three modes write to `state.draft.contents`, which is a plain string array. This is the source of truth — the chip row and (for type mode) the textarea are reflections.
- **Voice recognition:** continuous mode with interim results. Splits transcript on `[,.]` OR `\band\b` (word boundary) into items. Auto-restarts if the browser stops it prematurely (Chrome does this every ~60s). Errors surface as toasts.
- **Photo → contents seeding:** very light filename heuristic (`cable`, `winter`, `christmas`, `tax`, etc.). Deliberately conservative — pushes one plausible item so the user has something to edit rather than a blank chip row. Real product could layer on a vision model here; the shell is agnostic.
- **Search scoring:** `scoreMatch(query, box)` — pure function, port verbatim. Combines:
  - Item exact match (100) / substring (60) / all query tokens present (45) / any token (20 per hit).
  - Levenshtein-adjacent match on tokens ≥ 4 chars (+10).
  - Summary exact (25) / substring (25) / token hits (+8 each).
  - Room exact (30) / substring (15) / token hits (+5 each).
  - Box number literal (`"7"`, `"07"`, `"box 7"`) (+80).
  Returns `{ score, hits: string[] }` so the results view can highlight matching item chips.
- **Auto-summary:** if the user hasn't manually edited the summary field, it auto-fills as items are added — `"item1 + item2"`, or `"item1 + item2 + N more"`. Tracked via `dataset.manual = 'true'` on first user input.
- **Label QR:** the "QR code" is a deterministic 8×8 SVG glyph seeded by the box number — visual marker only, not scannable. **Production must swap this for a real QR library** (e.g. `qrcode.js`) encoding a deep link like `sor7ed.app/box/:id` that opens the contents page on any phone.
- **Print isolation:** `printSingleLabel()` injects a scoped `@media print` block hiding everything except `#box-saved`'s label wrapper, then calls `window.print()`, then removes the injected style. This avoids leaking print styles into other pages.
- **Motion:** subtle `.fade-in` on saved-header, 200ms border-colour hover on cards/inputs, mic pulse animation while recording, 150ms button hover. No score-count-up or celebration animations — keep the tone calm.
- **Escape closes modals.** Enter in the add-chip input adds it. Standard keyboard.

## State Management

Runtime shape:
```typescript
type State = {
  isPaid: boolean;
  currentScreen: 'landing' | 'capture' | 'box-saved' | 'search' | 'boxes' | 'box-detail' | 'print-sheet';
  boxes: Box[];
  nextNumber: number;
  draft: {
    mode: 'photo' | 'voice' | 'type';
    contents: string[];
    photoDataUrl: string | null;
    room: string;
    summary: string;
  };
  query: string;
  selectedBoxId: string | null;
  pendingDeleteId: string | null;
};

type Box = {
  id: string;
  number: number;        // human-facing, monotonically increasing
  room: string;
  summary: string;
  contents: string[];
  photoDataUrl: string | null;  // paid-only; free tier discards
  createdAt: string;     // ISO
  updatedAt?: string;    // production only
};
```

- All computed fields (label preview HTML, search scores) are re-derived on render — memoize with `useMemo` in production.
- Free-tier discards `photoDataUrl` on save. This is a design choice (photo storage is the biggest cost driver; it's the honest upgrade lever) — remove that line if the pricing model changes.

## Design Tokens

Same base as Life Admin Inbox — only the accent swaps.

```css
:root {
  --bg:     #0a0a0b;    /* page */
  --bg2:    #111114;    /* inputs, subtle surfaces */
  --bg3:    #16161a;    /* cards */
  --bg4:    #1e1e24;    /* elevated / hover rows */
  --border: #2a2a35;

  --text:  #f0f0f5;
  --muted: #9090a8;
  --dim:   #5a5a70;

  /* Doom Box accent — teal (Life Admin Inbox uses yellow) */
  --accent:        #5eead4;
  --accentbg:      rgba(94,234,212,.12);
  --accentborder:  rgba(94,234,212,.3);
  --accent-hover:  #7cf5e0;

  /* Semantic colours — identical across the SOR7ED toolkit */
  --yellow: #f5c518;  --yellowbg: rgba(245,197,24,.12);
  --green:  #22c55e;  --greenbg:  rgba(34,197,94,.12);
  --orange: #f97316;  --orangebg: rgba(249,115,22,.12);
  --red:    #ef4444;  --redbg:    rgba(239,68,68,.12);

  --radius:    16px;
  --radius-sm: 10px;
}
```

**Semantic colour discipline:** teal is CTA-only in this tool. Green/orange/red are status-only. Yellow is *not* used here — keeps Doom Box visually distinct from Life Admin Inbox even when they sit side-by-side in the toolkit.

### Typography
- System stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`. Body 15px / 1.6. Identical to Life Admin Inbox.
- Display: `clamp(32px, 6vw, 60px)` / 900 / -1.5px tracking / 1.1 line-height.
- H2: 24-28px / 800.
- Chip / eyebrow / label: 10-12px, uppercase, 0.5-1px tracking, weight 700.
- Label numbers (on printable labels): 44px / 900 / -1px tracking.

### Spacing
8px scale. Card interiors 18-28px. Container widths: `960px` (main dashboard/boxes), `680px` (capture, search — narrower for focus).

### Radii
- Small: `10px` (inputs, small buttons, chips)
- Default: `16px` (cards, textarea, feature cards)
- Pills: `100px`

## Free vs Paid Enforcement

| Feature | Free | Paid (£4 / mo) |
|---|---|---|
| Log a box | Up to 3 | Unlimited |
| Photo / voice / type capture | ✅ | ✅ |
| Contents chips + edit | ✅ | ✅ |
| Printable label (single) | ✅ | ✅ |
| Instant search | ✅ | ✅ |
| Saved boxes across sessions | ✅ | ✅ |
| Photo attachments stored | 🔒 | ✅ |
| Print full label sheet (A4 8-up) | 🔒 | ✅ |
| Export manifest (CSV / JSON) | 🔒 | ✅ |
| Room grouping / filters | 🔒 | ✅ |
| Priority support | 🔒 | ✅ |

Gate points in code:
- `sealBox()` — blocks if free & `boxes.length >= FREE_LIMIT`.
- `showScreen('print-sheet')` — opens upgrade modal if free.
- `exportManifest()` — opens upgrade modal if free.
- `sealBox()` — discards `photoDataUrl` if free (photo capture works, but doesn't persist).

`FREE_LIMIT` is a constant at the top of the script — change once, applies everywhere.

## Files

| File | Purpose |
|---|---|
| `index.html` | The complete working single-file prototype. Includes CSS variables, layout, all 8 screens, JS state machine, three capture modes (photo/voice/type), contents parser, search scoring engine, label generator (with SVG QR placeholder), print sheet, upgrade modal, delete confirmation, localStorage persistence, and demo data loader. **Open it directly** — click "See a demo" to see 5 pre-loaded boxes and try search. |
| `README.md` (this file) | Developer-oriented handoff summary. |

## Recommended Implementation Notes

- **Stack:** Next.js 14 + TypeScript + Tailwind — same as Life Admin Inbox for consistency across the toolkit. Map the `showScreen` state machine to real routes.
- **Extract logic first:** move `scoreMatch`, `levDistance`, filename heuristic, voice-transcript splitter, and label builder into `lib/doombox.ts` and unit-test them. These are the product — the UI is replaceable, the tuning is not.
- **Real QR codes:** swap `buildQrPlaceholder(seed)` for a proper QR library (`qrcode.js`, `qr-code-styling`, or server-side generation). Encode a URL like `https://sor7ed.app/b/:id` so scanning it opens the contents page on any phone. This is the single biggest production upgrade from the prototype.
- **Persistence path:** the localStorage key is `sor7ed.doombox.v1` — keep it stable across releases and migrate with a `v2` key + a one-time migration on load. Photo data URLs balloon storage fast (a 5MP photo is ~2-4 MB base64) — move to object storage (S3 / R2) as soon as auth is wired.
- **Voice fallback:** the current fallback is a banner. Consider a "record → upload → server-side transcription (Whisper)" path for Firefox / older Safari to keep parity. Not blocking.
- **Photo → contents seeding:** the filename heuristic is a placeholder. Production should layer a vision model (GPT-4V / Gemini / Claude Vision) that receives the photo and returns a JSON array of likely items. Fall back to the filename heuristic when the model is unavailable or slow.
- **Payments:** the prototype's `state.isPaid = true` hook is where Stripe checkout lands. Use `checkout.session.completed` + a `plan` field on the users table. **If a user is subscribed to Life Admin Inbox already, treat them as paid here too** — one SOR7ED membership covers the whole toolkit (matches the pricing narrative).
- **Accessibility:**
  - Contrast: `#9090a8` on `#0a0a0b` is ~5.2:1 (AA body). Verify `--dim` on card backgrounds.
  - Segmented tabs need `role="tablist"` + `role="tab"` + `aria-selected`.
  - Modal needs focus trap + Escape to close (Escape wired; focus trap TBD).
  - Search input already autofocuses on screen entry.
  - Mic button needs `aria-pressed` reflecting recording state.
  - Photo dropzone needs a keyboard equivalent (currently click / drag only).
- **Copy:** do not rewrite. The tone ("You're not disorganised. The box just needs a memory.", "The physical box is your problem.", "Nobody is grading this.") is a product choice — validating and gently funny, never gamified, never preachy.
- **Motion:** keep restrained. The mic pulse is the only celebratory motion; anything more (confetti when a box is sealed, streaks, badges) breaks the tone.
- **Print:** already handled via `@media print`. Retest single-label print + full-sheet print after re-implementing to confirm nav / disclaimer / modal are `display: none` in print.

## Relationship to Life Admin Inbox

Same brand family (SOR7ED), same voice, same base tokens, same free/paid pattern, same shell architecture (single-file state machine → screens with `.active` toggle).

Differences by design:
- **Accent = teal, not yellow.** Yellow stays reserved for Life Admin Inbox so both tools can sit on the SOR7ED marketing site without visual collision.
- **Different domain logic.** Life Admin Inbox has scoring / bucketing / scripts. Doom Box has three capture modes / contents chips / fuzzy search / printable labels.
- **How-it-works strip on landing.** Doom Box has one extra "1-2-3" strip because the value prop needs unpacking (people don't intuitively know what "box decoder" means until they see it).
- **Free tier is a hard box count**, not a bucket-visibility gate. Simpler mental model for this product.

When rebuilding in production, the shared bits — nav shell, toast, upgrade modal, disclaimer bar, `.btn`/`.card`/`.plan-card` classes, the printable-doc pattern, localStorage helpers, `.hero`+`.features-grid`+`.pricing-grid` layouts — should all live in a shared `sor7ed-ui` package. Each tool ships its own accent + domain logic on top.

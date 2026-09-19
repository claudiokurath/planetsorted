# Handoff: Guilt-Free Boundary Builder — SOR7ED

## Overview

Guilt-Free Boundary Builder is the third tool in the SOR7ED Toolkit — a sibling of Life Admin Inbox and Doom Box Decoder that solves a very specific, very common failure mode: **spending three days drafting a message to cancel plans / decline an expensive invite / turn down extra work, then over-explaining, then apologising for over-explaining, then not sending anything at all.**

The user types the situation as messily as it lives in their head. The app returns:
1. **Three tone variants** (Softer / Neutral / Firmer), side by side, ready to copy.
2. A **"No explanation" version** for when a full sentence is already too much.
3. **Anticipated pushback** — what the recipient will probably say — with ready replies.
4. Optional **saved library** so the same request from the same person becomes a two-tap reply next time.

Audience is the same as the rest of the toolkit: neurodivergent / burnt-out / people-pleasing users who need executive-function scaffolding around the *decision to say the thing*, not another to-do app. The value prop is **you don't have to spend all week on this**.

Freeform situation input (matches product spec — no scenario selector; the app detects intent from what the user typed).

## About the Design Files

`index.html` is a **complete, working single-file HTML prototype** — zero dependencies, zero build step. Open it in Chrome/Safari/Edge and every screen works end-to-end, including the demo generator via the "See an example" button.

Treat it as a **design reference**, not shipping code. The intent-detection regex catalogue, tone-template library, pushback library, greeting/sign-off matrix, and placeholder filler are all in the file and should be **ported verbatim** — the heuristics have been tuned around real speech patterns.

The DOM/CSS layer should be **re-implemented in the target codebase's component library** (React + Tailwind is a natural fit; the CSS variable set drops straight into `:root` or `tailwind.config.js`).

**Production note:** the prototype's draft generator is a template engine (deterministic, works offline, no LLM required). In production, the recommended path is:
- Keep the template engine as a **fallback**.
- Route the primary path through `window.genspark.complete()` (or an equivalent LLM call) with a structured prompt that includes: `situation`, `intent` (from `detectIntent`), `relationship`, `channel`, `theirName`, `yourName`, and the requested tone.
- Return the LLM's output through the same three-card + pushback UI. The template output IS the spec for what "good" looks like — use it as a few-shot example in the prompt.

## Fidelity

**High-fidelity, fully-interactive prototype.** Every screen, empty state, tone card, gated overlay, and print layout is final. Copy is final. Colours, spacing, radii, motion are final.

The developer should recreate the UI **pixel-faithfully** using the codebase's existing patterns and lift the client-side logic modules (intent detection, tone templates, greeting matrix, pushback library) into a `lib/` directory as pure functions.

## Screens / Views

Screen switcher: `showScreen(id)` toggles `.active` on `<div class="screen">`. Four screens.

### 1. `#landing` — Landing / pricing
- Sticky top nav (`Boundary Builder` brand + `part of SOR7ED` mark + free counter chip + Saved / Demo / Upgrade / New buttons).
- Hero: rose pill "✦ Say no without the three-paragraph apology", H1 "The message you've been drafting for two days. **Written for you in ten seconds.**", supporting paragraph, two CTAs (rose primary "Write a boundary →", ghost "See an example").
- **Promise strip** — three cards ("No guilt spirals / No over-explaining / No hours of drafting") that state the negative-space value prop up front. This is the emotional hook the tool is really selling.
- 6-card feature grid: Three tones per message / Every channel covered / Anticipated pushback / The "no explanation" version / Saved for reruns / Print or copy.
- Pricing: 2-card grid (max-width 620px). Free (£0 / forever, **3 drafts/day** + Neutral tone only + email/text) vs Premium (**£4/month**, unlimited + all three tones + verbal script + no-explanation version + pushback + saved library).
- **Route mapping:** `/`.

### 2. `#compose` — Situation input
- **Situation textarea** (min-height 160px, auto-counts chars, disables generate button below 15 chars). Placeholder shows a realistic freeform example.
- Below: two-column segmented pickers for **Who is this for?** (Family / Friend / Partner / Colleague / Boss / Client / Acquaintance) and **How are you sending it?** (📧 Email / 💬 Text / 🗣️ Verbal). Rose active state.
- Optional **name inputs**: Their name / Your name (used to personalise greetings + sign-offs; both optional).
- **Example chips** — 8 pre-canned scenarios (Expensive invite / Cancel plans / Extra work / Family obligation / Lend money / Unpaid favour / Reduce contact / Guilt-tripping reply). Clicking one fills the whole form.
- Footer: Cancel / **Write my drafts →** (rose primary, disabled with empty situation).
- **Free-tier gate:** clicking generate after 3 drafts today opens the upgrade modal instead.
- **Route mapping:** `/compose`.

### 3. `#results` — The output (the product core)
Rendered by `renderResults()` in this order:
1. **Reassurance card** — one line, intent-specific, rose-toned. E.g. for `expensive_invite`: *"You're not being cheap. You're being **honest about what you can afford**."* This is the tool's emotional signature — do not remove.
2. **Situation echo** — a compact card showing the situation the user typed, plus intent chip, relationship chip, channel chip, and the recipient name if provided. Confirms the app understood correctly.
3. **Three tone cards** side-by-side (stack on mobile): Softer (purple top border) / Neutral (blue top border) / Firmer (rose top border). Each shows:
   - Tone pill (colour-coded)
   - Word count
   - One-line description of that tone's stance
   - The draft body in a preformatted block
   - **Copy** (rose primary) + **Regenerate** (ghost) actions
   - Free users see Neutral unlocked; Softer + Firmer show a locked overlay with an Unlock CTA.
4. **"No explanation" version** *(paid)* — the shortest possible reply for that channel. Free tier sees a locked gate card.
5. **Anticipated pushback + replies** *(paid)* — 2-3 quote/reply pairs specific to the detected intent. E.g. for `lend_money`: *"I'll pay you back this time I promise."* → *You: "I believe you. I'm still not going to lend it."* Free tier sees a locked gate card.
- Header actions: New boundary / Save / Print. Print CSS renders a clean white version of the drafts + pushback.
- **Route mapping:** `/b/:id`.

### 4. `#library` — Saved boundaries *(paid)*
- Grid of saved-boundary cards (rows of 300px min-width). Each card: intent label + relationship, situation preview (~110 chars), channel + recipient, save date.
- Click a card → re-opens it in the results view (same layout, no regeneration cost).
- Empty state: friendly encouragement to save the first one.
- **Route mapping:** `/saved`.

### 5. Modals
- `#upgrade-modal` — matches Life Admin Inbox and Doom Box exactly (dimmed overlay, 480px centered card, feature list, £4/month CTA, "Demo mode" footer note). Triggered from: nav Upgrade button, hitting the daily draft cap, clicking a locked tone/section, opening `#library` while free, clicking Save while free.
- `#confirm-modal` — delete confirmation for saved-library entries. Voice: dry, no drama.

## Interactions & Behavior

- **Client-side state:** single `state` object:
  ```js
  {
    isPaid: false,
    currentScreen: 'landing',
    saved: [],                // Boundary[]
    dailyCount: 0,            // free-tier daily counter
    dailyDate: null,          // 'YYYY-MM-DD' — resets counter when day changes
    current: null,            // last generated Boundary
    pendingDeleteId: null,
  }
  ```
- **Persistence:** localStorage key `sor7ed.boundary.v1`. `isPaid`, `saved[]`, `dailyCount`, `dailyDate` all persist. Refresh doesn't lose anything. Daily counter auto-resets when `dailyDate !== today` on load.
- **Intent detection (`detectIntent`, port verbatim):** regex catalogue matched against the lowercased situation text. Order matters — first match wins. Falls back to `generic_decline`.
- **Reason inference (`inferReason`, port verbatim):** detects `financial | capacity | preference | wellbeing | unspecified` — used by the LLM prompt in production to steer the softer/neutral/firmer language.
- **Greeting + sign-off matrix:** `greeting(relationship, channel, name)` + `signoff(relationship, channel, yourName)`. Handles the difference between "Hi Alex," (email to boss) vs "Hey Priya," (text to friend) vs no greeting (verbal script). Emails to work relationships get "Best, [name]"; personal emails get "Love, [name]"; texts sign off with "x [name]"; verbal scripts have neither.
- **Placeholder filler (`fillPlaceholders`):** replaces `{event}`, `{day}`, `{alt}`, `{current}` in templates with heuristic best-guesses drawn from the situation text ("hen do" → "the hen do", "Saturday" → "Saturday", "two projects" → "two projects"). Templates always ship with sensible generic fallbacks so nothing renders as `{event}`.
- **Regenerate:** in the prototype, applies a small phrase-swap variant (one of 2-3 per tone). In production, re-calls the LLM with a "vary the wording, same meaning" instruction. Regenerate on a locked tone opens the upgrade modal.
- **Copy:** `navigator.clipboard.writeText` with a "✓ Copied" button flash + toast confirm. Falls back to a toast telling the user to select the text manually if the clipboard API is blocked.
- **Save:** paid-only. Dedupes by generated boundary ID (each generation gets a fresh ID; re-saving the same boundary is a no-op with a "Already saved" toast).
- **Demo:** loads the "expensive invite" example, temporarily flips `isPaid` for the render so the user sees the full Premium result (all three tones + pushback + no-explanation), then restores their real paid state. Purely for the marketing-side moment.
- **Motion:** subtle `.fade-in` on reassurance card, 200ms border-colour hover on cards/inputs, 150ms button hover. No celebrations, no confetti — this tool is emotional territory, keep the tone dignified.
- **Escape closes modals.** Enter in the situation textarea inserts a newline (no submit-on-enter — this is long-form input).

## State Management

Runtime shape:
```typescript
type State = {
  isPaid: boolean;
  currentScreen: 'landing' | 'compose' | 'results' | 'library';
  saved: Boundary[];
  dailyCount: number;
  dailyDate: string | null;      // 'YYYY-MM-DD'
  current: Boundary | null;
  pendingDeleteId: string | null;
};

type Relationship = 'family' | 'friend' | 'partner' | 'colleague' | 'boss' | 'client' | 'acquaintance';
type Channel = 'email' | 'text' | 'verbal';
type Tone = 'softer' | 'neutral' | 'firmer';
type Intent =
  | 'expensive_invite' | 'cancel_plans' | 'extra_work' | 'family_obligation'
  | 'lend_money' | 'unpaid_labour' | 'reduce_contact' | 'guilt_trip'
  | 'end_relationship' | 'generic_decline';

type Boundary = {
  id: string;
  ctx: {
    situation: string;
    relationship: Relationship;
    channel: Channel;
    theirName: string;
    yourName: string;
    intent: Intent;
    reason: 'financial' | 'capacity' | 'preference' | 'wellbeing' | 'unspecified';
  };
  intent: Intent;
  drafts: { softer: string; neutral: string; firmer: string; noExplain: string };
  pushback: { q: string; a: string }[];
  createdAt: string;   // ISO
};
```

- All derived render output is re-computed from `state.current` on every render — memoize with `useMemo` in production.
- `saveState()` writes the full state to localStorage after every mutation that matters.

## Design Tokens

Same base as Life Admin Inbox and Doom Box Decoder — only the accent swaps. The toolkit's three tools together use yellow (Life Admin), teal (Doom Box), and now **rose** (Boundary Builder) so they read as distinct-but-related on the SOR7ED marketing site.

```css
:root {
  --bg:     #0a0a0b;
  --bg2:    #111114;
  --bg3:    #16161a;
  --bg4:    #1e1e24;
  --border: #2a2a35;

  --text:  #f0f0f5;
  --muted: #9090a8;
  --dim:   #5a5a70;

  /* Boundary Builder accent — rose */
  --accent:       #fb7185;
  --accentbg:     rgba(251,113,133,.12);
  --accentborder: rgba(251,113,133,.3);
  --accent-hover: #fda4af;

  /* Tone-slot colours (three variants — designed to work with the rose accent) */
  --softer:   #a78bfa;  --softerbg:  rgba(167,139,250,.10);
  --neutral:  #60a5fa;  --neutralbg: rgba(96,165,250,.10);
  --firmer:   #fb7185;  --firmerbg:  rgba(251,113,133,.10);

  /* Semantic colours — identical across the SOR7ED toolkit */
  --yellow: #f5c518;  --yellowbg: rgba(245,197,24,.12);
  --green:  #22c55e;  --greenbg:  rgba(34,197,94,.12);
  --orange: #f97316;  --orangebg: rgba(249,115,22,.12);
  --red:    #ef4444;  --redbg:    rgba(239,68,68,.12);

  --radius:    16px;
  --radius-sm: 10px;
}
```

**Semantic colour discipline:**
- **Rose** = CTA / accent / firmer-tone signal (they overlap intentionally — firmer *is* the CTA-tone).
- **Purple** = softer tone (only).
- **Blue** = neutral tone (only).
- **Green/orange/red** = status only (unused in most of this tool).

### Typography
Identical to Life Admin Inbox / Doom Box.
- System stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`. Body 15px / 1.6.
- Display: `clamp(32px, 6vw, 60px)` / 900 / -1.5px tracking / 1.1 line-height.
- H2: 22-28px / 800.
- Chip / eyebrow / label: 10-12px, uppercase, 0.5-1px tracking, weight 700.
- Draft body: 13.5px / 1.7 — slightly larger than metadata so the actual message reads comfortably.

### Spacing
8px scale. Card interiors 18-28px. Container widths: `960px` (main / library), `720px` (compose — wider than Doom Box's 680px because the segmented pickers need breathing room).

### Radii
- Small: `10px` (inputs, small buttons, chips)
- Default: `16px` (cards, textarea, feature cards)
- Pills: `100px`

## Free vs Paid Enforcement

| Feature | Free | Paid (£4 / mo) |
|---|---|---|
| Boundary drafts | 3 per day | Unlimited |
| Neutral tone | ✅ | ✅ |
| Softer tone | 🔒 | ✅ |
| Firmer tone | 🔒 | ✅ |
| "No explanation" version | 🔒 | ✅ |
| Anticipated pushback + replies | 🔒 | ✅ |
| Email + text channels | ✅ | ✅ |
| Verbal script channel | ✅ (with neutral only) | ✅ |
| Copy to clipboard | ✅ | ✅ |
| Save to library | 🔒 | ✅ |
| Access saved library across sessions | 🔒 | ✅ |
| Print & export | ✅ (single draft) | ✅ (full result) |

Gate points in code:
- `generateDrafts()` — opens upgrade modal if free and `dailyCount >= FREE_DAILY_LIMIT`.
- Draft grid render — softer/firmer cards get `.locked` overlay if free.
- `buildNoExplanation()` — renders a gate card if free.
- `buildPushback()` — renders a gate card if free.
- `regenerateTone()` — opens upgrade modal if regenerating a locked tone.
- `saveDraft()` — opens upgrade modal if free.
- `showScreen('library')` — opens upgrade modal if free (returns immediately).

`FREE_DAILY_LIMIT` is a constant at the top of the script.

## Files

| File | Purpose |
|---|---|
| `index.html` | The complete working single-file prototype. Includes CSS variables, layout, all 4 screens, JS state machine, intent detection catalogue, tone template library, greeting/sign-off matrix, placeholder filler, pushback library, copy/save/regenerate actions, localStorage persistence, and demo loader. **Open it directly** — click "See an example" to see the full Premium result populated. |
| `README.md` (this file) | Developer-oriented handoff summary. |

## Recommended Implementation Notes

- **Stack:** Next.js 14 + TypeScript + Tailwind — same as the rest of the toolkit. Map the `showScreen` state machine to real routes.
- **LLM-first, templates as fallback:** the real production flow is `situation → detectIntent → LLM call with structured prompt → three drafts + pushback JSON`. Ship the template engine as the offline/fallback path (also useful for E2E tests and cost containment). Use the template outputs as few-shot examples in the prompt to keep tone consistent with the spec.
- **Extract logic first:** move `detectIntent`, `inferReason`, `greeting`, `signoff`, `fillPlaceholders`, `TEMPLATES`, `NO_EXPLANATION`, `PUSHBACK`, `INTENT_LABELS` into `lib/boundary.ts` and unit-test them. These are the product — the UI is replaceable, the tuning is not.
- **Persistence:** the localStorage key is `sor7ed.boundary.v1` — keep stable and migrate with a `v2` key + one-time migration on load. Move `saved[]` to server-side storage as soon as auth is wired (users will expect to access their saved library across devices).
- **Payments:** `state.isPaid = true` is where Stripe checkout lands. **If a user is subscribed to Life Admin Inbox or Doom Box Decoder already, treat them as paid here too** — one SOR7ED membership covers the whole toolkit.
- **Accessibility:**
  - Contrast: verify `#9090a8` on `#0a0a0b` (5.2:1, AA body) and rose-on-dark for the accent.
  - Segmented pickers need `role="radiogroup"` + `role="radio"` + `aria-checked`.
  - Textarea needs `aria-describedby` linking to the character counter.
  - Modal needs focus trap + Escape to close (Escape wired; focus trap TBD).
  - Copy buttons need `aria-live="polite"` announcement on success.
  - Locked overlays need to be keyboard-reachable (currently only the "Unlock" button inside is; the overlay itself is not focusable).
- **Copy:** do not rewrite. This tool has more emotional labour in its copy than the other two — every reassurance line and every template body was tuned. "You're not being cheap. You're being honest about what you can afford." is doing work; if you soften it further, the tool loses its edge.
- **Motion:** keep restrained. The `.fade-in` on reassurance is the only celebratory motion; anything more (confetti when a boundary is sent, streaks, "you were assertive today!" badges) breaks the tone. This is emotional territory — dignified is the north star.
- **Print:** already handled via `@media print`. Retest after re-implementing to make sure nav / disclaimer / modal / actions / regenerate bar are `display: none` in print.
- **Content warnings:** the disclaimer bar already flags this — "Boundary Builder helps you find the words. It does not replace therapy or professional advice for high-risk situations." — keep it. Consider adding a soft interstitial if the situation text contains flagged terms (abuse, harm, self-harm, safety) that routes the user to appropriate resources instead of a template.

## Relationship to Life Admin Inbox and Doom Box Decoder

Same brand family (SOR7ED), same voice, same base tokens, same free/paid pattern, same shell architecture.

**Accent map across the toolkit:**
| Tool | Accent | Domain |
|---|---|---|
| Life Admin Inbox | Yellow | Sorting the admin backlog |
| Doom Box Decoder | Teal | Finding what you packed |
| Guilt-Free Boundary Builder | Rose | Saying the hard thing |

Distinct enough to sit side-by-side on the SOR7ED marketing site without visual collision. Related enough that switching between them feels like moving between rooms of the same house.

**Shared components** to lift into a `sor7ed-ui` package when consolidating:
- Nav shell + `part of SOR7ED` mark
- `.btn` / `.card` / `.plan-card` / `.hero` / `.features-grid` / `.pricing-grid`
- Toast, disclaimer bar, upgrade modal, confirm modal
- Free-counter chip, paid badge
- Segmented picker (`.seg` / `.seg-opt`)
- localStorage helpers + daily-counter reset logic
- Print CSS reset

Each tool ships its own accent variable and its own domain logic on top.

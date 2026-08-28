# The Friction Wallet — Landing Page

## Project Goal
A single-page marketing/product site for **The Friction Wallet**, a "Spend Smart" concept product: a biometric spend-lock that reads a user's heart rate at the moment of an NFC/digital payment and pauses the transaction (with a one‑minute guided breathing exercise) when stress markers are high, encouraging more mindful spending.

## Completed Features
- **Responsive one-page site** (`index.html`) built with Tailwind CSS (CDN), Font Awesome icons, and Google Fonts (Space Grotesk + Inter).
- **Sticky header/nav** with anchor links to all sections, a WhatsApp CTA button, and a mobile hamburger menu with slide-down nav.
- **Hero section** with headline, description, key stats (110 bpm default threshold, 60s breathing cooldown, 7–10 day report cycle), CTA buttons, and an AI-generated app mockup image with a floating "Transaction Paused" status card.
- **Working Process** section (5 steps) describing onboarding → monitoring → middleware check → pause & breathe → mindful confirm, paired with an illustration.
- **Interactive heart-rate demo simulation**: a slider (60–180 bpm) that live-toggles the UI between "Authorized" and "Transaction Paused" states (threshold 110 bpm), including an animated breathing indicator — implemented in `js/main.js`.
- **Expected Results** section (4 benefit cards) + timeframe callout (7–10 days to full report, delivered within 24h).
- **Target Audience** section (4 audience cards: impulse spenders, financial wellness seekers, health-conscious users, employers/wellness programs).
- **Usage Instructions** (6-step numbered list) and **Customer Benefits** (5 checklist rows).
- **Tech / Logic Blueprint** section showing the stack (Swift/Kotlin, HealthKit/Google Fit) and a syntax-highlighted code sample of the `authorize_transaction` middleware logic from the source spec.
- **FAQ accordion** (5 common questions) with smooth expand/collapse.
- **Final CTA banner** driving to WhatsApp with the trigger word `WALLET` (`https://wa.me/?text=WALLET`).
- **Footer** with logo, copyright, back-to-top link.
- Scroll-reveal animations, floating mockup animation, pulsing status dot, and a scrolled/blurred header state — all in `css/style.css` and `js/main.js`.
- Custom AI-generated imagery (`images/hero-mockup.png`, `images/how-it-works.png`).

## Site Structure / Entry Points
- `index.html` — the entire single-page site (all sections are anchors: `#top`, `#how-it-works`, `#results`, `#audience`, `#usage`, `#tech`, `#faq`, `#cta`). No query parameters or routing.
- `css/style.css` — custom styles layered on top of Tailwind utility classes.
- `js/main.js` — header scroll state, mobile menu toggle, scroll-reveal observer, heart-rate demo simulation logic, FAQ accordion.
- `images/hero-mockup.png`, `images/how-it-works.png` — supporting illustrations.

## Data / Storage
This is a purely static informational/marketing page — **no database, table schema, or backend API is used**. All content (working process, results, audience, usage steps, benefits, code sample) is sourced directly from the provided product brief and hard-coded into `index.html`. The WhatsApp CTA links to `https://wa.me/?text=WALLET`, which opens the visitor's WhatsApp client — no server-side processing is involved.

## Not Yet Implemented
- No real backend/middleware — the heart-rate demo on the page is a **client-side simulation only** (a slider that mimics the described logic); it does not connect to HealthKit, Google Fit, or any live wearable data, since this is a static site.
- No lead-capture form or waitlist (currently only the WhatsApp deep link is provided per the source brief's "CTA Text: Get via WhatsApp").
- No blog/article template exists beyond this single landing page (the source doc's "Blog Post" content was folded directly into the relevant landing-page sections).
- No analytics/tracking integration.

## Suggested Next Steps
1. Replace `https://wa.me/?text=WALLET` with the project's actual WhatsApp Business number if one exists (currently a generic wa.me link with pre-filled trigger text).
2. If a waitlist/email capture is desired, add a lightweight form backed by the RESTful Table API (e.g., a `waitlist` table with `name`, `email`, `created_at`).
3. Add real product screenshots/demo video once available (currently using AI-generated concept imagery).
4. Consider adding a status/progress tracker section reflecting the "In progress" status shown in the source brief, if the team wants to publicly communicate roadmap milestones.

## Deployment
This project has not yet been deployed. To publish it live, use the **Publish tab** for one-click deployment, or ask me to run a Hosted Deploy explicitly.

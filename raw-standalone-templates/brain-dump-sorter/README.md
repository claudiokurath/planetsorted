# The Brain Dump Sorter — Landing Page

A single-page marketing/landing site for **The Brain Dump Sorter**, an NLP-based automation that classifies raw WhatsApp thought-dumps into **Task**, **Idea**, or **Emotion** categories and writes them straight into a Notion database.

Source content for this page was extracted from the uploaded Notion export (`THE BRAIN DUMP SORTER ....pdf`), which described:
- **Category:** Keep Going
- **Meta Description:** NLP sorter: classify raw dumps into task/idea/emotion for Notion.
- **Slug:** `brain-dump-sorter`
- **Status:** Draft
- **Template:** Prompt → classify → write to Notion
- **WhatsApp Trigger keyword:** `BRAINDUMP`
- **CTA Text:** Get via WhatsApp
- **Blog Post / Featured / Has Demo:** not enabled
- **Summary:** Intro copy describing the tool as an intuitive, Python-based NLP classifier for raw thoughts.

## ✅ Completed Features
- Responsive, dark-themed one-page site built with Tailwind CSS (CDN) + custom CSS.
- **Hero section** with headline, WhatsApp CTA, and a custom-generated illustration showing the WhatsApp → AI → Notion flow.
- **How it Works** 3-step section (Send on WhatsApp → AI classifies → Lands in Notion).
- **Categories** section explaining Task / Idea / Emotion with icon cards.
- **WhatsApp Trigger** section with an interactive phone-chat mockup demonstrating the `BRAINDUMP` keyword and classification result.
- **Notion board preview** showing example sorted notes in a 3-column kanban layout.
- **FAQ** accordion (native `<details>`, no extra JS dependency needed beyond a small toggle script).
- **Final CTA** section with a WhatsApp deep link (`https://wa.me/?text=BRAINDUMP%20`).
- Sticky/blurred header with in-page anchor navigation.
- Verified via Playwright screenshots on both desktop and mobile viewports — layout is clean with no overflow or broken elements.

## 📄 Page Structure / Entry Points
- `index.html` — the only page, with in-page anchors:
  - `#top` — hero
  - `#how-it-works`
  - `#categories`
  - `#trigger`
  - `#faq`
  - `#get-started` — final CTA (WhatsApp deep link)
- `css/style.css` — all custom styling (hero glows, cards, phone mock, Notion board, FAQ accordion).
- `js/main.js` — header scroll state + FAQ accordion behavior (single-open).
- `images/hero-illustration.png` — AI-generated hero graphic (WhatsApp → AI brain → Notion board).
- `assets/brain-dump-sorter-source.pdf` — original uploaded source PDF, kept for reference.

## ❌ Not Yet Implemented
- No live backend: the WhatsApp button is a `wa.me` deep link — it does **not** actually trigger the NLP classification or write to Notion (that logic runs in the user's own automation/n8n/Zapier setup outside this static site).
- No live "Has Demo" interactive classifier — the phone chat mock is a static illustration, not a working demo (the source data marks Has Demo = false).
- No blog post variant (source data marks Blog Post = false).
- No CMS/table-backed content — everything is static per the "Draft" status of the source record.

## 🔜 Recommended Next Steps
- If a real workflow exists (e.g., n8n/Zapier/Make scenario wired to WhatsApp Business API + Notion API), replace the `wa.me` link with the real WhatsApp Business number/deep link.
- Consider adding a lightweight interactive demo (a text box that fakes classification client-side) if "Has Demo" becomes true later.
- Add real testimonials/usage stats once available.
- Move to the **Publish tab** to deploy this static site live.

## 🗂 Data Models / Storage
This project uses **no table/database storage** — it is a fully static informational/marketing page with no forms, no persisted data, and no Table API calls.

## 🌐 Public URL
Use the **Publish tab** in the editor to deploy this site and obtain its live URL.

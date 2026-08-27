# Planet Sorted — Content & Tools Workflow Runbook

**Single Source of Truth:** `docs/planet-sorted-master.md`  
**Purpose:** Operational runbook for managing Planet Sorted Articles and Interactive Tools via Notion and Supabase without touching application code.

---

## 1. System Architecture Overview

Planet Sorted uses a unified content model where **Notion is the authoring CMS** and **Supabase is the high-speed read cache**.

```
[Notion Content DB]
       │
       ▼ (Vercel Cron / Manual Sync)
[Supabase protocols table] (Filtered by type: 'Article' | 'Tool')
       │
       ├─────────────────────────────────┬──────────────────────────────────┐
       ▼                                 ▼                                  ▼
[Next.js Website]                [WhatsApp Webhook]                 [Dynamic Redirects]
• /tools (Tools Grid)            • Matches incoming keywords        • /r/[slug] checks type
• /dashboard (Featured Tools)    • e.g., "TAX", "CLARITY"           • Redirects to /tools/ or
• /intelligence (Articles)       • Returns rich shortlink cards       /intelligence/
```

### Key Architectural Benefits
- **Zero Code Deployments:** Adding a tool, hiding an article, or changing a WhatsApp keyword happens 100% in Notion.
- **Unified Database:** Both articles and tools live in the Supabase `protocols` table, differentiated by the `type` column (`'Article'` vs `'Tool'`).
- **Dynamic WhatsApp Dispatch:** Incoming WhatsApp messages query the database in real-time. If an incoming word matches `protocols.keyword` where `status = 'Published'`, the bot immediately replies with the tool or article card.

---

## 2. Step-by-Step: Adding a New Tool

To launch a new interactive tool or template:

1. **Open the Notion Tools Database:** Navigate to database ID `08ac767d313845ca91886ce45c379b99`.
2. **Create a New Row** with the following required properties:
   - **Title:** e.g., `Sleep Routine Reset`
   - **Slug:** kebab-case identifier, e.g., `sleep-routine-reset` (used in `/tools/sleep-routine-reset` and `/r/sleep-routine-reset`)
   - **Type:** `Tool` (Select property)
   - **Status:** `Published` (Select property)
   - **Category:** One of the 7 taxonomy terms: `Mind`, `Wealth`, `Body`, `Tech`, `Connection`, `Impression`, `Growth`
   - **WhatsApp Trigger (Keyword):** Uppercase keyword, e.g., `SLEEP` (What users text to the WhatsApp bot to get the tool)
   - **Summary:** Short 1–2 sentence promise displayed on cards and previews.
   - **Read Time:** e.g., `3 min` or `5 min`
   - **Cover Image 1:** Upload an image or provide a valid external URL.
3. **Sync to Database:**
   - Either wait for the automatic Vercel Cron job (runs every 5 minutes), OR
   - Run the manual sync script from your terminal:
     ```bash
     node --env-file=.env.local scratch/sync-and-check.js
     ```
4. **Verify Live Site:**
   - Visit `https://planetsorted.com/tools` → Your new tool card will appear in the grid.
   - Visit `https://planetsorted.com/tools/sleep-routine-reset` → The dynamic tool detail page will load.
   - Text `SLEEP` to your WhatsApp bot → You will receive the shortlink `planetsorted.com/r/sleep-routine-reset`.

---

## 3. Step-by-Step: Adding a New Article

1. **Create Row in Notion** with the same properties as above, but set:
   - Use the **Blog Database** (`3b30d6014acc80c9bee6d95709efd209`).
   - **Blog Post:** Markdown content of the article body.
   - **Protocol:** The actionable step-by-step text sent via WhatsApp when users request the protocol.
   - **Cover Image:** Upload the website card and article cover artwork.
   - **Gamma:** Add the published Gamma URL. This is the customer-facing destination used by the Sorted button delivery flow.
2. **Sync & Verify:**
   - Once synced, articles automatically populate `https://planetsorted.com/intelligence`, the homepage guide grid, and sitemaps.

---

## 4. Hiding or Temporarily Removing Content

Never delete rows in database directly if you want a clean audit trail. Instead:

1. **In Notion:** Open the target Tool or Article row.
2. **Change Status:** Switch `Status` from `Published` to `Draft`.
3. **Trigger Sync:** Wait for cron or run `node --env-file=.env.local scratch/sync-and-check.js`.
4. **Result:** The tool or article instantly vanishes from `/tools`, `/dashboard`, `/intelligence`, sitemaps, and WhatsApp keyword matching. Switching it back to `Published` restores it immediately.

---

## 5. Reordering Tools & Articles

Content sorting on the frontend uses timestamps (`order('updated_at', { ascending: false })` or `created_at`).
- To bump a tool to the top of the grid, edit any property in Notion (or update its date) and re-sync.

---

## 6. Troubleshooting Guide

### Issue A: Tool does not appear on `/tools` page after sync
- **Check 1 (Type Column):** Confirm in Notion that `Type` is explicitly set to `Tool` (case-sensitive, not `tool` or `tools`).
- **Check 2 (Status Column):** Confirm `Status` is set to `Published`.
- **Check 3 (Database Verification):** Run the CLI check script to see exactly what Supabase holds:
  ```bash
  node --env-file=.env.local scratch/check-all-tools-db.js
  ```
  If it shows `0 rows`, the sync failed or credentials in `.env.local` are expired.

### Issue B: WhatsApp keyword does not trigger the tool card
- **Check 1 (Keyword Formatting):** Ensure the `WhatsApp Trigger` in Notion is a clean word with no trailing spaces or punctuation (e.g., `TAX`, not `TAX ` or `#TAX`).
- **Check 2 (Simulation Test):** Run the local WhatsApp keyword simulator against your live database:
  ```bash
  node --env-file=.env.local scratch/test-wa-keywords.js
  ```
  This tests the exact query used by `app/api/whatsapp/webhook/route.ts` and prints `[PASS]` or `[FAIL]` for each keyword.

### Issue C: Cover image fails to display
- When syncing, the cron route (`app/api/cron/sync-notion/route.ts`) downloads Notion images to Supabase Storage bucket `notion-files/covers/{slug}.jpg`.
- If an image appears broken, force-refresh cover downloads by running:
  ```bash
  node --env-file=.env.local scratch/force-refresh-covers.js
  ```

---

## 7. Essential CLI Helper Scripts (`scratch/`)

| Script Name | Command | Purpose |
| :--- | :--- | :--- |
| **Sync & Check** | `node --env-file=.env.local scratch/sync-and-check.js` | Triggers live Notion → Supabase sync and reports updated rows. |
| **Test WA Keywords** | `node --env-file=.env.local scratch/test-wa-keywords.js` | Simulates WhatsApp webhook queries against all 8 tool keywords. |
| **Check DB Tools** | `node --env-file=.env.local scratch/check-all-tools-db.js` | Lists all published tools currently in Supabase `protocols`. |
| **Refresh Covers** | `node --env-file=.env.local scratch/force-refresh-covers.js` | Redownloads and updates Notion cover images to Supabase storage. |

# Native guidebook/tool presentations and private delivery

SOR7ED serves public guidebooks without sign-in. Their content is copied from the
published **Blog Post Gamma** links in Notion, rather than the **Protocol Gamma**
links. Public tool presentations use the Tools database's **Gamma** embeds.
`presentationSources.json` records the exact Notion sources refreshed on 25 October
2026; `nativeGammaCopy.json` contains only public presentation content. Original
illustrations are stored locally as WebP images. The native renderer supplies
semantic headings, responsive text, thin borders, and white-background printing.

These are checked copies, not live Gamma frames. Edits inside a Gamma document
require a new import and deployment. A changed Notion document link invalidates
its old copy: guidebooks fall back to synced Blog Post text instead of displaying
the wrong deck. New sources should be imported before publishing.

## WhatsApp delivery

The existing sender and approved card remain unchanged: `/go/{slug}` → `/r/{slug}`.
Public article previews link to `/intelligence/{slug}`; the WhatsApp card routes to
private content. `/r` shows only public metadata to preview crawlers. Humans open:

- Every published article: its current Notion **Protocol Gamma** URL. Active
  conversation cards open Gamma directly. Previously sent/template cards reach
  `/protocols/{slug}`, which verifies the member and redirects to that URL.
  No imported presentation, generated Protocol text deck or PDF replaces Gamma.

As clarified on 5 November 2026, all website delivery is rich-link-only. The
server ignores legacy text/audio flags, including old reply requests. The
scribble button still sends automatically and resolves to a tick on acceptance;
it does not open WhatsApp with a per-request code. Approved-template fallback
retains the fixed protected link route; no free-form follow-up is attempted.
Missing/unsafe Protocol Gamma URLs produce no message, with no text/PDF fallback.

Private endpoints require a server-validated Supabase user and that user's own
verified WhatsApp number. Forged `access_token` parameters and public `/r` links
cannot bypass this check. Sign-in/connect redirects retain the requested path.
The routes are dynamic and excluded from indexing. Downloads use private/no-store
headers. Existing STOP handling remains in the sender; downloads do not send messages.

## Encrypted assets

The repository is public. Private protocol text, illustrations, and PDF bytes are
stored only as AES-256-GCM ciphertext under `private/protocols/`. Decryption uses
`PRIVATE_PROTOCOL_KEY`, a server-only 32-byte base64 key configured as a Vercel
Secret in Preview and Production. Never expose it through NEXT_PUBLIC variables,
commit it, or place unencrypted protocols in `public/`.

`next.config.ts` traces encrypted assets into the private routes, including Docker
standalone output. Missing keys or corrupted files fail closed. The PDF was checked
against the uploaded original byte-for-byte.

Supabase migration `private_protocol_content` removes browser SELECT access to
`protocol` and `gamma_url` and restricts public rows to Published content. Service
role access remains available to Notion sync and WhatsApp delivery. Do not restore
whole-table SELECT grants to browser roles when adding new fields.

## Source discrepancies

Notion's Financial Avoidance **Protocol Gamma** currently points to the digital
file organisation document (confirmed from its page title). The Digital Files
row has no Protocol Gamma URL. These properties need correction in Notion;
application code uses the current source and must not invent a replacement.
The original Financial Avoidance PDF remains a protected archive, not a default
card destination. All three published tool embeds and seven public blog embeds
match Supabase.

## Refresh on 25 October 2026

The three currently published tools and seven published public blog presentations
were re-imported from the Notion-linked Gamma documents. Medical Trauma now uses
`90xxncdrsrdji75`. Source revision timestamps are recorded in
`lib/content/presentationVersions.json`; illustrations use content-versioned URLs
so cached artwork cannot conceal an update. Hidden Gamma cards are omitted.

The importer preserves source text, line breaks, emoji and diagram step labels
as React text nodes; it never injects Gamma HTML. Only explicitly selected public
captures may be passed to `scripts/import-gamma-presentations.py`. Captures contain
the public Gamma `/docs/<id>` page's `pageProps`, not private Protocol Gamma data.

Toolbox and Guidebook introductory copy was checked against their source decks
and still matches. Their old hardcoded Gamma catalogs are intentionally not
imported: live catalog visibility comes from Notion Published status. About's
Gamma.site source could not be read from this execution environment; its existing
approved copy remains unchanged. The Financial Avoidance private PDF and all
other private protocol assets are unchanged.

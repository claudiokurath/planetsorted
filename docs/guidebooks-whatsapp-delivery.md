# Guidebooks delivery correction — 3 November 2026

Production evidence: a new account completed email and phone verification. Several content requests received provider IDs, then Meta's signed status callbacks reported error 131047 (outside the 24-hour customer conversation window). Reading the outgoing verification link does not open that window. Provider acceptance must not be mistaken for delivery.

The public name and canonical route are now **Guidebooks**, `/guidebooks`; old `/intelligence/:path*` URLs permanently redirect. Original Notion Gamma sources and publication status remain authoritative. Semantic uses of “intelligence” inside authored material are not section labels and are not rewritten.

The website content button now:
1. Preserves its article/tool intent through signup and connection.
2. On an authenticated, deliberate click, stages an account-owned request for 15 minutes. No WhatsApp message is sent by this POST, a page GET, prefetch or reload.
3. Opens a prefilled WhatsApp message, `GET IT SORTED <action ID>`. The member presses **Send** in WhatsApp.
4. The signed Meta webhook, after crisis handling, matches the sender to the verified profile. A conditional database UPDATE claims the pending request once.
5. Rechecks current Notion publication, sends the private resource link plus available guidebook protocol text, and records provider outcomes. Financial Avoidance uses its existing protected PDF link; the PDF is not made public.

Wrong-number, opted-out, expired, withdrawn and duplicate requests cannot send. Unknown/partial provider outcomes are not automatically retried. An expired request can be explicitly replaced with a fresh request. Existing standalone Button relay and STOP/START handling remain separate. Legacy direct-send API callers keep their existing behavior; public website content controls and the connection continuation use the new reply flow.

The migration adds only server-owned request fields to the existing RLS-protected delivery journal. It contains no protocol body or phone number. Local CLI migration generation failed because its home configuration directory is read-only; the connected Supabase migration API generated version `20261103175411`, which is committed in the repository. Security advisors were reviewed; the table remains inaccessible to browser roles through its existing RLS policies/grants.

Visuals: yellow/black desktop/mobile navigation and account section tabs; a single labelled yellow/black SOR7ED button. Side labels are removed while accessible labels, reduced motion, status/error feedback and the tangle-to-tick animation remain.

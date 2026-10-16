# Account reference and website recovery — 2026-10-16

## Account reference

The supplied four-page `Untitled.pdf` is recreated as native, responsive account
content. `AccountMembersIntro` uses the separately supplied original `0_0 (7).jpg`
(1280 × 853), unchanged, and the PDF's source wording: the member introduction,
four yellow experience cards, and three outlined
affirmation cards. The account workspace stays above it with Your library and
Edit profile. Only the authenticated member's actual saved items are displayed.
Printing uses white backgrounds and hides the decorative photograph.

## Repairs

- Canonical website URLs resolve to `https://www.planetsorted.com`, even if the
  secret `SITE_URL` still contains the former `sor7ed.com` website host. Metadata,
  sitemap, auth and delivery URLs use the same helper. Historical saved website
  URLs are normalised on read; partner `/s/` links remain unchanged.
- New WhatsApp signups create a new, unconfirmed identity explicitly. Supplying
  an existing account's email cannot attach an unproven new phone to that identity.
  Failed initial delivery can retry only with the same browser's private,
  phone-bound, expiring signup cookie. Confirmation preserves edited names and
  STOP preferences.
- Delivered resource links open the implemented interactive tool instead of its
  preview. Six local tools use their embed routes; Task Breakdown has its own
  authenticated form. Unimplemented tools keep their normal resource page.
- Brain Dump separates ideas from emotions at question/exclamation boundaries and
  no longer advertises retired messaging commands or nonexistent background sync.
- Task Breakdown checks verified WhatsApp ownership and explicit unpaused consent
  before generating or sending. Inputs and network waits are bounded; a missing
  AI key is unavailable, and only an actual provider receipt means accepted.
- Account deletion verifies and cancels recorded Stripe subscriptions before
  removing billing references. Every delete error is checked. An Auth deletion
  followed by incomplete record cleanup signs the browser out and explicitly
  directs the member to support.
- STOP recovery appears only in Edit profile and opens WhatsApp with START
  prepared. The site does not automatically send it or change consent.
- Weekly subscriber selection also requires a verified number, and an unset cron
  secret cannot authenticate a broadcast request. Failed-send logs omit numbers.

## Database permissions

Migration `20261015235922_website_access_permissions.sql` was applied to the website
Supabase project during the audit. It changes grants, policies, indexes and the
existing service-only claim function, without rewriting customer rows or sending
messages. Do not apply the same migration a second time under another version.

- Removes an unrestricted profile policy and anonymous profile access.
- Members may read only their own profile; verification and profile writes stay
  behind authenticated server routes.
- Adds owner-scoped history reads/inserts/deletes and owned output checks.
- Denies browser writes to verification fields, history reassignment and truncate.
- Removes browser access to the legacy draft-exposing protocol view and makes it
  security invoker.
- Deduplicates historical/canonical website aliases when saving a delivery backup.

`scripts/test-website-permissions.mjs` runs 15 tests against a disposable localhost
PostgreSQL database, including independent member identities and service-role
operations. It refuses remote database URLs.

## Verification

- Native Node unit and actual-route fixture tests cover signup ownership,
  confirmations, private PDFs, delivery replay, profile OTPs, URL handling and
  billing deletion failures. Provider/storage responses are mocked.
- Isolated browser checks cover account widths 320–1440px, equal desktop cards,
  saved-only/empty/search/retry states, profile editing, STOP recovery, sign-out,
  partial deletion, signed-out gating and white print rendering.
- The supplied original account JPEG is copied unchanged; artwork is not cropped.
- Local webpack production build, TypeScript, lint and diff checks run before PR.
- Production read-only checks covered public resource/category pages, local
  calculators, the reflection app and private-content gates. No actual signup,
  WhatsApp/email send, Stripe action or customer-data deletion was performed.

## Remaining release/setup limits

- These application changes require a new website preview/release. The permission
  migration above is already applied independently; reverting app code must not
  restore unsafe grants.
- `sor7ed.com`, `www.sor7ed.com` and `api.sor7ed.com` returned Vercel
  `DEPLOYMENT_NOT_FOUND` during the audit. The separate `sor7ed-button` repository
  needs its own deployment and worker infrastructure. Website changes cannot
  repair those host assignments. The partner service configuration is review-only.
- Approved Meta cards may still contain the old `sor7ed.com` button base, including
  the sign-in card. Changing website `SITE_URL` does not change a template approved
  at Meta. Restore the legacy path redirects on that host, or approve/configure
  replacement templates, before calling those existing cards usable end to end.
- Task Breakdown requires `OPENAI_API_KEY`, which was absent from the observed
  production environment variable names. Its form being reachable does not mean
  generation is configured. No provider credentials were added or extracted.
- Real Meta delivery and approved-template routing still need a deliberate test
  with the owner's test number after deployment; mocked acceptance is not proof
  of handset receipt.
- Signup link cooldown and token consumption still use Auth metadata updates;
  concurrent confirmations are not a transactional one-use claim.
- Task Breakdown retains its existing direct generation/send flow; it does not
  gain the resource button's durable action deduplication or background queue.
- Account deletion is a sequence of provider/REST operations, not a transaction.
  A failure can remove some website records before Auth deletion; retained billing
  IDs allow reconciliation. Only recorded subscriptions are verified, and external
  Notion contacts are not erased by this endpoint. Do not claim universal erasure.

# SOR7ED website review — 11 October 2026

The website journey is: homepage → brain-type reflection or chosen content → relevant tool/protocol → sign in and verify WhatsApp → send that specific item → return through saved items.

## Deployment baseline

Production runs commit `707311482530b46d76dd27e68f2287b8274a306b` (merged PR #64). PR #65 remains open. Its button and Gamma embed are not on production until merged and deployed. The latest local work extends that same PR; it does not merge or publish production.

Toolbox redirects to https://the-tools-your-brain-act-nhom91y.gamma.site/ and Guidebook redirects to https://untitled-3e9fdk1.gamma.site/. The redirect destinations were verified. Gamma returned an automated-access 403 to the audit client; the complete published Gamma content was not independently browser-verified or edited.

## Content audit

All 13 published titles and stored Gamma references match the current Notion properties: seven articles and six tools. All 13 mirrored cover URLs respond with an image and HTTP 200; each URL's version hash matches its downloaded bytes. Notion exposes cover file IDs through this connector, so a new byte-for-byte comparison against the original Notion uploads could not be performed. The records were synced or repaired on 11 October.

Two source issues remain and should not be replaced with guessed links:

- Financial Avoidance's **Protocol Gamma** property points to a digital-file organisation presentation.
- Organising Digital Files has no **Protocol Gamma** value. Its **Blog Post Gamma** is populated.

## Protected sync dependency

`app/api/cron/sync-notion/route.ts` reads `Blog post Gamma`; Notion names the property `Blog Post Gamma`. Two sync paths can therefore replace valid article deck links with null. A verified, applicable patch is prepared at [patches/notion-cron-properties.patch](patches/notion-cron-properties.patch). It uses the existing case-insensitive property helper.

AGENTS.md rule 5 says the sync route is “final and immutable” unless explicitly authorised. The uploaded brief also requires following protected-file rules. The route remains unchanged pending explicit permission to apply this patch. The daily sync runs at 00:00 UTC; the restored article values alone do not prevent this regression.

The protected save/send files also retain some historical `sor7ed.com` fallbacks. Unprotected metadata, routing and account link fallbacks are corrected to `planetsorted.com`; protected files remain unchanged.

## Verification boundaries

Browser tests use local mocked responses for authentication, saves, OTP and delivery. They verify request payloads, UI success/failure and retry behaviour without sending real WhatsApp messages, creating real subscriptions or writing test history to production.

Actual magic-link email arrival, real OTP arrival, Meta delivery and Stripe payment completion require a deployment check using the owner's accounts. Do not describe these as verified by the local mocks.

## Implemented in PR #65

- Keep the approved brain-machine asset unchanged and fully visible. Stack readable full-width mobile copy, retain the profiler action and animate the three white desktop choices. Use a faithful 671KB logo-video derivative instead of the 25.5MB original (97.4% smaller), preserving the loop and frame timing.
- Add the real SOR7ED mark below equal native preview cards, with item-specific labels and truthful send/retry states. Provide Gamma embed instructions.
- Preserve item context through sign-in and WhatsApp verification. Returning verified members explicitly confirm the requested send; page loads and prefetches never send messages.
- Improve form labels, results and navigation across all seven standalone tools. Failed history saves/deletions retain local results or entries and offer recovery.
- Show only saved account content, distinguish failures from empty states, and prevent blank profile updates after a failed load.
- Make mobile About navigation available, increase tap targets and supporting-page readability, remove membership placeholders, and add friendly page errors.
- Correct primary-domain fallbacks, canonical metadata and social copy. Preserve approved About content, profiler scoring and Gamma destinations.

## Completed local checks

- All 57 unit tests passed.
- Optimised production build, TypeScript and ESLint checks passed for changed code.
- Browser layouts passed at 320, 390, 768 and 1440px; supporting pages and hero were also checked at 1024px.
- All profiler outcomes, recommendations, tie/reset behavior and clipboard interactions passed.
- Mocked history-save/deletion failures and retries, OTP failures and delivery retries passed without live writes or messages. Returning-member confirmation and opt-out server branches also passed.
- Native print view uses white backgrounds and black text, hides navigation and hero controls; reduced-motion and keyboard skip navigation passed.
- The prepared Notion sync patch passes `git apply --check` but has not been applied.

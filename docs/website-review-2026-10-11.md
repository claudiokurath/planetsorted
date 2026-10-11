# SOR7ED website review — 11 October 2026

The website journey is: homepage → brain-type reflection or chosen content → relevant tool/protocol → sign in and verify WhatsApp → send that specific item → return through saved items.

## Deployment baseline

Production runs commit `d218774fde8192e5a958c1843b3f0a9122997d05` (merged PR #65), confirmed READY on Vercel. The native Toolbox and Guidebook copies are a separate change based on that commit; they take effect after their own pull request is merged and deployed.

Toolbox (`/tools`) and Guidebook (`/intelligence`) now render native copies of the owner's current published Gamma pages, replacing the external redirects. Both Gamma sites were retrieved in Chromium with HTTP 200 and all sections scrolled into view. Their introductions, feature copy, section order and original artwork were captured directly. Native previews load current published Notion/Supabase records and have their own item-specific SOR7ED button. Individual content destinations remain unchanged.

## Content audit

All 13 published titles and stored Gamma references match the current Notion properties: seven articles and six tools. All 13 mirrored cover URLs respond with an image and HTTP 200; each URL's version hash matches its downloaded bytes. Notion exposes cover file IDs through this connector, so a new byte-for-byte comparison against the original Notion uploads could not be performed. The records were synced or repaired on 11 October.

Two source issues remain and should not be replaced with guessed links:

- Financial Avoidance's **Protocol Gamma** property points to a digital-file organisation presentation.
- Organising Digital Files has no **Protocol Gamma** value. Its **Blog Post Gamma** is populated.

## Approved Notion sync fix

`app/api/cron/sync-notion/route.ts` previously read `Blog post Gamma`; Notion names the property `Blog Post Gamma`. Both sync paths now use the existing case-insensitive property helper, preferring the exact current property name. This preserves article deck links and embedded iframe snippets while keeping **Protocol Gamma** separate. The reviewed change is recorded at [patches/notion-cron-properties.patch](patches/notion-cron-properties.patch).

The owner explicitly authorised this protected-file change on 11 October. The fix was merged in PR #65 and is included in the production deployment. The daily sync runs at 00:00 UTC.

The protected save/send files also retain some historical `sor7ed.com` fallbacks. Unprotected metadata, routing and account link fallbacks are corrected to `planetsorted.com`; protected files remain unchanged.

## Verification boundaries

Browser tests use local mocked responses for authentication, saves, OTP and delivery. They verify request payloads, UI success/failure and retry behaviour without sending real WhatsApp messages, creating real subscriptions or writing test history to production.

Actual magic-link email arrival, real OTP arrival, Meta delivery and Stripe payment completion require a deployment check using the owner's accounts. Do not describe these as verified by the local mocks.

## Native collection addition

Copy the current Gamma Toolbox and Guidebook into native pages, with the exact cover/closing artwork and introduction/feature copy. Preserve the section order, Anton/Roboto Condensed typography, yellow feature cards and black panels; fix the source's mobile overflow. Replace obsolete keyword delivery instructions with the SOR7ED-button journey and remove the unverified 133-article claim. Use current Notion covers, titles and descriptions in equal native preview cards. Standalone-tool Toolbox navigation returns to `/tools`.

The production build, TypeScript, focused ESLint and native browser checks passed. See [native collection sources and verification](native-collections.md) for the current 13-item catalog, responsive layout, button-context, mocked-send and error/empty checks.

## Previously implemented in PR #65

- Keep the approved brain-machine asset unchanged and fully visible. Stack readable full-width mobile copy, retain the profiler action and animate the three white desktop choices. Use a faithful 671KB logo-video derivative instead of the 25.5MB original (97.4% smaller), preserving the loop and frame timing.
- Add the real SOR7ED mark below equal native preview cards, with item-specific labels and truthful send/retry states. Provide Gamma embed instructions.
- Preserve item context through sign-in and WhatsApp verification. Returning verified members explicitly confirm the requested send; page loads and prefetches never send messages.
- Improve form labels, results and navigation across all seven standalone tools. Failed history saves/deletions retain local results or entries and offer recovery.
- Show only saved account content, distinguish failures from empty states, and prevent blank profile updates after a failed load.
- Make mobile About navigation available, increase tap targets and supporting-page readability, remove membership placeholders, and add friendly page errors.
- Correct primary-domain fallbacks, canonical metadata and social copy. Preserve approved About content, profiler scoring and Gamma destinations.

## Completed PR #65 checks

- All 57 unit tests passed.
- Optimised production build, TypeScript and ESLint checks passed for changed code.
- Browser layouts passed at 320, 390, 768 and 1440px; supporting pages and hero were also checked at 1024px.
- All profiler outcomes, recommendations, tie/reset behavior and clipboard interactions passed.
- Mocked history-save/deletion failures and retries, OTP failures and delivery retries passed without live writes or messages. Returning-member confirmation and opt-out server branches also passed.
- Native print view uses white backgrounds and black text, hides navigation and hero controls; reduced-motion and keyboard skip navigation passed.
- The approved Notion sync patch is applied. Eight mocked sync scenarios passed across both sync paths: current and legacy property names, exact-match preference and iframe-rich-text values. Article destinations, protocol destinations and cover images were preserved without external writes. TypeScript and focused ESLint passed; ESLint reports one pre-existing unused-function warning.

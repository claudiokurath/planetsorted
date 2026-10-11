# Native Toolbox and Guidebook

The owner requested native copies so item-specific SOR7ED buttons could be placed directly below the previews. `/tools` and `/intelligence` now render on planetsorted.com instead of redirecting to Gamma.

## Sources captured on 11 October 2026

- Toolbox: https://the-tools-your-brain-act-nhom91y.gamma.site/
- Guidebook: https://untitled-3e9fdk1.gamma.site/

Both published pages loaded in Chromium with HTTP 200. Every section was scrolled into view before capturing the rendered content, links, styles and original image URLs.

`lib/content/collectionCopy.ts` contains the copied introductions and four features for each collection. `public/images/collections/` contains the unchanged original Gamma cover images and the Guidebook closing illustration. `GammaCollectionPage` preserves the source section order, typography, yellow feature cards and black panels. It uses readable body weight and a responsive grid because the original Gamma pages overflow on narrow phones.

The Guidebook's obsolete keyword instructions are replaced with the current button journey: read → tap the SOR7ED mark → receive the protocol via WhatsApp. The unverified 133-article claim is removed. Its Back button now links to the homepage; the source button had no destination.

## Current previews and delivery

`CollectionCatalog` reads only published `protocols` rows of the requested type on each request. It uses the current Notion-synced title, excerpt/summary, category, read time and versioned cover URL. It has no saved snapshot fallback. Failures show a retry control; a successful empty query shows a separate empty state.

Each `ContentCard` includes the real tangle control through `ToolWhatsAppCta`. Guidebooks use `context=article`; tools use `context=tool`. Sign-in and WhatsApp verification retain that specific item's slug. Opening or loading the catalog never sends a message. Verified users deliberately request the item with the mark.

The public article deck and the WhatsApp protocol remain separate destinations. This change does not rewrite them or modify the published Gamma pages. Toolbox preview order matches the Gamma source; newly published tools follow the original six. Guidebooks sort by title.

Notion changes to published previews appear on the next page request. The copied introduction text and illustration assets are maintained in this repository; later Gamma edits to those sections must be mirrored here.

## Verification

- Both introductions and all feature text match the captured Gamma source; all three illustration files match the original downloads byte-for-byte.
- The production build, TypeScript and focused ESLint checks passed.
- A fresh read-only production query returned seven articles and six tools, all with current cover URLs.
- Browser checks at 320, 390, 768 and 1440px confirmed equal preview geometry, correct covers, one primary heading and no horizontal overflow, iframe or inner scrolling.
- Native navigation and signed-out clicks preserved each item's slug, context and return path. All 13 mocked verified sends used the correct payload; page loads sent nothing.
- Query failures, retries and successful empty catalogs were checked separately. Loader checks also confirmed fresh replacement covers and descriptions without a snapshot fallback.
- Local browser layout tests served the exact downloaded public cover bytes because the workspace's Node image fetch cannot directly reach Supabase. An independent production image-optimizer request for the current biometric cover returned HTTP 200 with a valid 640×482 PNG. No production content, account data or WhatsApp messages were written by these tests.

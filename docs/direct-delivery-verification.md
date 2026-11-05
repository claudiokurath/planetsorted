# Website direct delivery regression checks — 5 November 2026

The website must not stage a per-item WhatsApp reply code for a connected member.
The canonical request goes to `/api/save-to-phone`; the legacy request-delivery
POST delegates to that sender for compatibility with older open tabs.

## Automated coverage

- `deliveryClient.test.js`: canonical article/tool payloads use direct delivery;
  concurrent clicks coalesce; a new deliberate click after acceptance gets a new
  action; submitted/uncertain requests use read-only status checks.
- `deliveryRoute.test.js`: authentication, consent, atomic claims, user-scoped
  replay, unknown/partial outcomes, current Protocol text, Notion publication and
  refresh failures. A closed-window template fallback sends its protected link
  without attempting prohibited free-form follow-ups.
- `memberProtocolPage.test.js`: refresh before reading current Protocol text;
  financial article uses Notion text; anonymous, unverified, withdrawn, empty and
  unavailable content cannot fall back to an old presentation.
- `privateProtocol.test.js`: original PDF remains encrypted and private.

`npm test`: 227 passed, zero failed. `npm run lint` and `npm run build` passed.

## Browser checks

A temporary, uncommitted Next.js fixture used the actual SortedSaveButton,
contentDeliveryRequest and deliveryClient. Only its provider-facing HTTP response
was intercepted, using fictional content and user IDs. No WhatsApp messages were
sent and no customer protocol text was included in the fixture.

- Desktop 1280px with normal animation; mobile 390px with reduced motion:
  one POST per deliberate click, scribble → tick → scribble, no window.open,
  no WhatsApp navigation. A second click after reset sends a fresh request.
- Failed and unknown responses never show a success tick; another click checks
  status and does not send again.
- Pending response stays unresolved until an accepted GET response; focus checks
  status only. Exactly one POST across the interaction.

The fixture was removed before committing. These checks prove app behavior with
controlled provider results, not delivery to a real phone. No authenticated live
customer message was sent during verification.

## Source audit

All seven published Notion Protocol fields matched their Supabase counterparts
exactly. The Financial Avoidance Protocol Gamma link resolves to a Digital File
Organisation document; that property is not used as private delivery authority.
The correct Financial Avoidance Protocol text is used instead. No Notion content
or publication settings were changed.

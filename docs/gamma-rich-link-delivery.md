# Gamma-only website delivery — 5 November 2026

This contract supersedes the Protocol-text rendering/delivery in PR #114.

- A connected member clicks the existing animated scribble once.
- The server refreshes Notion publication and uses the Article's Protocol Gamma
  URL (`gamma_url`) as the card destination. It sends one rich-link card only.
- Legacy text/audio request flags are ignored; no protocol paragraphs, raw
  Markdown, audio or second message are appended. Old inbound reply fulfilment
  follows the same card-only contract; no new reply-code requests are staged.
- Active-conversation cards link directly to Gamma. Approved templates have a
  fixed `/go/{slug}` URL; the existing authenticated member route redirects to
  the current Notion Gamma URL. No copied or generated website deck is rendered.
- Missing/invalid Gamma links fail clearly before a message is sent. There is no
  Protocol text, old presentation or PDF fallback. Tool destinations are unchanged.
- STOP, account ownership, number verification and atomic delivery claims remain
  enforced. The tick means provider acceptance, not confirmed handset receipt.

## Source audit

Notion currently has five populated matching Protocol Gamma destinations, a
Financial Avoidance destination pointing to Digital File Organisation, and no
Protocol Gamma on Digital Files. No source properties were invented or changed.

## Verification

Route tests assert the exact changed Gamma URL is passed to the actual sender,
including the saved library URL; one accepted interactive message and no text or
audio even for legacy payload flags. Template fallback has no follow-up message.
Missing/unsafe sources, auth, consent, unknown outcomes and replays are covered.
The compatibility page tests assert refresh-before-read and an external Gamma
redirect, without a deck/PDF substitution. URL validation rejects unrelated hosts,
credentials and unsafe schemes; iframe snippets retain their exact Gamma source.

No real customer messages were sent in these checks. The earlier real-component
browser checks still cover the unchanged scribble/tick/reset and duplicate-send
behaviour; this change does not modify that component.

`npm test`: 228 passed, zero failed. Lint and production build passed. Direct
Gamma URL rendering could not be fully verified in this workspace browser due
its certificate trust configuration; this is not a real-phone delivery test.

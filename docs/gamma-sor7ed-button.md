# Add the SOR7ED button to Gamma

The button uses your SOR7ED tangle mark. Visitors see what they will receive,
sign in and connect WhatsApp if necessary, then request that specific item.

## Under a tool preview

In Gamma, add an **Embed / Webpage** block beneath the preview and paste:

```text
https://planetsorted.com/embed/sor7ed-button?slug=adhd-tax-calculator&context=tool
```

Replace `adhd-tax-calculator` with the tool’s published website slug. Use the
slug from Notion’s **Slug** property, rather than the Gamma document ID.
The button says **Get this tool via WhatsApp**.

## Under a guide preview

Use the guide’s published website slug and `context=article`:

```text
https://planetsorted.com/embed/sor7ed-button?slug=adhd-admin-overwhelm-paperwork&context=article
```

The button says **Get this protocol via WhatsApp**. The send service resolves
the current protocol destination; it does not send the public article deck.

## General WhatsApp connection

For a page without a specific tool or guide:

```text
https://planetsorted.com/embed/sor7ed-button
```

This offers connection or connection settings. It never sends an unspecified
item or displays a delivery confirmation.

## Layout and behaviour

- Start with an embed height of **320px** so the mark and labels fit on phones.
- Keep the preview image, title and description outside the embed.
- Sign-in and WhatsApp connection links open in the top-level page, outside
  Gamma’s frame. They retain the requested item and return destination.
- Returning members whose number is already connected confirm the requested
  send after sign-in. Loading or prefetching that page never sends a message.
- Verified members can send directly when the browser provides their session
  to the frame. If third-party cookies are blocked, the button offers the same
  top-level sign-in and connection journey.
- A green tick appears only after the send service succeeds. A failed send
  offers a retry instead of claiming delivery.
- Native website previews already include their own item-specific button;
  changing this repository cannot insert blocks into your published Gamma deck.

These changes are not live until the pull request is merged and the deployment
finishes. Verify a published slug before adding its embed to Gamma.

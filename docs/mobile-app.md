# SOR7ED mobile app — 4 November 2026

The accessible PlanetSorted checkout, local history and connected repositories
contain no prior Expo/React Native/Capacitor project. Do not describe a native
app or App Store release as complete. Ask for the old builder/project link if
one exists before replacing it.

## Working foundation

`/install` explains adding the live site to iPhone/Android home screens.
`app/manifest.ts` supplies standalone mode, original white scribble on black
icons (including maskable safe area), and shortcuts to Brain Type, Toolbox and
Guidebooks. The shared website and Notion publication pipeline remain the only
content source. There are no extra hosting or app-store charges for this version.
No service worker or offline cache is installed: unpublished Notion resources,
account pages, sign-in links and private protocols must not be cached as an
outdated offline copy. Internet is required.

## WhatsApp handoff

Reserve a separate window synchronously on the user action, before asynchronous
verification/delivery, then navigate it only to a validated WhatsApp URL. Clear
its opener before leaving our origin. Close unused reservations on failure or
when no handoff is needed. Popup blockers retain the form and offer an explicit
open button. Never navigate away from the original request/code form, resend on
focus, infer delivery from opening WhatsApp, or accept arbitrary redirect hosts.

PlanetSorted uses magic links for sign-in, unlike the Button's code-based login.
The signup page checks this browser's authenticated Supabase user on return.
It does not import sessions from WhatsApp, another browser or a home-screen
app's isolated storage. A magic link opened in a separate browser may finish
there instead. True native app login will require verified universal/app links
and an explicit secure callback flow; this limitation is stated on `/install`.

## Next native milestone

Recover the earlier project, if supplied. Otherwise choose a native app shell
only after agreeing its scope. Reuse the public content pipeline, preserve
private delivery and opt-outs, add native callback handling, and test on physical
Android and iPhone before proposing store publication. No Apple/Google developer
fees, signing accounts or paid build services have been purchased or configured.

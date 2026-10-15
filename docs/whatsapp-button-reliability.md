# Website WhatsApp button reliability

This applies to `claudiokurath/planetsorted` and its existing Supabase/Meta
integration. The separate `sor7ed-button` partner product uses a different
database and migration history.

## API and user experience

- Every deliberate send has a UUID `idempotencyKey`. Repeating that key for the
  same authenticated user returns the original action, without sending again.
  Changing its requested content or delivery flags returns a conflict.
- The database claim and an Account `saved_items` backup commit together. Multiple
  actions for the same user/resource do not create duplicate backups.
- `GET /api/save-to-phone?actionId=<uuid>` checks an authenticated user's own
  request. It never sends a message and never returns another user's action.
- A Meta response containing one nonempty message ID means **accepted**, not
  delivered to the recipient's device. Only this state shows the success tick.
- Failed, skipped, pending and uncertain sends remain distinct. A timeout,
  malformed response or provider server error never triggers a fallback send.
  A different message format is attempted only after a definite HTTP 400
  rejection of the previous format.
- The client journals actions in user-scoped session storage and shares in-flight
  requests. Reloading or clicking again checks submitted actions. Pending and
  uncertain outcomes must not be automatically resent.
- A separate, deliberate retry is offered only for confirmed failed/skipped
  actions. It creates a new UUID; the original server record is retained.
- Verification codes retain the existing magic-link/WhatsApp connection flow.
  Reserving a code, applying send/attempt limits, linking the profile and consuming
  the successful code use database transactions. Only the code HMAC is stored.
  Send limits survive successful verification.

The API requires the action UUID. Older tabs that loaded before deployment need
to refresh; an untracked send is rejected rather than receiving a new server-side
identity on each retry.

## Migration and release

Apply `20261013162726_website_whatsapp_actions.sql` to the website's Supabase
project before the new application deployment. It adds the private action table,
an Account-backup lookup index and four service-role-only RPCs. It also explicitly
revokes browser access to the existing private OTP table. It does not change
customer profile data, public content, private PDF routes or Meta templates.

This migration was applied to the existing website Supabase project on
2026-10-13. Read-only verification confirmed RLS, denied browser access and
service-role-only function execution. No customer messages were sent. The
application changes still require the normal PR/Preview/merge deployment flow.

The functions use `SECURITY INVOKER` and an empty search path. Per-user advisory
locks coordinate claim/OTP operations without granting access to `auth.users`.
No provider request runs while a database lock is held.

After migration, confirm RLS and browser permission denial, then test the PR
Preview before merging. No new secrets, cron schedules or external service
provisioning are required. To roll back application behavior, revert the PR;
the additive database objects can remain safely in place.

## Verification

Run `npm test`, `npx tsc --noEmit`, lint on the changed files, and `npm run build`.
The unit/route tests mock Meta and Supabase and never send real messages.

`scripts/test-whatsapp-actions.mjs` exercises the migration against real disposable
PostgreSQL. It requires `pg` available to Node and
`SOR7ED_TEST_ADMIN_URL=postgres://sor7ed_test:<local-password>@127.0.0.1:<port>/postgres`.
It rejects remote hosts and production environment variables, and recreates only
the fixed local database `planet_button_tests`. It verifies concurrency, owner
isolation, rollback, limits and service-role privileges without Auth-table access.

`scripts/check-whatsapp-button-browser.mjs` exercises the production components
with mocked browser responses. It temporarily creates a test route, runs a local
Next development server, then removes the route. Its requirements and invocation
are documented in the script.

## Limits of this change

This records provider acceptance; it does not add webhook delivery/read tracking
or a durable background delivery queue. If a server crashes after Meta accepted
the message but before storing the outcome, status becomes uncertain rather than
authorizing a second send. A pending action older than two minutes also displays
as uncertain, while retaining its original identity.

## Separate Button domain

The intended domain split is `sor7ed.com` for the standalone partner Button and
`planetsorted.com` for this website. Existing Meta cards may still have an
approved `sor7ed.com/` template base with the `go/<slug>` suffix. Before moving
that hostname, the Button deployment must preserve `/go/:slug` and `/r/:slug`
redirects to the matching `planetsorted.com` routes, including query strings.
The website's private protocol access checks must remain on the website.

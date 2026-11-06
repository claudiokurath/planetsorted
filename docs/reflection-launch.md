# Public reflection pages — 3 November 2026

These are directly requested campaign experiences, separate from the Notion-controlled Toolbox/Guidebook catalogue. Publishing these pages does not publish any additional Notion tools. Homepage entry remains the existing Brain Sorter.

| Address | Experience | Storage |
| --- | --- | --- |
| `/brain-type` | Existing 12-question Brain Sorter | Page memory only |
| `/hidden-strength` | Five untimed challenges: predict, play, rate, reveal | Page memory only |
| `/hidden-strength-test` | Permanent redirect to the same Hidden Strength experience | Same experience |
| `/self-perception-gap` | Three tasks, two independent rounds each; prediction/performance report | Browser localStorage `spg.session.v1`; Clear this session deletes it |
| `/adhd-money-reset` | Six-step organisation form, calculated plan, print/export | Browser localStorage `sor7ed.money-reset.v1`; Clear my answers deletes it |

The Hidden Strength bundles describe revisions of the same five tasks, not two separate validated assessments. The larger handoff supplies task data and snapshot rules; the other address remains an alias. Brain Type's supplied handoff already matches its existing route; its corrected answer-share bars and live Notion recommendations remain.

No quiz answers or financial inputs are sent to Supabase, Notion, WhatsApp or an AI service. Money sample results never overwrite personal answers and printed sample plans are marked as examples. Browser storage can be unavailable; Money Reset reports that and still works in memory. Hidden Strength reload starts over. These are reflections/planning aids, not diagnoses, intelligence measures or financial advice.

## Implementation

Native Next.js routes and bundled React components. No prototype iframe, HTML-string renderer, browser Babel, CDN React, `window.genspark`, or design Tweaks panel. Authored task/metric/calculation data are pure modules under `lib/reflections`; CSS resets and animations are scoped to the appropriate app. Self-Perception's distinct study/find grids and second-round cursor were corrected. Rule-switch inputs are synchronously locked and their timers are cleaned up.

Money Reset's prototype Premium/waitlist simulation is removed from the launch UI; there is no price, purchase or fake subscription. The provided plan/export are accessible in this release. The pressure score is explicitly an illustrative indicator. A shortfall is labelled before the suggested allocation so it cannot be mistaken for a funded transfer plan.

`project (3).zip` contains a separate Admin Email Writer relying on a Genspark-only completion API. It is not published as part of the quiz launch. No broken AI calls or hardcoded credentials were ported.

## Verification

Meaningful unit coverage checks task-specific score bands, non-fabricated highlights, enjoyment/effort separation, prediction calibration, weekly/monthly income and budget shortfalls. Browser checks cover full task/form journeys, independent rounds, skip minimums, reload/resume/deletion, sample isolation, print/export, both viewport widths and alias routing. Poster QR payloads are decoded and their final live destinations checked after deployment.

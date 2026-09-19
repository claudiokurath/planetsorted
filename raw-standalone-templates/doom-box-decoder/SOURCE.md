# Doom Box Decoder — Source Prototype

This file wraps the complete standalone HTML prototype for **Doom Box Decoder**, the second tool in the SOR7ED Toolkit and a sibling of Life Admin Inbox.

The design is a single self-contained `index.html`: no build step, no dependencies, no CDN. Open it directly in a modern browser and every screen works end-to-end, including the demo dataset (5 realistic boxes) via the "See a demo" button.

## What this file is for

- **Archival copy** of the design-time prototype, preserved verbatim alongside `README.md`.
- **Reference for developers** re-implementing this in production — the HTML/CSS/JS in the fence below is the source of truth for layout, tokens, copy, and interaction behaviour.
- The scoring engine (`scoreMatch`, `levDistance`), voice-transcript splitter, filename heuristic, and label builder are all in this file and should be **ported verbatim** into the production stack. The DOM/CSS layer should be re-implemented in the target codebase's component library.

## How to use it

1. Copy the block between the ```html fences below into a file called `index.html`.
2. Open it in Chrome, Safari, or Edge.
3. Click **See a demo** on the landing page to explore all screens with pre-loaded data.
4. Click **Upgrade** anywhere to flip the local `isPaid` flag and unlock the gated screens (print sheet, export, photo persistence).

For the full screen-by-screen breakdown, design tokens, state model, and production notes, see `README.md` in this bundle.

---

## The prototype (verbatim)

```html
<!DOCTYPE html>
<html data-om-id="b5e59dd6:om-html-1" data-src-ver="b5e59dd6" lang="en">
<head data-om-id="b5e59dd6:om-head-1">
<meta charset="UTF-8"  data-om-id="b5e59dd6:om-meta-1"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"  data-om-id="b5e59dd6:om-meta-2"/>
<title data-om-id="b5e59dd6:om-title-1" data-om-text-id="txt:doom_box_decoder/index.html:145:172">Doom Box Decoder — SOR7ED</title>
<style data-om-id="b5e59dd6:om-style-1" data-om-text-id="txt:doom_box_decoder/index.html:188:23112">
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0b; --bg2: #111114; --bg3: #16161a; --bg4: #1e1e24; --border: #2a2a35;
    --text: #f0f0f5; --muted: #9090a8; --dim: #5a5a70;

    /* Doom Box accent = teal (sibling of Life Admin Inbox's yellow) */
    --accent: #5eead4; --accentbg: rgba(94,234,212,.12); --accentborder: rgba(94,234,212,.3);
    --accent-hover: #7cf5e0;

    /* Semantic colours — kept identical to Life Admin Inbox */
    --yellow: #f5c518; --yellowbg: rgba(245,197,24,.12);
    --green: #22c55e; --greenbg: rgba(34,197,94,.12);
    --orange: #f97316; --orangebg: rgba(249,115,22,.12);
    --red: #ef4444; --redbg: rgba(239,68,68,.12);
    --blue: #60a5fa; --bluebg: rgba(96,165,250,.12);
    --purple: #a78bfa; --purplebg: rgba(167,139,250,.12);
    --pink: #f472b6; --pinkbg: rgba(244,114,182,.12);

    --radius: 16px; --radius-sm: 10px;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; min-height: 100vh; }
  button { cursor: pointer; font-family: inherit; font-size: inherit; border: none; }
  input, textarea, select { font-family: inherit; font-size: inherit; background: var(--bg2); color: var(--text); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; width: 100%; outline: none; transition: border-color .2s; }
  input:focus, textarea:focus, select:focus { border-color: var(--accent); }
  select option { background: var(--bg2); }
  a { color: var(--accent); text-decoration: none; }

  .screen { display: none; } .screen.active { display: block; }
  .container { max-width: 960px; margin: 0 auto; padding: 0 16px; }
  .container-sm { max-width: 680px; margin: 0 auto; padding: 0 16px; }

  /* NAV */
  nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,11,.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .nav-brand-wrap { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .nav-brand { font-weight: 800; font-size: 16px; letter-spacing: -.3px; white-space: nowrap; }
  .nav-brand span { color: var(--accent); }
  .sor-mark { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--dim); border-left: 1px solid var(--border); padding-left: 10px; white-space: nowrap; }
  .sor-mark b { color: var(--muted); }
  .nav-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
  .badge-paid { background: var(--accentbg); color: var(--accent); border: 1px solid var(--accentborder); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: .5px; }
  @media (max-width: 560px) { .sor-mark { display: none; } }

  /* BUTTONS */
  .btn { display: inline-flex; align-items: center; gap: 6px; border-radius: var(--radius-sm); padding: 10px 20px; font-weight: 600; transition: all .15s; }
  .btn-primary { background: var(--accent); color: #0a0a0b; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-primary:disabled { opacity: .4; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: var(--text); border: 1.5px solid var(--border); }
  .btn-ghost:hover { border-color: var(--muted); }
  .btn-danger-ghost { background: transparent; color: var(--muted); border: 1.5px solid var(--border); }
  .btn-danger-ghost:hover { border-color: var(--red); color: var(--red); }
  .btn-sm { padding: 6px 14px; font-size: 13px; }

  /* CARDS */
  .card { background: var(--bg3); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 20px; }

  /* LANDING */
  #landing { padding-bottom: 80px; }
  .hero { text-align: center; padding: 72px 20px 48px; }
  .hero-pill { display: inline-block; background: var(--accentbg); border: 1px solid var(--accentborder); color: var(--accent); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 5px 16px; border-radius: 100px; margin-bottom: 24px; }
  .hero h1 { font-size: clamp(32px, 6vw, 60px); font-weight: 900; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 20px; text-wrap: balance; }
  .hero h1 span { color: var(--accent); }
  .hero p { font-size: 18px; color: var(--muted); max-width: 560px; margin: 0 auto 36px; text-wrap: pretty; }
  .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .hero-ctas .btn { padding: 14px 28px; font-size: 16px; border-radius: 12px; }

  /* Painted "how it works" strip */
  .how-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 720px; margin: 48px auto 0; padding: 0 20px; }
  @media (max-width: 620px) { .how-strip { grid-template-columns: 1fr; } }
  .how-step { background: var(--bg3); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 18px; text-align: left; }
  .how-num { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: var(--accentbg); color: var(--accent); font-size: 12px; font-weight: 800; margin-bottom: 10px; }
  .how-step h4 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .how-step p { font-size: 13px; color: var(--muted); }

  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 56px; }
  .feature-card { background: var(--bg3); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 24px; }
  .feature-icon { font-size: 28px; margin-bottom: 12px; }
  .feature-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .feature-card p { font-size: 13px; color: var(--muted); }

  .pricing-section { margin-top: 80px; text-align: center; }
  .pricing-section h2 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
  .pricing-section > p { color: var(--muted); margin-bottom: 40px; }
  .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 620px; margin: 0 auto; }
  @media (max-width: 520px) { .pricing-grid { grid-template-columns: 1fr; } }
  .plan-card { background: var(--bg3); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 28px; text-align: left; }
  .plan-card.featured { border-color: var(--accent); background: rgba(94,234,212,.05); }
  .plan-name { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); margin-bottom: 8px; }
  .plan-price { font-size: 32px; font-weight: 900; margin-bottom: 4px; }
  .plan-price span { font-size: 16px; font-weight: 400; color: var(--muted); }
  .plan-features { list-style: none; margin: 16px 0; }
  .plan-features li { font-size: 13px; color: var(--muted); padding: 4px 0; }
  .plan-features li::before { content: "✓  "; color: var(--green); }
  .plan-features li.locked::before { content: "✕  "; color: var(--dim); }
  .plan-features li.locked { color: var(--dim); }

  /* CAPTURE SCREEN */
  #capture { padding: 32px 0 100px; }
  .cap-header { text-align: center; margin-bottom: 24px; }
  .cap-header h2 { font-size: 28px; font-weight: 800; margin-bottom: 8px; text-wrap: balance; }
  .cap-header p { color: var(--muted); }
  .mode-tabs { display: flex; gap: 6px; margin: 0 auto 24px; justify-content: center; background: var(--bg3); padding: 4px; border-radius: 100px; border: 1px solid var(--border); width: fit-content; max-width: 100%; flex-wrap: wrap; }
  .mode-tab { padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 600; background: transparent; color: var(--muted); transition: all .2s; }
  .mode-tab.active { background: var(--accentbg); color: var(--accent); }

  /* Photo mode */
  .photo-dropzone { border: 2px dashed var(--border); border-radius: var(--radius); padding: 40px 20px; text-align: center; background: var(--bg2); transition: border-color .2s, background .2s; cursor: pointer; }
  .photo-dropzone:hover, .photo-dropzone.dragover { border-color: var(--accent); background: rgba(94,234,212,.03); }
  .photo-dropzone-icon { font-size: 44px; margin-bottom: 12px; }
  .photo-dropzone h4 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .photo-dropzone p { font-size: 13px; color: var(--muted); }
  .photo-dropzone .btn { margin-top: 16px; }
  .photo-preview { display: none; }
  .photo-preview.show { display: block; }
  .photo-preview img { max-width: 100%; max-height: 320px; border-radius: var(--radius); border: 1.5px solid var(--border); display: block; margin: 0 auto 16px; }

  /* Voice mode */
  .voice-panel { background: var(--bg3); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 32px; text-align: center; }
  .voice-status { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .voice-mic-btn { display: inline-flex; align-items: center; justify-content: center; width: 88px; height: 88px; border-radius: 50%; background: var(--accentbg); border: 2px solid var(--accentborder); color: var(--accent); font-size: 36px; transition: all .2s; }
  .voice-mic-btn:hover { background: var(--accent); color: #0a0a0b; }
  .voice-mic-btn.recording { background: var(--red); color: white; border-color: var(--red); animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.4); } 50% { box-shadow: 0 0 0 16px rgba(239,68,68,0); } }
  .voice-transcript { margin-top: 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; font-size: 14px; color: var(--muted); min-height: 60px; text-align: left; }
  .voice-transcript.has-content { color: var(--text); }
  .voice-unsupported { background: var(--orangebg); border: 1px solid rgba(249,115,22,.3); color: var(--orange); padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; }

  /* Type mode */
  .type-textarea { min-height: 200px; resize: vertical; font-size: 16px; line-height: 1.7; border-radius: var(--radius); padding: 18px; }
  .type-helper { font-size: 12px; color: var(--dim); margin-top: 8px; }

  /* Contents review — shared across all 3 modes */
  .contents-review { margin-top: 24px; }
  .contents-review h3 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
  .contents-review h3 .count { color: var(--accent); }
  .contents-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px; background: var(--bg2); border: 1.5px solid var(--border); border-radius: var(--radius); min-height: 64px; }
  .contents-chips.empty { color: var(--dim); font-size: 13px; align-items: center; }
  .content-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px 6px 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: 100px; font-size: 13px; }
  .content-chip button { background: none; border: none; color: var(--dim); padding: 0 2px; font-size: 15px; line-height: 1; }
  .content-chip button:hover { color: var(--red); }
  .add-chip-row { display: flex; gap: 8px; margin-top: 8px; }
  .add-chip-row input { flex: 1; }

  /* Box meta grid */
  .box-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
  @media (max-width: 560px) { .box-meta-grid { grid-template-columns: 1fr; } }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
  .form-hint { font-size: 11px; color: var(--dim); }

  .cap-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; flex-wrap: wrap; gap: 12px; }
  .cap-count { font-size: 12px; color: var(--dim); }

  /* BOX SAVED / LABEL */
  #box-saved { padding: 32px 0 100px; }
  .saved-header { text-align: center; margin-bottom: 32px; }
  .saved-header .tick { font-size: 40px; margin-bottom: 8px; }
  .saved-header h2 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
  .saved-header p { color: var(--muted); font-size: 14px; }

  .label-preview { max-width: 420px; margin: 0 auto 24px; background: white; color: #111; border-radius: 12px; padding: 24px; font-family: -apple-system, sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,.4); }
  .label-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; border-bottom: 2px dashed #ccc; padding-bottom: 14px; }
  .label-num { font-size: 44px; font-weight: 900; line-height: 1; letter-spacing: -1px; color: #111; }
  .label-num-sub { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-top: 2px; }
  .label-qr { width: 72px; height: 72px; flex-shrink: 0; padding: 4px; background: white; border: 1px solid #eee; border-radius: 4px; }
  .label-qr svg { display: block; width: 100%; height: 100%; }
  .label-summary { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 6px; line-height: 1.4; }
  .label-room { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #666; margin-bottom: 12px; }
  .label-contents { font-size: 12px; color: #333; line-height: 1.5; margin-bottom: 12px; }
  .label-footer { display: flex; justify-content: space-between; font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: .5px; border-top: 1px solid #eee; padding-top: 10px; }
  .label-footer .brand { font-weight: 700; color: #111; }

  .saved-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

  /* SEARCH */
  #search { padding: 32px 0 100px; }
  .search-header { margin-bottom: 20px; text-align: center; }
  .search-header h2 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
  .search-header p { color: var(--muted); font-size: 14px; }
  .search-bar-wrap { position: relative; margin-bottom: 24px; }
  .search-bar { padding: 16px 20px 16px 48px; font-size: 16px; border-radius: 12px; }
  .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 20px; pointer-events: none; }
  .search-summary { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
  .search-summary b { color: var(--text); }
  .search-empty { text-align: center; padding: 60px 20px; color: var(--muted); }
  .search-empty .icon { font-size: 40px; margin-bottom: 12px; opacity: .6; }
  .result-card { background: var(--bg3); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 18px; margin-bottom: 12px; cursor: pointer; transition: border-color .2s; }
  .result-card:hover { border-color: var(--accent); }
  .result-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
  .result-box-tag { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: .5px; }
  .result-room { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
  .result-summary { font-size: 15px; font-weight: 600; margin-bottom: 10px; }
  .result-matches { display: flex; flex-wrap: wrap; gap: 6px; }
  .match-chip { font-size: 12px; padding: 3px 10px; border-radius: 100px; background: var(--bg2); border: 1px solid var(--border); color: var(--muted); }
  .match-chip.hit { background: var(--accentbg); color: var(--accent); border-color: var(--accentborder); }
  .result-meta { font-size: 11px; color: var(--dim); margin-top: 10px; }

  /* ALL BOXES */
  #boxes { padding: 32px 0 100px; }
  .boxes-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
  .boxes-header h2 { font-size: 24px; font-weight: 800; }
  .boxes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .box-card { background: var(--bg3); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 18px; cursor: pointer; transition: border-color .2s; display: flex; flex-direction: column; gap: 8px; }
  .box-card:hover { border-color: var(--accent); }
  .box-card-num { font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1; color: var(--accent); }
  .box-card-room { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); }
  .box-card-summary { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.4; }
  .box-card-meta { font-size: 12px; color: var(--dim); margin-top: auto; }

  /* BOX DETAIL */
  #box-detail { padding: 32px 0 100px; }
  .detail-back { font-size: 13px; color: var(--muted); margin-bottom: 12px; display: inline-flex; align-items: center; gap: 4px; }
  .detail-back:hover { color: var(--accent); }
  .detail-grid { display: grid; grid-template-columns: 420px 1fr; gap: 24px; align-items: start; }
  @media (max-width: 780px) { .detail-grid { grid-template-columns: 1fr; } }
  .detail-side { display: flex; flex-direction: column; gap: 16px; }
  .detail-photo { width: 100%; border-radius: var(--radius); border: 1.5px solid var(--border); display: block; }
  .detail-info h2 { font-size: 28px; font-weight: 900; margin-bottom: 6px; }
  .detail-info .detail-summary { font-size: 16px; color: var(--muted); margin-bottom: 20px; }
  .detail-contents-list { list-style: none; }
  .detail-contents-list li { padding: 10px 12px; background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 6px; font-size: 14px; display: flex; align-items: center; gap: 8px; }
  .detail-contents-list li::before { content: "•"; color: var(--accent); font-weight: 800; }
  .detail-actions { display: flex; gap: 8px; margin-top: 20px; flex-wrap: wrap; }

  /* Locked overlay */
  .locked-overlay { background: var(--bg3); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 32px; text-align: center; }
  .locked-overlay .lock-icon { font-size: 32px; margin-bottom: 12px; }
  .locked-overlay h3 { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
  .locked-overlay p { color: var(--muted); font-size: 14px; max-width: 380px; margin: 0 auto 20px; }

  /* PRINT SHEET */
  #print-sheet { padding: 32px 0 100px; }
  .print-actions { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
  .a4-sheet { background: white; color: #111; max-width: 794px; margin: 0 auto; padding: 40px 32px; border-radius: 12px; }
  .a4-labels { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .a4-label { border: 2px dashed #bbb; border-radius: 8px; padding: 16px; font-family: -apple-system, sans-serif; page-break-inside: avoid; break-inside: avoid; }
  .a4-label .label-header { padding-bottom: 10px; margin-bottom: 10px; }
  .a4-label .label-num { font-size: 34px; }
  .a4-label .label-qr { width: 56px; height: 56px; }
  .a4-label .label-summary { font-size: 13px; margin-bottom: 4px; }
  .a4-label .label-contents { font-size: 11px; }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; opacity: 0; pointer-events: none; transition: opacity .25s; }
  .modal-overlay.open { opacity: 1; pointer-events: all; }
  .modal { background: var(--bg3); border: 1.5px solid var(--border); border-radius: 20px; padding: 32px; max-width: 480px; width: 100%; transform: translateY(16px); transition: transform .25s; position: relative; }
  .modal-overlay.open .modal { transform: translateY(0); }
  .modal h2 { font-size: 22px; font-weight: 900; margin-bottom: 6px; }
  .modal .modal-sub { font-size: 14px; color: var(--muted); margin-bottom: 24px; }
  .modal-features { list-style: none; margin-bottom: 24px; }
  .modal-features li { font-size: 14px; padding: 6px 0; border-bottom: 1px solid var(--border); color: var(--muted); }
  .modal-features li::before { content: "✓  "; color: var(--green); font-weight: 700; }
  .modal-close { position: absolute; top: 16px; right: 20px; background: none; border: none; color: var(--muted); font-size: 22px; }
  .modal-price { font-size: 28px; font-weight: 900; margin-bottom: 20px; }
  .modal-price span { font-size: 14px; font-weight: 400; color: var(--muted); }
  .modal-footer { font-size: 11px; color: var(--dim); text-align: center; margin-top: 12px; }

  /* Confirm modal */
  .modal-danger { text-align: center; }
  .modal-danger .btn-row { display: flex; gap: 8px; justify-content: center; margin-top: 20px; }

  /* Disclaimer + toast */
  .disclaimer-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(10,10,11,.96); border-top: 1px solid var(--border); padding: 8px 16px; text-align: center; font-size: 11px; color: var(--dim); z-index: 50; }
  .toast { position: fixed; bottom: 60px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--bg4); border: 1px solid var(--border); border-radius: 100px; padding: 10px 20px; font-size: 13px; font-weight: 600; opacity: 0; transition: all .3s; pointer-events: none; z-index: 200; white-space: nowrap; }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* Free-tier counter */
  .free-counter { font-size: 11px; color: var(--muted); padding: 4px 10px; border: 1px solid var(--border); border-radius: 100px; }
  .free-counter b { color: var(--text); }
  .free-counter.full { color: var(--orange); border-color: rgba(249,115,22,.3); }

  /* Utility */
  .mt-4{margin-top:16px}.mt-6{margin-top:24px}.mb-4{margin-bottom:16px}.mb-6{margin-bottom:24px}
  .flex{display:flex}.gap-2{gap:8px}.items-center{align-items:center}.justify-between{justify-content:space-between}
  .text-muted{color:var(--muted)}.text-sm{font-size:13px}.w-full{width:100%}.text-center{text-align:center}.hidden{display:none!important}

  /* Print */
  @media print {
    nav, .disclaimer-bar, .print-actions, .toast, .modal-overlay, .saved-actions, .detail-actions, .detail-back { display: none !important; }
    body { background: white; color: #111; }
    #print-sheet, #box-saved { padding: 0; }
    .a4-sheet { box-shadow: none; padding: 0; max-width: none; border-radius: 0; }
    .label-preview { box-shadow: none; margin: 0 auto; }
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--bg); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* Motion */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn .4s ease forwards; }
</style>
</head>
<body data-om-id="b5e59dd6:om-body-1">

<nav data-om-id="b5e59dd6:om-nav-1" id="main-nav">
  <div data-om-id="b5e59dd6:om-div-1" class="nav-brand-wrap">
    <div data-om-id="b5e59dd6:om-div-2" class="nav-brand">Doom Box <span data-om-id="b5e59dd6:om-span-1" data-om-text-id="txt:doom_box_decoder/index.html:23230:23237">Decoder</span></div>
    <div data-om-id="b5e59dd6:om-div-3" class="sor-mark">part of <b data-om-id="b5e59dd6:om-b-1" data-om-text-id="txt:doom_box_decoder/index.html:23288:23294">SOR7ED</b></div>
  </div>
  <div data-om-id="b5e59dd6:om-div-4" class="nav-actions">
    <span data-om-id="b5e59dd6:om-span-2" id="free-counter" class="free-counter hidden"><b data-om-id="b5e59dd6:om-b-2" data-om-text-id="txt:doom_box_decoder/index.html:23417:23418" id="free-count">0</b>/3 boxes</span>
    <span data-om-id="b5e59dd6:om-span-3" data-om-text-id="txt:doom_box_decoder/index.html:23490:23497" id="paid-badge" class="badge-paid hidden">Premium</span>
    <button data-om-id="b5e59dd6:om-button-1" data-om-text-id="txt:doom_box_decoder/index.html:23604:23610" class="btn btn-ghost btn-sm hidden" id="nav-search-btn" onclick="showScreen('search')">Search</button>
    <button data-om-id="b5e59dd6:om-button-2" data-om-text-id="txt:doom_box_decoder/index.html:23717:23725" class="btn btn-ghost btn-sm hidden" id="nav-boxes-btn" onclick="showScreen('boxes')">My boxes</button>
    <button data-om-id="b5e59dd6:om-button-3" data-om-text-id="txt:doom_box_decoder/index.html:23797:23801" class="btn btn-ghost btn-sm" onclick="loadDemo()">Demo</button>
    <button data-om-id="b5e59dd6:om-button-4" data-om-text-id="txt:doom_box_decoder/index.html:23899:23906" class="btn btn-primary btn-sm" id="nav-upgrade-btn" onclick="openUpgrade()">Upgrade</button>
    <button data-om-id="b5e59dd6:om-button-5" data-om-text-id="txt:doom_box_decoder/index.html:24007:24016" class="btn btn-primary btn-sm hidden" id="nav-new-btn" onclick="startNewBox()">+ New box</button>
  </div>
</nav>

<!-- LANDING -->
<div data-om-id="b5e59dd6:om-div-5" id="landing" class="screen active">
  <div data-om-id="b5e59dd6:om-div-6" class="container">
    <div data-om-id="b5e59dd6:om-div-7" class="hero">
      <div data-om-id="b5e59dd6:om-div-8" data-om-text-id="txt:doom_box_decoder/index.html:24179:24215" class="hero-pill">✦ Never lose a spare charger again</div>
      <h1 data-om-id="b5e59dd6:om-h1-1">Photograph a box.<br data-om-id="b5e59dd6:om-br-1"><span data-om-id="b5e59dd6:om-span-4" data-om-text-id="txt:doom_box_decoder/index.html:24259:24291">Find what's in it, months later.</span></h1>
      <p data-om-id="b5e59dd6:om-p-1" data-om-text-id="txt:doom_box_decoder/index.html:24313:24505">Panic-tidied everything into a random box? Snap it, say it, or type it. Get a printable label and a searchable memory — so "spare phone charger" is a two-second lookup, not a lost afternoon.</p>
      <div data-om-id="b5e59dd6:om-div-9" class="hero-ctas">
        <button data-om-id="b5e59dd6:om-button-6" data-om-text-id="txt:doom_box_decoder/index.html:24604:24617" class="btn btn-primary" onclick="startNewBox()">Log a box →</button>
        <button data-om-id="b5e59dd6:om-button-7" data-om-text-id="txt:doom_box_decoder/index.html:24686:24696" class="btn btn-ghost" onclick="loadDemo()">See a demo</button>
      </div>
    </div>

    <div data-om-id="b5e59dd6:om-div-10" class="how-strip">
      <div data-om-id="b5e59dd6:om-div-11" class="how-step">
        <div data-om-id="b5e59dd6:om-div-12" data-om-text-id="txt:doom_box_decoder/index.html:24817:24818" class="how-num">1</div>
        <h4 data-om-id="b5e59dd6:om-h4-1" data-om-text-id="txt:doom_box_decoder/index.html:24837:24855">Capture in seconds</h4>
        <p data-om-id="b5e59dd6:om-p-2" data-om-text-id="txt:doom_box_decoder/index.html:24872:24959">Snap a photo of what's going in, dictate a quick list, or type it. Whichever's fastest.</p>
      </div>
      <div data-om-id="b5e59dd6:om-div-13" class="how-step">
        <div data-om-id="b5e59dd6:om-div-14" data-om-text-id="txt:doom_box_decoder/index.html:25035:25036" class="how-num">2</div>
        <h4 data-om-id="b5e59dd6:om-h4-2" data-om-text-id="txt:doom_box_decoder/index.html:25055:25070">Print the label</h4>
        <p data-om-id="b5e59dd6:om-p-3" data-om-text-id="txt:doom_box_decoder/index.html:25087:25155">Every box gets a big number and QR — tape it on the outside. Done.</p>
      </div>
      <div data-om-id="b5e59dd6:om-div-15" class="how-step">
        <div data-om-id="b5e59dd6:om-div-16" data-om-text-id="txt:doom_box_decoder/index.html:25231:25232" class="how-num">3</div>
        <h4 data-om-id="b5e59dd6:om-h4-3" data-om-text-id="txt:doom_box_decoder/index.html:25251:25274">Search when you need it</h4>
        <p data-om-id="b5e59dd6:om-p-4" data-om-text-id="txt:doom_box_decoder/index.html:25291:25362">"Where's my passport photo?" → Box 04, spare room, packed last March.</p>
      </div>
    </div>

    <div data-om-id="b5e59dd6:om-div-17" class="features-grid">
      <div data-om-id="b5e59dd6:om-div-18" class="feature-card"><div data-om-id="b5e59dd6:om-div-19" data-om-text-id="txt:doom_box_decoder/index.html:25482:25486" class="feature-icon">📸</div><h3 data-om-id="b5e59dd6:om-h3-1" data-om-text-id="txt:doom_box_decoder/index.html:25496:25503">Snap it</h3><p data-om-id="b5e59dd6:om-p-5" data-om-text-id="txt:doom_box_decoder/index.html:25511:25572">One photo. We remember what's in the box even when you don't.</p></div>
      <div data-om-id="b5e59dd6:om-div-20" class="feature-card"><div data-om-id="b5e59dd6:om-div-21" data-om-text-id="txt:doom_box_decoder/index.html:25641:25648" class="feature-icon">🎙️</div><h3 data-om-id="b5e59dd6:om-h3-2" data-om-text-id="txt:doom_box_decoder/index.html:25658:25664">Say it</h3><p data-om-id="b5e59dd6:om-p-6" data-om-text-id="txt:doom_box_decoder/index.html:25672:25742">Rapid-fire dictate contents while you pack. Hands-free for panic mode.</p></div>
      <div data-om-id="b5e59dd6:om-div-22" class="feature-card"><div data-om-id="b5e59dd6:om-div-23" data-om-text-id="txt:doom_box_decoder/index.html:25811:25817" class="feature-icon">⌨️</div><h3 data-om-id="b5e59dd6:om-h3-3" data-om-text-id="txt:doom_box_decoder/index.html:25827:25834">Type it</h3><p data-om-id="b5e59dd6:om-p-7" data-om-text-id="txt:doom_box_decoder/index.html:25842:25908">One item per line, comma-separated, however you write. We sort it.</p></div>
      <div data-om-id="b5e59dd6:om-div-24" class="feature-card"><div data-om-id="b5e59dd6:om-div-25" data-om-text-id="txt:doom_box_decoder/index.html:25977:25984" class="feature-icon">🏷️</div><h3 data-om-id="b5e59dd6:om-h3-4" data-om-text-id="txt:doom_box_decoder/index.html:25994:26010">Printable labels</h3><p data-om-id="b5e59dd6:om-p-8" data-om-text-id="txt:doom_box_decoder/index.html:26018:26077">Big number + QR + human summary. Tape once, forget forever.</p></div>
      <div data-om-id="b5e59dd6:om-div-26" class="feature-card"><div data-om-id="b5e59dd6:om-div-27" data-om-text-id="txt:doom_box_decoder/index.html:26146:26150" class="feature-icon">🔎</div><h3 data-om-id="b5e59dd6:om-h3-5" data-om-text-id="txt:doom_box_decoder/index.html:26160:26174">Instant search</h3><p data-om-id="b5e59dd6:om-p-9" data-om-text-id="txt:doom_box_decoder/index.html:26182:26246">Fuzzy match across every box, room, and item you've ever packed.</p></div>
      <div data-om-id="b5e59dd6:om-div-28" class="feature-card"><div data-om-id="b5e59dd6:om-div-29" data-om-text-id="txt:doom_box_decoder/index.html:26315:26319" class="feature-icon">💸</div><h3 data-om-id="b5e59dd6:om-h3-6" data-om-text-id="txt:doom_box_decoder/index.html:26329:26344">Never buy twice</h3><p data-om-id="b5e59dd6:om-p-10" data-om-text-id="txt:doom_box_decoder/index.html:26352:26421">Stop replacing things you already own. Object permanence, outsourced.</p></div>
    </div>

    <div data-om-id="b5e59dd6:om-div-30" class="pricing-section">
      <h2 data-om-id="b5e59dd6:om-h2-1" data-om-text-id="txt:doom_box_decoder/index.html:26488:26502">Simple pricing</h2>
      <p data-om-id="b5e59dd6:om-p-11" data-om-text-id="txt:doom_box_decoder/index.html:26517:26583">Start free. Upgrade when your house has more boxes than furniture.</p>
      <div data-om-id="b5e59dd6:om-div-31" class="pricing-grid">
        <div data-om-id="b5e59dd6:om-div-32" class="plan-card">
          <div data-om-id="b5e59dd6:om-div-33" data-om-text-id="txt:doom_box_decoder/index.html:26686:26690" class="plan-name">Free</div>
          <div data-om-id="b5e59dd6:om-div-34" class="plan-price">£0 <span data-om-id="b5e59dd6:om-span-5" data-om-text-id="txt:doom_box_decoder/index.html:26741:26750">/ forever</span></div>
          <ul data-om-id="b5e59dd6:om-ul-1" class="plan-features">
            <li data-om-id="b5e59dd6:om-li-1" data-om-text-id="txt:doom_box_decoder/index.html:26817:26834">Log up to 3 boxes</li>
            <li data-om-id="b5e59dd6:om-li-2" data-om-text-id="txt:doom_box_decoder/index.html:26856:26884">Photo, voice or type capture</li>
            <li data-om-id="b5e59dd6:om-li-3" data-om-text-id="txt:doom_box_decoder/index.html:26906:26920">Instant search</li>
            <li data-om-id="b5e59dd6:om-li-4" data-om-text-id="txt:doom_box_decoder/index.html:26942:26960">Print single label</li>
            <li data-om-id="b5e59dd6:om-li-5" data-om-text-id="txt:doom_box_decoder/index.html:26997:27012" class="locked">Unlimited boxes</li>
            <li data-om-id="b5e59dd6:om-li-6" data-om-text-id="txt:doom_box_decoder/index.html:27049:27072" class="locked">Print full label sheets</li>
            <li data-om-id="b5e59dd6:om-li-7" data-om-text-id="txt:doom_box_decoder/index.html:27109:27137" class="locked">Export manifest (CSV / JSON)</li>
          </ul>
          <button data-om-id="b5e59dd6:om-button-8" data-om-text-id="txt:doom_box_decoder/index.html:27230:27241" class="btn btn-ghost w-full" onclick="startNewBox()">Get started</button>
        </div>
        <div data-om-id="b5e59dd6:om-div-35" class="plan-card featured">
          <div data-om-id="b5e59dd6:om-div-36" data-om-text-id="txt:doom_box_decoder/index.html:27340:27347" class="plan-name">Premium</div>
          <div data-om-id="b5e59dd6:om-div-37" class="plan-price">£4 <span data-om-id="b5e59dd6:om-span-6" data-om-text-id="txt:doom_box_decoder/index.html:27398:27405">/ month</span></div>
          <ul data-om-id="b5e59dd6:om-ul-2" class="plan-features">
            <li data-om-id="b5e59dd6:om-li-8" data-om-text-id="txt:doom_box_decoder/index.html:27472:27490">Everything in Free</li>
            <li data-om-id="b5e59dd6:om-li-9" data-om-text-id="txt:doom_box_decoder/index.html:27512:27527">Unlimited boxes</li>
            <li data-om-id="b5e59dd6:om-li-10" data-om-text-id="txt:doom_box_decoder/index.html:27549:27579">Print sheets (8 labels per A4)</li>
            <li data-om-id="b5e59dd6:om-li-11" data-om-text-id="txt:doom_box_decoder/index.html:27601:27621">Export full manifest</li>
            <li data-om-id="b5e59dd6:om-li-12" data-om-text-id="txt:doom_box_decoder/index.html:27643:27668">Room filters and grouping</li>
            <li data-om-id="b5e59dd6:om-li-13" data-om-text-id="txt:doom_box_decoder/index.html:27690:27713">Photo attachments saved</li>
            <li data-om-id="b5e59dd6:om-li-14" data-om-text-id="txt:doom_box_decoder/index.html:27735:27751">Priority support</li>
          </ul>
          <button data-om-id="b5e59dd6:om-button-9" data-om-text-id="txt:doom_box_decoder/index.html:27846:27857" class="btn btn-primary w-full" onclick="openUpgrade()">Upgrade now</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- CAPTURE -->
<div data-om-id="b5e59dd6:om-div-38" data-om-text-id="txt:doom_box_decoder/index.html:27973:32263" id="capture" class="screen">
  <div data-om-id="b5e59dd6:om-div-39" class="container-sm">
    <div data-om-id="b5e59dd6:om-div-40" class="cap-header">
      <h2 data-om-id="b5e59dd6:om-h2-2" data-om-text-id="txt:doom_box_decoder/index.html:28042:28067">What's going in this box?</h2>
      <p data-om-id="b5e59dd6:om-p-12" data-om-text-id="txt:doom_box_decoder/index.html:28082:28126">Fastest method wins. Nobody is grading this.</p>
    </div>

    <div data-om-id="b5e59dd6:om-div-41" class="mode-tabs" role="tablist">
      <button data-om-id="b5e59dd6:om-button-10" data-om-text-id="txt:doom_box_decoder/index.html:28269:28279" class="mode-tab active" id="tab-photo" onclick="switchMode('photo')">📸 Photo</button>
      <button data-om-id="b5e59dd6:om-button-11" data-om-text-id="txt:doom_box_decoder/index.html:28365:28378" class="mode-tab" id="tab-voice" onclick="switchMode('voice')">🎙️ Voice</button>
      <button data-om-id="b5e59dd6:om-button-12" data-om-text-id="txt:doom_box_decoder/index.html:28462:28473" class="mode-tab" id="tab-type" onclick="switchMode('type')">⌨️ Type</button>
    </div>

    <!-- PHOTO MODE -->
    <div data-om-id="b5e59dd6:om-div-42" id="mode-photo">
      <div data-om-id="b5e59dd6:om-div-43" class="photo-dropzone" id="photo-dropzone" onclick="document.getElementById('photo-input').click()">
        <div data-om-id="b5e59dd6:om-div-44" data-om-text-id="txt:doom_box_decoder/index.html:28698:28702" class="photo-dropzone-icon">📸</div>
        <h4 data-om-id="b5e59dd6:om-h4-4" data-om-text-id="txt:doom_box_decoder/index.html:28721:28757">Snap or drop a photo of the contents</h4>
        <p data-om-id="b5e59dd6:om-p-13" data-om-text-id="txt:doom_box_decoder/index.html:28774:28842">Then edit the auto-generated list below. Doesn't need to be perfect.</p>
        <button data-om-id="b5e59dd6:om-button-13" data-om-text-id="txt:doom_box_decoder/index.html:28976:28988" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); document.getElementById('photo-input').click()">Choose photo</button>
        <input type="file" id="photo-input" accept="image/*" capture="environment" style="display:none"  data-om-id="b5e59dd6:om-input-1"/>
      </div>
      <div data-om-id="b5e59dd6:om-div-45" class="photo-preview" id="photo-preview">
        <img id="photo-img" alt="Box contents"  data-om-id="b5e59dd6:om-img-1"/>
        <div data-om-id="b5e59dd6:om-div-46" class="text-center">
          <button data-om-id="b5e59dd6:om-button-14" data-om-text-id="txt:doom_box_decoder/index.html:29325:29337" class="btn btn-ghost btn-sm" onclick="clearPhoto()">Remove photo</button>
        </div>
      </div>
    </div>

    <!-- VOICE MODE -->
    <div data-om-id="b5e59dd6:om-div-47" id="mode-voice" class="hidden">
      <div data-om-id="b5e59dd6:om-div-48" data-om-text-id="txt:doom_box_decoder/index.html:29519:29620" id="voice-unsupported" class="voice-unsupported hidden">
        Your browser doesn't support voice input. Try the Photo or Type tabs — same result.
      </div>
      <div data-om-id="b5e59dd6:om-div-49" class="voice-panel">
        <div data-om-id="b5e59dd6:om-div-50" data-om-text-id="txt:doom_box_decoder/index.html:29711:29772" class="voice-status" id="voice-status">Tap the mic and list what's going in — pause between items.</div>
        <button data-om-id="b5e59dd6:om-button-15" data-om-text-id="txt:doom_box_decoder/index.html:29864:29871" class="voice-mic-btn" id="voice-mic-btn" onclick="toggleRecording()">🎙️</button>
        <div data-om-id="b5e59dd6:om-div-51" data-om-text-id="txt:doom_box_decoder/index.html:29941:29983" class="voice-transcript" id="voice-transcript">Your dictated contents will appear here…</div>
      </div>
    </div>

    <!-- TYPE MODE -->
    <div data-om-id="b5e59dd6:om-div-52" id="mode-type" class="hidden">
      <textarea data-om-id="b5e59dd6:om-textarea-1" id="type-textarea" class="type-textarea" placeholder="Spare phone charger&#10;Winter jumpers (grey, navy)&#10;Old iPhone 8&#10;Tax paperwork 2023&#10;Christmas lights"></textarea>
      <div data-om-id="b5e59dd6:om-div-53" data-om-text-id="txt:doom_box_decoder/index.html:30305:30357" class="type-helper">One item per line — or use commas. We sort it out.</div>
    </div>

    <!-- CONTENTS REVIEW (shared) -->
    <div data-om-id="b5e59dd6:om-div-54" class="contents-review" id="contents-review">
      <h3 data-om-id="b5e59dd6:om-h3-7">In this box <span data-om-id="b5e59dd6:om-span-7" data-om-text-id="txt:doom_box_decoder/index.html:30530:30537" class="count" id="content-count">0 items</span></h3>
      <div data-om-id="b5e59dd6:om-div-55" data-om-text-id="txt:doom_box_decoder/index.html:30610:30650" class="contents-chips empty" id="contents-chips">Add something above, or type it here ↓</div>
      <div data-om-id="b5e59dd6:om-div-56" class="add-chip-row">
        <input type="text" id="add-chip-input" placeholder="Add another item…" onkeydown="if(event.key==='Enter'){event.preventDefault();addChipFromInput()}"  data-om-id="b5e59dd6:om-input-2"/>
        <button data-om-id="b5e59dd6:om-button-16" data-om-text-id="txt:doom_box_decoder/index.html:30927:30930" class="btn btn-ghost btn-sm" onclick="addChipFromInput()">Add</button>
      </div>
    </div>

    <!-- BOX META -->
    <div data-om-id="b5e59dd6:om-div-57" data-om-text-id="txt:doom_box_decoder/index.html:31018:31872" class="box-meta-grid">
      <div data-om-id="b5e59dd6:om-div-58" class="form-group">
        <label data-om-id="b5e59dd6:om-label-1" data-om-text-id="txt:doom_box_decoder/index.html:31100:31115" class="form-label" for="meta-room">Room / location</label>
        <input type="text" id="meta-room" placeholder="Spare room, loft, under the stairs…" list="room-suggestions"  data-om-id="b5e59dd6:om-input-3"/>
        <datalist data-om-id="b5e59dd6:om-datalist-1" data-om-text-id="txt:doom_box_decoder/index.html:31285:31590" id="room-suggestions">
          <option data-om-id="b5e59dd6:om-option-1" value="Bedroom"><option data-om-id="b5e59dd6:om-option-2" value="Spare room"><option data-om-id="b5e59dd6:om-option-3" value="Living room"><option data-om-id="b5e59dd6:om-option-4" value="Kitchen">
          <option data-om-id="b5e59dd6:om-option-5" value="Loft / attic"><option data-om-id="b5e59dd6:om-option-6" value="Garage"><option data-om-id="b5e59dd6:om-option-7" value="Under the stairs"><option data-om-id="b5e59dd6:om-option-8" value="Cupboard">
          <option data-om-id="b5e59dd6:om-option-9" value="Storage unit"><option data-om-id="b5e59dd6:om-option-10" value="Shed">
        </datalist>
      </div>
      <div data-om-id="b5e59dd6:om-div-59" class="form-group">
        <label data-om-id="b5e59dd6:om-label-2" class="form-label" for="meta-summary">Short summary <span data-om-id="b5e59dd6:om-span-8" data-om-text-id="txt:doom_box_decoder/index.html:31737:31750" class="form-hint">(auto-filled)</span></label>
        <input type="text" id="meta-summary" placeholder="e.g. cables + winter stuff"  data-om-id="b5e59dd6:om-input-4"/>
      </div>
    </div>

    <div data-om-id="b5e59dd6:om-div-60" class="cap-footer">
      <span data-om-id="b5e59dd6:om-span-9" class="cap-count" id="cap-count">Box <b data-om-id="b5e59dd6:om-b-3" data-om-text-id="txt:doom_box_decoder/index.html:31979:31981" id="cap-next-num">01</b> · packed today</span>
      <div data-om-id="b5e59dd6:om-div-61" class="flex gap-2">
        <button data-om-id="b5e59dd6:om-button-17" data-om-text-id="txt:doom_box_decoder/index.html:32104:32110" class="btn btn-ghost" onclick="cancelCapture()">Cancel</button>
        <button data-om-id="b5e59dd6:om-button-18" data-om-text-id="txt:doom_box_decoder/index.html:32203:32220" class="btn btn-primary" id="seal-btn" onclick="sealBox()" disabled>Seal this box →</button>
      </div>
    </div>
  </div>
</div>

<!-- BOX SAVED -->
<div data-om-id="b5e59dd6:om-div-62" id="box-saved" class="screen">
  <div data-om-id="b5e59dd6:om-div-63" class="container-sm">
    <div data-om-id="b5e59dd6:om-div-64" class="saved-header fade-in">
      <div data-om-id="b5e59dd6:om-div-65" data-om-text-id="txt:doom_box_decoder/index.html:32418:32421" class="tick">✅</div>
      <h2 data-om-id="b5e59dd6:om-h2-3" data-om-text-id="txt:doom_box_decoder/index.html:32438:32471">Sealed. You'll never lose it now.</h2>
      <p data-om-id="b5e59dd6:om-p-14" data-om-text-id="txt:doom_box_decoder/index.html:32486:32578">Print this label and tape it to the outside. Or just remember the number — that works too.</p>
    </div>
    <div data-om-id="b5e59dd6:om-div-66" id="saved-label-container"></div>
    <div data-om-id="b5e59dd6:om-div-67" class="saved-actions">
      <button data-om-id="b5e59dd6:om-button-19" data-om-text-id="txt:doom_box_decoder/index.html:32736:32760" class="btn btn-primary" onclick="printSingleLabel()">🖨️ Print this label</button>
      <button data-om-id="b5e59dd6:om-button-20" data-om-text-id="txt:doom_box_decoder/index.html:32830:32847" class="btn btn-ghost" onclick="startNewBox()">+ Log another box</button>
      <button data-om-id="b5e59dd6:om-button-21" data-om-text-id="txt:doom_box_decoder/index.html:32924:32944" class="btn btn-ghost" onclick="showScreen('search')">🔎 Search my boxes</button>
    </div>
  </div>
</div>

<!-- SEARCH -->
<div data-om-id="b5e59dd6:om-div-68" id="search" class="screen">
  <div data-om-id="b5e59dd6:om-div-69" class="container-sm">
    <div data-om-id="b5e59dd6:om-div-70" class="search-header">
      <h2 data-om-id="b5e59dd6:om-h2-4" data-om-text-id="txt:doom_box_decoder/index.html:33102:33117">Find something.</h2>
      <p data-om-id="b5e59dd6:om-p-15" data-om-text-id="txt:doom_box_decoder/index.html:33132:33180">Search across every box, every item, every room.</p>
    </div>
    <div data-om-id="b5e59dd6:om-div-71" class="search-bar-wrap">
      <span data-om-id="b5e59dd6:om-span-10" data-om-text-id="txt:doom_box_decoder/index.html:33262:33266" class="search-icon">🔎</span>
      <input type="text" id="search-input" class="search-bar" placeholder="e.g. spare charger, passport, winter coat…" oninput="runSearch()" autofocus  data-om-id="b5e59dd6:om-input-5"/>
    </div>
    <div data-om-id="b5e59dd6:om-div-72" id="search-results-wrap"></div>
  </div>
</div>

<!-- ALL BOXES -->
<div data-om-id="b5e59dd6:om-div-73" id="boxes" class="screen">
  <div data-om-id="b5e59dd6:om-div-74" class="container">
    <div data-om-id="b5e59dd6:om-div-75" class="boxes-header">
      <h2 data-om-id="b5e59dd6:om-h2-5" data-om-text-id="txt:doom_box_decoder/index.html:33617:33625">My boxes</h2>
      <div data-om-id="b5e59dd6:om-div-76" class="flex gap-2">
        <button data-om-id="b5e59dd6:om-button-22" data-om-text-id="txt:doom_box_decoder/index.html:33743:33767" class="btn btn-ghost btn-sm" onclick="showScreen('print-sheet')">🖨️ Print all labels</button>
        <button data-om-id="b5e59dd6:om-button-23" data-om-text-id="txt:doom_box_decoder/index.html:33849:33868" class="btn btn-ghost btn-sm" onclick="exportManifest()">⬇ Export manifest</button>
      </div>
    </div>
    <div data-om-id="b5e59dd6:om-div-77" id="boxes-list"></div>
  </div>
</div>

<!-- BOX DETAIL -->
<div data-om-id="b5e59dd6:om-div-78" id="box-detail" class="screen">
  <div data-om-id="b5e59dd6:om-div-79" class="container">
    <a data-om-id="b5e59dd6:om-a-1" data-om-text-id="txt:doom_box_decoder/index.html:34123:34144" class="detail-back" href="#" onclick="event.preventDefault();showScreen('boxes')">← Back to all boxes</a>
    <div data-om-id="b5e59dd6:om-div-80" id="detail-content"></div>
  </div>
</div>

<!-- PRINT SHEET -->
<div data-om-id="b5e59dd6:om-div-81" id="print-sheet" class="screen">
  <div data-om-id="b5e59dd6:om-div-82" class="container">
    <div data-om-id="b5e59dd6:om-div-83" class="print-actions">
      <button data-om-id="b5e59dd6:om-button-24" data-om-text-id="txt:doom_box_decoder/index.html:34382:34395" class="btn btn-primary" onclick="window.print()">🖨️ Print</button>
      <button data-om-id="b5e59dd6:om-button-25" data-om-text-id="txt:doom_box_decoder/index.html:34471:34488" class="btn btn-ghost" onclick="showScreen('boxes')">← Back to boxes</button>
    </div>
    <div data-om-id="b5e59dd6:om-div-84" id="print-sheet-content"></div>
  </div>
</div>

<!-- UPGRADE MODAL -->
<div data-om-id="b5e59dd6:om-div-85" class="modal-overlay" id="upgrade-modal" onclick="closeUpgrade(event)">
  <div data-om-id="b5e59dd6:om-div-86" class="modal">
    <button data-om-id="b5e59dd6:om-button-26" data-om-text-id="txt:doom_box_decoder/index.html:34749:34752" class="modal-close" onclick="closeUpgradeBtn()">✕</button>
    <div data-om-id="b5e59dd6:om-div-87" data-om-text-id="txt:doom_box_decoder/index.html:34813:34817" style="font-size:36px;margin-bottom:12px">📦</div>
    <h2 data-om-id="b5e59dd6:om-h2-6" data-om-text-id="txt:doom_box_decoder/index.html:34832:34887">Unlimited boxes, printable sheets, exportable manifest.</h2>
    <p data-om-id="b5e59dd6:om-p-16" data-om-text-id="txt:doom_box_decoder/index.html:34918:35002" class="modal-sub">Free is for trying it out. Premium is for the person whose loft has thirty of these.</p>
    <div data-om-id="b5e59dd6:om-div-88" class="modal-price">£4 <span data-om-id="b5e59dd6:om-span-11" data-om-text-id="txt:doom_box_decoder/index.html:35046:35071">/ month · cancel anytime</span></div>
    <ul data-om-id="b5e59dd6:om-ul-3" class="modal-features">
      <li data-om-id="b5e59dd6:om-li-15" data-om-text-id="txt:doom_box_decoder/index.html:35127:35160">Unlimited boxes (free stops at 3)</li>
      <li data-om-id="b5e59dd6:om-li-16" data-om-text-id="txt:doom_box_decoder/index.html:35176:35203">Print 8 labels per A4 sheet</li>
      <li data-om-id="b5e59dd6:om-li-17" data-om-text-id="txt:doom_box_decoder/index.html:35219:35254">Export full manifest as CSV or JSON</li>
      <li data-om-id="b5e59dd6:om-li-18" data-om-text-id="txt:doom_box_decoder/index.html:35270:35294">Filter and group by room</li>
      <li data-om-id="b5e59dd6:om-li-19" data-om-text-id="txt:doom_box_decoder/index.html:35310:35347">Photo attachments saved with each box</li>
      <li data-om-id="b5e59dd6:om-li-20" data-om-text-id="txt:doom_box_decoder/index.html:35363:35379">Priority support</li>
    </ul>
    <button data-om-id="b5e59dd6:om-button-27" data-om-text-id="txt:doom_box_decoder/index.html:35502:35524" class="btn btn-primary w-full" style="padding:14px;font-size:16px" onclick="activatePremium()">Upgrade to Premium →</button>
    <p data-om-id="b5e59dd6:om-p-17" data-om-text-id="txt:doom_box_decoder/index.html:35562:35633" class="modal-footer">Demo mode: clicking Upgrade activates Premium locally for this session.</p>
  </div>
</div>

<!-- CONFIRM DELETE MODAL -->
<div data-om-id="b5e59dd6:om-div-89" class="modal-overlay" id="confirm-modal" onclick="closeConfirm(event)">
  <div data-om-id="b5e59dd6:om-div-90" class="modal modal-danger">
    <div data-om-id="b5e59dd6:om-div-91" data-om-text-id="txt:doom_box_decoder/index.html:35848:35855" style="font-size:36px;margin-bottom:12px">🗑️</div>
    <h2 data-om-id="b5e59dd6:om-h2-7" data-om-text-id="txt:doom_box_decoder/index.html:35870:35886">Delete this box?</h2>
    <p data-om-id="b5e59dd6:om-p-18" data-om-text-id="txt:doom_box_decoder/index.html:35917:35984" class="modal-sub">This removes it from your search. The physical box is your problem.</p>
    <div data-om-id="b5e59dd6:om-div-92" class="btn-row">
      <button data-om-id="b5e59dd6:om-button-28" data-om-text-id="txt:doom_box_decoder/index.html:36079:36086" class="btn btn-ghost" onclick="closeConfirmBtn()">Keep it</button>
      <button data-om-id="b5e59dd6:om-button-29" data-om-text-id="txt:doom_box_decoder/index.html:36202:36208" class="btn btn-primary" style="background:var(--red);color:white" onclick="confirmDelete()">Delete</button>
    </div>
  </div>
</div>

<div data-om-id="b5e59dd6:om-div-93" data-om-text-id="txt:doom_box_decoder/index.html:36274:36371" class="disclaimer-bar">Doom Box Decoder helps you remember what you packed. It does not physically find the box for you.</div>
<div data-om-id="b5e59dd6:om-div-94" class="toast" id="toast"></div>

<script data-om-id="b5e59dd6:om-script-1" data-om-text-id="txt:doom_box_decoder/index.html:36424:71026">
// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════
const STORAGE_KEY = 'sor7ed.doombox.v1';
const FREE_LIMIT = 3;

let state = {
  isPaid: false,
  currentScreen: 'landing',
  boxes: [],
  nextNumber: 1,
  // Capture draft
  draft: {
    mode: 'photo',
    contents: [],     // array of item strings
    photoDataUrl: null,
    room: '',
    summary: '',
  },
  // Search
  query: '',
  // Selected box (for detail / delete)
  selectedBoxId: null,
  pendingDeleteId: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state.boxes = parsed.boxes || [];
      state.nextNumber = parsed.nextNumber || (state.boxes.length + 1);
      state.isPaid = !!parsed.isPaid;
    }
  } catch (e) { console.warn('Could not load state', e); }
  refreshFreeCounter();
  refreshPaidBadge();
}
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      boxes: state.boxes,
      nextNumber: state.nextNumber,
      isPaid: state.isPaid,
    }));
  } catch (e) { console.warn('Could not save state', e); }
  refreshFreeCounter();
}

function refreshFreeCounter() {
  const el = document.getElementById('free-counter');
  const c = document.getElementById('free-count');
  if (state.isPaid) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  c.textContent = state.boxes.length;
  el.classList.toggle('full', state.boxes.length >= FREE_LIMIT);
}
function refreshPaidBadge() {
  document.getElementById('paid-badge').classList.toggle('hidden', !state.isPaid);
  document.getElementById('nav-upgrade-btn').classList.toggle('hidden', state.isPaid);
}

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  state.currentScreen = id;
  window.scrollTo(0, 0);

  const hasBoxes = state.boxes.length > 0;
  document.getElementById('nav-search-btn').classList.toggle('hidden', !hasBoxes);
  document.getElementById('nav-boxes-btn').classList.toggle('hidden', !hasBoxes);
  document.getElementById('nav-new-btn').classList.toggle('hidden', !hasBoxes || id === 'capture');

  if (id === 'print-sheet' && !state.isPaid) { openUpgrade(); return; }
  if (id === 'search') { renderSearch(); setTimeout(() => document.getElementById('search-input')?.focus(), 50); }
  if (id === 'boxes') renderBoxes();
  if (id === 'print-sheet') renderPrintSheet();
  if (id === 'capture') renderCaptureNumber();
}

function startNewBox() {
  if (!state.isPaid && state.boxes.length >= FREE_LIMIT) {
    openUpgrade();
    return;
  }
  // Reset draft
  state.draft = { mode: 'photo', contents: [], photoDataUrl: null, room: '', summary: '' };
  document.getElementById('type-textarea').value = '';
  document.getElementById('meta-room').value = '';
  document.getElementById('meta-summary').value = '';
  document.getElementById('add-chip-input').value = '';
  clearPhoto();
  stopRecording();
  document.getElementById('voice-transcript').textContent = 'Your dictated contents will appear here…';
  document.getElementById('voice-transcript').classList.remove('has-content');
  switchMode('photo');
  renderChips();
  renderCaptureNumber();
  showScreen('capture');
}

function renderCaptureNumber() {
  const num = String(state.nextNumber).padStart(2, '0');
  document.getElementById('cap-next-num').textContent = num;
}

function cancelCapture() {
  showScreen(state.boxes.length ? 'boxes' : 'landing');
}

// ═══════════════════════════════════════════════════════════════════
// CAPTURE MODES
// ═══════════════════════════════════════════════════════════════════
function switchMode(mode) {
  state.draft.mode = mode;
  ['photo', 'voice', 'type'].forEach(m => {
    document.getElementById('tab-' + m).classList.toggle('active', m === mode);
    document.getElementById('mode-' + m).classList.toggle('hidden', m !== mode);
  });
  if (mode === 'voice') initVoice();
}

// ── PHOTO MODE ──
document.getElementById('photo-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    state.draft.photoDataUrl = ev.target.result;
    document.getElementById('photo-img').src = ev.target.result;
    document.getElementById('photo-dropzone').style.display = 'none';
    document.getElementById('photo-preview').classList.add('show');
    // Seed some plausible contents from filename (so user has something to edit)
    seedContentsFromFilename(file.name);
    showToast('Photo added. Edit the item list below.');
  };
  reader.readAsDataURL(file);
});

// Drag-and-drop on the dropzone
const dz = document.getElementById('photo-dropzone');
['dragenter', 'dragover'].forEach(evt => dz.addEventListener(evt, e => { e.preventDefault(); dz.classList.add('dragover'); }));
['dragleave', 'drop'].forEach(evt => dz.addEventListener(evt, e => { e.preventDefault(); dz.classList.remove('dragover'); }));
dz.addEventListener('drop', e => {
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    document.getElementById('photo-input').files = e.dataTransfer.files;
    document.getElementById('photo-input').dispatchEvent(new Event('change'));
  }
});

function clearPhoto() {
  state.draft.photoDataUrl = null;
  document.getElementById('photo-input').value = '';
  document.getElementById('photo-img').src = '';
  document.getElementById('photo-dropzone').style.display = '';
  document.getElementById('photo-preview').classList.remove('show');
}

function seedContentsFromFilename(name) {
  // Very light heuristic — filename often contains a room or descriptor
  const guesses = [];
  const clean = name.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[_\-]+/g, ' ');
  if (/cable|wire|charger|cord/.test(clean)) guesses.push('Cables', 'Chargers');
  if (/winter|coat|jumper|scarf/.test(clean)) guesses.push('Winter clothes');
  if (/tax|paperwork|document/.test(clean)) guesses.push('Paperwork');
  if (/christmas|xmas|decoration/.test(clean)) guesses.push('Christmas decorations');
  if (/book/.test(clean)) guesses.push('Books');
  if (/tool/.test(clean)) guesses.push('Tools');
  if (/kitchen/.test(clean)) guesses.push('Kitchen bits');
  // Always append a placeholder so user knows to edit
  if (!guesses.length) guesses.push('Item from photo (edit me)');
  guesses.forEach(g => addContent(g, { silent: true }));
  renderChips();
}

// ── VOICE MODE ──
let recognition = null;
let isRecording = false;
let voiceBuffer = '';

function initVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const unsupported = document.getElementById('voice-unsupported');
  if (!SR) {
    unsupported.classList.remove('hidden');
    document.getElementById('voice-mic-btn').disabled = true;
    return;
  }
  unsupported.classList.add('hidden');
  if (recognition) return;
  recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-GB';
  recognition.onresult = (e) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) final += r[0].transcript + ' ';
      else interim += r[0].transcript;
    }
    if (final) {
      voiceBuffer += final;
      // Split by commas, "and", or long pauses (a period from the engine)
      const items = voiceBuffer.split(/[,.]|\band\b/i).map(s => s.trim()).filter(s => s.length > 1);
      // Keep the last fragment as pending (in case not finished)
      const lastFinal = voiceBuffer.match(/[,.]|\band\b/i);
      let pending = '';
      if (!lastFinal) { pending = voiceBuffer.trim(); voiceBuffer = pending; }
      else {
        // Everything before last separator becomes items; keep tail
        const idx = voiceBuffer.search(/[,.]|\band\b(?![^,.]*[,.])/i);
        // Simpler: just commit everything and reset buffer
        items.forEach(it => addContent(capitalise(it), { silent: true, dedupe: true }));
        voiceBuffer = '';
      }
      renderChips();
    }
    document.getElementById('voice-transcript').textContent =
      state.draft.contents.length
        ? `Captured: ${state.draft.contents.join(' · ')}${interim ? ' … ' + interim : ''}`
        : (interim || 'Listening…');
    document.getElementById('voice-transcript').classList.add('has-content');
  };
  recognition.onerror = (e) => {
    if (e.error === 'not-allowed') showToast('Microphone blocked. Enable it in browser settings.');
    else if (e.error === 'no-speech') { /* silent */ }
    else showToast('Voice error: ' + e.error);
    stopRecording();
  };
  recognition.onend = () => {
    if (isRecording) {
      // Auto-restart while user wants it on
      try { recognition.start(); } catch (_) {}
    }
  };
}

function toggleRecording() {
  if (!recognition) return;
  if (isRecording) stopRecording();
  else startRecording();
}
function startRecording() {
  try {
    recognition.start();
    isRecording = true;
    document.getElementById('voice-mic-btn').classList.add('recording');
    document.getElementById('voice-status').textContent = 'Listening — say each item, pause between them. Tap the mic to stop.';
  } catch (e) { showToast('Could not start recording'); }
}
function stopRecording() {
  isRecording = false;
  if (recognition) { try { recognition.stop(); } catch (_) {} }
  const btn = document.getElementById('voice-mic-btn');
  if (btn) btn.classList.remove('recording');
  const status = document.getElementById('voice-status');
  if (status) status.textContent = 'Tap the mic and list what\'s going in — pause between items.';
}
function capitalise(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── TYPE MODE ──
document.getElementById('type-textarea').addEventListener('input', function() {
  const raw = this.value;
  // Reset draft contents from typed input each time (typing is the source of truth for this mode)
  const items = raw.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
  // Only replace if user is actively typing (mode is type)
  if (state.draft.mode === 'type') {
    state.draft.contents = items.map(capitalise);
    renderChips();
  }
});

// ── SHARED: contents chips ──
function addContent(text, opts = {}) {
  text = text.trim();
  if (!text) return;
  if (opts.dedupe && state.draft.contents.some(c => c.toLowerCase() === text.toLowerCase())) return;
  state.draft.contents.push(text);
  if (!opts.silent) renderChips();
}
function removeContent(idx) {
  state.draft.contents.splice(idx, 1);
  renderChips();
  // If user is in Type mode, reflect the removal back into the textarea
  if (state.draft.mode === 'type') {
    document.getElementById('type-textarea').value = state.draft.contents.join('\n');
  }
}
function addChipFromInput() {
  const input = document.getElementById('add-chip-input');
  const val = input.value.trim();
  if (!val) return;
  addContent(capitalise(val));
  input.value = '';
  input.focus();
  // Reflect into type textarea if in type mode
  if (state.draft.mode === 'type') {
    document.getElementById('type-textarea').value = state.draft.contents.join('\n');
  }
}
function renderChips() {
  const el = document.getElementById('contents-chips');
  const count = document.getElementById('content-count');
  const n = state.draft.contents.length;
  count.textContent = n === 1 ? '1 item' : n + ' items';
  document.getElementById('seal-btn').disabled = n === 0;

  if (n === 0) {
    el.classList.add('empty');
    el.innerHTML = 'Add something above, or type it here ↓';
    autoFillSummary();
    return;
  }
  el.classList.remove('empty');
  el.innerHTML = state.draft.contents.map((c, i) =>
    `<span class="content-chip">${escapeHtml(c)}<button title="Remove" onclick="removeContent(${i})">✕</button></span>`
  ).join('');
  autoFillSummary();
}

function autoFillSummary() {
  const summaryInput = document.getElementById('meta-summary');
  // Only auto-fill if user hasn't manually edited
  if (summaryInput.dataset.manual === 'true') return;
  const c = state.draft.contents;
  if (c.length === 0) { summaryInput.value = ''; summaryInput.placeholder = 'e.g. cables + winter stuff'; return; }
  if (c.length === 1) summaryInput.value = c[0];
  else if (c.length === 2) summaryInput.value = c.join(' + ');
  else summaryInput.value = c.slice(0, 2).join(' + ') + ` + ${c.length - 2} more`;
}
document.getElementById('meta-summary').addEventListener('input', function() { this.dataset.manual = 'true'; });

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ═══════════════════════════════════════════════════════════════════
// SEAL BOX
// ═══════════════════════════════════════════════════════════════════
function sealBox() {
  if (state.draft.contents.length === 0) return;
  if (!state.isPaid && state.boxes.length >= FREE_LIMIT) {
    openUpgrade();
    return;
  }
  stopRecording();
  const box = {
    id: 'box_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    number: state.nextNumber,
    room: document.getElementById('meta-room').value.trim() || 'Unspecified',
    summary: document.getElementById('meta-summary').value.trim() || state.draft.contents.slice(0, 2).join(' + '),
    contents: [...state.draft.contents],
    photoDataUrl: state.isPaid ? state.draft.photoDataUrl : null, // only paid saves photos
    createdAt: new Date().toISOString(),
  };
  state.boxes.push(box);
  state.nextNumber++;
  saveState();
  state.selectedBoxId = box.id;
  renderSavedLabel(box);
  showScreen('box-saved');
  showToast('Box ' + String(box.number).padStart(2, '0') + ' sealed.');
}

// ═══════════════════════════════════════════════════════════════════
// LABEL RENDERING (single + sheet)
// ═══════════════════════════════════════════════════════════════════
function renderSavedLabel(box) {
  document.getElementById('saved-label-container').innerHTML = buildLabelHtml(box);
}

function buildLabelHtml(box, opts = {}) {
  const num = String(box.number).padStart(2, '0');
  const date = new Date(box.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const contentsPreview = box.contents.slice(0, 6).join(' · ') + (box.contents.length > 6 ? ` · +${box.contents.length - 6} more` : '');
  const qr = buildQrPlaceholder(box.number);
  const wrapClass = opts.sheet ? 'a4-label' : 'label-preview';
  return `
    <div class="${wrapClass}">
      <div class="label-header">
        <div>
          <div class="label-num">${num}</div>
          <div class="label-num-sub">Doom Box</div>
        </div>
        <div class="label-qr">${qr}</div>
      </div>
      <div class="label-summary">${escapeHtml(box.summary || 'Untitled box')}</div>
      <div class="label-room">${escapeHtml(box.room || 'Unspecified')}</div>
      <div class="label-contents">${escapeHtml(contentsPreview)}</div>
      <div class="label-footer">
        <span>Packed ${date}</span>
        <span class="brand">SOR7ED</span>
      </div>
    </div>
  `;
}

// Deterministic 8×8 "QR-style" glyph derived from box number
// (Not a scannable QR — just a visual marker. Real product wires a QR lib.)
function buildQrPlaceholder(seed) {
  const size = 8;
  const cell = 6;
  let rng = (seed + 1) * 2654435761 >>> 0;
  const next = () => { rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; return (rng >>> 0) / 0xffffffff; };
  let rects = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Force corners solid (finder-pattern feel)
      const corner = (x < 3 && y < 3) || (x >= size - 3 && y < 3) || (x < 3 && y >= size - 3);
      const on = corner ? ((x + y) % 2 === 0 || (x === 0 || y === 0 || x === 2 || y === 2)) : next() > .55;
      if (on) rects += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" fill="#111"/>`;
    }
  }
  return `<svg viewBox="0 0 ${size*cell} ${size*cell}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

function printSingleLabel() {
  // Isolate the label for print: hide everything else via a body class
  document.body.classList.add('printing-single');
  const style = document.createElement('style');
  style.id = 'print-single-style';
  style.textContent = `@media print { body.printing-single > *:not(#box-saved) { display: none !important; } body.printing-single #box-saved .saved-header, body.printing-single #box-saved .saved-actions { display: none !important; } }`;
  document.head.appendChild(style);
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-single');
    document.getElementById('print-single-style')?.remove();
  }, 500);
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════════
function scoreMatch(query, box) {
  if (!query) return { score: 0, hits: [] };
  const q = query.toLowerCase().trim();
  const qTokens = q.split(/\s+/).filter(Boolean);
  let score = 0;
  const hits = new Set();

  // Item-level matches (strongest signal)
  box.contents.forEach(item => {
    const lo = item.toLowerCase();
    if (lo === q) { score += 100; hits.add(item); return; }
    if (lo.includes(q)) { score += 60; hits.add(item); return; }
    let tokenHits = 0;
    qTokens.forEach(t => { if (lo.includes(t)) tokenHits++; });
    if (tokenHits === qTokens.length && qTokens.length > 1) { score += 45; hits.add(item); }
    else if (tokenHits > 0) { score += 20 * tokenHits; hits.add(item); }
    // Levenshtein-ish: close match on any token
    qTokens.forEach(t => {
      if (t.length >= 4 && levDistance(t, lo.slice(0, t.length + 2)) <= 1) { score += 10; hits.add(item); }
    });
  });
  // Summary
  const sumLo = (box.summary || '').toLowerCase();
  if (sumLo.includes(q)) score += 25;
  qTokens.forEach(t => { if (sumLo.includes(t)) score += 8; });
  // Room
  const roomLo = (box.room || '').toLowerCase();
  if (roomLo === q) score += 30;
  else if (roomLo.includes(q)) score += 15;
  qTokens.forEach(t => { if (roomLo.includes(t)) score += 5; });
  // Box number literal match
  if (q === String(box.number) || q === String(box.number).padStart(2, '0') || q === 'box ' + box.number) score += 80;

  return { score, hits: [...hits] };
}

function levDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({length: a.length+1}, () => new Array(b.length+1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function runSearch() {
  state.query = document.getElementById('search-input').value;
  renderSearchResults();
}

function renderSearch() {
  document.getElementById('search-input').value = state.query || '';
  renderSearchResults();
}

function renderSearchResults() {
  const wrap = document.getElementById('search-results-wrap');
  const q = state.query.trim();

  if (state.boxes.length === 0) {
    wrap.innerHTML = `<div class="search-empty"><div class="icon">📦</div><h3>No boxes yet</h3><p style="margin-top:6px">The moment you shove things in one, come back here.</p><div style="margin-top:16px"><button class="btn btn-primary" onclick="startNewBox()">Log your first box</button></div></div>`;
    return;
  }

  if (!q) {
    wrap.innerHTML = `<div class="search-empty"><div class="icon">🔎</div><p>Start typing what you're looking for.</p><p style="font-size:12px;color:var(--dim);margin-top:8px">You have <b style="color:var(--text)">${state.boxes.length}</b> box${state.boxes.length===1?'':'es'} logged, containing <b style="color:var(--text)">${state.boxes.reduce((s,b)=>s+b.contents.length,0)}</b> items.</p></div>`;
    return;
  }

  const scored = state.boxes
    .map(box => ({ box, ...scoreMatch(q, box) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    wrap.innerHTML = `
      <div class="search-summary">No matches for <b>"${escapeHtml(q)}"</b> across ${state.boxes.length} box${state.boxes.length===1?'':'es'}.</div>
      <div class="search-empty">
        <div class="icon">🤷</div>
        <p>Try a different word — or maybe it's not in a box at all.</p>
      </div>`;
    return;
  }

  const html = [`<div class="search-summary">Found <b>${scored.length}</b> match${scored.length===1?'':'es'} for <b>"${escapeHtml(q)}"</b></div>`];
  scored.forEach(({ box, hits }) => {
    const date = new Date(box.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    const chips = box.contents.map(item =>
      `<span class="match-chip ${hits.includes(item) ? 'hit' : ''}">${escapeHtml(item)}</span>`
    ).join('');
    html.push(`
      <div class="result-card" onclick="openBox('${box.id}')">
        <div class="result-head">
          <div>
            <div class="result-box-tag">Box ${String(box.number).padStart(2,'0')}</div>
            <div class="result-summary">${escapeHtml(box.summary || 'Untitled box')}</div>
          </div>
          <div class="result-room">${escapeHtml(box.room || 'Unspecified')}</div>
        </div>
        <div class="result-matches">${chips}</div>
        <div class="result-meta">Packed ${date} · ${box.contents.length} item${box.contents.length===1?'':'s'}</div>
      </div>
    `);
  });
  wrap.innerHTML = html.join('');
}

// ═══════════════════════════════════════════════════════════════════
// ALL BOXES / DETAIL
// ═══════════════════════════════════════════════════════════════════
function renderBoxes() {
  const wrap = document.getElementById('boxes-list');
  if (state.boxes.length === 0) {
    wrap.innerHTML = `<div class="search-empty"><div class="icon">📦</div><p>No boxes yet.</p><div style="margin-top:16px"><button class="btn btn-primary" onclick="startNewBox()">Log your first box</button></div></div>`;
    return;
  }
  // Sort by newest first
  const sorted = [...state.boxes].sort((a, b) => b.number - a.number);
  wrap.innerHTML = `<div class="boxes-grid">` + sorted.map(box => {
    const num = String(box.number).padStart(2, '0');
    const date = new Date(box.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    return `
      <div class="box-card" onclick="openBox('${box.id}')">
        <div class="box-card-num">${num}</div>
        <div class="box-card-room">${escapeHtml(box.room || 'Unspecified')}</div>
        <div class="box-card-summary">${escapeHtml(box.summary || 'Untitled')}</div>
        <div class="box-card-meta">${box.contents.length} item${box.contents.length===1?'':'s'} · packed ${date}</div>
      </div>
    `;
  }).join('') + `</div>`;
}

function openBox(id) {
  state.selectedBoxId = id;
  const box = state.boxes.find(b => b.id === id);
  if (!box) return;
  renderBoxDetail(box);
  showScreen('box-detail');
}

function renderBoxDetail(box) {
  const num = String(box.number).padStart(2, '0');
  const date = new Date(box.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const photoBlock = box.photoDataUrl
    ? `<img class="detail-photo" src="${box.photoDataUrl}" alt="Contents photo" />`
    : `<div class="card" style="padding:32px;text-align:center;color:var(--dim);font-size:13px">📷 No photo saved${!state.isPaid ? ' <br><span style="font-size:11px">Upgrade to keep photos</span>' : ''}</div>`;

  const contentsList = box.contents.map(c => `<li>${escapeHtml(c)}</li>`).join('');

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-grid">
      <div class="detail-side">
        ${photoBlock}
        ${buildLabelHtml(box)}
      </div>
      <div>
        <div class="detail-info">
          <h2>Box ${num}</h2>
          <div class="detail-summary">${escapeHtml(box.summary || 'Untitled box')} · <span style="color:var(--dim)">${escapeHtml(box.room)}</span></div>
          <div style="font-size:12px;color:var(--dim);margin-bottom:20px">Packed ${date}</div>
          <div class="section-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)">Contents (${box.contents.length})</div>
          </div>
          <ul class="detail-contents-list">${contentsList}</ul>
          <div class="detail-actions">
            <button class="btn btn-primary btn-sm" onclick="printSingleLabel()">🖨️ Print label</button>
            <button class="btn btn-danger-ghost btn-sm" onclick="askDelete('${box.id}')">Delete box</button>
          </div>
        </div>
      </div>
    </div>
    <div style="display:none">${buildLabelHtml(box)}</div>
  `;
  // For print-single: put the label inside #box-saved container so the print handler still finds it
  document.getElementById('saved-label-container').innerHTML = buildLabelHtml(box);
}

function askDelete(id) {
  state.pendingDeleteId = id;
  document.getElementById('confirm-modal').classList.add('open');
}
function closeConfirm(e) { if (e.target.id === 'confirm-modal') closeConfirmBtn(); }
function closeConfirmBtn() {
  state.pendingDeleteId = null;
  document.getElementById('confirm-modal').classList.remove('open');
}
function confirmDelete() {
  state.boxes = state.boxes.filter(b => b.id !== state.pendingDeleteId);
  saveState();
  closeConfirmBtn();
  showToast('Box deleted');
  showScreen('boxes');
}

// ═══════════════════════════════════════════════════════════════════
// PRINT SHEET (paid)
// ═══════════════════════════════════════════════════════════════════
function renderPrintSheet() {
  const wrap = document.getElementById('print-sheet-content');
  if (!state.isPaid) return; // guarded upstream
  if (state.boxes.length === 0) {
    wrap.innerHTML = `<div class="search-empty">No boxes to print.</div>`;
    return;
  }
  const sorted = [...state.boxes].sort((a, b) => a.number - b.number);
  const labels = sorted.map(b => buildLabelHtml(b, { sheet: true })).join('');
  wrap.innerHTML = `<div class="a4-sheet"><div class="a4-labels">${labels}</div></div>`;
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT (paid)
// ═══════════════════════════════════════════════════════════════════
function exportManifest() {
  if (!state.isPaid) { openUpgrade(); return; }
  if (state.boxes.length === 0) { showToast('No boxes to export'); return; }
  const rows = [['number', 'room', 'summary', 'contents', 'packed']];
  state.boxes.forEach(b => {
    rows.push([
      String(b.number).padStart(2, '0'),
      b.room,
      b.summary,
      b.contents.join(' | '),
      new Date(b.createdAt).toISOString().slice(0, 10),
    ]);
  });
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'doom-box-manifest.csv';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  showToast('Manifest downloaded');
}

// ═══════════════════════════════════════════════════════════════════
// UPGRADE MODAL
// ═══════════════════════════════════════════════════════════════════
function openUpgrade() { document.getElementById('upgrade-modal').classList.add('open'); }
function closeUpgrade(e) { if (e.target.id === 'upgrade-modal') closeUpgradeBtn(); }
function closeUpgradeBtn() { document.getElementById('upgrade-modal').classList.remove('open'); }
function activatePremium() {
  state.isPaid = true;
  saveState();
  refreshPaidBadge();
  closeUpgradeBtn();
  showToast('Premium activated — unlimited boxes ✨');
}

// ═══════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ═══════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════
function loadDemo() {
  const today = new Date();
  const daysAgo = n => new Date(today.getTime() - n * 86400000).toISOString();
  const demo = [
    { number: 1, room: 'Spare room', summary: 'Cables + old tech',
      contents: ['Spare phone charger (iPhone)', 'USB-C cable', 'Old iPhone 8', 'Travel adapter (EU)', 'Travel adapter (US)', 'HDMI cable', 'Bluetooth headphones (broken)'],
      createdAt: daysAgo(120) },
    { number: 2, room: 'Loft', summary: 'Winter clothes',
      contents: ['Wool jumper (grey)', 'Wool jumper (navy)', 'Winter coat', 'Two scarves', 'Ski gloves', 'Thermal socks'],
      createdAt: daysAgo(210) },
    { number: 3, room: 'Under the stairs', summary: 'Christmas decorations',
      contents: ['Fairy lights x3', 'Tree ornaments', 'Wreath', 'Christmas cards (unwritten)', 'Stockings x4'],
      createdAt: daysAgo(280) },
    { number: 4, room: 'Spare room', summary: 'Paperwork + passport photos',
      contents: ['Passport photos (Feb 2024)', 'Old tax returns 2022', 'Old tax returns 2023', 'NHS letters', 'Council tax records', 'Warranty documents'],
      createdAt: daysAgo(60) },
    { number: 5, room: 'Kitchen cupboard', summary: 'Rarely-used kitchen bits',
      contents: ['Ice cream scoop', 'Melon baller', 'Springform tin', 'Pastry brush', 'Kitchen scales (backup)', 'Sushi mat'],
      createdAt: daysAgo(30) },
  ].map(b => ({ ...b, id: 'demo_' + b.number, photoDataUrl: null }));

  state.boxes = demo;
  state.nextNumber = demo.length + 1;
  saveState();
  showScreen('search');
  showToast('Loaded 5 demo boxes — try searching "charger"');
}

// ═══════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('upgrade-modal').classList.remove('open');
    document.getElementById('confirm-modal').classList.remove('open');
  }
});

loadState();
if (state.boxes.length > 0) {
  // If they've got boxes saved, land on search (probably why they opened it)
  showScreen('landing');
}
</script>
<script data-designer2-injected>
/**
 * Designer 2.0 — iframe inject script.
 *
 * Injected by the backend into every HTML file served from the preview endpoint.
 * Provides: console forwarding, error capture, height reporting,
 * remote JS eval, window.genspark.complete() (cheap-model callback;
 * also exposed as window.claude.complete for Tiffany-portability),
 * Design Mode (element selection + data-cc-id), Tweaks protocol,
 * Babel JSX auto-config, and escape key forwarding.
 */
(function () {
  var P = window.parent;
  if (!P || P === window) return;

  // ── Origin verification ────────────────────────────────────────────
  var ALLOWED_ORIGINS = [
    location.origin,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.genspark.ai',
    'https://genspark.ai',
    'https://www.coswift.ai',
    'https://coswift.ai',
  ];

  function isAllowedOrigin(origin) {
    if (!origin) return true;
    for (var i = 0; i < ALLOWED_ORIGINS.length; i++) {
      if (origin === ALLOWED_ORIGINS[i]) return true;
    }
    return origin.endsWith('.genspark.ai') || origin.endsWith('.coswift.ai') || origin.endsWith('.genspark.site');
  }

  // ── Infinite-canvas viewport reset (__dc_reset, phase 2) ───────────
  // The design_canvas starter persists its pan/zoom transform to
  // localStorage ('dc-viewport:' + pathname) and re-writes it from a
  // pagehide flush during unload — so deleting the key and *then*
  // reloading would lose the race and resurrect the old transform.
  // Instead the __dc_reset message handler below only sets a
  // per-pathname sessionStorage flag and reloads; this startup block
  // (inject runs at document parse time, before the babel/React starter
  // mounts and restores) consumes the flag and deletes the key. The key
  // must be deleted exactly (not by prefix): the cookie-free serve
  // origin is shared by all public projects, so a prefix sweep would
  // wipe other projects' saved viewports.
  var DC_RESET_FLAG = '__dc_reset_pending:' + location.pathname;
  try {
    if (sessionStorage.getItem(DC_RESET_FLAG)) {
      sessionStorage.removeItem(DC_RESET_FLAG);
      try {
        localStorage.removeItem('dc-viewport:' + location.pathname);
      } catch (e) {}
    }
  } catch (e) {}

  // ── Console forwarding ──────────────────────────────────────────────
  ['log', 'warn', 'error'].forEach(function (k) {
    var orig = console[k];
    console[k] = function () {
      var msg = Array.prototype.slice
        .call(arguments)
        .map(function (a) {
          try {
            return typeof a === 'object' ? JSON.stringify(a) : String(a);
          } catch (e) {
            return '[unstringifiable]';
          }
        })
        .join(' ');
      try {
        P.postMessage({ __designer2_log: true, type: k, data: msg }, '*');
      } catch (e) {}
      orig.apply(console, arguments);
    };
  });

  // ── Global error forwarding ─────────────────────────────────────────
  window.addEventListener(
    'error',
    function (e) {
      var t = e.target;
      if (t && t !== window && t.tagName) {
        P.postMessage(
          {
            __designer2_log: true,
            type: 'resource_error',
            data: t.tagName + ' failed to load: ' + (t.src || t.href || ''),
          },
          '*'
        );
      } else {
        P.postMessage(
          {
            __designer2_log: true,
            type: 'error',
            data:
              (e.message || 'Error') +
              ' at ' +
              (e.filename || '?') +
              ':' +
              (e.lineno || 0),
          },
          '*'
        );
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    var msg = r instanceof Error ? r.message + ' ' + r.stack : String(r);
    P.postMessage(
      { __designer2_log: true, type: 'error', data: 'Unhandled rejection: ' + msg },
      '*'
    );
  });

  // ── Height reporting ────────────────────────────────────────────────
  function reportHeight() {
    try {
      P.postMessage(
        { type: 'designer2:height', height: document.documentElement.scrollHeight },
        '*'
      );
    } catch (e) {}
  }
  if (document.readyState === 'complete') reportHeight();
  else window.addEventListener('load', reportHeight);
  if (window.ResizeObserver)
    new ResizeObserver(reportHeight).observe(document.documentElement);

  // ── Escape key forwarding + canvas-zoom shortcut forwarding ─────────
  // The host's Designer2Canvas binds Cmd/Ctrl + =/-/0 to step the
  // preview-canvas zoom, but those keydown events never reach the host
  // document when focus is inside the iframe (the common case after
  // clicking into the canvas). Forward them up as __d2_zoom postMessage
  // so the host's _stepZoom runs regardless of focus.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      P.postMessage({ type: 'escape-pressed' }, '*');
      return;
    }
    if (!(e.metaKey || e.ctrlKey)) return;
    var dir = null;
    if (e.key === '=' || e.key === '+') dir = 'in';
    else if (e.key === '-') dir = 'out';
    else if (e.key === '0') dir = 'reset';
    if (!dir) return;
    e.preventDefault();
    P.postMessage({ type: '__d2_zoom', dir: dir }, '*');
  });

  // ── Remote JS eval (__d2_eval) ──────────────────────────────────────
  // ── window.genspark.complete() responses (__d2_api_r) ───────────────
  // ── Tweaks activation (__activate_edit_mode / __deactivate_edit_mode)
  window.addEventListener('message', function (e) {
    if (!e.data) return;
    if (!isAllowedOrigin(e.origin)) return;

    // Remote eval
    if (e.data.__d2_eval) {
      var evalId = e.data.id;
      function respond(payload) {
        e.source.postMessage(
          Object.assign(payload, { __d2_eval_r: 1, id: evalId }),
          e.origin === 'null' ? '*' : e.origin
        );
      }
      try {
        var result = eval(e.data.code);
        if (result && typeof result.then === 'function') {
          result.then(
            function (v) { respond({ ok: 1, v: JSON.stringify(v) }); },
            function (err) { respond({ ok: 0, e: String(err) }); }
          );
        } else {
          respond({ ok: 1, v: JSON.stringify(result) });
        }
      } catch (err) {
        respond({ ok: 0, e: String(err) });
      }
      return;
    }

    // Claude API responses (streaming)
    if (e.data.__d2_api_r) {
      var req = _d2_pending[e.data.id];
      if (!req) return;
      if (e.data.error != null) {
        clearTimeout(req.t);
        delete _d2_pending[e.data.id];
        req.reject(new Error(e.data.error));
      } else if (e.data.chunk != null) {
        clearTimeout(req.t);
        req.t = req.arm();
        req.text += e.data.chunk;
      } else if (e.data.done) {
        clearTimeout(req.t);
        delete _d2_pending[e.data.id];
        req.resolve(e.data.text != null ? e.data.text : req.text);
      }
      return;
    }

    // Tweaks activation / deactivation
    if (e.data.type === '__activate_edit_mode') {
      _tweaksActive = true;
      window.dispatchEvent(new CustomEvent('designer2:tweaks-activate'));
      return;
    }
    if (e.data.type === '__deactivate_edit_mode') {
      _tweaksActive = false;
      window.dispatchEvent(new CustomEvent('designer2:tweaks-deactivate'));
      return;
    }

    // Tweaks value updates from host
    if (e.data.type === '__edit_mode_set_keys' && e.data.edits) {
      window.dispatchEvent(
        new CustomEvent('designer2:tweaks-update', { detail: e.data.edits })
      );
      return;
    }

    // Screenshot capture
    if (e.data.type === '__d2_screenshot') {
      _captureScreenshot(e.data.id, !!e.data.hq);
      return;
    }

    // Speaker notes request
    if (e.data.type === '__d2_get_speaker_notes') {
      _sendSpeakerNotes();
      return;
    }

    // Infinite-canvas viewport reset (phase 1) — set the per-pathname
    // flag and reload; the startup block above deletes the persisted
    // viewport on the next load, before the starter can restore it.
    // (Deleting here instead would race the starter's pagehide flush.)
    if (e.data.type === '__dc_reset') {
      try {
        sessionStorage.setItem(DC_RESET_FLAG, '1');
      } catch (err) {}
      location.reload();
      return;
    }

    // Probe edit mode — relay to the page so LLM-generated code can respond.
    // Only the page itself knows if it implemented the tweaks protocol; the
    // inject script must NOT reply unconditionally.
    if (e.data.type === '__probe_edit_mode') {
      window.dispatchEvent(new CustomEvent('designer2:probe-edit-mode'));
      return;
    }

    // Design Mode activation — Comment + Inspect share this path.
    // Body cursor swap mirrors Edit mode (line ~1068) so the user sees
    // a pick-mode affordance the moment they hover into the iframe,
    // independent of whether the host's overlay highlight is visible
    // (e.g. at non-100% zoom or in poster mode where the overlay sits
    // in a different coord space).
    if (e.data.type === '__DESIGNER_ACTIVATE') {
      _dmActive = true;
      if (_dmOriginalBodyCursor === null) {
        _dmOriginalBodyCursor = document.body.style.cursor;
      }
      document.body.style.cursor = 'crosshair';
      return;
    }
    if (e.data.type === '__DESIGNER_DEACTIVATE') {
      _dmActive = false;
      if (_dmOriginalBodyCursor !== null) {
        document.body.style.cursor = _dmOriginalBodyCursor || '';
        _dmOriginalBodyCursor = null;
      }
      return;
    }
  });

  // ── window.genspark.complete() (with window.claude.complete alias) ──
  // The proxy routes to whichever cheap model the backend picks
  // (claude-haiku, gpt-nano, etc.) — `genspark.complete` is the
  // brand-correct name; `claude.complete` is kept as an alias so any
  // artifact ported in from claude.ai/design (Tiffany) keeps working.
  var _d2_pending = {};
  var _d2_seq = 0;
  var _d2_timeout = 30000;
  var _tweaksActive = false;

  window.genspark = {
    complete: function (body) {
      return new Promise(function (resolve, reject) {
        var id = 'd2_' + ++_d2_seq;
        var arm = function () {
          return setTimeout(function () {
            delete _d2_pending[id];
            reject(new Error('genspark.complete: timeout after ' + _d2_timeout / 1000 + 's'));
          }, _d2_timeout);
        };
        var timer = arm();
        _d2_pending[id] = { resolve: resolve, reject: reject, text: '', t: timer, arm: arm };
        try {
          P.postMessage({ __d2_api: true, id: id, body: body }, '*');
        } catch (err) {
          clearTimeout(timer);
          delete _d2_pending[id];
          reject(err);
        }
      });
    },
    // Ask the Designer V2 host to open another file from the same project as a
    // new canvas tab. Used by multi-poster gallery pages so clicking a card
    // keeps the user inside Designer V2 (poster toolbar / regen / edit all
    // still work) instead of yanking them to a raw /api/designer2/serve URL.
    // Returns true if the postMessage was dispatched (i.e. we have a parent
    // frame to talk to), false otherwise — callers can fall back to the link's
    // own href when this returns false, so the same gallery works standalone.
    openFile: function (path) {
      if (!path || typeof path !== 'string' || P === window) return false;
      try {
        P.postMessage({ type: 'designer2:open-file', path: path }, '*');
        return true;
      } catch (_e) {
        return false;
      }
    },
  };
  // Tiffany-compat alias — same object, both names accepted.
  window.claude = window.genspark;

  // ── window.omelette.writeFile (sidecar persistence for starters) ────
  // Starter components like image_slot.js persist user state to a
  // ``*.state.json`` sidecar (e.g. .image-slots.state.json on image drop).
  // Tiffany exposes this as window.omelette.writeFile. We mirror the API
  // so the same starter source works without modification. Server-side
  // path validation lives at /api/designer2/state/{project_id}; this
  // shim is the iframe-side bridge.
  window.omelette = window.omelette || {};
  if (!window.omelette.writeFile) {
    window.omelette.writeFile = async function (path, content) {
      // Project id comes from the iframe URL pattern enforced by the
      // service worker + backend routes: /api/designer2/serve/<pid>/...
      // No template substitution needed → inject stays static + cached.
      var m = window.location.pathname.match(
        /\/api\/designer2\/serve\/([^/]+)/,
      );
      if (!m) {
        throw new Error('omelette.writeFile: no project_id in iframe URL');
      }
      var url = '/api/designer2/state/' + encodeURIComponent(m[1]);
      var res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: path, content: String(content) }),
      });
      if (!res.ok) {
        var detail = '';
        try { detail = (await res.json()).detail || ''; } catch (_e) {}
        throw new Error(
          'omelette.writeFile failed: ' + res.status +
            (detail ? ' — ' + detail : ''),
        );
      }
      var body = await res.json();
      // Notify parent → syncFromRemote so the FE's IDB mirror catches up.
      try {
        P.postMessage(
          { type: 'omelette:write-success', path: path },
          '*',
        );
      } catch (_e) {}
      return body;
    };
  }

  // ── Screenshot capture ──────────────────────────────────────────────
  var _html2canvasLoaded = false;
  var _html2canvasLoading = false;

  var _html2canvasLoadError = null;

  function _loadHtml2Canvas(cb) {
    if (_html2canvasLoaded && window.html2canvas) { cb(); return; }
    if (_html2canvasLoadError) { cb(_html2canvasLoadError); return; }
    if (_html2canvasLoading) {
      var check = setInterval(function () {
        if (_html2canvasLoaded) { clearInterval(check); cb(); }
        else if (_html2canvasLoadError) { clearInterval(check); cb(_html2canvasLoadError); }
      }, 100);
      return;
    }
    _html2canvasLoading = true;
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = function () { _html2canvasLoaded = true; _html2canvasLoading = false; cb(); };
    s.onerror = function () {
      _html2canvasLoadError = new Error('Failed to load html2canvas');
      _html2canvasLoading = false;
      cb(_html2canvasLoadError);
    };
    document.head.appendChild(s);
  }

  function _captureScreenshot(requestId, hq) {
    _loadHtml2Canvas(function (err) {
      if (err) {
        P.postMessage({ type: '__d2_screenshot_result', id: requestId, error: err.message }, '*');
        return;
      }
      try {
        var body = document.body;
        // Pre-flight: refuse to capture if the body has zero dimensions.
        // html2canvas would synthesize a 0×0 canvas and `toDataURL()` on
        // a 0-dimension canvas returns the literal "data:," (per HTML
        // spec) which decodes to 0 bytes and silently writes empty files
        // to git. Fail loudly instead so the LLM gets a real error to
        // act on (e.g. wait for content to load, or pick a different
        // capture target).
        var sw = body ? body.scrollWidth : 0;
        var sh = body ? body.scrollHeight : 0;
        if (!sw || !sh) {
          P.postMessage({
            type: '__d2_screenshot_result',
            id: requestId,
            error:
              'preview body has zero dimensions (scrollWidth=' +
              sw +
              ', scrollHeight=' +
              sh +
              '); content may not be loaded yet',
          }, '*');
          return;
        }
        // Non-hq: cap output dimension at 1600px to keep file size reasonable
        // for long pages. hq preserves full devicePixelRatio resolution.
        var maxDim = Math.max(sw, sh, 1);
        var scale = hq
          ? (window.devicePixelRatio || 1)
          : Math.min(1, 1600 / maxDim);
        var mime = hq ? 'image/png' : 'image/jpeg';
        var quality = hq ? undefined : 0.85;
        window.html2canvas(body, {
          useCORS: true,
          allowTaint: true,
          scale: scale,
          logging: false,
        }).then(function (canvas) {
          // Defense in depth: even with non-zero body dims, html2canvas
          // can still produce a 0×0 canvas (e.g. fixed-position root,
          // display:contents on body). `toDataURL` on a 0-dim canvas
          // returns "data:," — short-circuit before postMessage so the
          // LLM never sees ok=true with 0 bytes.
          if (!canvas.width || !canvas.height) {
            P.postMessage({
              type: '__d2_screenshot_result',
              id: requestId,
              error:
                'html2canvas produced empty canvas (' +
                canvas.width +
                'x' +
                canvas.height +
                ')',
            }, '*');
            return;
          }
          var dataUrl = canvas.toDataURL(mime, quality);
          // toDataURL contract: a valid data URL is at minimum
          // "data:image/<fmt>;base64,<some-base64>". The literal
          // "data:," (canvas spec fallback) and any payload with an
          // empty base64 segment must be rejected here.
          var commaIdx = dataUrl.indexOf(',');
          var b64Len = commaIdx >= 0 ? dataUrl.length - commaIdx - 1 : 0;
          if (dataUrl === 'data:,' || b64Len < 32) {
            P.postMessage({
              type: '__d2_screenshot_result',
              id: requestId,
              error:
                'toDataURL returned empty payload (length=' +
                b64Len +
                '); body=' +
                sw +
                'x' +
                sh +
                ', canvas=' +
                canvas.width +
                'x' +
                canvas.height,
            }, '*');
            return;
          }
          P.postMessage({
            type: '__d2_screenshot_result',
            id: requestId,
            data: dataUrl,
            hq: !!hq,
          }, '*');
        }).catch(function (captureErr) {
          P.postMessage({ type: '__d2_screenshot_result', id: requestId, error: String(captureErr) }, '*');
        });
      } catch (syncErr) {
        P.postMessage({ type: '__d2_screenshot_result', id: requestId, error: String(syncErr) }, '*');
      }
    });
  }

  // ── Speaker Notes ────────────────────────────────────────────────────
  // Extract notes from <script type="application/json" id="speaker-notes">
  // and forward slideIndexChanged events to the parent.
  function _sendSpeakerNotes() {
    var notesEl = document.getElementById('speaker-notes');
    var notes = [];
    if (notesEl) {
      try {
        var parsed = JSON.parse(notesEl.textContent);
        if (Array.isArray(parsed)) notes = parsed;
      } catch (e) { /* ignore parse errors */ }
    }
    P.postMessage({ speakerNotes: notes }, '*');
  }

  // Forward slideIndexChanged from slide decks (e.g. Reveal.js)
  // so the parent SpeakerNotes panel can track the current slide.
  window.addEventListener('message', function (e) {
    if (e.data && typeof e.data.slideIndexChanged === 'number' && e.source === window) {
      P.postMessage({ slideIndexChanged: e.data.slideIndexChanged }, '*');
    }
  });

  // Also listen for Reveal.js-style events directly
  document.addEventListener('DOMContentLoaded', function () {
    if (window.Reveal) {
      try {
        window.Reveal.on('slidechanged', function (ev) {
          var idx = ev.indexh != null ? ev.indexh : 0;
          P.postMessage({ slideIndexChanged: idx }, '*');
        });
      } catch (e) { /* ignore */ }
    }
  });

  // ── Design Mode ─────────────────────────────────────────────────────
  var _ccSeq = 1;
  var _dmActive = false;
  var _dmOriginalBodyCursor = null;

  function ccStamp(el) {
    if (!el.getAttribute('data-cc-id')) {
      el.setAttribute('data-cc-id', 'cc-' + _ccSeq++);
    }
    return el.getAttribute('data-cc-id');
  }

  function domAncestry(el, limit) {
    var chain = [];
    var cur = el;
    for (var i = 0; i < (limit || 6) && cur && cur !== document.body; i++) {
      var tag = cur.tagName.toLowerCase();
      var elId = cur.id ? '#' + cur.id : '';
      var cls =
        cur.className && typeof cur.className === 'string'
          ? '.' + cur.className.split(' ').slice(0, 2).join('.')
          : '';
      var label = cur.getAttribute('data-screen-label');
      var labelStr = label ? '[' + label + ']' : '';
      chain.push(tag + elId + cls + labelStr);
      cur = cur.parentElement;
    }
    return chain.join(' > ');
  }

  document.addEventListener(
    'click',
    function (ev) {
      if (!_dmActive) return;
      ev.preventDefault();
      ev.stopPropagation();
      var el = ev.target;
      P.postMessage(
        {
          type: '__DESIGNER_ELEMENT_SELECTED__',
          data: {
            ccId: ccStamp(el),
            dom: domAncestry(el),
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').slice(0, 80).trim(),
            rect: el.getBoundingClientRect().toJSON(),
          },
        },
        '*'
      );
    },
    true
  );

  document.addEventListener(
    'mouseover',
    function (ev) {
      if (!_dmActive) return;
      var el = ev.target;
      ccStamp(el);
      P.postMessage(
        {
          type: '__DESIGNER_ELEMENT_HOVERED__',
          data: {
            ccId: el.getAttribute('data-cc-id'),
            dom: domAncestry(el),
            rect: el.getBoundingClientRect().toJSON(),
          },
        },
        '*'
      );
    },
    true
  );

  // ══════════════════════════════════════════════════════════════════════
  // Edit / Knobs mode
  //
  // Mirrors Claude Design's "Edit" button flow (captured via CDP on
  // claude.ai/design): click an element → right-side host panel renders
  // Typography / Size / Box (and Layout / Image when applicable) sections;
  // user drags a value → __knobsApply mutates inline style; on exit the host
  // calls __knobsGetAllChanged to build a natural-language "Apply N direct
  // edits" prompt sent to the LLM.
  //
  // Text editing is a sub-case: clicking a text element also flips it to
  // contenteditable with the same purple outline, so users can type directly
  // and that edit is committed alongside the style changes.
  // ══════════════════════════════════════════════════════════════════════

  var _editActive = false;
  // Saved body cursor value from before __enterEditMode overwrote it with
  // 'crosshair'. Restored on __exitEditMode so any pre-existing inline
  // cursor (e.g. source has <body style="cursor:pointer">) isn't lost.
  var _editOriginalBodyCursor = null;
  // Array of {el, selector} so host can render the selected element's
  // context panel. Kept as an array to leave room for future multi-select
  // parity with Claude Design (our MVP only ever has one entry).
  var _editSelected = [];
  // Runtime overlays and their state.
  var _editHoverOverlay = null;
  var _editSelectedOverlay = null;
  // Text-edit sub-state (set when the selected element is a text node).
  var _editTextCurrentEl = null;
  var _editTextOriginalText = null;
  var _editTextOriginalCE = null;
  var _editTextOriginalOutline = null;
  var _editTextOriginalOutlineOffset = null;
  // Accumulated text-edit changes across the whole session. When the
  // user edits text on element A then clicks B, A's change must be
  // captured here before _editFinishTextEdit nulls _editTextCurrentEl,
  // otherwise it's silently dropped from the exit prompt.
  var _editTextChanges = [];
  // Saved cssText baseline for Discard / diff. Each entry: {el, cssText, written}.
  // written is nulled until __knobsMarkWritten flips it to the latest on-disk
  // value, so the next __knobsGetAllChanged diff is relative to disk.
  var _knobsSaved = [];

  // Tiffany-parity §23 — parse a stamped `data-om-id` value into
  // `{srcVer, key}`. New format is `<8-hex-char-hash>:<key>`; legacy
  // unversioned values pass through as `{srcVer: null, key: <raw>}`.
  // The 8-hex strict prefix prevents accidental splits on legacy ids
  // like `om-script-6` (no leading 8-hex chars) and on text-id values
  // like `txt:foo.jsx:120:131` (prefix `txt` is not 8 hex chars).
  var _OM_VER_RE = /^([0-9a-f]{8}):(.+)$/;
  function _parseOmIdStamp(raw) {
    if (raw == null) return { srcVer: null, key: null };
    var m = _OM_VER_RE.exec(raw);
    if (m) return { srcVer: m[1], key: m[2] };
    return { srcVer: null, key: raw };
  }
  // Current src-ver from <html data-src-ver>. Used for stale-stamp
  // detection — see dispatcher.ts.
  function _readCurrentSrcVer() {
    try {
      return document.documentElement.getAttribute('data-src-ver') || null;
    } catch (e) {
      return null;
    }
  }

  function _editCreateOverlay(color) {
    var d = document.createElement('div');
    d.style.cssText =
      'position:fixed;pointer-events:none;border:2px solid ' + color +
      ';border-radius:4px;z-index:99999;transition:all 0.1s ease;display:none;';
    d.setAttribute('data-designer2-overlay', '1');
    document.body.appendChild(d);
    return d;
  }

  function _editPositionOverlay(overlay, el) {
    var r = el.getBoundingClientRect();
    overlay.style.left = (r.left - 2) + 'px';
    overlay.style.top = (r.top - 2) + 'px';
    overlay.style.width = (r.width + 4) + 'px';
    overlay.style.height = (r.height + 4) + 'px';
    overlay.style.display = 'block';
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  function _editIsTextElement(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (el.namespaceURI && el.namespaceURI.indexOf('svg') >= 0) return false;
    var t = (el.innerText || el.textContent || '').trim();
    if (!t) return false;
    // Direct-text node OR leaf element with text.
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.textContent.trim().length > 0) return true;
    }
    return el.children.length === 0;
  }

  function _editFallbackSelector(el) {
    if (el.id) {
      try {
        var idSel = '#' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id);
        if (document.querySelectorAll(idSel).length === 1) return idSel;
      } catch (e) {}
    }
    if (el === document.body) return 'body';
    var parent = el.parentNode;
    if (!parent || parent.nodeType !== 1) return el.tagName.toLowerCase();
    var siblings = Array.prototype.slice.call(parent.children);
    var index = siblings.indexOf(el);
    return _editFallbackSelector(parent) + ' > ' + el.tagName.toLowerCase()
      + ':nth-child(' + (index + 1) + ')';
  }

  function _editPickSelector(el) {
    // Never use data-cc-id here. cc-id is a runtime handle stamped by
    // Design Mode and stripped by __serializeDocument, so it's not
    // present in saved HTML / source files. The LLM couldn't resolve it.
    // A structural CSS path (id if unique, else nth-child chain from body)
    // is what survives the round-trip.
    return _editFallbackSelector(el);
  }

  // ── Context for host panel ──────────────────────────────────────────
  var _editStyleProps = [
    'display', 'position', 'width', 'height',
    'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'borderWidth', 'borderStyle', 'borderColor', 'borderRadius',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'borderTopLeftRadius', 'borderTopRightRadius',
    'borderBottomRightRadius', 'borderBottomLeftRadius',
    'backgroundColor', 'backgroundImage', 'backgroundSize',
    'backgroundPosition', 'objectFit',
    'color', 'fontSize', 'fontWeight', 'fontFamily', 'fontStyle',
    'lineHeight', 'letterSpacing', 'textAlign', 'textDecoration', 'textTransform',
    'gap', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap',
    'opacity', 'overflow', 'boxShadow', 'transform',
    'gridTemplateColumns', 'gridTemplateRows',
    'fill', 'stroke', 'strokeWidth',
  ];

  // Diff computed styles against a fresh element of the same tag; returns
  // only the props that differ. Don't set inline style on the temp —
  // `position` is in the list and would skew the baseline.
  //
  // CSSStyleDeclaration is live — if we read `comp[p]` AFTER appending the
  // temp element, structural pseudo-class selectors (e.g. :last-child,
  // :nth-child) relative to body would return values that reflect the
  // post-mutation state. Snapshot the node's props first into a plain
  // object, THEN append the temp.
  function _editNonDefaultStyles(node) {
    var compLive = window.getComputedStyle(node);
    var compSnap = {};
    for (var si = 0; si < _editStyleProps.length; si++) {
      compSnap[_editStyleProps[si]] = compLive[_editStyleProps[si]];
    }
    var temp = document.createElement(node.tagName);
    temp.style.cssText = 'visibility:hidden;pointer-events:none;';
    document.body.appendChild(temp);
    var def = window.getComputedStyle(temp);
    var out = {};
    for (var i = 0; i < _editStyleProps.length; i++) {
      var p = _editStyleProps[i];
      var v = compSnap[p];
      if (v && v !== def[p]) out[p] = v;
    }
    temp.remove();
    return out;
  }

  function _editRectOf(node) {
    var r = node.getBoundingClientRect();
    return {
      x: Math.round(r.left),
      y: Math.round(r.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  }

  // Font families actually loaded in this design (via @font-face / the Font
  // Loading API), deduped and sorted. Feeds the Font combobox's suggestions so
  // the picker searches THIS design's real fonts, not a generic list. System /
  // generic families aren't FontFace objects — the frontend adds web-safe
  // fallbacks on top.
  function _editAvailableFonts() {
    var seen = {};
    try {
      document.fonts.forEach(function (ff) {
        var fam = (ff.family || '').replace(/["']/g, '').trim();
        if (fam) seen[fam] = true;
      });
    } catch (e) {
      // FontFaceSet unavailable — frontend falls back to its curated list.
    }
    return Object.keys(seen).sort();
  }

  // Rewrite relative url()s in a CSS rule to absolute (against the sheet URL)
  // so @font-face src still resolves once the rule is moved to the parent doc.
  function _editAbsUrls(css, base) {
    return css.replace(/url\((['"]?)([^'")]+)\1\)/g, function (m, q, u) {
      if (/^(data:|https?:|\/\/)/.test(u)) return m;
      try {
        return 'url("' + new URL(u, base).href + '")';
      } catch (e) {
        return m;
      }
    });
  }

  // CSS that reproduces this design's @font-face declarations, so the edit
  // panel (which lives in the PARENT document) can preview each family in its
  // real typeface. Cross-origin font-CDN sheets (e.g. Google Fonts) are pulled
  // in via @import (their rules aren't readable); readable same-origin
  // @font-face rules are inlined with their url()s absolutized. Capped so a
  // pathological stylesheet can't bloat the context.
  function _editFontFaceCss() {
    var imports = [];
    var faces = [];
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      var rules = null;
      try {
        rules = sheet.cssRules;
      } catch (e) {
        rules = null;
      }
      if (rules) {
        for (var j = 0; j < rules.length; j++) {
          if (rules[j].type === 5 /* CSSFontFaceRule */) {
            faces.push(_editAbsUrls(rules[j].cssText, sheet.href || document.baseURI));
          }
        }
      } else if (
        sheet.href &&
        /(fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|fast\.fonts\.net)/.test(
          sheet.href
        )
      ) {
        imports.push('@import url("' + sheet.href + '");');
      }
    }
    return (imports.join('') + faces.join('')).slice(0, 40000);
  }

  window.__knobsGetContext = function () {
    var availableFonts = _editAvailableFonts();
    var fontFaceCss = _editFontFaceCss();
    return JSON.stringify(_editSelected.map(function (s) {
      var el = s.el;
      var styles = _editNonDefaultStyles(el);
      var cs = window.getComputedStyle(el);
      // Props that zero-diff out against the same-tag scratch temp — either
      // inherited from an ancestor (color, font*, text-align, text-transform)
      // or matching the tag's UA default (bold <strong>, italic <em>,
      // underlined <a>) — backfill from computed so the panel's selects reflect
      // the real render. The frontend maps text-align's initial 'start'/'end'
      // onto left/right.
      if (!styles.color && cs.color) styles.color = cs.color;
      if (!styles.fontFamily && cs.fontFamily) styles.fontFamily = cs.fontFamily;
      if (!styles.fontSize && cs.fontSize) styles.fontSize = cs.fontSize;
      if (!styles.fontWeight && cs.fontWeight) styles.fontWeight = cs.fontWeight;
      if (!styles.fontStyle && cs.fontStyle) styles.fontStyle = cs.fontStyle;
      if (!styles.textAlign && cs.textAlign) styles.textAlign = cs.textAlign;
      if (!styles.textTransform && cs.textTransform) {
        styles.textTransform = cs.textTransform;
      }
      if (!styles.textDecoration && cs.textDecorationLine) {
        styles.textDecoration = cs.textDecorationLine;
      }
      if (el === document.body) {
        var directBg = cs.backgroundColor;
        if (directBg && directBg !== 'rgba(0, 0, 0, 0)') {
          styles.backgroundColor = directBg;
        }
      }
      var attrs = {};
      for (var i = 0; i < el.attributes.length; i++) {
        var a = el.attributes[i];
        if (a.name !== 'style') {
          attrs[a.name] = (a.value || '').slice(0, 200);
        }
      }
      return {
        selector: s.selector,
        tag: el.tagName.toLowerCase(),
        attrs: attrs,
        styles: styles,
        inlineStyle: (el.getAttribute('style') || '').slice(0, 400),
        rect: _editRectOf(el),
        innerHTML: el.innerHTML.slice(0, 1000),
        isText: _editIsTextElement(el),
        availableFonts: availableFonts,
        fontFaceCss: fontFaceCss,
      };
    }));
  };

  // Save cssText for selected + ancestors up to 4 deep so Discard can
  // revert nested applyFn changes too (e.g. Size knob walks up to set
  // parent width). APPENDS entries rather than replacing: reselecting
  // must preserve earlier elements' baselines so their diffs survive
  // into __knobsGetAllChanged when the user exits after touching
  // multiple elements.
  function _knobsAlreadySaved(el) {
    for (var i = 0; i < _knobsSaved.length; i++) {
      if (_knobsSaved[i].el === el) return true;
    }
    return false;
  }
  window.__knobsSaveState = function () {
    _editSelected.forEach(function (s) {
      if (!_knobsAlreadySaved(s.el)) {
        _knobsSaved.push({ el: s.el, cssText: s.el.style.cssText });
      }
      var cur = s.el.parentElement;
      for (var i = 0; i < 4 && cur && cur !== document.body; i++) {
        if (!_knobsAlreadySaved(cur)) {
          _knobsSaved.push({ el: cur, cssText: cur.style.cssText });
        }
        cur = cur.parentElement;
      }
    });
  };

  window.__knobsRestoreState = function () {
    _knobsSaved.forEach(function (s) { s.el.style.cssText = s.cssText; });
    _knobsSaved = [];
  };

  function _knobsParseCss(t) {
    var m = {};
    (t || '').split(';').forEach(function (d) {
      var c = d.indexOf(':');
      if (c < 0) return;
      var k = d.slice(0, c).trim();
      var v = d.slice(c + 1).trim();
      if (k && v) m[k] = v;
    });
    return m;
  }

  // Returns [{selector, cssText}] — inline-style diffs since selection or
  // since last __knobsMarkWritten. Skips text-edit chrome props so the
  // outline/offset never surface as a user edit. body IS included —
  // LLMs can find `body` in the source and apply inline style there.
  //
  // Detects added, modified, AND removed properties: iterating only
  // `after` would miss deletions (baseline had a key, user cleared it).
  // Removed props are reported as `k: initial` so the LLM knows to
  // delete the rule from the source.
  window.__knobsGetAllChanged = function () {
    var out = [];
    _knobsSaved.forEach(function (s) {
      var base = s.written != null ? s.written : s.cssText;
      var before = _knobsParseCss(base);
      var after = _knobsParseCss(s.el.style.cssText);
      var parts = [];
      var seen = {};
      for (var k in after) {
        seen[k] = true;
        if (k === 'outline' || k === 'outline-offset') continue;
        if (after[k] !== before[k]) parts.push(k + ': ' + after[k]);
      }
      for (var k2 in before) {
        if (seen[k2]) continue;
        if (k2 === 'outline' || k2 === 'outline-offset') continue;
        parts.push(k2 + ': initial');
      }
      if (!parts.length) return;
      out.push({
        selector: _editPickSelector(s.el),
        cssText: parts.join('; '),
      });
    });
    return JSON.stringify(out);
  };

  window.__knobsMarkWritten = function () {
    _knobsSaved.forEach(function (s) { s.written = s.el.style.cssText; });
  };

  // Host eval path: `new Function('return ' + applyFnStr)()` compiles the
  // section's applyFn source and we call it with the parsed props against
  // each currently-selected element.
  window.__knobsApply = function (applyFnStr, propsJson) {
    try {
      var props = JSON.parse(propsJson);
      var fn = new Function('return ' + applyFnStr)();
      _editSelected.forEach(function (s) { fn(props, s.el); });
    } catch (e) {
      console.error('[designer2] knobs apply error:', e);
    }
  };

  window.__knobsSelectBody = function () {
    if (_editSelectedOverlay) _editSelectedOverlay.style.display = 'none';
    _editFinishTextEdit();
    _editSelected = [{ el: document.body, selector: 'body' }];
    _editEmitSelection(document.body, 'body', false);
    window.__knobsSaveState();
  };

  // ── Text-edit sub-state ──────────────────────────────────────────────
  function _editFinishTextEdit() {
    var el = _editTextCurrentEl;
    if (!el) return;
    // Commit the change to the session accumulator BEFORE we null state,
    // so subsequent clicks on other text elements don't drop this edit.
    try {
      // Issue #28304 Piece 3-A: use `textContent` not `innerText` so
      // the captured "before" / "after" preserve source whitespace
      // (newlines + indentation). Otherwise the dispatcher's
      // `ledger.canApply` compares innerText (CSS-collapsed) against
      // the textRun's raw source bytes and ALWAYS bails on indented
      // multi-line text (`<p>\n   X\n  </p>` is extremely common).
      // Bail-to-LLM rate drops from ~30% to ~10% on real designer2
      // pages once this lands.
      var now = el.textContent || '';
      if (_editTextOriginalText != null && now !== _editTextOriginalText) {
        // Issue #28304 Piece 2: stamp omId / omTextId alongside the
        // CSS selector so the source-map dispatcher can pick `text` /
        // `srcmap` cases. Reads pre-stamped attrs from the BE serve
        // pipeline (`stamp_om_ids`); falls back to null when absent
        // (the legacy bail-babel path still works on `selector`).
        var _parsedTe = _parseOmIdStamp(el.getAttribute('data-om-id'));
        // `data-om-text` is the JSX overlay marker; `data-om-text-id` is
        // the BE-stamper marker. Both encode `txt:<file>:<start>:<end>`.
        // Also look one level into descendants: when user clicks a JSX
        // parent (`<div>{text}</div>`), the __OmT wrapper is a span
        // CHILD of the clicked div, not the div itself. Pick it up if
        // exactly one __OmT descendant matches the edited textContent.
        var omTextIdAttr = el.getAttribute('data-om-text-id')
          || el.getAttribute('data-om-text')
          || null;
        if (!omTextIdAttr) {
          try {
            var nested = el.querySelectorAll('[data-om-text]');
            if (nested.length === 1) {
              omTextIdAttr = nested[0].getAttribute('data-om-text');
            }
          } catch (e) {}
        }
        _editTextChanges.push({
          selector: _editPickSelector(el),
          omId: _parsedTe.key,
          omIdSrcVer: _parsedTe.srcVer,
          currentSrcVer: _readCurrentSrcVer(),
          omTextId: omTextIdAttr,
          originalText: _editTextOriginalText,
          newText: now,
        });
      }
    } catch (e) {}
    try {
      if (_editTextOriginalCE == null) el.removeAttribute('contenteditable');
      else el.setAttribute('contenteditable', _editTextOriginalCE);
      el.style.outline = _editTextOriginalOutline || '';
      el.style.outlineOffset = _editTextOriginalOutlineOffset || '';
    } catch (e) {}
    _editTextCurrentEl = null;
    _editTextOriginalText = null;
    _editTextOriginalCE = null;
    _editTextOriginalOutline = null;
    _editTextOriginalOutlineOffset = null;
  }

  function _editBeginTextEdit(el) {
    _editFinishTextEdit();
    _editTextCurrentEl = el;
    // Issue #28304 Piece 3-A: see `_editFinishTextEdit` above. `textContent`
    // preserves source whitespace so canApply's byte-level equality
    // check against the sidecar's textRun bytes can succeed for
    // indented multi-line elements.
    _editTextOriginalText = el.textContent || '';
    _editTextOriginalCE = el.hasAttribute('contenteditable')
      ? el.getAttribute('contenteditable')
      : null;
    _editTextOriginalOutline = el.style.outline;
    _editTextOriginalOutlineOffset = el.style.outlineOffset;
    el.setAttribute('contenteditable', 'true');
    el.style.outline = '2px solid #8B5CF6';
    el.style.outlineOffset = '2px';
    try { el.focus(); } catch (e) {}
  }

  // Emit a selection-changed signal to host via postMessage. Host reacts
  // by calling __knobsGetContext and rendering the right-side panel.
  function _editEmitSelection(el, selector, isText) {
    try {
      var _parsedSel = _parseOmIdStamp(el.getAttribute('data-om-id'));
      P.postMessage({
        type: '__DESIGNER_KNOBS_SELECTED__',
        data: {
          selector: selector,
          // Issue #28304 Piece 2 — pre-stamped at serve time
          // (`stamp_om_ids`). Null on legacy / unstamped pages.
          // §23 src-ver: prefix parsed off here so downstream
          // sidecar lookups still receive the bare entry key
          // (`om-<tag>-<n>`). The version comes back through
          // `omIdSrcVer` + `currentSrcVer` for stale-stamp
          // detection in the dispatcher.
          omId: _parsedSel.key,
          omIdSrcVer: _parsedSel.srcVer,
          currentSrcVer: _readCurrentSrcVer(),
          omTextId: el.getAttribute('data-om-text-id')
            || el.getAttribute('data-om-text')
            || (function () {
                // Fall back to a single __OmT descendant (JSX overlay
                // wraps the text inside its parent JSX element).
                try {
                  var nested = el.querySelectorAll('[data-om-text]');
                  if (nested.length === 1) return nested[0].getAttribute('data-om-text');
                } catch (e) {}
                return null;
              })(),
          tag: el.tagName.toLowerCase(),
          rect: _editRectOf(el),
          isText: isText,
          originalText: isText ? _editTextOriginalText : null,
        },
      }, '*');
    } catch (e) {}
  }

  // ── Event wiring ─────────────────────────────────────────────────────
  document.addEventListener('mousemove', function (e) {
    if (!_editActive || !_editHoverOverlay) return;
    var el = null;
    try {
      if (document.elementFromPoint) {
        el = document.elementFromPoint(e.clientX, e.clientY);
      }
    } catch (err) {}
    if (!el || el === document.body || el === document.documentElement) {
      _editHoverOverlay.style.display = 'none';
      return;
    }
    // Don't double-highlight the currently-selected element.
    if (_editSelected.some(function (s) { return s.el === el; })) {
      _editHoverOverlay.style.display = 'none';
      return;
    }
    _editPositionOverlay(_editHoverOverlay, el);
  });

  document.addEventListener('mouseleave', function () {
    if (!_editActive || !_editHoverOverlay) return;
    _editHoverOverlay.style.display = 'none';
  });

  document.addEventListener('click', function (ev) {
    if (!_editActive) return;
    // Click inside the text-editing element: let the browser handle caret
    // placement / text selection naturally.
    if (_editTextCurrentEl && (ev.target === _editTextCurrentEl
        || _editTextCurrentEl.contains(ev.target))) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (_editHoverOverlay) _editHoverOverlay.style.display = 'none';
    _editFinishTextEdit();

    var el = null;
    try {
      if (document.elementFromPoint) {
        el = document.elementFromPoint(ev.clientX, ev.clientY);
      }
    } catch (err) {}
    if (!el) el = ev.target;
    if (!el || el === document.body || el === document.documentElement) {
      if (_editSelectedOverlay) _editSelectedOverlay.style.display = 'none';
      return;
    }

    var selector = _editPickSelector(el);
    _editSelected = [{ el: el, selector: selector }];
    window.__knobsSaveState();

    var isText = _editIsTextElement(el);
    if (isText) {
      // Text-edit sub-case: element becomes contenteditable with outline-on-element;
      // the selected overlay hides because the element's own outline is the
      // selection affordance.
      if (_editSelectedOverlay) _editSelectedOverlay.style.display = 'none';
      _editBeginTextEdit(el);
    } else {
      if (!_editSelectedOverlay) _editSelectedOverlay = _editCreateOverlay('#8B5CF6');
      _editPositionOverlay(_editSelectedOverlay, el);
    }
    _editEmitSelection(el, selector, isText);
  }, true);

  // ── Public mode-toggle API ───────────────────────────────────────────
  window.__enterEditMode = function () {
    _editActive = true;
    _editOriginalBodyCursor = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';
    if (!_editHoverOverlay) _editHoverOverlay = _editCreateOverlay('#10B981');
    if (!_editSelectedOverlay) _editSelectedOverlay = _editCreateOverlay('#8B5CF6');
    _editSelected = [];
    _knobsSaved = [];
    _editTextChanges = [];
  };

  window.__exitEditMode = function () {
    _editActive = false;
    _editFinishTextEdit();
    if (_editHoverOverlay) _editHoverOverlay.style.display = 'none';
    if (_editSelectedOverlay) _editSelectedOverlay.style.display = 'none';
    // Restore the body's original cursor instead of blank-clearing it,
    // so a source-set cursor (e.g. inline style="cursor:pointer")
    // survives an edit session.
    document.body.style.cursor = _editOriginalBodyCursor || '';
    _editOriginalBodyCursor = null;
    _editSelected = [];
    _knobsSaved = [];
  };

  window.__textEditFinish = function () { _editFinishTextEdit(); };

  // Returns all text-edit changes made during this edit session as a
  // JSON array of {selector, originalText, newText}. Commits the
  // currently-editing element first, so its change is included even
  // if the user hasn't clicked away. Empty array string ("[]") when
  // nothing has changed.
  window.__textEditGetChange = function () {
    _editFinishTextEdit();
    return JSON.stringify(_editTextChanges.slice());
  };

  // ── Source-map text override registry (#28304 Piece 2-B) ─────────────
  //
  // The FE dispatcher's `text` patcher (Tiffany `n_()`) needs:
  //   - `window.__omTextO`  — { omTextId: newText, ... } accumulator
  //   - `window.__omTextSet({omTextId: newText, ...})` — apply to DOM
  //
  // omTextId carries the byte range of an element's single text run
  // (`txt:<file>:<start>:<end>`), pre-stamped by the BE at serve time
  // (`stamp_om_ids`). Each call merges into the registry so concurrent
  // edits accumulate, and the corresponding `[data-om-text-id=...]`
  // element's textContent is updated in place — no iframe reload, no
  // postMessage round-trip back to the host.
  //
  // Single-text-run leaf elements only (the stamper only stamps those).
  // Multi-run / mixed-content elements: the FE patcher bails to chat.
  window.__omTextO = window.__omTextO || {};
  window.__omTextSet = function (updates) {
    if (!updates || typeof updates !== 'object') return 0;
    var applied = 0;
    // Merge into the registry first so a follow-up __omTextSet (or a
    // late-mounted DOM node that adopts data-om-text-id from a script)
    // can read the current authoritative override.
    for (var k in updates) {
      if (!Object.prototype.hasOwnProperty.call(updates, k)) continue;
      var v = updates[k];
      if (typeof v !== 'string') continue;
      window.__omTextO[k] = v;
    }
    // Single querySelectorAll pass, matching by attribute value in JS —
    // avoids CSS selector escaping for omTextId values that contain
    // characters with attribute-selector meaning (`'`, `"`, `\`, etc.
    // would all need CSS.escape in a `[attr="..."]` selector). Cheap:
    // typical pages have under a few hundred stamped text leaves.
    try {
      var nodes = document.querySelectorAll('[data-om-text-id]');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var id = el.getAttribute('data-om-text-id');
        if (id != null && Object.prototype.hasOwnProperty.call(updates, id)) {
          var nv = updates[id];
          if (typeof nv === 'string') {
            el.textContent = nv;
            applied++;
          }
        }
      }
    } catch (e) {}
    // Notify React subscribers so <__OmT> components re-render.
    try {
      window.__omTextSubVersion = (window.__omTextSubVersion || 0) + 1;
      var subs = window.__omTextSubscribers;
      if (subs) subs.forEach(function (cb) { try { cb(); } catch (e) {} });
    } catch (e) {}
    return applied;
  };

  // Tiffany-parity JSX text overlay: Babel plugin wraps JSX text in
  // <__OmT i="txt:..."> components; React subscribes via
  // useSyncExternalStore so __omTextSet triggers a re-render with the
  // override. Verbatim port — see docs/design-v2-tiffany-analysis-
  // 2026-04-28/23-stamp-and-serve-architecture.md §5 Section 3.
  window.__omTextSubscribers = window.__omTextSubscribers || new Set();
  window.__omTextSubVersion = window.__omTextSubVersion || 0;

  // Register __OmT. React is guaranteed to be loaded when this
  // component executes (React itself is the only caller, via
  // Babel-compiled JSX rendering). Hooks must be called in the same
  // order every render — call useSyncExternalStore unconditionally.
  // Bugbot #31915 R3.
  if (!window.__OmT) {
    var _subscribe = function (cb) {
      window.__omTextSubscribers.add(cb);
      return function () { window.__omTextSubscribers.delete(cb); };
    };
    var _getSnapshot = function () { return window.__omTextSubVersion; };
    window.__OmT = function OmT(props) {
      var R = window.React;
      R.useSyncExternalStore(_subscribe, _getSnapshot, _getSnapshot);
      var store = window.__omTextO || {};
      var i = props && props.i;
      var content = (i != null && Object.prototype.hasOwnProperty.call(store, i))
        ? store[i]
        : (props ? props.children : null);
      return R.createElement(
        'span', { 'data-om-text': i, className: '__om-t' }, content
      );
    };
  }

  // ── HTML serialize (used for static-page text writes) ────────────────
  window.__serializeDocument = function () {
    // Snapshot then strip edit-mode DOM artifacts. Restore in document
    // order using pre-captured child indices so adjacent injected siblings
    // don't reorder. Tweaks panel chrome (`.twk-panel`, `.twk-sugg`) is
    // also stripped — issue #30147.
    var strip = Array.from(document.querySelectorAll(
      'script[data-designer2-injected], [data-designer2-overlay], ' +
        '.twk-panel, .twk-sugg'
    ));
    var positions = strip.map(function (el) {
      return {
        node: el,
        parent: el.parentNode,
        index: Array.prototype.indexOf.call(el.parentNode.children, el),
      };
    });
    // Temporarily clear edit chrome on the text-editing element so the
    // saved HTML doesn't include the purple outline / contenteditable.
    var te = _editTextCurrentEl;
    var saveOutline = null, saveOffset = null, saveCE = null;
    if (te) {
      saveCE = te.hasAttribute('contenteditable')
        ? te.getAttribute('contenteditable') : null;
      saveOutline = te.style.outline;
      saveOffset = te.style.outlineOffset;
      if (_editTextOriginalCE == null) te.removeAttribute('contenteditable');
      else te.setAttribute('contenteditable', _editTextOriginalCE);
      te.style.outline = _editTextOriginalOutline || '';
      te.style.outlineOffset = _editTextOriginalOutlineOffset || '';
    }
    // Strip body cursor (crosshair during edit mode).
    var saveCursor = document.body.style.cursor;
    if (_editActive) document.body.style.cursor = '';
    // Strip data-cc-id stamps (runtime handles, not source markup).
    var ccEls = document.querySelectorAll('[data-cc-id]');
    var ccSaved = [];
    ccEls.forEach(function (el) {
      ccSaved.push({ el: el, val: el.getAttribute('data-cc-id') });
      el.removeAttribute('data-cc-id');
    });
    // Strip serve-time stamps too. data-om-id / data-om-text-id are
    // generated by `stamp_om_ids` (#28304 Piece 2-A) on every serve and
    // MUST NOT leak into the saved HTML: any persisted id becomes a
    // false-positive for the BE's "skip re-stamp if already present"
    // guard on subsequent serves, freezing stale ids that no longer
    // match the regenerated sidecar after edits. Bugbot #28507 R1.
    var omEls = document.querySelectorAll(
      '[data-om-id], [data-om-text-id], [data-src-ver], [data-om-text], [data-om-text-attrs]'
    );
    var omSaved = [];
    omEls.forEach(function (el) {
      omSaved.push({
        el: el,
        omId: el.hasAttribute('data-om-id') ? el.getAttribute('data-om-id') : null,
        omTextId: el.hasAttribute('data-om-text-id') ? el.getAttribute('data-om-text-id') : null,
        srcVer: el.hasAttribute('data-src-ver') ? el.getAttribute('data-src-ver') : null,
        omText: el.hasAttribute('data-om-text') ? el.getAttribute('data-om-text') : null,
        omTextAttrs: el.hasAttribute('data-om-text-attrs') ? el.getAttribute('data-om-text-attrs') : null,
      });
      el.removeAttribute('data-om-id');
      el.removeAttribute('data-om-text-id');
      el.removeAttribute('data-src-ver');
      el.removeAttribute('data-om-text');
      el.removeAttribute('data-om-text-attrs');
    });
    // Issue #28304 Piece 3-A2: unwrap editing-time text-run wrapper
    // spans. The BE stamper injects `<span data-designer2-textrun-
    // wrapper ...>` around each textRun of mixed-content elements so
    // a click on a specific text segment can route through the
    // `srcmap` silent path; the wrapper element itself is NEVER part
    // of the user's source and MUST NOT leak into the saved HTML.
    // We unwrap (move children up to parent, remove wrapper) instead
    // of just stripping the attr because removing the wrapper element
    // is structurally required — leaving an empty `<span>` shell
    // would change the rendered DOM.
    //
    // We DO restore wrappers post-serialize (see wrapSaved loop
    // further down) so the in-iframe live editing session keeps its
    // textRun-level click targets without needing a full reload.
    var wrapEls = Array.from(
      document.querySelectorAll('[data-designer2-textrun-wrapper]')
    );
    var wrapSaved = [];
    wrapEls.forEach(function (w) {
      var parent = w.parentNode;
      if (!parent) return;
      // Capture wrapper + its position so we can restore for live
      // editing after the serialize completes.
      var siblingsBefore = Array.from(parent.childNodes);
      var idx = siblingsBefore.indexOf(w);
      var children = Array.from(w.childNodes);
      wrapSaved.push({ wrapper: w, parent: parent, index: idx, children: children });
      // Unwrap: move children up, then remove wrapper.
      while (w.firstChild) parent.insertBefore(w.firstChild, w);
      parent.removeChild(w);
    });
    strip.forEach(function (el) { el.parentNode.removeChild(el); });
    var html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    // Restore in forward order using captured indices.
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      var children = p.parent.children;
      if (p.index >= children.length) p.parent.appendChild(p.node);
      else p.parent.insertBefore(p.node, children[p.index]);
    }
    ccSaved.forEach(function (s) {
      try { s.el.setAttribute('data-cc-id', s.val); } catch (e) {}
    });
    omSaved.forEach(function (s) {
      try {
        if (s.omId != null) s.el.setAttribute('data-om-id', s.omId);
        if (s.omTextId != null) s.el.setAttribute('data-om-text-id', s.omTextId);
        if (s.srcVer != null) s.el.setAttribute('data-src-ver', s.srcVer);
        if (s.omText != null) s.el.setAttribute('data-om-text', s.omText);
        if (s.omTextAttrs != null) s.el.setAttribute('data-om-text-attrs', s.omTextAttrs);
      } catch (e) {}
    });
    // Restore textRun wrappers for the live editing session (#28304
    // Piece 3-A2). Re-collect each wrapper's original children (which
    // we just moved into the parent's position) and re-wrap them.
    wrapSaved.forEach(function (s) {
      try {
        var w = s.wrapper;
        // Re-insert wrapper at its original position; then move children back.
        var parent = s.parent;
        var childrenSnap = s.children;
        // Detach all live nodes we just promoted, in order.
        childrenSnap.forEach(function (c) {
          if (c.parentNode) c.parentNode.removeChild(c);
        });
        // Re-attach wrapper to the parent at original index.
        var liveSiblings = parent.childNodes;
        if (s.index >= liveSiblings.length) parent.appendChild(w);
        else parent.insertBefore(w, liveSiblings[s.index]);
        childrenSnap.forEach(function (c) { w.appendChild(c); });
      } catch (e) {}
    });
    if (te) {
      if (saveCE == null) te.removeAttribute('contenteditable');
      else te.setAttribute('contenteditable', saveCE);
      te.style.outline = saveOutline;
      te.style.outlineOffset = saveOffset;
    }
    if (_editActive) document.body.style.cursor = saveCursor;
    return html;
  };

  // ── Babel JSX auto-config + per-script source cache (issue #30147) ──
  // `transform-react-jsx-source` makes Babel emit `_debugSource` on each
  // JSX element's fiber. `__babelScriptSources` caches the original
  // source so the host can parse + patch via patchJsxStyleBatch.
  // Multi-alias keys handle the babel-standalone naming conventions
  // ("Inline Babel script (N)" for inline, absolute URL for external).
  //
  // Tiffany-parity §23 P1: also register `om-src-id` plugin so every
  // JSXOpeningElement gets `data-om-id="jsx:<file>:<byte>:<line>:<col>"`
  // baked in at compile time. Lets `getJSXLoc` short-circuit fiber-walk
  // → direct attribute read for stamped elements. Verbatim port from
  // Tiffany's inject-script (`<script data-omelette-injected>`).
  window.__babelScriptSources = window.__babelScriptSources || {};
  document.addEventListener('DOMContentLoaded', function () {
    // Register om-src-id once (guarded against double-register; Babel
    // throws on duplicate plugin name).
    var Babel = window.Babel;
    var OM_SRC_ID = 'om-src-id';
    // §23 P1 — track whether the plugin is actually registered. If
    // Babel isn't on `window` yet at DOMContentLoaded (loaded async,
    // bundle-delay, etc.), we must NOT add 'om-src-id' to any
    // <script type="text/babel">'s data-plugins — Babel would later
    // try to resolve the unknown plugin name and abort compilation
    // (Bugbot R2 #31427).
    var _omSrcIdRegistered = false;
    if (Babel && Babel.registerPlugin
        && !(Babel.availablePlugins && Babel.availablePlugins[OM_SRC_ID])) {
      _omSrcIdRegistered = true;
      Babel.registerPlugin(OM_SRC_ID, function (api) {
        var t = api.types;
        return {
          visitor: {
            JSXOpeningElement: function (path, state) {
              var node = path.node;
              // <Component.Sub> — JSXMemberExpression has no stable
              // source filename binding, skip.
              if (node.name && node.name.type === 'JSXMemberExpression') return;
              // Idempotent: skip if data-om-id already present (user-authored
              // or another plugin stamped first).
              for (var i = 0; i < node.attributes.length; i++) {
                var a = node.attributes[i];
                if (a.type === 'JSXAttribute' && a.name
                    && a.name.name === 'data-om-id') return;
              }
              var fileName = (state.file && state.file.opts && state.file.opts.filename) || '?';
              var loc = node.loc && node.loc.start;
              // Column is 0-indexed (Babel AST convention, also what
              // React fiber's `_debugSource.columnNumber` returns).
              // Tiffany's verbatim plugin emits `column + 1` because
              // their `findJSXElementAtLoc` consumer is 1-indexed;
              // ours (`frontend-nuxt/composables/designer2/srcmap/
              // patchJsxStyle.ts:155`) compares against 0-indexed
              // `start.column` — so we emit 0-indexed here. Bugbot
              // R3 #31427 caught the mismatch.
              var id = 'jsx:' + fileName + ':'
                + (node.start == null ? 0 : node.start) + ':'
                + (loc ? loc.line : 0) + ':'
                + (loc ? loc.column : 0);
              node.attributes.push(
                t.jsxAttribute(t.jsxIdentifier('data-om-id'), t.stringLiteral(id))
              );
            }
          }
        };
      });
    }

    // om-text-extract Babel plugin: wraps JSX text in <__OmT> and
    // interpolates EDITABLE_ATTRS string literals through window.__omTextO.
    var OM_TEXT_EXTRACT = 'om-text-extract';
    var _omTextExtractRegistered = false;
    if (Babel && Babel.registerPlugin
        && !(Babel.availablePlugins && Babel.availablePlugins[OM_TEXT_EXTRACT])) {
      _omTextExtractRegistered = true;
      Babel.registerPlugin(OM_TEXT_EXTRACT, function (api) {
        var t = api.types;
        var SKIP_ELEMENTS = {
          style: 1, script: 1, noscript: 1, textarea: 1,
          title: 1, option: 1, text: 1, tspan: 1, textPath: 1,
          __OmT: 1
        };
        var EDITABLE_ATTRS = {
          placeholder: 1, alt: 1, title: 1, label: 1,
          'aria-label': 1, 'aria-description': 1, 'aria-placeholder': 1
        };

        var getFile = function (s) {
          return (s.file && s.file.opts && s.file.opts.filename) || '?';
        };
        var getCode = function (s) {
          return (s.file && s.file.code) || '';
        };

        // (window.__omTextO || {})[id] ?? originalLiteral
        var wrapWithStore = function (textId, originalLit) {
          return t.logicalExpression('??',
            t.memberExpression(
              t.logicalExpression('||',
                t.memberExpression(t.identifier('window'), t.identifier('__omTextO')),
                t.objectExpression([])
              ),
              t.stringLiteral(textId), true
            ),
            originalLit
          );
        };

        // Resolve byte range of a string literal (or const-bound id pointing at one).
        var resolveStringRange = function (path, node) {
          var isLit = function (n) {
            if (!n || n.start == null || n.end == null) return null;
            if (n.type === 'StringLiteral') return [n.start, n.end];
            if (n.type === 'TemplateLiteral' && n.expressions.length === 0) {
              return [n.start, n.end];
            }
            return null;
          };
          var r = isLit(node);
          if (r) return r;
          if (node && node.type === 'Identifier' && path.scope) {
            var binding = path.scope.getBinding(node.name);
            if (binding && binding.constant
                && binding.path && binding.path.node
                && binding.path.node.type === 'VariableDeclarator') {
              return isLit(binding.path.node.init);
            }
          }
          return null;
        };

        var wrapChildren = function (path, fileName, code) {
          var node = path.node;
          if (!node.children || !node.children.length) return;
          // Babel AST .start/.end are JS-string (UTF-16 code unit) offsets.
          // Downstream dispatcher works in UTF-8 byte offsets to match BE
          // stamper convention. Convert via TextEncoder once per emit.
          var enc = new TextEncoder();
          var charToByte = function (charPos) {
            if (charPos <= 0) return 0;
            return enc.encode(code.slice(0, charPos)).length;
          };
          var didWrap = false;
          var wrap = function (textId, child) {
            didWrap = true;
            return t.jsxElement(
              t.jsxOpeningElement(
                t.jsxIdentifier('__OmT'),
                [t.jsxAttribute(t.jsxIdentifier('i'), t.stringLiteral(textId))],
                false
              ),
              t.jsxClosingElement(t.jsxIdentifier('__OmT')),
              [child],
              false
            );
          };

          var newChildren = node.children.map(function (child) {
            if (child.type === 'JSXText') {
              if (child.start == null || child.end == null) return child;
              var raw = code.slice(child.start, child.end);
              // Skip pure-whitespace; tighten range excluding leading/trailing ws.
              var lead = raw.length - raw.replace(/^\s+/, '').length;
              var trail = raw.length - raw.replace(/\s+$/, '').length;
              if (lead + trail >= raw.length) return child;
              return wrap(
                'txt:' + fileName + ':' +
                  charToByte(child.start + lead) + ':' + charToByte(child.end - trail),
                child
              );
            }
            if (child.type === 'JSXExpressionContainer') {
              var range = resolveStringRange(path, child.expression);
              if (range) {
                // StringLiteral / no-interp TemplateLiteral .start/.end span
                // the quote/backtick chars; skip them so byte range matches
                // the literal's runtime value. Bugbot #31915 R4.
                return wrap(
                  'str:' + fileName + ':' + charToByte(range[0] + 1) + ':' + charToByte(range[1] - 1),
                  child
                );
              }
            }
            return child;
          });

          if (didWrap) node.children = newChildren;
        };

        return {
          visitor: {
            JSXOpeningElement: function (path, state) {
              var node = path.node;
              if (!node.attributes || !node.attributes.length) return;
              var fileName = getFile(state);
              var code = getCode(state);
              var encA = new TextEncoder();
              var charToByteA = function (charPos) {
                if (charPos <= 0) return 0;
                return encA.encode(code.slice(0, charPos)).length;
              };
              var attrIds = {};
              for (var i = 0; i < node.attributes.length; i++) {
                var attr = node.attributes[i];
                if (attr.type !== 'JSXAttribute' || !attr.name) continue;
                var aname = attr.name.name;
                if (!EDITABLE_ATTRS[aname]) continue;
                if (!attr.value || attr.value.type !== 'StringLiteral') continue;
                if (attr.value.start == null || attr.value.end == null) continue;
                // `str:` (not `txt:`) — attribute values sit inside a JS
                // string literal, so dispatcher must bail on `"`/`'`/`\`.
                var textId = 'str:' + fileName + ':'
                  + charToByteA(attr.value.start + 1) + ':' + charToByteA(attr.value.end - 1);
                attrIds[aname] = textId;
                attr.value = t.jsxExpressionContainer(
                  wrapWithStore(textId, t.stringLiteral(attr.value.value))
                );
              }
              if (Object.keys(attrIds).length) {
                node.attributes.push(
                  t.jsxAttribute(
                    t.jsxIdentifier('data-om-text-attrs'),
                    t.stringLiteral(JSON.stringify(attrIds))
                  )
                );
              }
            },
            JSXElement: function (path, state) {
              var opening = path.node.openingElement;
              var nameNode = opening && opening.name;
              if (!nameNode) return;
              var name = nameNode.name;
              // Skip JSXMemberExpression (<Foo.Bar>); skip non-editable tags.
              if (typeof name !== 'string') return;
              if (SKIP_ELEMENTS[name]) return;
              wrapChildren(path, getFile(state), getCode(state));
            },
            JSXFragment: function (path, state) {
              wrapChildren(path, getFile(state), getCode(state));
            }
          }
        };
      });
    }

    document
      .querySelectorAll('script[type="text/babel"],script[type="text/jsx"]')
      .forEach(function (s, i) {
        var plugins = s.getAttribute('data-plugins') || '';
        var srcPlugin = 'transform-react-jsx-source';
        // Babel 8 removed this built-in; injecting the name aborts ALL
        // text/babel compilation ("Invalid plugin specified in Babel
        // options") — whole-page white screen on unpinned-Babel pages.
        // Guarded like om-src-id below (Bugbot R2 #31427): only the
        // fiber-walk srcmap fallback is lost; data-om-id stamps still
        // work (registerPlugin exists on 8.x).
        var srcPluginAvailable = !!(window.Babel
            && window.Babel.availablePlugins
            && window.Babel.availablePlugins[srcPlugin]);
        if (srcPluginAvailable && plugins.indexOf(srcPlugin) < 0) {
          s.setAttribute('data-plugins', plugins ? plugins + ',' + srcPlugin : srcPlugin);
        } else if (!srcPluginAvailable && window.Babel && i === 0) {
          console.warn(
            '[designer2] Babel ' + (window.Babel.version || '?') + ' lacks '
            + srcPlugin + ' (removed in Babel 8) — source-map fallback for '
            + 'click-to-edit is disabled on this page. Use the pinned stack '
            + 'from the starter header: @babel/standalone@7.29.0 + '
            + 'react@18.3.1 development UMD, with integrity attributes.');
        }
        // §23 P1: enable om-src-id on every babel script — but
        // ONLY when the plugin actually got registered above. If
        // Babel wasn't on `window` yet (loaded async), adding the
        // plugin name here would later abort Babel compilation
        // when it tries to resolve the unknown name. Re-check
        // `availablePlugins` at use site to also catch the case
        // where another script registered the plugin between our
        // check and now.
        if (_omSrcIdRegistered
            || (window.Babel
                && window.Babel.availablePlugins
                && window.Babel.availablePlugins[OM_SRC_ID])) {
          var current = s.getAttribute('data-plugins') || '';
          if (current.indexOf(OM_SRC_ID) < 0) {
            s.setAttribute('data-plugins', current ? current + ',' + OM_SRC_ID : OM_SRC_ID);
          }
        }
        if (_omTextExtractRegistered
            || (window.Babel
                && window.Babel.availablePlugins
                && window.Babel.availablePlugins[OM_TEXT_EXTRACT])) {
          var currentExt = s.getAttribute('data-plugins') || '';
          if (currentExt.indexOf(OM_TEXT_EXTRACT) < 0) {
            s.setAttribute(
              'data-plugins',
              currentExt ? currentExt + ',' + OM_TEXT_EXTRACT : OM_TEXT_EXTRACT
            );
          }
        }
        var srcAttr = s.getAttribute('src');
        var fileName = s.getAttribute('data-filename') || srcAttr || 'inline-' + i;
        if (!s.hasAttribute('data-filename')) {
          s.setAttribute('data-filename', fileName);
        }
        var entry = {
          src: srcAttr || null,
          idx: i,
          codeOrig: null,
          jsxMutated: false,
          fileName: fileName,
        };
        if (!srcAttr) {
          entry.codeOrig = s.textContent || '';
        } else {
          fetch(srcAttr, { credentials: 'same-origin' })
            .then(function (r) { return r.ok ? r.text() : null; })
            .then(function (text) { if (text != null) entry.codeOrig = text; })
            .catch(function () { /* ignore */ });
        }
        var aliases = [fileName];
        if (!srcAttr) {
          aliases.push('Inline Babel script (' + (i + 1) + ')');
          if (i === 0) aliases.push('Inline Babel script');
        } else {
          try {
            var abs = new URL(srcAttr, document.baseURI).href;
            if (abs !== srcAttr) aliases.push(abs);
          } catch (e) {}
        }
        for (var ai = 0; ai < aliases.length; ai++) {
          window.__babelScriptSources[aliases[ai]] = entry;
        }
      });
  });

  // Look up a __babelScriptSources entry tolerant of two fileName forms
  // that both surface in the JSX-stamping pipeline:
  //   - the raw HTML attribute / data-filename (e.g. `app.jsx`)
  //   - the resolved absolute URL (e.g. `http://host/.../app.jsx`)
  //   - babel-standalone's "URL flattened to path" form
  //     (`/http:/host/.../app.jsx`) — produced when the bundler runs
  //     `path.resolve()` on a URL, collapsing `://` → `:/`. The Babel
  //     plugin's `state.file.opts.filename` lands in this form for
  //     external scripts, so JSX om-ids stamped at compile time embed
  //     this third variant. We unflatten back to `http://` before the
  //     lookup so the absolute-URL alias hits. Without this fallback
  //     `getJSXLoc` returns `isInline:null, writePath:null` for every
  //     JSX-rendered element and the dispatcher's jsx case can't
  //     write — 98% of designer2-project elements bail to chat.
  function _lookupBabelEntry(fileName) {
    if (!fileName) return null;
    var bss = window.__babelScriptSources;
    if (!bss) return null;
    var direct = bss[fileName];
    if (direct) return direct;
    var unflattened = fileName.replace(/^\/(https?:)\/(.*)$/, '$1//$2');
    if (unflattened !== fileName) {
      var hit = bss[unflattened];
      if (hit) return hit;
    }
    return null;
  }

  // ── getJSXLoc(selector): React fiber walk → JSX source location ────
  // Returns {fileName, line, column, scriptIdx, isInline, writePath} or
  // null. isInline / writePath come from the cache entry — fileName
  // alone is not a reliable inline-vs-external signal, and may be a
  // resolved absolute URL when ledger.writeRaw needs a repo-relative path.
  window.getJSXLoc = function (selector) {
    try {
      var el = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector;
      if (!el) return null;

      // §23 P1 fast path: if the om-src-id Babel plugin stamped this
      // element at compile time with `data-om-id="jsx:<file>:<byte>:
      // <line>:<col>"`, parse the value directly and skip the fiber
      // walk. Falls through to the legacy fiber walk when stamp absent
      // (non-JSX elements, or pages that haven't loaded with the
      // current inject script's plugin).
      // Lowercased DOM tag — passed to the FE patcher as a disambiguator
      // when multiple JSXOpeningElements share the line (Tiffany's `dZ`
      // finder pattern; see docs/design-v2-tiffany-analysis-2026-04-28/
      // _data/tiffany-ProjectPage-DmrLASxr.js).
      var domTag = (el.tagName ? String(el.tagName).toLowerCase() : null);

      var rawOmId = el.getAttribute && el.getAttribute('data-om-id');
      if (rawOmId) {
        // Strip the version prefix that BE-side stamper adds for
        // HTML-shell elements (`<8hex>:`). JSX stamps from om-src-id
        // start with `jsx:` and have no version prefix, but for
        // future-proofing we strip either way.
        var stripped = rawOmId;
        var verMatch = /^[0-9a-f]{8}:(.+)$/.exec(stripped);
        if (verMatch) stripped = verMatch[1];
        // jsx:<file>:<byte>:<line>:<col>
        if (stripped.indexOf('jsx:') === 0) {
          // Walk from the back: column, line, byte, then everything
          // remaining (after `jsx:`) is the fileName — which may
          // itself contain `:` (Windows paths, query strings).
          var rest = stripped.slice(4);
          var lastColon = rest.lastIndexOf(':');
          if (lastColon > 0) {
            var col = parseInt(rest.slice(lastColon + 1), 10);
            var beforeCol = rest.slice(0, lastColon);
            var c2 = beforeCol.lastIndexOf(':');
            if (c2 > 0) {
              var line = parseInt(beforeCol.slice(c2 + 1), 10);
              var beforeLine = beforeCol.slice(0, c2);
              var c3 = beforeLine.lastIndexOf(':');
              if (c3 > 0) {
                var fileNameJsx = beforeLine.slice(0, c3);
                var entry2 = _lookupBabelEntry(fileNameJsx);
                if (!isNaN(line) && !isNaN(col)) {
                  return {
                    fileName: fileNameJsx,
                    line: line,
                    column: col,
                    tagName: domTag,
                    scriptIdx: entry2 ? entry2.idx : -1,
                    isInline: entry2 ? !entry2.src : null,
                    writePath: entry2 && entry2.src ? entry2.src : null,
                  };
                }
              }
            }
          }
        }
      }

      // Legacy fiber-walk path — keeps working for elements that
      // weren't stamped at compile time (e.g. plain HTML loaded
      // without the Babel pipeline).
      var fiberKey = null;
      for (var k in el) {
        if (k.indexOf('__reactFiber$') === 0) { fiberKey = k; break; }
      }
      if (!fiberKey) return null;
      var fiber = el[fiberKey];
      while (fiber && !fiber._debugSource) fiber = fiber.return;
      if (!fiber || !fiber._debugSource) return null;
      var ds = fiber._debugSource;
      var fileName = ds.fileName || '';
      var entry = _lookupBabelEntry(fileName);
      return {
        fileName: fileName,
        line: ds.lineNumber,
        column: (ds.columnNumber != null ? ds.columnNumber : 0),
        tagName: domTag,
        scriptIdx: entry ? entry.idx : -1,
        isInline: entry ? !entry.src : null,
        writePath: entry && entry.src ? entry.src : null,
      };
    } catch (e) {
      return null;
    }
  };

  // ── Poster mode (genspark-artifact-type=poster) ─────────────────────
  // The poster_design skill emits a fixed HTML structure: a marker meta
  // tag + .poster-canvas wrapper + N children carrying [data-layer-id]
  // [data-layer-type="image"|"html"] [data-layer-name]. When detected,
  // we (a) report the layer list to the host so it can render a
  // PosterToolbar, (b) re-scrape on DOM mutation so streaming HTML is
  // tracked, (c) intercept clicks on image layers so the host can open
  // a regenerate prompt panel, (d) accept layer-visibility toggles from
  // the host. Click handler is gated on existing mode flags so we never
  // steal events from tweaks/edit/designer modes — those win, and the
  // PosterToolbar's per-layer "Edit image" button is the escape hatch
  // when other modes are active.
  var _posterDetected = false;
  var _posterScrapeQueued = false;
  var _posterHiddenLayers = Object.create(null);
  var _posterObserver = null;

  function _posterMarker() {
    return document.querySelector(
      'meta[name="genspark-artifact-type"][content="poster"]'
    );
  }

  function _posterCanvas() {
    return document.querySelector('.poster-canvas');
  }

  function _posterEscapeAttr(s) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(s);
    }
    return String(s).replace(/[^a-zA-Z0-9_\-]/g, '\\$&');
  }

  // Read an element's ``src`` attribute as a fully-resolved absolute
  // URL. The LLM authors poster HTML with relative paths
  // (``src="assets/bg.png"``) that the iframe resolves against its own
  // document URL (``/api/designer2/serve/<projectId>/<file>``). The
  // host page lives at a different base, so the raw attribute would
  // resolve wrong when re-rendered in the PosterToolbar thumbnail.
  // Prefer the IDL ``.src`` (returns absolute for <img>/<source>),
  // fall back to URL resolution against ``document.baseURI`` for other
  // element types.
  function _posterAttrSrc(el) {
    var raw = el.getAttribute('src');
    if (raw == null || raw === '') return '';
    if (typeof el.src === 'string' && el.src) return el.src;
    try {
      return new URL(raw, document.baseURI).href;
    } catch (e) {
      return raw;
    }
  }

  // First ``url(...)`` from a computed ``background-image`` value.
  // Quoted forms first (computed style serializes as ``url("...")``);
  // the bare form covers older serializers. Gradient-only / ``none``
  // values yield ''.
  function _posterCssUrl(value) {
    if (!value || value === 'none') return '';
    var m =
      /url\(\s*"((?:[^"\\]|\\.)*)"\s*\)/.exec(value) ||
      /url\(\s*'((?:[^'\\]|\\.)*)'\s*\)/.exec(value) ||
      /url\(\s*([^)'"\s]+)\s*\)/.exec(value);
    if (!m || !m[1]) return '';
    return m[1].replace(/\\(.)/g, '$1');
  }

  // Resolve an image layer's current image URL. The ``src`` attribute
  // alone misses two very common LLM poster-authoring shapes — a
  // wrapper div around a nested ``<img>``, and a div painted with CSS
  // ``background-image`` — which made the host's edit takeover open
  // the panel with an empty URL (demo/upload state) over the user's
  // own poster (issue #55499). Resolution order: own ``src``
  // attribute → first nested ``<img>`` with a resolvable src → first
  // ``url(...)`` of the computed ``background-image``.
  function _posterResolveSrc(el) {
    var own = _posterAttrSrc(el);
    if (own) return own;
    if (el.querySelectorAll) {
      var imgs = el.querySelectorAll('img');
      for (var i = 0; i < imgs.length; i++) {
        // Only imgs this layer owns: an img whose nearest
        // [data-layer-id] ancestor is a NESTED layer belongs to that
        // layer — picking it up would show the child's asset in the
        // parent's thumbnail/edit takeover.
        var owner = imgs[i].closest
          ? imgs[i].closest('[data-layer-id]')
          : null;
        if (owner && owner !== el) continue;
        var nested = _posterAttrSrc(imgs[i]);
        if (nested) return nested;
      }
    }
    var bg = '';
    try {
      bg = _posterCssUrl(window.getComputedStyle(el).backgroundImage);
    } catch (e) {}
    if (bg) {
      try {
        return new URL(bg, document.baseURI).href;
      } catch (e2) {
        return bg;
      }
    }
    return '';
  }

  function _posterScrapeLayers() {
    var canvas = _posterCanvas();
    if (!canvas) return [];
    var nodes = canvas.querySelectorAll('[data-layer-id]');
    var layers = [];
    var seen = Object.create(null);
    var dups = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var id = el.getAttribute('data-layer-id');
      if (!id) continue;
      if (seen[id]) { dups.push(id); continue; }
      seen[id] = 1;
      var type = el.getAttribute('data-layer-type');
      if (!type) {
        type = el.tagName.toLowerCase() === 'img' ? 'image' : 'html';
      }
      var name = el.getAttribute('data-layer-name') || id;
      var src = type === 'image' ? _posterResolveSrc(el) : '';
      layers.push({ id: id, type: type, name: name, src: src });
    }
    if (dups.length) {
      try {
        P.postMessage(
          { type: 'poster:warning', kind: 'duplicate-layer-id', ids: dups },
          '*'
        );
      } catch (e) {}
    }
    return layers;
  }

  function _posterCanvasDims() {
    // Read the .poster-canvas element's *logical* size — i.e. the
    // pre-transform layout dimensions the LLM authored against (e.g.
    // ``width:1080px; height:1620px`` in the stylesheet). Used both
    // for the host's aspect-ratio letterbox AND for native-resolution
    // export. Lookup order:
    //   1. Inline style (``canvas.style.width``) — still the canonical
    //      hint when the LLM applies dims inline.
    //   2. ``getComputedStyle(canvas).width`` — returns the CSS-
    //      resolved width *before* any ``transform: scale()``,
    //      whereas ``getBoundingClientRect`` would return the
    //      post-transform (visual) width and shrink as the iframe
    //      shrinks. The v5 skill's viewport-fit pattern lives in a
    //      stylesheet rule, so this branch is the common path.
    //   3. ``getBoundingClientRect`` — last-resort fallback for
    //      flex/vw-driven layouts where neither inline nor computed
    //      width is a fixed pixel value.
    var canvas = _posterCanvas();
    if (!canvas) return null;
    var w = parseInt(canvas.style.width, 10);
    var h = parseInt(canvas.style.height, 10);
    if (!w || !h) {
      var cs;
      try {
        cs = window.getComputedStyle(canvas);
      } catch (e) {
        cs = null;
      }
      if (cs) {
        w = parseInt(cs.width, 10);
        h = parseInt(cs.height, 10);
      }
    }
    if (!w || !h) {
      var rect = canvas.getBoundingClientRect();
      w = Math.round(rect.width);
      h = Math.round(rect.height);
    }
    if (!w || !h) return null;
    return { width: w, height: h };
  }

  function _posterEmitDetected() {
    _posterDetected = true;
    var layers = _posterScrapeLayers();
    var canvas = _posterCanvasDims();
    try {
      P.postMessage(
        { type: 'poster:detected', layers: layers, canvas: canvas },
        '*'
      );
    } catch (e) {}
  }

  function _posterScheduleScrape() {
    if (_posterScrapeQueued) return;
    _posterScrapeQueued = true;
    setTimeout(function () {
      _posterScrapeQueued = false;
      if (!_posterMarker()) return;
      _posterEmitDetected();
    }, 200);
  }

  function _posterAttachObserver() {
    if (_posterObserver || !document.body) return;
    _posterObserver = new MutationObserver(function () {
      if (!_posterMarker()) return;
      _posterScheduleScrape();
    });
    _posterObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'data-layer-id',
        'data-layer-type',
        'data-layer-name',
        'src',
      ],
    });
    // Initial scrape if the marker is already present at attach time
    // (the page may have finished loading before this script ran).
    if (_posterMarker()) _posterScheduleScrape();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _posterAttachObserver);
  } else {
    _posterAttachObserver();
  }

  // Capture-phase click → emit poster:layer-clicked.
  // Gated on _posterDetected (no-op for non-poster pages) AND on existing
  // mode flags so tweaks / edit / designer modes keep their click priority.
  document.addEventListener(
    'click',
    function (ev) {
      if (!_posterDetected) return;
      if (_tweaksActive || _dmActive || _editActive) return;
      var el = ev.target;
      var layer =
        el && el.closest
          ? el.closest('[data-layer-type="image"][data-layer-id]')
          : null;
      if (!layer) return;
      ev.preventDefault();
      ev.stopPropagation();
      var rect = layer.getBoundingClientRect();
      try {
        P.postMessage(
          {
            type: 'poster:layer-clicked',
            layerId: layer.getAttribute('data-layer-id'),
            layerName:
              layer.getAttribute('data-layer-name') ||
              layer.getAttribute('data-layer-id'),
            src: _posterResolveSrc(layer),
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            },
          },
          '*'
        );
      } catch (e) {}
    },
    true
  );

  // Layer visibility toggle from host.
  // Toggle via inline ``style.visibility`` (NOT ``display``) so the
  // element keeps its space in the document flow when hidden — the
  // surrounding layout doesn't reflow, which matters because v5 lets
  // the LLM compose posters with flex/flow layouts where layers may
  // share a parent's flow context. Hiding a layer should just hide
  // its pixels, not collapse its slot. Observer's attributeFilter
  // does NOT include ``style``, so this won't retrigger a scrape.
  window.addEventListener('message', function (ev) {
    if (!isAllowedOrigin(ev.origin)) return;
    if (!ev.data || typeof ev.data !== 'object') return;
    if (ev.data.type !== 'poster:set-layer-visibility') return;
    var id = ev.data.layerId;
    if (!id) return;
    var el;
    try {
      el = document.querySelector(
        '[data-layer-id="' + _posterEscapeAttr(id) + '"]'
      );
    } catch (e) {
      return;
    }
    if (!el) return;
    if (ev.data.visible === false) {
      if (!(id in _posterHiddenLayers)) {
        _posterHiddenLayers[id] = el.style.visibility || '';
      }
      el.style.visibility = 'hidden';
    } else {
      var saved = id in _posterHiddenLayers ? _posterHiddenLayers[id] : '';
      delete _posterHiddenLayers[id];
      if (saved) {
        el.style.visibility = saved;
      } else {
        // No inline visibility before — use removeProperty so the
        // layer falls back to whatever the stylesheet set (and
        // happy-dom in tests reliably clears it; setting
        // style.visibility='' is flaky there).
        el.style.removeProperty('visibility');
      }
    }
  });

  // ── Frame Movie variable handoff across reload ──────────────────────
  // The parent's `apply_variables` sub-action stores the new variable
  // map in sessionStorage (same-origin, persists across `location.reload`)
  // and triggers a reload of one OR more iframes. We read it here at
  // script-evaluation time — before any composition `<script>` tag
  // executes — so when the user's inline script calls
  // `window.__hyperframes.getVariables()` it sees the override.
  //
  // Stored value shape: `{vars: {...}, ttl: <epoch_ms>}`. We do NOT
  // remove the key here because same-origin iframes (preview, user HF,
  // agent HF) SHARE this sessionStorage, and they reload simultaneously
  // — if the first iframe's inject removes the key, the other two read
  // null and miss the override. The parent (`apply_variables`) clears
  // the key once all iframes have reported ready. The `ttl` guards
  // against "user manually reloads an iframe minutes later" picking up
  // stale values: we only apply when the entry is fresh (~10s window).
  // Legacy bare-string format (pre-2026-05-12) is still tolerated for
  // upgrade safety.
  try {
    var __fmPending = window.sessionStorage &&
      window.sessionStorage.getItem('__frame_movie_pending_variables');
    if (__fmPending) {
      try {
        var __fmParsed = JSON.parse(__fmPending);
        var __fmVars = null;
        var __fmFresh = true;
        if (__fmParsed && typeof __fmParsed === 'object' &&
            __fmParsed.vars && typeof __fmParsed.ttl === 'number') {
          __fmVars = __fmParsed.vars;
          __fmFresh = Date.now() < __fmParsed.ttl;
        } else if (__fmParsed && typeof __fmParsed === 'object') {
          // Legacy: parent wrote the vars map directly. No ttl → apply.
          __fmVars = __fmParsed;
        }
        if (__fmVars && __fmFresh) {
          window.__hfVariables = __fmVars;
        }
      } catch (e) {
        // Stored value wasn't valid JSON — drop silently. The parent
        // serializes via JSON.stringify, so this only fires on
        // user-attempted manipulation of sessionStorage.
      }
    }
  } catch (e) {
    // sessionStorage access can throw in Safari private mode etc.
    // Variables not persisting across reload is a graceful degrade —
    // the user just sees default values until the parent's next
    // apply_variables succeeds (e.g. after browser settings change).
  }

  // ── Frame Movie mode (genspark-artifact-type=frame_movie) ───────────
  // The frame_movie skill emits HTML-as-video compositions with a marker
  // meta tag + a [data-composition-id] root. When detected, we:
  //   (a) auto-inject <script src="/hyperframes/runtime.iife.js"> if
  //       it isn't already in the document — see _fmEnsureRuntimeScript.
  //       Real-LLM E2E showed the LLM frequently writes a valid
  //       composition (marker + data-composition-id + GSAP timeline)
  //       but forgets the runtime <script>, leaving window.__hf /
  //       __player undefined and the FrameMoviePanel stuck on
  //       "LOADING RUNTIME…" indefinitely. Auto-injection is safe
  //       because the guard requires the marker meta tag, so we only
  //       fire on pages that explicitly opted in to frame_movie.
  //   (b) report the composition metadata + initial layer set so the host
  //       mounts the FrameMoviePanel.vue
  //   (c) re-scrape on DOM mutation while the LLM is still writing
  //   (d) emit periodic playback state ticks once the runtime exposes
  //       window.__hf / window.__player so the FE timeline scrubber
  //       stays in sync without polling from the parent frame
  var _fmDetected = false;
  var _fmRuntimeScriptInjected = false;
  var _fmScrapeQueued = false;
  var _fmObserver = null;
  var _fmStateInterval = null;

  function _fmMarker() {
    return document.querySelector(
      'meta[name="genspark-artifact-type"][content="frame_movie"]'
    );
  }

  function _fmRoot() {
    return document.querySelector('[data-composition-id]');
  }

  // ── animations.jsx fallback detection ────────────────────────────
  // The Designer V2 ``animations.jsx`` starter (React + ``<Stage>`` /
  // ``<Sprite>``) is HF-exportable via the materialize-time HTML
  // rewrite (see _rewrite_animations_jsx_html in frame_movie_render.py).
  // But the preview HTML carries NO meta marker and NO
  // [data-composition-id] — Stage renders those via JSX, invisible to
  // the static probes above. Without an explicit fallback, the inject
  // script never emits ``frame_movie:detected`` for animations.jsx
  // projects and the Designer V2 Export button stays hidden, leaving
  // the export pipeline unreachable from the UI.
  //
  // Detection: a ``<script>`` whose ``src`` ends in ``animations.jsx``.
  // Robust enough — user-authored HTML wouldn't reference this filename
  // unless they're using the starter, and the same heuristic
  // ``_is_animations_jsx_project`` uses on the backend side.
  function _fmIsAnimationsJsxProject() {
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      // Strip query strings / hashes before the suffix check so
      // ``animations.jsx?v=1`` still matches.
      var path = src.split('?')[0].split('#')[0];
      if (path === 'animations.jsx' || /\/animations\.jsx$/.test(path)) {
        return true;
      }
    }
    return false;
  }

  // animations.jsx Stage defaults — must mirror the component's
  // signature in starters/animations.jsx so a parse miss falls back
  // to the same dims the runtime would render at.
  var _FM_ANIMJSX_STAGE_DEFAULTS = {
    width: 1280,
    height: 720,
    duration: 10,
  };

  // Escape regex metacharacters so an arbitrary identifier can be
  // safely interpolated into a ``new RegExp(...)`` source. Mirrors
  // Python's ``re.escape``. Critical for ``$`` (valid JS identifier
  // char, also a regex anchor): without this, ``STAGE_W$`` produces
  // a broken regex that never matches and silently falls the
  // affected prop back to its Stage default.
  function _fmReEscape(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Port of the Python ``_parse_stage_props`` regex chain. Scrapes
  // every inline ``<script>`` in the document for the first
  // ``<Stage width={...} height={...} duration={...}>`` JSX tag and
  // extracts the dims. Handles:
  //   * literal numeric props:   <Stage width={1920} ...>
  //   * const-backed props:      const STAGE_W = 1920; <Stage width={STAGE_W} ...>
  //   * partial misses:          any missing prop falls back to default
  // Returns ``{width, height, duration}`` always (no nulls) so the
  // emitter never has to special-case a partial dims object.
  function _fmParseAnimationsJsxDims() {
    var dims = {
      width: _FM_ANIMJSX_STAGE_DEFAULTS.width,
      height: _FM_ANIMJSX_STAGE_DEFAULTS.height,
      duration: _FM_ANIMJSX_STAGE_DEFAULTS.duration,
    };
    // Exclude THIS inject script itself (marker attribute set by the
    // backend wrapper). Its own comments mention the literal token
    // ``<Stage width={...} height={...} duration={...}>`` as
    // documentation; without the exclusion the first .match() below
    // could hit the comment before the user's real JSX (depending on
    // DOM ordering), making all three props fail both the numeric and
    // identifier checks and silently fall back to Stage defaults.
    var scripts = document.querySelectorAll(
      'script:not([data-designer2-injected])'
    );
    var combined = '';
    for (var i = 0; i < scripts.length; i++) {
      // Skip external scripts — only inline text can reasonably
      // contain the user's Stage call site. textContent is empty for
      // src= scripts, so a defensive ``if`` is unnecessary.
      combined += '\n' + (scripts[i].textContent || '');
    }
    if (!combined) return dims;

    // Strip JS comments before scanning. animations.jsx's own
    // top-of-file docstring contains ``// <Stage width={1280}
    // height={720} duration={10}>`` as a usage example; with the
    // raw text included, the first /<Stage\b([^>]*)/ hit is the
    // commented example — which silently overrides the user's
    // actual <Stage duration={DURATION}> further down the script
    // chain. Block-then-line order: block-comment regex is the
    // simpler one; the line-comment guard requires whitespace or a
    // statement-terminator before // so that URL literals
    // ('https://...') and protocol-prefixed strings keep their
    // content intact.
    combined = combined
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/(^|[\s;{}(),])\/\/[^\n]*/g, '$1');

    // Match opening tag's attribute blob up to closing ``>``. The
    // character class is ``[^>]`` (not ``[^/>]``) — a bare ``/`` inside
    // a prop value (e.g. ``background="url(/img.png)"``) would
    // truncate the capture and silently fall the prop extraction
    // below back to Stage defaults. Same fix as Python side from PR
    // #28450 Bugbot round.
    var stageMatch = combined.match(/<Stage\b([^>]*)/);
    if (!stageMatch) return dims;
    var propsBlob = stageMatch[1];

    var keys = ['width', 'height', 'duration'];
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      // key={ <expr> } — expr is captured as the text between {}.
      // Use ``new RegExp`` so we can build the per-key pattern.
      var propRe = new RegExp(
        '\\b' + key + '\\s*=\\s*\\{\\s*([^{}]+?)\\s*\\}'
      );
      var m = propsBlob.match(propRe);
      if (!m) continue;
      var valExpr = m[1].trim();
      // Direct numeric literal
      if (/^-?\d+(\.\d+)?$/.test(valExpr)) {
        dims[key] = parseFloat(valExpr);
        continue;
      }
      // Identifier reference: scan ``const <ident> = <number>``
      // anywhere in the combined script text. Mirrors the Python
      // fallback strategy.
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(valExpr)) {
        // ``$`` is a valid identifier char AND a regex anchor — must
        // escape before interpolating into the pattern string.
        var constRe = new RegExp(
          '\\bconst\\s+' + _fmReEscape(valExpr) + '\\s*=\\s*(-?\\d+(?:\\.\\d+)?)'
        );
        var constM = combined.match(constRe);
        if (constM) {
          dims[key] = parseFloat(constM[1]);
        }
      }
    }
    return dims;
  }

  function _fmIntDataAttr(el, name) {
    // Use ``getAttribute`` truth-test, NOT ``!raw`` — the latter treats
    // the string ``"0"`` as falsy and returns null, which causes
    // ``data-start="0"`` clips to be silently dropped from
    // ``_fmScrapeLayers`` (the very first frame of every composition
    // is at t=0, so this is the common path). Check explicitly for
    // missing / empty so a numeric zero authored as a string still
    // parses to the number ``0``.
    var raw = el && el.getAttribute ? el.getAttribute(name) : null;
    if (raw === null || raw === undefined || raw === '') return null;
    var n = parseFloat(raw);
    return isFinite(n) ? n : null;
  }

  function _fmComp() {
    var root = _fmRoot();
    if (root) {
      return {
        id: root.getAttribute('data-composition-id'),
        width: _fmIntDataAttr(root, 'data-width'),
        height: _fmIntDataAttr(root, 'data-height'),
        duration: _fmIntDataAttr(root, 'data-duration'),
      };
    }
    // animations.jsx fallback: no [data-composition-id] in preview HTML
    // (Stage renders it via JSX at runtime), so synthesize a comp from
    // the inline ``<Stage>`` JSX. ``runtime: 'animations_jsx'`` is a
    // tag the FE uses to gate HF-only behaviors (HF iframe mount,
    // preview-hidden CSS class) — Export button gates on the truthy
    // ref alone, so it shows for both runtimes.
    if (_fmIsAnimationsJsxProject()) {
      var d = _fmParseAnimationsJsxDims();
      // Prefer the live ``__timelines`` controller's duration over the
      // static parser's. The parser walks the inline scripts for
      // ``<Stage duration={...}>`` — a best-effort that misses
      // dynamically-computed dims (``duration={someProp}``,
      // ``duration={config.dur}``) and falls back to the 10s default,
      // visibly truncating the draw scrubber's max range on real
      // multi-scene animations. The controller (registered in
      // Stage's useLayoutEffect post PR #29727) carries the actual
      // value React used to construct the timeline, so it's the truth
      // whenever it's present. Static parse is the fallback for
      // pre-#29727 projects that never register a controller.
      var ctrl = _fmFindTimelineController();
      var ctrlDur = ctrl && Number(ctrl.duration);
      var duration =
        Number.isFinite(ctrlDur) && ctrlDur > 0 ? ctrlDur : d.duration;
      return {
        id: 'stage',
        width: d.width,
        height: d.height,
        duration: duration,
        runtime: 'animations_jsx',
      };
    }
    return null;
  }

  function _fmScrapeLayers() {
    var root = _fmRoot();
    if (!root) return [];
    // Walk every descendant that has data-start AND (data-duration OR
    // data-end). Mirror the Python extract_layers logic for parity.
    var nodes = root.querySelectorAll('[data-start]');
    var layers = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var ds = _fmIntDataAttr(el, 'data-start');
      var dd = _fmIntDataAttr(el, 'data-duration');
      var de = _fmIntDataAttr(el, 'data-end');
      if (ds === null) continue;
      if (dd === null && de === null) continue;
      var dur = dd !== null ? dd : (de - ds);
      var end = dd !== null ? (ds + dd) : de;
      var tag = el.tagName.toLowerCase();
      // Mirror the Python extract_layers kind mapping verbatim — Three.js
      // compositions use <canvas data-start=...> per the frame_movie_three
      // skill, and SVG / iframe authored clips also need their own kind so
      // the FrameMoviePanel renders the right icon. Anything not listed
      // falls through to "text" (div / p / h1-6 / section / custom elements).
      var kind =
        tag === 'video' ? 'video' :
        tag === 'audio' ? 'audio' :
        tag === 'img' ? 'image' :
        tag === 'canvas' ? 'canvas' :
        tag === 'svg' ? 'svg' :
        tag === 'iframe' ? 'iframe' :
        'text';
      // Use explicit null-check rather than `||` chain. With `||`,
      // a present-but-empty ``data-track-index=""`` falls through to
      // ``data-layer`` (because ``""`` is falsy in JS), even though
      // the author clearly meant to set the canonical attribute. The
      // string ``"0"`` is truthy, so the previous chain handled
      // ``data-track-index="0"`` correctly — only the empty-string
      // edge case was wrong. Pattern matches _fmIntDataAttr for
      // consistency within this file.
      var trackAttr = el.getAttribute('data-track-index');
      if (trackAttr === null) {
        trackAttr = el.getAttribute('data-layer');
      }
      if (trackAttr === null || trackAttr === '') {
        trackAttr = '0';
      }
      var track = parseInt(trackAttr, 10);
      if (!isFinite(track)) track = 0;
      // Mirror Python ``extract_layers``: include ``volume`` (parsed
      // from ``data-volume``) when present. Without this the
      // FrameMoviePanel sees ``volume: undefined`` for audio/video
      // layers even when the LLM authored a ``data-volume`` —
      // a data-shape divergence vs what the LLM gets back from the
      // Python tool. ``null`` (not ``undefined``) when absent so the
      // shape matches Python's ``Optional[float]``.
      var volRaw = el.getAttribute('data-volume');
      var volume = null;
      if (volRaw !== null && volRaw !== '') {
        var parsed = parseFloat(volRaw);
        if (isFinite(parsed)) volume = parsed;
      }
      layers.push({
        id: el.getAttribute('id') || null,
        tag: tag,
        kind: kind,
        name: el.getAttribute('data-name') || null,
        start: ds,
        duration: dur,
        end: end,
        trackIndex: track,
        src: el.getAttribute('src') || null,
        volume: volume,
      });
    }
    layers.sort(function (a, b) {
      if (a.trackIndex !== b.trackIndex) return a.trackIndex - b.trackIndex;
      return a.start - b.start;
    });
    return layers;
  }

  // Find a Designer V2 ``animations.jsx`` Stage controller registered on
  // ``window.__timelines``. The starter (PR #29727) registers under the
  // Stage's ``persistKey`` (default ``'animstage'``) with shape
  // ``{ duration, seek(t), pause(), play(), get isPlaying }``. Multiple
  // Stage instances each register under their own key; we only need any
  // controller that exposes ``seek`` to bridge frame_movie:* postMessages
  // from the parent's draw bar into the React Stage.
  function _fmFindTimelineController() {
    var t = window.__timelines;
    if (!t || typeof t !== 'object') return null;
    var keys = Object.keys(t);
    for (var i = 0; i < keys.length; i++) {
      var c = t[keys[i]];
      if (c && typeof c.seek === 'function') return c;
    }
    return null;
  }

  // Sub-comps loaded via ``<div data-composition-src="...">`` register
  // their own GSAP timelines on ``window.__timelines`` under each
  // ``data-composition-id``. ``frame_movie:play/pause/seek`` must drive
  // every one or sub-comp timelines run independently while the host UI
  // shows paused. Returns ``__player`` plus every ``__timelines`` entry
  // that exposes ``seek``, deduped.
  function _fmFindAllTimelineControllers() {
    var seen = [];
    function add(c) {
      if (!c || typeof c.seek !== 'function') return;
      if (seen.indexOf(c) !== -1) return;
      seen.push(c);
    }
    if (window.__player) add(window.__player);
    var t = window.__timelines;
    if (t && typeof t === 'object') {
      var keys = Object.keys(t);
      for (var i = 0; i < keys.length; i++) add(t[keys[i]]);
    }
    return seen;
  }

  // Translate host playhead → sub-comp local time. Sub-comps are
  // authored on their own 0-duration axis, but the host can embed them
  // with ``<div data-composition-id="X" data-start="N">`` so that
  // local 0 corresponds to host time N. Without this offset, a caption
  // embedded at data-start=10 would be seeked to host time 12 directly
  // (= 12s into the caption) instead of its local 2s. ``__player``
  // shares __timelines under the HOST composition id (data-start=0
  // for the root marker), so this is a no-op for the host entry.
  function _fmHostToLocalTime(compId, hostTime) {
    if (!compId) return hostTime;
    try {
      var el = document.querySelector(
        '[data-composition-id="' + (window.CSS && CSS.escape ? CSS.escape(compId) : compId) + '"]'
      );
      if (!el) return hostTime;
      var ds = parseFloat(el.getAttribute('data-start'));
      if (!isFinite(ds)) return hostTime;
      return hostTime - ds;
    } catch (e) {
      return hostTime;
    }
  }

  function _fmRuntimeReady() {
    // The vendored HyperFrames runtime IIFE exposes window.__player (see
    // vendor/hyperframes/core/runtime/init.ts createPlayerApiCompat) but
    // does NOT expose window.__hf. Earlier code checked __hf because the
    // skill docs referenced both names; only __player is real. The player
    // API has seek/play/pause/getTime/getDuration/isPlaying/renderSeek.
    //
    // animations.jsx (Designer V2 React Stage) doesn't ship __player; it
    // registers a slimmer controller on window.__timelines[persistKey]
    // (PR #29727). Recognising it here flips ``runtimeReady`` true for
    // animations.jsx projects too, so the parent's draw bar — gated on
    // ``isVideoMode = composition && runtimeReady`` — picks up the
    // video-shape toolbar without relying on the orchestrator's
    // animations_jsx carve-out alone.
    if (window.__player && typeof window.__player.seek === 'function') {
      return true;
    }
    return !!_fmFindTimelineController();
  }

  function _fmEnsureRuntimeScript() {
    // Auto-injection of the hyperframes runtime + gsap script tags
    // was removed alongside issue #27591. The LLM now writes those
    // tags itself with RELATIVE paths (hyperframes/gsap.min.js +
    // hyperframes/runtime.iife.js) after calling
    // copy_starter_component to land the files in the project repo;
    // see the frame_movie skill prompts. Relative paths resolve via
    // /api/designer2/serve/<pid>/hyperframes/... at preview AND get
    // inlined by super_inline_html on standalone export. The
    // platform no longer serves /hyperframes/* directly — bundles
    // moved from frontend-nuxt/public/hyperframes/ to
    // backend/tool_call/designer2/starters/hyperframes/.
    //
    // NOTE: do NOT write the literal closing-script-tag sequence
    // inside comments anywhere in this file. The whole inject script
    // gets wrapped in a <script data-designer2-injected> ... close
    // tag ... element by _get_inject_script (designer2.py), and an
    // in-comment close tag would prematurely terminate that wrapper
    // and surface the rest of this file as visible body text in the
    // preview iframe.
    _fmRuntimeScriptInjected = true;
  }

  function _fmEmitDetected() {
    _fmDetected = true;
    _fmEnsureRuntimeScript();
    var comp = _fmComp();
    if (!comp) return;
    var layers = _fmScrapeLayers();
    try {
      P.postMessage(
        {
          type: 'frame_movie:detected',
          composition: comp,
          layers: layers,
          runtimeReady: _fmRuntimeReady(),
        },
        '*'
      );
    } catch (e) {}
  }

  // Detection is either the meta marker (frame_movie skill) or an
  // animations.jsx script reference (Designer V2 React Stage).
  function _fmDetectable() {
    return _fmMarker() || _fmIsAnimationsJsxProject();
  }

  function _fmScheduleScrape() {
    if (_fmScrapeQueued) return;
    _fmScrapeQueued = true;
    setTimeout(function () {
      _fmScrapeQueued = false;
      if (!_fmDetectable()) return;
      _fmEmitDetected();
      // Cover the case where the meta tag was absent at DOMContentLoaded
      // but appeared later via DOM mutation (streaming write_file → iframe
      // reload, agent edit). Without this, the FrameMoviePanel's timeline
      // scrubber stays frozen because state ticks never start. The setter
      // is idempotent (early-returns if the interval is already armed).
      // animations.jsx projects have no window.__player to drive ticks
      // (they run their own React Stage preview), so only arm ticks
      // when the meta-marker path is in use.
      if (_fmMarker()) _fmStartStateTicks();
    }, 200);
  }

  function _fmStopStateTicks() {
    if (_fmStateInterval) {
      clearInterval(_fmStateInterval);
      _fmStateInterval = null;
    }
  }

  // Mirror HF ``__player`` playback state onto every sub-comp GSAP
  // timeline registered on ``window.__timelines``. HF only drives the
  // host timeline; sub-comps loaded via ``data-composition-src``
  // (caption templates) run their own GSAP timelines and HF's
  // play/pause/seek don't reach them. Without this, three things break
  // in browser preview:
  //   - On mount: HF unpauses sub-comps via ``tl.paused(false)`` (
  //     runtime.init.site5), so captions auto-play even though the
  //     host stays at 0.
  //   - On scrub: HF moves the host timeline but Qo/Jo never call
  //     ``seek`` on sub-comps, so captions stay where they were and
  //     diverge from the visible playhead.
  //   - On HF's shadow-DOM play/pause: the in-shadow buttons call
  //     ``hp.play()/pause()/currentTime=`` which bypass our
  //     postMessage dispatcher entirely.
  // Running this at the state-tick rate (4Hz) is enough — pause/play
  // is "instant enough" within 250ms of any state change, and
  // ``.seek(t)`` on a GSAP timeline that's already at time t is a
  // cheap no-op. The 50ms diff threshold avoids re-seeking on every
  // tick during smooth playback (live tick mode advances both host
  // and sub-comps via gsap.ticker in lockstep).
  function _fmSyncSubCompsToHost() {
    var p = window.__player;
    if (
      !p ||
      typeof p.getTime !== 'function' ||
      typeof p.isPlaying !== 'function'
    ) {
      return;
    }
    var reg = window.__timelines;
    if (!reg || typeof reg !== 'object') return;
    var hostTime = p.getTime();
    var hostPlaying = p.isPlaying();
    for (var k in reg) {
      try {
        var tl = reg[k];
        if (!tl) continue;
        var localTime = _fmHostToLocalTime(k, hostTime);
        if (
          typeof tl.time === 'function' &&
          typeof tl.seek === 'function' &&
          Math.abs(tl.time() - localTime) > 0.05
        ) {
          tl.seek(localTime);
        }
        if (typeof tl.paused === 'function') {
          var subPaused = tl.paused();
          if (hostPlaying && subPaused && typeof tl.play === 'function') {
            tl.play();
          } else if (
            !hostPlaying &&
            !subPaused &&
            typeof tl.pause === 'function'
          ) {
            tl.pause();
          }
        }
      } catch (e) {}
    }
  }

  function _fmStartStateTicks() {
    if (_fmStateInterval) return;
    // Emit playback state at 4Hz while runtime is up. Cheap (4 reads,
    // 4 postMessages per second) and the FE only needs it to drive the
    // timeline scrubber needle and play/pause indicator.
    _fmStateInterval = setInterval(function () {
      // If the composition was removed from the DOM (e.g. SPA replaced
      // the body content without a full navigation), stop ticking. The
      // marker check is the authoritative "is this still a frame_movie
      // page?" probe. Without this, the interval would keep firing
      // post-messages with stale state until the iframe is torn down.
      if (!_fmMarker()) {
        _fmStopStateTicks();
        _fmDetected = false;
        return;
      }
      if (!_fmDetected || !_fmRuntimeReady()) return;
      _fmSyncSubCompsToHost();
      try {
        var time = window.__player && typeof window.__player.getTime === 'function'
          ? window.__player.getTime() : 0;
        var dur = window.__player && typeof window.__player.getDuration === 'function'
          ? window.__player.getDuration() : 0;
        var playing = window.__player && typeof window.__player.isPlaying === 'function'
          ? window.__player.isPlaying() : false;
        P.postMessage(
          {
            type: 'frame_movie:state',
            time: time,
            duration: dur,
            playing: playing,
          },
          '*'
        );
      } catch (e) {}
    }, 250);
  }

  // Belt-and-braces: clear the interval on pagehide so the iframe doesn't
  // hold a live timer through bfcache restore. Window-level pagehide
  // fires on navigation away even when the iframe document is replaced.
  window.addEventListener('pagehide', _fmStopStateTicks);

  function _fmAttachObserver() {
    if (_fmObserver || !document.documentElement) return;
    _fmObserver = new MutationObserver(function () {
      if (!_fmDetectable()) return;
      _fmScheduleScrape();
    });
    // Observe the whole document, not just <body>. The frame_movie
    // marker meta tag lives in <head>; if the LLM injects it after
    // DOMContentLoaded without any body mutation (e.g. updates a
    // composition's head via str_replace_edit), an observer scoped
    // to body alone would miss it and the FrameMoviePanel would
    // never mount. documentElement is <html>, which contains both.
    _fmObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'data-composition-id',
        'data-start',
        'data-duration',
        'data-end',
        // Composition root dimensions — LLM edits these when retargeting
        // resolution (1920×1080 → 1080×1920 for vertical Reels). Without
        // them in the filter the panel header lies until an unrelated
        // mutation triggers a re-scrape.
        'data-width',
        'data-height',
        'data-track-index',
        'data-layer',
        'data-name',
        // <audio data-volume> retunes — re-emit so the audio layer's
        // metadata stays accurate.
        'data-volume',
        // ``_fmScrapeLayers`` reads ``el.getAttribute('id')`` for each
        // layer's display name; without ``id`` here, renaming a clip via
        // str_replace_edit (very common LLM iteration) wouldn't refresh
        // the panel's layer list.
        'id',
        'src',
      ],
    });
    if (_fmDetectable()) {
      _fmEmitDetected();
      // Only HF (meta marker) projects expose window.__player and need
      // periodic state ticks. animations.jsx runs its own preview loop.
      if (_fmMarker()) _fmStartStateTicks();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _fmAttachObserver);
  } else {
    _fmAttachObserver();
  }

  // Host → iframe control: play, pause, seek.
  // Mirrors the runtime's own postMessage protocol so the FrameMoviePanel
  // doesn't need to know about __player directly. For seek, also writes
  // through to the runtime synchronously so the next state tick already
  // reflects the new playhead.
  window.addEventListener('message', function (ev) {
    if (!isAllowedOrigin(ev.origin)) return;
    if (!ev.data || typeof ev.data !== 'object') return;
    var t = ev.data.type;
    if (t !== 'frame_movie:play' && t !== 'frame_movie:pause' && t !== 'frame_movie:seek') {
      return;
    }
    if (!_fmRuntimeReady()) return;
    try {
      // Drive every controller, not just the first. A frame_movie host
      // that embeds caption / animation sub-compositions via
      // ``<div data-composition-src="...">`` ends up with multiple GSAP
      // timelines on ``__timelines``. Picking just one leaves sub-comps
      // running independently while the parent UI shows paused.
      // ``window.__player`` (HF) ships renderSeek for deterministic
      // capture; ``__timelines`` entries (sub-comps + animations.jsx
      // Stages from PR #29727) get ``seek`` so they stay in lockstep.
      var controllers = _fmFindAllTimelineControllers();
      if (t === 'frame_movie:play') {
        // ``__player.play`` only flips HF's internal clock — sub-comp
        // GSAP timelines registered on ``__timelines`` need their own
        // ``.play()``. With ``hf_tick_mode=live`` (the user-target
        // default in Designer2HfPlayer) GSAP's ticker is awake, so
        // unpaused timelines advance real-time and stay in sync.
        for (var pi = 0; pi < controllers.length; pi++) {
          if (typeof controllers[pi].play === 'function') controllers[pi].play();
        }
      } else if (t === 'frame_movie:pause') {
        for (var pi2 = 0; pi2 < controllers.length; pi2++) {
          if (typeof controllers[pi2].pause === 'function') controllers[pi2].pause();
        }
      } else if (t === 'frame_movie:seek') {
        var s = parseFloat(ev.data.time);
        // ALL of {do the seek, ack the parent} must live INSIDE the
        // isFinite gate — invalid times must skip both the seek and
        // the ack so the parent's timeout surfaces the bad input
        // instead of silently capturing the wrong frame.
        if (isFinite(s)) {
          // HF's ``__player.renderSeek``/``seek`` only repositions the
          // HOST timeline — Qo/Jo plays sub-comp timelines but never
          // seeks them, so scrub-while-paused leaves caption playheads
          // at their current position. Explicitly call ``.seek(s)`` on
          // every registered timeline to keep sub-comps in lockstep.
          // ``isReactBacked`` flips when any controller takes the seek
          // path so the ack drains microtasks before the two rAFs —
          // React's commit lands on a microtask and under concurrent
          // rendering can defer past the next frame.
          var seekFired = false;
          var isReactBacked = false;
          // Host first via renderSeek (deterministic frame stepping).
          if (
            window.__player &&
            typeof window.__player.renderSeek === 'function'
          ) {
            window.__player.renderSeek(s);
            seekFired = true;
          } else if (
            window.__player &&
            typeof window.__player.seek === 'function'
          ) {
            window.__player.seek(s);
            seekFired = true;
          }
          // Sub-comp / animations.jsx Stage timelines: HF's Qo unpaused
          // them as a side effect of the host renderSeek but never
          // seeked them. Iterate ``__timelines`` directly so we can
          // map each entry's key → its wrapper's ``data-start`` and
          // translate host time into the sub-comp's local axis.
          var reg = window.__timelines;
          if (reg && typeof reg === 'object') {
            for (var k in reg) {
              try {
                var c = reg[k];
                if (!c || c === window.__player) continue;
                if (typeof c.seek !== 'function') continue;
                var localT = _fmHostToLocalTime(k, s);
                c.seek(localT);
                seekFired = true;
                if (typeof c.pause === 'function') c.pause();
                if (!c.renderSeek) isReactBacked = true;
              } catch (e) {}
            }
          }
          var reqId = ev.data && ev.data.request_id;
          if (seekFired && reqId && ev.source && typeof ev.source.postMessage === 'function') {
            var srcOrigin = ev.origin || '*';
            var ackTwoRAFs = function () {
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  try {
                    ev.source.postMessage(
                      { type: 'frame_movie:seek_ack', request_id: reqId },
                      srcOrigin
                    );
                  } catch (e) {}
                });
              });
            };
            if (isReactBacked) {
              // Two microtask drains: the first lets React schedule the
              // render, the second lets the commit's effect cleanup run.
              // Empirically this is what fixes Stage seeks landing late.
              Promise.resolve().then(function () {
                Promise.resolve().then(ackTwoRAFs);
              });
            } else {
              ackTwoRAFs();
            }
          }
        }
      }
    } catch (e) {}
  });

})();

</script></body>
</html>

```

import { PRED, BAND, ENJ, DRAIN, TASKS } from './strengthData.js';
  const cfg = { strong: 0.75, solid: 0.5 };



  /* ---------- bands ---------- */

  function bandOf(score, max) {
    if (!max) return 0;
    const f = score / max;
    if (f >= cfg.strong) return 2;
    if (f >= cfg.solid) return 1;
    return 0;
  }

  function cutoffs(max) {
    const strongMin = Math.ceil(cfg.strong * max - 1e-9);
    const solidMin = Math.ceil(cfg.solid * max - 1e-9);
    const fmt = (a, b) => (a > b ? "—" : a === b ? String(a) : a + "–" + b);
    return {
      dev: fmt(0, solidMin - 1),
      solid: fmt(solidMin, strongMin - 1),
      strong: fmt(strongMin, max)
    };
  }

  const gapOf = (r) => r.band - r.pred;

  /* ---------- statements ---------- */

  function gapSentence(r) {
    const g = gapOf(r);
    if (g === 0) return "Your result landed where you expected.";
    if (g > 0) return "You did better than you expected.";
    return "This set went less well than you predicted. One short round says little about you.";
  }

  const readiness = (results) => results.filter((r) => r && !r.skipped);

  /* ---------- highlight ----------
     1. Only Strong-band results are eligible.
     2. Enjoyment decides; largest positive gap breaks ties.
     3. If nothing was Strong, no performance highlight is claimed. */
  function highlight(results) {
    const strong = readiness(results)
      .filter((r) => r.band === 2)
      .sort((a, b) => ((b.enjoy ?? -1) - (a.enjoy ?? -1)) || (gapOf(b) - gapOf(a)));
    return strong.length ? strong[0] : null;
  }

  function mostEnjoyed(results) {
    const rated = readiness(results).filter((r) => r.enjoy != null);
    if (!rated.length) return { tasks: [], rating: null };
    const top = Math.max(...rated.map((r) => r.enjoy));
    return { tasks: rated.filter((r) => r.enjoy === top), rating: top };
  }

  function biggestSurprise(results) {
    const done = readiness(results);
    if (!done.length) return null;
    return [...done].sort((a, b) => Math.abs(gapOf(b)) - Math.abs(gapOf(a)))[0];
  }

  function contrasts(results) {
    return readiness(results).filter(
      (r) => r.band === 2 && ((r.drain != null && r.drain >= 4) || (r.enjoy != null && r.enjoy <= 2))
    );
  }

  function focusTask(results, hl) {
    if (hl) return hl;
    const enj = mostEnjoyed(results);
    if (enj.tasks.length) return enj.tasks[0];
    const done = readiness(results);
    return done.length ? done[0] : null;
  }

  const taskById = (id) => TASKS.find((t) => t.id === id);

  function buildSnapshot(results) {
    const done = readiness(results);
    const hl = highlight(results);
    const enj = mostEnjoyed(results);
    const surprise = biggestSurprise(results);
    const gaps = done.map(gapOf);
    return {
      done,
      hl,
      enjoyed: enj.tasks,
      topEnjoy: enj.rating,
      surprise,
      hasSurprise: surprise ? gapOf(surprise) !== 0 : false,
      contrast: contrasts(results),
      focus: focusTask(results, hl),
      allMatched: gaps.length > 0 && gaps.every((g) => g === 0),
      anyStrong: done.some((r) => r.band === 2)
    };
  }

  /* ---------- share text ---------- */

  function shareText(results) {
    const s = buildSnapshot(results);
    if (s.hl) {
      const t = taskById(s.hl.id);
      return "My session highlight: " + t.label + " — " + s.hl.score + " of " + s.hl.max +
        " on " + t.name.toLowerCase() + " in one short round. Which challenge brings out your best?";
    }
    if (s.enjoyed.length) {
      return "The challenge I most enjoyed today: " + taskById(s.enjoyed[0].id).name.toLowerCase() +
        ". Which challenge brings out your best?";
    }
    return "Five short challenges, one honest snapshot. Which challenge brings out your best?";
  }


export {cfg, bandOf, cutoffs, gapOf, gapSentence, highlight, mostEnjoyed, biggestSurprise, contrasts, buildSnapshot, taskById, readiness, shareText, PRED, BAND, ENJ, DRAIN, TASKS};

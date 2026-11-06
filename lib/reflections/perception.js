const TASKS = [
  {
    id: 'memory',
    n: '01',
    name: 'Recall',
    short: 'Recall',
    unit: 'items',
    max: 8,
    kind: 'count',
    preview: 'Eight symbols appear for three seconds. They vanish. You then pick the ones you saw from a set of sixteen — eight were shown, eight were not.',
    scoring: 'One point per symbol correctly identified, minus one for every symbol you pick that was never shown. Wrong picks cost you.',
    play(t) { return 'Eight symbols for three seconds. You get sixteen choices.'; },
  },
  {
    id: 'change',
    n: '02',
    name: 'Change detection',
    short: 'Change',
    unit: 'changes',
    max: 6,
    kind: 'count',
    preview: 'A grid of twenty-four forms is shown to you once. Then it returns, and six of the twenty-four have been altered — flipped, rotated, resized, or recoloured.',
    scoring: 'You flag the cells you think changed. One point for each correct flag, minus one for each cell you flag that did not change.',
    play(t) { return 'Six changes in twenty-four cells. Forty-five seconds.'; },
  },
  {
    id: 'rule',
    n: '03',
    name: 'Rule switching',
    short: 'Rule',
    unit: 'choices',
    max: 12,
    kind: 'count',
    preview: 'You see one form and choose which of two piles it belongs in. The rule is either SHAPE or COLOUR. Six choices, then the rule flips without warning, then six more.',
    scoring: 'One point per correct choice out of twelve. There is a short practice before the scored run.',
    play(t) { return 'Twelve choices. The rule changes partway through.'; },
    hasPractice: true,
  },
];

const byId = id => TASKS.find(t => t.id === id);

/* ---------------- metrics ---------------- */

const signedOf = r => r.result - r.prediction;
const gapOf = r => Math.abs(r.result - r.prediction);
const normGapOf = r => gapOf(r) / byId(r.task).max;
const isExact = r => gapOf(r) === 0;

/* "close" band: within 1 unit, or ~10% of the maximum, whichever is larger */
function closeBand(max) { return Math.max(1, Math.round(max * 0.1)); }
const isClose = r => gapOf(r) <= closeBand(byId(r.task).max);

const pct = x => Math.round(x * 100);

function signedLabel(r) {
  const d = signedOf(r);
  if (d === 0) return 'exact';
  return (d > 0 ? '+' : '\u2212') + Math.abs(d);
}

function adjustmentOf(all, taskId) {
  const r1 = all.find(r => r.task === taskId && r.round === 1);
  const r2 = all.find(r => r.task === taskId && r.round === 2);
  if (!r1 || !r2) return null;
  return { value: gapOf(r1) - gapOf(r2), g1: gapOf(r1), g2: gapOf(r2), exactBoth: gapOf(r1) === 0 && gapOf(r2) === 0 };
}

/* ---------------- reveal copy (descriptive, never diagnostic) ---------------- */

function revealSentence(r) {
  const t = byId(r.task);
  const d = signedOf(r);
  const u = t.unit;
  if (d === 0) {
    return {
      head: 'Your prediction was exactly right.',
      body: `You predicted ${r.prediction} of ${t.max} and scored ${r.result} of ${t.max}.`,
    };
  }
  if (isClose(r)) {
    return {
      head: d > 0 ? 'Close — and slightly above your prediction.' : 'Close — and slightly below your prediction.',
      body: `You predicted ${r.prediction} ${u} and got ${r.result}. A gap of ${gapOf(r)}.`,
    };
  }
  if (d > 0) {
    return {
      head: 'You did better than you gave yourself credit for.',
      body: `You predicted ${r.prediction} ${u} and got ${r.result} — ${d} more than you expected.`,
    };
  }
  return {
    head: 'You expected more than the result this time.',
    body: `You predicted ${r.prediction} ${u} and got ${r.result} — ${Math.abs(d)} fewer.`,
  };
}


export { TASKS,byId,signedOf,gapOf,normGapOf,isExact,closeBand,isClose,pct,signedLabel,adjustmentOf,revealSentence };

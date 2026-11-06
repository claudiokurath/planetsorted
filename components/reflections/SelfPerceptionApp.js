'use client'
import * as React from 'react'
import './SelfPerception.css'
import { TASKS,byId,signedOf,gapOf,normGapOf,isExact,isClose,pct,signedLabel,adjustmentOf,revealSentence } from '@/lib/reflections/perception'
/* ---------------------------------------------------------------
   lib.jsx — metrics, task definitions, glyphs, shared components
   Sign convention everywhere: signed = result - prediction
   (positive = the player beat their prediction)
----------------------------------------------------------------*/


/* ---------------- tasks ---------------- */

/* ---------------- glyphs ----------------
   A small fixed vocabulary of drawn forms, used as the
   actual stimulus in the memory and change tasks.        */

const GLYPH_KEYS = [
  'tri', 'sq', 'dia', 'circ', 'bar', 'chev', 'cross', 'ring',
  'half', 'dots', 'corner', 'lens', 'steps', 'arc', 'notch', 'plus',
];

const GLYPH_COLORS = ['#16140F', '#8C8678', '#B4402A', '#5A6B4E', '#3C4A63', '#9C7C33'];

function Glyph({ k, color = '#16140F', size, extra = 0, fill = 0 }) {
  // extra drives the "changed" variants: rotate / scale / hollow
  const rot = extra % 4 * 90;
  const sc = 1 - fill * 0.28;
  const solid = fill > 0.5;
  const c = color;
  const st = { stroke: c, strokeWidth: 1.6, fill: 'none', vectorEffect: 'non-scaling-stroke' };
  const sf = { fill: c, stroke: 'none' };
  let body = null;
  switch (k) {
    case 'tri': body = <polygon points="32,8 54,52 10,52" {...(solid ? sf : st)} />; break;
    case 'sq': body = <rect x="12" y="12" width="40" height="40" {...(solid ? sf : st)} />; break;
    case 'dia': body = <polygon points="32,8 56,32 32,56 8,32" {...(solid ? sf : st)} />; break;
    case 'circ': body = <circle cx="32" cy="32" r="21" {...(solid ? sf : st)} />; break;
    case 'bar': body = <rect x="12" y="25" width="40" height="14" {...(solid ? sf : st)} />; break;
    case 'chev': body = <polyline points="16,52 32,16 48,52" {...st} strokeLinecap="square" />; break;
    case 'cross': body = <g {...st}><line x1="14" y1="14" x2="50" y2="50" /><line x1="50" y1="14" x2="14" y2="50" /></g>; break;
    case 'ring': body = <g><circle cx="32" cy="32" r="21" {...st} />{solid && <circle cx="32" cy="32" r="9" {...sf} />}</g>; break;
    case 'half': body = <path d="M32 10 A22 22 0 0 0 32 54 Z" {...(solid ? sf : st)} />; break;
    case 'dots': body = <g {...(solid ? sf : st)}>{[[20,20],[32,20],[44,20],[20,32],[44,32],[20,44],[32,44],[44,44]].map(([x, y], i) => solid ? <circle key={i} cx={x} cy={y} r="4.5" fill={c} stroke="none" /> : <circle key={i} cx={x} cy={y} r="3.4" />)}</g>; break;
    case 'corner': body = <polyline points="14,50 14,14 50,14" {...st} strokeWidth="3" />; break;
    case 'lens': body = <path d="M14 32 Q32 6 50 32 Q32 58 14 32 Z" {...(solid ? sf : st)} />; break;
    case 'steps': body = <polyline points="12,50 24,50 24,34 38,34 38,18 52,18" {...st} strokeWidth="2.2" />; break;
    case 'arc': body = <path d="M12 46 A20 20 0 1 1 52 46" {...st} strokeWidth="2.4" />; break;
    case 'notch': body = <path d="M12 12 H52 V44 H40 V32 H24 V44 H12 Z" {...(solid ? sf : st)} />; break;
    case 'plus': body = <g {...(solid ? sf : st)}><rect x="27" y="12" width="10" height="40" fill={solid ? c : 'none'} stroke={solid ? 'none' : c} />{!solid && <rect x="12" y="27" width="40" height="10" />}</g>; break;
    default: body = <rect x="14" y="14" width="36" height="36" {...(solid ? sf : st)} />;
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" style={{ transform: `rotate(${rot}deg) scale(${sc})`, display: 'block', width: '100%', height: '100%', transition: 'transform .25s ease' }}>
      {body}
    </svg>
  );
}

/* ---------------- shared bits ---------------- */


function Screen({ children, label }) {
  return <div className="screen" data-screen-label={label}>{children}</div>;
}

function TopBar({ round, totalRounds, screenLabel }) {
  return (
    <div className="topbar">
      <div className="frame">
        <div className="topbar-in">
          <div className="brand"><b>The Self-Perception Gap</b></div>
          {totalRounds ? (
            <div className="tickwrap">
              <div className="tickcount num">{round}/{totalRounds}</div>
              <div className="ticks" aria-hidden="true">
                {Array.from({ length: totalRounds }, (_, i) => (
                  <i key={i} className={i + 1 < round ? 'on' : i + 1 === round ? 'now' : ''} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* PairedScale — prediction hollow, result solid.
   No colour distinction between "good" and "bad"; only the gap is marked. */

function PairedScale({ prediction, result, max, unit, compact }) {
  const p = Math.max(0, Math.min(1, prediction / max));
  const r = Math.max(0, Math.min(1, result / max));
  const lo = Math.min(p, r), hi = Math.max(p, r);
  const same = Math.abs(p - r) < 0.001;
  const ticks = [];
  for (let i = 0; i <= max; i++) ticks.push(i);
  return (
    <div className="scalewrap" role="img" aria-label={`Predicted ${prediction}, scored ${result}, out of ${max}`}>
      <div className="scale-legend">
        <span className="lg"><i className="lg-ring" />predicted <b>{prediction}</b></span>
        <span className="lg"><i className="lg-dot" />result <b>{result}</b></span>
        {!same && <span className="lg gap">{gapOfLabel(prediction, result)} apart</span>}
      </div>
      <div className="scale">
        <div className="scale-line" />
        {ticks.map(i => (
          <div key={i} className={'scale-tick' + (i === 0 || i === max ? ' mid' : '')} style={{ left: `${(i / max) * 100}%` }} />
        ))}
        {!same && <div className="scale-band" style={{ left: `${lo * 100}%`, width: `${Math.max(0.6, (hi - lo) * 100)}%` }} />}
        <div className="scale-mark" style={{ left: `${p * 100}%` }}><i className="scale-ring" /></div>
        <div className="scale-mark" style={{ left: `${r * 100}%` }}><i className="scale-dot" /></div>
      </div>
      <div className="scale-foot">
        <span>0</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

const gapOfLabel = (a, b) => Math.abs(a - b);



/* ---------------------------------------------------------------
   challenges.jsx — the three playable tasks
   Each exposes: <Challenge task round onComplete(score, detail) />
   No prediction, no score and no running count is visible in play.
----------------------------------------------------------------*/
const { useState: useStateC, useEffect: useEffectC, useRef: useRefC, useMemo: useMemoC } = React;

/* deterministic shuffle so each round is reproducible and alternate
   sets are matched in composition (same glyph vocabulary, same counts) */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function shuffled(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* =========================================================
   01 — RECALL (recognition)
   ========================================================= */
function MemoryChallenge({ round, onComplete }) {
  const [phase, setPhase] = useStateC('study');
  const [sel, setSel] = useStateC([]);

  const { study, board, answer } = useMemoC(() => {
    const rnd = mulberry32(round === 1 ? 20261026 : 771203);
    const order = shuffled(Array.from({ length: 16 }, (_, i) => i), rnd);
    const studyKeys = order.slice(0, 8);
    const boardKeys = shuffled(order, rnd);

    return {
      study: studyKeys.map((k, i) => ({ k: GLYPH_KEYS[k], color: '#16140F' })),
      board: boardKeys.map(k => ({ gi: k, k: GLYPH_KEYS[k] })),
      answer: new Set(studyKeys),
    };
  }, [round]);

  useEffectC(() => {
    const t = setTimeout(() => setPhase('select'), 3400);
    return () => clearTimeout(t);
  }, []);

  const toggle = i => setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);

  const submit = () => {
    let hits = 0, fa = 0;
    sel.forEach(i => { if (answer.has(board[i].gi)) hits++; else fa++; });
    onComplete(Math.max(0, hits - fa), { hits, falseAlarms: fa, flagged: sel.length });
  };

  if (phase === 'study') {
    return (
      <div className="stack">
        <div className="studybar">
          <div className="micro">Memorise</div>
          <div className="timerbar"><i style={{ animation: 'spg-deplete 3.2s linear forwards' }} /></div>
        </div>
        <div className="gridstudy" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
          {study.map((g, i) => (
            <div key={i} className="cell-glyph" style={{ animation: `spg-popIn .3s cubic-bezier(.22,.72,.2,1) ${i * 0.045}s both`, padding: '10px' }}>
              <Glyph k={g.k} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <div className="micro" style={{ marginBottom: 8 }}>Select every symbol you were shown</div>
        <p className="tiny">Eight of these sixteen appeared. Picking one that did not costs you a point.</p>
      </div>
      <div className="gridstudy" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
        {board.map((g, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={sel.includes(i)}
            aria-label={'Symbol ' + (i + 1)}
            className={'cell-glyph' + (sel.includes(i) ? ' sel' : '')}
            onClick={() => toggle(i)}
            style={{ padding: '9px' }}
          >
            <Glyph k={g.k} />
          </button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 4 }}>
        <div className="hint num">{sel.length} selected</div>
        <div className="hint">{sel.length === 0 ? 'tap to select' : ''}</div>
      </div>
      <button className="btn" type="button" onClick={submit}>
        <span>Finish round</span><span className="go">{'\u2192'}</span>
      </button>
    </div>
  );
}

/* =========================================================
   02 — CHANGE DETECTION
   A change must be detectable: rotations only on asymmetric
   forms, fills only on closed forms.
   ========================================================= */
const ROTATABLE = new Set(['tri', 'bar', 'chev', 'steps', 'half', 'notch', 'corner', 'arc', 'lens']);
const FILLABLE = new Set(['tri', 'sq', 'dia', 'circ', 'bar', 'half', 'lens', 'notch', 'plus', 'ring']);

function buildGrid(round) {
  const rnd = mulberry32(round === 1 ? 40921 : 88117);
  const pool = shuffled(Array.from({ length: 16 }, (_, i) => i), rnd);
  const cells = Array.from({ length: 24 }, (_, i) => {
    const gi = pool[i % 16];
    return { ki: gi, k: GLYPH_KEYS[gi], color: '#16140F', rot: 0, scale: 1, solid: 0 };
  });
  const idx = shuffled(Array.from({ length: 24 }, (_, i) => i), rnd).slice(0, 6);

  // for each cell to change, pick a kind this glyph can express
  idx.forEach(ci => {
    const c = cells[ci];
    const kinds = [];
    if (ROTATABLE.has(c.k)) kinds.push('rot', 'rot');
    if (FILLABLE.has(c.k)) kinds.push('solid');
    kinds.push('scale');
    const kind = kinds[Math.floor(rnd() * kinds.length)];
    if (kind === 'rot') c.rot = rnd() > 0.5 ? 1 : 3;
    if (kind === 'scale') c.scale = 0.6;
    if (kind === 'solid') c.solid = 1;
  });
  return { cells, changed: new Set(idx) };
}

function CellRender({ c, ghost }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', opacity: ghost ? 0.28 : 1 }}>
      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', transform: `rotate(${c.rot * 90}deg) scale(${c.scale})`, transition: 'transform .3s ease' }}>
        <Glyph k={c.k} color={c.color} fill={c.solid} />
      </div>
    </div>
  );
}

function ChangeChallenge({ round, onComplete }) {
  const [phase, setPhase] = useStateC('study');
  const [flags, setFlags] = useStateC([]);
  const [left, setLeft] = useStateC(45);
  const { cells, changed } = useMemoC(() => buildGrid(round), [round]);

  useEffectC(() => {
    const t = setTimeout(() => setPhase('find'), 5200);
    return () => clearTimeout(t);
  }, []);

  useEffectC(() => {
    if (phase !== 'find') return;
    const iv = setInterval(() => {
      setLeft(s => {
        if (s <= 1) { clearInterval(iv); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const finish = (list) => {
    let hits = 0, fa = 0;
    list.forEach(i => changed.has(i) ? hits++ : fa++);
    onComplete(Math.max(0, hits - fa), { hits, falseAlarms: fa, flagged: list.length });
  };

  useEffectC(() => {
    if (phase === 'find' && left === 0) finish(flags);
  }, [left, phase]);

  const toggle = i => setFlags(f => f.includes(i) ? f.filter(x => x !== i) : [...f, i]);

  if (phase === 'study') {
    return (
      <div className="stack">
        <div className="studybar">
          <div className="micro">Memorise the grid</div>
          <div className="timerbar"><i style={{ animation: 'spg-deplete 5.2s linear forwards' }} /></div>
        </div>
        <div className="gridchange">
          {cells.map((c, i) => (
            <div key={i} className="cell-ch" style={{ cursor: 'default' }}><CellRender c={{ ...c, rot: 0, scale: 1, solid: 0 }} /></div>
          ))}
        </div>
        <p className="tiny">Six of these twenty-four will be altered when the grid returns.</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="row">
        <div className="micro">Flag the cells that changed</div>
        <div className={'hint num' + (left <= 10 ? ' ox' : '')} style={left <= 10 ? { color: 'var(--oxide)' } : undefined}>{left}s</div>
      </div>
      <div className="gridchange">
        {cells.map((c, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={flags.includes(i)}
            aria-label={'Cell ' + (i + 1) + ', flag as changed'}
            className={'cell-ch' + (flags.includes(i) ? ' flag' : '')}
            onClick={() => toggle(i)}
          >
            <CellRender c={c} />
          </button>
        ))}
      </div>
      <div className="stack-s">
        <div className="row">
          <div className="hint num">{flags.length} flagged</div>
          <button className="link" type="button" onClick={() => setFlags([])} style={{ opacity: flags.length ? 1 : 0 }}>
            Clear
          </button>
        </div>
        <button className="btn" type="button" onClick={() => finish(flags)}>
          <span>Finish round</span><span className="go">{'\u2192'}</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   03 — RULE SWITCHING
   ========================================================= */
const PILE_A = { shape: 'tri', color: GLYPH_COLORS[2] };  // oxide triangle
const PILE_B = { shape: 'sq', color: GLYPH_COLORS[3] };   // sage square

function makeTrials(round) {
  const rnd = mulberry32(round === 1 ? 5551 : 91077);
  const scored = Array.from({ length: 12 }, (_, i) => {
    const rule = i < 6 ? 'shape' : 'colour';
    // always incongruent: the shape points at one pile, the colour at the other
    const shapeIsA = rnd() > 0.5;
    const stim = {
      shape: shapeIsA ? PILE_A.shape : PILE_B.shape,
      color: shapeIsA ? PILE_B.color : PILE_A.color,
    };
    const correct = rule === 'shape' ? (shapeIsA ? 'A' : 'B') : (shapeIsA ? 'B' : 'A');
    return { stim, rule, correct };
  });
  const practice = [
    { rule: 'shape' }, { rule: 'shape' }, { rule: 'colour' }, { rule: 'colour' },
  ].map(({ rule }, i) => {
    const shapeIsA = i % 2 === 0;
    const stim = { shape: shapeIsA ? PILE_A.shape : PILE_B.shape, color: shapeIsA ? PILE_B.color : PILE_A.color };
    return { stim, rule, correct: rule === 'shape' ? (shapeIsA ? 'A' : 'B') : (shapeIsA ? 'B' : 'A') };
  });
  return { scored, practice };
}

function RuleChallenge({ round, onComplete }) {
  const [phase, setPhase] = useStateC('practice'); // practice | run
  const [pi, setPi] = useStateC(0);
  const [ti, setTi] = useStateC(0);
  const [fb, setFb] = useStateC(null);      // practice feedback
  const [score, setScore] = useStateC(0);
  const [lock, setLock] = useStateC(false);
  const inputLockRef = useRefC(false);
  const timerRef = useRefC(null);
  useEffectC(() => () => clearTimeout(timerRef.current), []);
  const { scored, practice } = useMemoC(() => makeTrials(round), [round]);

  const trial = phase === 'practice' ? practice[Math.min(pi, practice.length - 1)] : scored[Math.min(ti, scored.length - 1)];

  const pick = side => {
    if (lock || inputLockRef.current) return;
    inputLockRef.current = true;
    if (phase === 'practice') {
      setLock(true);
      setFb(side === trial.correct ? 'right' : 'wrong');
      timerRef.current = setTimeout(() => {
        inputLockRef.current = false;
        setFb(null); setLock(false);
        if (pi + 1 >= practice.length) { setPhase('run'); }
        else setPi(pi + 1);
      }, 720);
    } else {
      const next = side === trial.correct ? score + 1 : score;
      setScore(next);
      setLock(true);
      timerRef.current = setTimeout(() => {
        inputLockRef.current = false; setLock(false);
        if (ti + 1 >= scored.length) onComplete(next, { of: 12 });
        else setTi(ti + 1);
      }, 210);
    }
  };

  const ruleLabel = trial.rule === 'shape' ? 'Match the shape' : 'Match the colour';

  return (
    <div className="stack">
      {phase === 'practice' ? (
        <div className="row">
          <div className="micro">Practice {'\u00b7'} not scored</div>
          <div className="hint num">{pi + 1}/{practice.length}</div>
        </div>
      ) : (
        <div className="micro">Scored run {'\u00b7'} the rule will change without warning</div>
      )}

      <div className={'cue' + (trial.rule === 'colour' ? ' flip' : '')}>
        <span className="cuek">Rule</span>
        <span>{ruleLabel}</span>
        <span className="cuek">{trial.rule === 'shape' ? '\u25a0\u25b2' : '\u25cf\u25cf'}</span>
      </div>

      <div className="rulecard">
        <div style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }}>
          <RuleStim stim={trial.stim} />
        </div>
      </div>

      <div className="optgrid">
        {['A', 'B'].map(side => {
          const pile = side === 'A' ? PILE_A : PILE_B;
          let cls = 'opt';
          if (phase === 'practice' && fb) {
            if (side === trial.correct) cls += ' correct';
            else if (fb === 'wrong') cls += ' wrong';
          }
          return (
            <button key={side} type="button" className={cls} disabled={lock} onClick={() => pick(side)}
              aria-label={'Pile ' + side}>
              <RuleStim stim={{ shape: pile.shape, color: pile.color }} small />
            </button>
          );
        })}
      </div>

      <div style={{ minHeight: 22, textAlign: 'center' }}>
        {phase === 'practice' && fb && (
          <div className="micro" style={{ color: fb === 'right' ? '#5A6B4E' : 'var(--oxide)' }}>
            {fb === 'right' ? 'Correct' : 'Not quite'}
          </div>
        )}
        {phase === 'practice' && !fb && (
          <div className="tiny" style={{ color: 'var(--ink-3)' }}>Two trials for each rule, then the scored run begins.</div>
        )}
      </div>
    </div>
  );
}

function RuleStim({ stim, small }) {
  const size = small ? 40 : 74;
  return (
    <div style={{ width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <Glyph k={stim.shape} color={stim.color} />
    </div>
  );
}

/* =========================================================
   dispatcher
   ========================================================= */
function Challenge({ task, round, onComplete }) {
  if (task === 'memory') return <MemoryChallenge round={round} onComplete={onComplete} />;
  if (task === 'change') return <ChangeChallenge round={round} onComplete={onComplete} />;
  if (task === 'rule') return <RuleChallenge round={round} onComplete={onComplete} />;
  return null;
}



/* ---------------------------------------------------------------
   screens.jsx — intro, preview, predict, play, reveal
----------------------------------------------------------------*/
const { useState: useStateS } = React;

/* ============================= INTRO ============================= */
function IntroScreen({ onBegin, hasProgress, onResume, onReset }) {
  return (
    <Screen label="01 Intro">
      <div className="masthead">
        <div className="row">
          <div className="micro">A short experiment in self-prediction</div>
          <div className="micro nowrap">3 tasks {'\u00b7'} 2 rounds</div>
        </div>
        <h1>You are about to guess how you will&nbsp;do. <em>That guess is the experiment.</em></h1>
        <p className="lede">
          Most games ask how well you did. This one asks how well you knew how you would do.
          The tasks are only the evidence.
        </p>
      </div>

      <div className="tasklist">
        {TASKS.map(t => (
          <div className="taskrow" key={t.id}>
            <div className="n num">{t.n}</div>
            <div className="nm">{t.name}</div>
            <div className="mt">{t.max} {t.unit}<br />{'\u00d7'} 2 rounds</div>
          </div>
        ))}
      </div>

      <div className="stack" style={{ marginTop: 30 }}>
        <div className="marginnote">
          <p>
            Before every round you commit to a number. During the round you see no score, no
            count and no prediction. Afterwards you see both numbers at once — and then you
            predict again, with new information.
          </p>
        </div>
      </div>

      <div className="stack" style={{ marginTop: 30 }}>
        {hasProgress ? (
          <>
            <button className="btn" type="button" onClick={onResume}>
              <span>Continue where you stopped</span><span className="go">{'\u2192'}</span>
            </button>
            <button className="btn-ghost" type="button" onClick={onReset}>Start over</button>
          </>
        ) : (
          <button className="btn" type="button" onClick={onBegin}>
            <span>Begin {'\u00b7'} about five minutes</span><span className="go">{'\u2192'}</span>
          </button>
        )}
        <div className="ornament"><span className="sq" /><span className="ln" /></div>
        <p className="tiny" style={{ maxWidth: '30em' }}>
          This does not measure intelligence, personality, self-esteem or mental health. It records
          how a few short tasks compared with your own expectations of them.
        </p>
      </div>
    </Screen>
  );
}

/* ============================ PREVIEW ============================ */
function TaskPreviewArt({ task }) {
  if (task === 'memory') {
    return (
      <div className="gridstudy" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 7, opacity: .92 }}>
        {['tri', 'ring', 'steps', 'lens', 'notch', 'arc', 'corner', 'plus'].map((k, i) => (
          <div key={i} className="cell-glyph" style={{ padding: 9 }}><Glyph k={k} /></div>
        ))}
      </div>
    );
  }
  if (task === 'change') {
    return (
      <div className="gridchange">
        {['circ', 'tri', 'bar', 'dia', 'sq', 'chev', 'cross', 'ring', 'half', 'lens', 'arc', 'steps'].map((k, i) => (
          <div key={i} className={'cell-ch' + (i === 3 || i === 8 ? ' flag' : '')} style={{ cursor: 'default' }}>
            <Glyph k={k} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="stack-s">
      <div className="cue">
        <span className="cuek">Rule</span><span>Match the shape</span><span className="cuek">{'\u25a0\u25b2'}</span>
      </div>
      <div className="row" style={{ alignItems: 'stretch', gap: 8 }}>
        <div className="rulecard" style={{ flex: 1, height: 92 }}>
          <RuleStim stim={{ shape: 'tri', color: GLYPH_COLORS[3] }} small />
        </div>
        <div className="rulecard" style={{ flex: 1, height: 92 }}>
          <RuleStim stim={{ shape: 'sq', color: GLYPH_COLORS[2] }} small />
        </div>
      </div>
      <p className="tiny">The shape points to the left pile. The colour points to the right one.</p>
    </div>
  );
}

function PreviewScreen({ task, round, onNext, onBack }) {
  const t = byId(task);
  return (
    <Screen label={`Preview ${t.n} ${t.name}`}>
      <div className="stack">
        <div className="row">
          <div className="micro">Task {t.n} of 03</div>
          <div className="micro">{round === 1 ? 'First round' : 'Second round'}</div>
        </div>
        <h2>{t.name}</h2>
        <p className="lede">{t.preview}</p>
        <div className="panel panel-pad">
          <TaskPreviewArt task={task} />
        </div>
        <div className="stack-s">
          <div className="micro ink">How a correct answer is counted</div>
          <p className="small">{t.scoring}</p>
          <p className="tiny">The maximum is {t.max} {t.unit}. Rounds are short — under a minute of play.</p>
        </div>
        <button className="btn" type="button" onClick={onNext}>
          <span>Make your prediction</span><span className="go">{'\u2192'}</span>
        </button>
        <button className="link" type="button" onClick={onBack} style={{ justifySelf: 'start', alignSelf: 'start' }}>
          {'\u2190'} Back
        </button>
      </div>
    </Screen>
  );
}

/* ============================ PREDICT ============================ */
function PredictDial({ max, value, onChange, unit }) {
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="dial">
      <div className="dial-face">
        {value === null
          ? <div className="dial-num blank">{'\u2014'}</div>
          : <div className="dial-num num" key={value}><span>{value}</span></div>}
        <div className="dial-of">of {max} {unit}</div>
      </div>
      <div className="dial-track" role="group" aria-label="Predicted score">
        {ticks.map(i => (
          <button
            key={i}
            type="button"
            className={'dial-tick' + (value === i ? ' on' : '')}
            aria-pressed={value === i}
            aria-label={i + ' of ' + max}
            onClick={() => onChange(i)}
          >
            <span>{i}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PredictScreen({ task, round, prior, onConfirm, onBack }) {
  const t = byId(task);
  const [value, setValue] = useStateS(null);
  return (
    <Screen label={`Predict ${t.n} ${t.name} R${round}`}>
      <div className="stack">
        <div className="row">
          <div className="micro">Before you play</div>
          <div className="micro">{round === 1 ? 'Round 1 of 2' : 'Round 2 of 2'}</div>
        </div>
        <h2>
          {round === 1
            ? <>How many {t.unit} will you get?</>
            : <>Predict again. <em>How many this time?</em></>}
        </h2>
        {round === 2 && prior ? (
          <div className="stack-s">
            <p className="lede">
              Last round you predicted {prior.prediction} and got {prior.result} of {t.max}.
              This is a fresh set of items, not the same one again.
            </p>
            <div className="prevbox">
              <div className="micro ink">Round 1, for reference</div>
              <div className="prevgrid">
                <div className="prevcell"><div className="k">Predicted</div><div className="v hollow">{prior.prediction}</div></div>
                <div className="prevcell"><div className="k">Result</div><div className="v" style={{ color: 'var(--oxide)' }}>{prior.result}</div></div>
                <div className="prevcell"><div className="k">Gap</div><div className="v">{gapOf(prior)}</div></div>
              </div>
            </div>
          </div>
        ) : (
          <p className="lede">
            The number you pick becomes your prediction. Nothing you see while playing will
            tell you whether you are hitting it.
          </p>
        )}

        <div className="pt">
          <PredictDial max={t.max} value={value} onChange={setValue} unit={t.unit} />
        </div>

        <button className="btn" type="button" disabled={value === null} onClick={() => onConfirm(value)}>
          <span>{value === null ? 'Choose a number' : `Lock in ${value} of ${t.max}`}</span>
          <span className="go">{value === null ? '' : '\u2192'}</span>
        </button>
        <button className="link" type="button" onClick={onBack} style={{ justifySelf: 'start', alignSelf: 'start' }}>
          {'\u2190'} Back
        </button>
      </div>
    </Screen>
  );
}

/* ============================== PLAY ============================== */
function PlayScreen({ task, round, onDone }) {
  const t = byId(task);
  return (
    <Screen label={`Play ${t.n} ${t.name} R${round}`}>
      <div className="stack">
        <div className="row">
          <div className="micro">In progress {'\u00b7'} no score shown</div>
          <div className="micro num">{round === 1 ? 'Round 1' : 'Round 2'}</div>
        </div>
        <Challenge key={`${task}-${round}`} task={task} round={round} onComplete={(score, detail) => onDone(score, detail)} />
      </div>
    </Screen>
  );
}

/* ============================= REVEAL ============================= */
function RevealScreen({ record, prior, round, total, onNext, taskIndex }) {
  const t = byId(record.task);
  const s = revealSentence(record);
  const d = signedOf(record);
  const adj = prior ? { value: gapOf(prior) - gapOf(record), g1: gapOf(prior), g2: gapOf(record) } : null;

  return (
    <Screen label={`Reveal ${t.n} ${t.name} R${round}`}>
      <div className="stack-l">
        <div className="stack">
          <div className="row">
            <div className="micro">Round {round} of 2 {'\u00b7'} {t.name}</div>
            <div className="micro num">{total} of 6</div>
          </div>
          <h2 style={{ maxWidth: '16em' }}>{s.head}</h2>

          <div className="readout">
            <div>
              <div className="micro">Predicted</div>
              <div className="v hollow num">{record.prediction}</div>
              <div className="s">you said</div>
            </div>
            <div>
              <div className="micro">Difference</div>
              <div className="v sig num" style={{ color: d === 0 ? 'var(--ink)' : d > 0 ? 'var(--oxide)' : 'var(--ink-2)' }}>
                {signedLabel(record)}
              </div>
              <div className="s">result {'\u2212'} prediction</div>
            </div>
            <div>
              <div className="micro">Result</div>
              <div className="v num" style={{ color: 'var(--oxide)' }}>{record.result}</div>
              <div className="s">of {t.max} {t.unit}</div>
            </div>
          </div>
        </div>

        <PairedScale prediction={record.prediction} result={record.result} max={t.max} unit={t.unit} compact />

        <div className="stack">
          <p className="lede" style={{ color: 'var(--ink)' }}>{s.body}</p>
          <div className="hr" />
          <div className="stack-s">
            {record.detail && record.task === 'memory' && (
              <p className="tiny">
                {record.detail.hits} correct {record.detail.hits === 1 ? 'pick' : 'picks'},
                {' '}{record.detail.falseAlarms} that were never shown.
              </p>
            )}
            {record.detail && record.task === 'change' && (
              <p className="tiny">
                {record.detail.hits} of 6 changes found, {record.detail.falseAlarms} cells flagged that had not changed.
              </p>
            )}
            {record.detail && record.task === 'rule' && (
              <p className="tiny">{record.detail.of ? `Out of ${record.detail.of} choices.` : ''}</p>
            )}
            {round === 2 && adj && (
              <p className="tiny">
                {adj.value > 0
                  ? `Your second prediction was ${adj.value} ${adj.value === 1 ? 'unit' : 'units'} closer than your first.`
                  : adj.value === 0
                    ? 'Your second prediction was the same distance from the result as your first.'
                    : `Your second prediction was ${Math.abs(adj.value)} ${Math.abs(adj.value) === 1 ? 'unit' : 'units'} further from the result than your first.`}
                {' '}Familiarity with the task may be part of why.
              </p>
            )}
          </div>
        </div>

        <button className="btn" type="button" onClick={onNext}>
          <span>{round === 1 ? 'Predict again for round 2' : (taskIndex < TASKS.length - 1 ? 'Continue to the next task' : 'See the full report')}</span>
          <span className="go">{'\u2192'}</span>
        </button>
      </div>
    </Screen>
  );
}



/* ---------------------------------------------------------------
   report.jsx — "Prediction vs Performance"
   Four findings, evidence on demand, six-round table, share card.
----------------------------------------------------------------*/
const { useState: useStateR, useMemo: useMemoR } = React;

/* ---------- derive ---------- */

function analyse(records) {
  const norms = records.map(r => ({ r, ng: normGapOf(r), sg: signedOf(r) }));

  const surprise = records.length
    ? norms.filter(x => x.sg > 0).sort((a, b) => b.ng - a.ng)[0] || null
    : null;
  const mismatch = norms.slice().sort((a, b) => b.ng - a.ng)[0] || null;
  const closest = norms.slice().sort((a, b) => a.ng - b.ng)[0] || null;

  const adjs = TASKS.map(t => ({ task: t, ...(adjustmentOf(records, t.id) || { value: null }) }))
    .filter(a => a.value !== null);

  const above = records.filter(r => signedOf(r) > 0).length;
  const below = records.filter(r => signedOf(r) < 0).length;
  const exact = records.filter(r => isExact(r)).length;

  const r1 = norms.filter(x => x.r.round === 1);
  const r2 = norms.filter(x => x.r.round === 2);
  const avg = arr => arr.length ? arr.reduce((s, x) => s + x.ng, 0) / arr.length : null;

  return { surprise, mismatch, closest, adjs, above, below, exact, avg1: avg(r1), avg2: avg(r2), norms };
}

const tName = id => byId(id).name;

/* ---------- headline ---------- */

function headline(a, records) {
  // Lead with one observation the evidence actually supports.
  if (a.surprise && a.surprise.ng >= 0.09) {
    const r = a.surprise.r, t = byId(r.task);
    return {
      head: <>You did better than you predicted on {t.name.toLowerCase()}.</>,
      body: `You expected ${r.prediction} of ${t.max} ${t.unit} and got ${r.result}. That was the largest upward gap in the session.`,
    };
  }
  if (a.mismatch && a.mismatch.ng >= 0.09) {
    const r = a.mismatch.r, t = byId(r.task);
    const d = signedOf(r);
    return {
      head: <>Your expectations ran furthest from the result on {t.name.toLowerCase()}.</>,
      body: `You predicted ${r.prediction} of ${t.max} and got ${r.result} — ${Math.abs(d)} ${Math.abs(d) === 1 ? t.unit.replace(/s$/, '') : t.unit} ${d > 0 ? 'above' : 'below'} your number.`,
    };
  }
  if (a.closest) {
    const r = a.closest.r, t = byId(r.task);
    return {
      head: <>Your predictions tracked the results closely throughout.</>,
      body: `The closest was ${t.name.toLowerCase()}, round ${r.round}: predicted ${r.prediction}, got ${r.result}.`,
    };
  }
  return { head: <>Report</>, body: '' };
}

/* ---------- small components ---------- */


function Finding({ k, title, lead, value, children, defaultOpen }) {
  const [open, setOpen] = useStateR(!!defaultOpen);
  return (
    <div className="finding">
      <button className="finding-head" type="button" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className="fk">{k}</span>
        <span>
          <span className="ft">{title}</span>
          {lead ? <span className="tiny" style={{ display: 'block', marginTop: 4 }}>{lead}</span> : null}
        </span>
        <span className="fv">{value != null ? value : (open ? '\u2212' : '+')}</span>
      </button>
      {open && <div className="finding-body">{children}</div>}
    </div>
  );
}

/* ---------- share ---------- */

function ShareCard({ mode, records, headlineText }) {
  const a = useMemoR(() => analyse(records), [records]);
  const best = a.surprise ? a.surprise.r : null;
  const t = best ? byId(best.task) : null;

  return (
    <div className="sharecard">
      <div className="sc-top">
        <div className="sc-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>The Self-Perception Gap</span>
          <span>3 {'\u00d7'} 2</span>
        </div>
      </div>

      <div className="sc-mid">
        {mode === 'numbers' && best ? (
          <>
            <div className="sc-nums">
              <div>
                <div className="k">Predicted</div>
                <div className="v hollow" style={{ color: 'transparent', WebkitTextStroke: '1.2px rgba(242,239,231,.6)' }}>{best.prediction}</div>
                <div className="of">of {t.max}</div>
              </div>
              <div>
                <div className="k">Result</div>
                <div className="v ox num">{best.result}</div>
                <div className="of">of {t.max}</div>
              </div>
            </div>
            <div className="sc-rule" />
            <div className="quote">
              {t.name}.<br />
              <em>What would you predict?</em>
            </div>
          </>
        ) : (
          <div className="quote" style={{ fontSize: 28 }}>
            My biggest surprise wasn{'\u2019'}t what I got wrong.
            <br /><em>It was what I thought I couldn{'\u2019'}t do.</em>
          </div>
        )}
      </div>

      <div className="sc-bot">
        <div className="sc-meta">
          {mode === 'numbers' ? 'Prediction vs performance' : 'One session, six rounds'}
        </div>
        <div style={{ width: 26, height: 26, border: '1px solid rgba(242,239,231,.3)', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 5, height: 5, background: '#D9603F' }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- the report ---------- */

function ReportScreen({ records, onRestart, onReview }) {
  const [mode, setMode] = useStateR('numbers');
  const [copied, setCopied] = useStateR(false);
  const a = useMemoR(() => analyse(records), [records]);
  const h = useMemoR(() => headline(a, records), [a, records]);

  const copy = async () => {
    const best = a.surprise ? a.surprise.r : null;
    const text = best
      ? `I predicted ${best.prediction} of ${byId(best.task).max} on ${tName(best.task).toLowerCase()} and got ${best.result}. What would you predict? — The Self-Perception Gap`
      : 'The Self-Perception Gap — prediction vs performance.';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const { surprise, mismatch, closest, adjs, above, below, exact, avg1, avg2 } = a;

  return (
    <Screen label="09 Report">
      <div className="stack-l">
        <div className="stack">
          <div className="row">
            <div className="micro">Prediction vs performance</div>
            <div className="micro num">6 rounds</div>
          </div>
          <h1 style={{ fontSize: 'clamp(34px,9vw,52px)', lineHeight: 1.04 }}>{h.head}</h1>
          <p className="lede">{h.body}</p>
          <div className="row" style={{ marginTop: 4 }}>
            <div className="micro ink">Above {above} {'\u00b7'} below {below} {'\u00b7'} exact {exact}</div>
          </div>
        </div>

        {/* findings */}
        <div>
          <div className="micro" style={{ marginBottom: 12 }}>What the six rounds showed</div>

          <Finding k="01" title={<>Biggest pleasant surprise</>}
            lead={surprise ? `${tName(surprise.r.task)} \u00b7 round ${surprise.r.round}` : 'None this session'}
            value={surprise ? signedLabel(surprise.r) : '\u2014'}>
            {surprise ? (
              <div className="stack-s">
                <p className="small">
                  {tName(surprise.r.task)}, round {surprise.r.round}: you predicted {surprise.r.prediction} and got {surprise.r.result} of {byId(surprise.r.task).max}.
                </p>
                <PairedScale prediction={surprise.r.prediction} result={surprise.r.result} max={byId(surprise.r.task).max} unit={byId(surprise.r.task).unit} compact />
                <p className="tiny">A gap of {gapOf(surprise.r)} — {pct(normGapOf(surprise.r))}% of that task{'\u2019'}s maximum.</p>
              </div>
            ) : (
              <p className="small">No round finished above its prediction, so there is nothing to report here.</p>
            )}
          </Finding>

          <Finding k="02" title={<>Biggest mismatch</>}
            lead={mismatch ? `${tName(mismatch.r.task)} \u00b7 round ${mismatch.r.round}` : ''}
            value={mismatch ? pct(mismatch.ng) + '%' : '\u2014'}>
            {mismatch ? (
              <div className="stack-s">
                <p className="small">
                  {tName(mismatch.r.task)}, round {mismatch.r.round}: predicted {mismatch.r.prediction}, got {mismatch.r.result} of {byId(mismatch.r.task).max}.
                  {' '}The result was {signedOf(mismatch.r) === 0 ? 'identical to' : signedOf(mismatch.r) > 0 ? 'above' : 'below'} your expectation by {gapOf(mismatch.r)}.
                </p>
                <PairedScale prediction={mismatch.r.prediction} result={mismatch.r.result} max={byId(mismatch.r.task).max} unit={byId(mismatch.r.task).unit} compact />
                <p className="tiny">
                  Compared across tasks by dividing each gap by its maximum: {pct(mismatch.ng)}%. Raw gaps from different tasks are not directly comparable.
                </p>
              </div>
            ) : null}
          </Finding>

          <Finding k="03" title={<>Closest prediction</>}
            lead={closest ? `${tName(closest.r.task)} \u00b7 round ${closest.r.round}` : ''}
            value={closest ? (isExact(closest.r) ? 'exact' : '\u00b1' + gapOf(closest.r)) : '\u2014'}>
            {closest ? (
              <div className="stack-s">
                <p className="small">
                  {tName(closest.r.task)}, round {closest.r.round}: predicted {closest.r.prediction}, got {closest.r.result}.
                  {isExact(closest.r) ? ' Exactly right.' : ` Off by ${gapOf(closest.r)}.`}
                </p>
                <PairedScale prediction={closest.r.prediction} result={closest.r.result} max={byId(closest.r.task).max} unit={byId(closest.r.task).unit} compact />
                {isClose(closest.r) && !isExact(closest.r) && (
                  <p className="tiny">Within the close band — a gap of one item or about 10% of the maximum is inside the range this task can resolve.</p>
                )}
              </div>
            ) : null}
          </Finding>

          <Finding k="04" title={<>Second-round adjustment</>}
            value={adjs.length ? (() => { const s2 = adjs.reduce((x, y) => x + y.value, 0); return s2 === 0 ? '0' : (s2 > 0 ? '+' : '\u2212') + Math.abs(s2); })() : null}>
            <div className="stack-s">
              <p className="small">
                For each task, the gap in round 2 subtracted from the gap in round 1. A positive
                number means the second prediction landed closer to its result.
              </p>
              <table className="tbl">
                <thead>
                  <tr><th>Task</th><th>R1 gap</th><th>R2 gap</th><th>Adjust.</th></tr>
                </thead>
                <tbody>
                  {adjs.map(({ task, value, g1, g2, exactBoth }) => (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      <td className="num">{g1}</td>
                      <td className="num">{g2}</td>
                      <td className="num">{exactBoth ? 'exact both' : (value > 0 ? '+' : value < 0 ? '\u2212' : '0') + (value === 0 ? '' : Math.abs(value))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="tiny">
                Round 2 uses a different but comparable set of items. It also benefits from
                familiarity with the task, so a closer second prediction is not the same as knowing
                yourself better.
              </p>
            </div>
          </Finding>
        </div>

        {/* full table */}
        <div>
          <div className="micro" style={{ marginBottom: 12 }}>All six rounds</div>
          <table className="tbl">
            <thead>
              <tr><th>Task</th><th>R</th><th>Pred.</th><th>Result</th><th>Diff.</th><th>Gap</th><th>Norm.</th></tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className={isExact(r) ? 'exact' : ''}>
                  <td>{tName(r.task)}</td>
                  <td className="num"><span className="rn">{r.round}</span></td>
                  <td className="num">{r.prediction}</td>
                  <td className="num">{r.result}</td>
                  <td className={'num' + (signedOf(r) > 0 ? ' pos' : '')}>{signedLabel(r)}</td>
                  <td className="num">{gapOf(r)}</td>
                  <td className="num">{normGapOf(r).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="tiny" style={{ marginTop: 12 }}>
            Difference is result minus prediction, so a positive number means you beat your own
            estimate. Norm. divides the gap by the task maximum so rounds can be placed side by side —
            it describes score differences, not equal difficulty.
          </p>
        </div>

        {/* average comparison */}
        {avg1 !== null && avg2 !== null && (
          <div className="panel panel-pad">
            <div className="micro ink">Average normalized gap</div>
            <div className="row" style={{ alignItems: 'flex-end', marginTop: 14 }}>
              <div>
                <div className="micro">Round 1</div>
                <div className="num" style={{ fontFamily: 'var(--serif)', fontSize: 40, lineHeight: 1 }}>{avg1.toFixed(3)}</div>
              </div>
              <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 11 }}>{'\u2192'}</div>
              <div>
                <div className="micro">Round 2</div>
                <div className="num" style={{ fontFamily: 'var(--serif)', fontSize: 40, lineHeight: 1, color: 'var(--oxide)' }}>{avg2.toFixed(3)}</div>
              </div>
            </div>
            <p className="tiny" style={{ marginTop: 14 }}>
              A plain comparison, not a score. Two rounds of a few tasks cannot establish a stable
              level of self-knowledge.
            </p>
          </div>
        )}

        {/* share */}
        <div>
          <div className="micro" style={{ marginBottom: 12 }}>A card, if you want one</div>
          <div className="sharewrap">
            <ShareCard mode={mode} records={records} />
          </div>
          <div className="seg" style={{ marginTop: 18 }}>
            <button type="button" className={mode === 'numbers' ? 'on' : ''} onClick={() => setMode('numbers')}>Show the numbers</button>
            <button type="button" className={mode === 'private' ? 'on' : ''} onClick={() => setMode('private')}>Keep it private</button>
          </div>
          <div className="stack-s" style={{ marginTop: 14 }}>
            <button className={'btn-ghost' + (copied ? ' copied' : '')} type="button" onClick={copy}>
              {copied ? 'Copied to clipboard' : 'Copy the line'}
            </button>
            <p className="tiny">
              Detailed results stay on this device. Nothing clinical appears on the card, and the
              less revealing version shows no numbers at all.
            </p>
          </div>
        </div>

        <div className="stack">
          <button className="btn" type="button" onClick={onReview}>
            <span>Re-read a round</span><span className="go">{'\u2192'}</span>
          </button>
          <button className="btn-ghost" type="button" onClick={onRestart}>Start a new session</button>
        </div>
      </div>
    </Screen>
  );
}

/* ---------- review a single round ---------- */

function ReviewScreen({ records, onBack }) {
  const [sel, setSel] = useStateR(0);
  const r = records[sel];
  if (!r) return null;
  const t = byId(r.task);
  const s = revealSentence(r);
  return (
    <Screen label="10 Review">
      <div className="stack">
        <div className="row">
          <div className="micro">Evidence</div>
          <div className="micro num">{sel + 1}/{records.length}</div>
        </div>
        <h2 style={{ fontSize: 'clamp(26px,6.4vw,34px)' }}>{t.name} {'\u00b7'} round {r.round}</h2>
        <div className="readout">
          <div><div className="micro">Predicted</div><div className="v hollow num">{r.prediction}</div><div className="s">you said</div></div>
          <div><div className="micro">Difference</div><div className="v sig num" style={{ color: signedOf(r) > 0 ? 'var(--oxide)' : 'var(--ink-2)' }}>{signedLabel(r)}</div><div className="s">result {'\u2212'} prediction</div></div>
          <div><div className="micro">Result</div><div className="v num" style={{ color: 'var(--oxide)' }}>{r.result}</div><div className="s">of {t.max}</div></div>
        </div>
        <PairedScale prediction={r.prediction} result={r.result} max={t.max} unit={t.unit} compact />
        <p className="small">{s.body}</p>
        <div className="seg">
          {records.map((x, i) => (
            <button key={i} type="button" className={i === sel ? 'on' : ''} onClick={() => setSel(i)}>
              {byId(x.task).n}.{x.round}
            </button>
          ))}
        </div>
        <button className="btn-ghost" type="button" onClick={onBack}>{'\u2190'} Back to the report</button>
      </div>
    </Screen>
  );
}



/* ---------------------------------------------------------------
   main.jsx — session state machine + persistence
   Sequence: intro → [task: preview → predict → play → reveal] ×2
             → next task → report → review
----------------------------------------------------------------*/
const { useState: useStateM, useEffect: useEffectM } = React;

const KEY = 'spg.session.v1';
const TOTAL_ROUNDS = TASKS.length * 2;

function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.records) || s.records.length > 6 || !Number.isInteger(s.cursor) || s.cursor < 0 || s.cursor > 5 || !['intro','preview','predict','play','reveal','report','review'].includes(s.step)) return null;
    if (s.records.some(r => !r || !byId(r.task) || ![1,2].includes(r.round) || !Number.isInteger(r.prediction) || !Number.isInteger(r.result) || r.prediction < 0 || r.result < 0 || r.prediction > byId(r.task).max || r.result > byId(r.task).max)) return null;
    if (s.step === 'reveal' && !s.records.some(r => r.task === TASKS[Math.floor(s.cursor / 2)].id && r.round === s.cursor % 2 + 1)) return null;
    if (['report','review'].includes(s.step) && s.records.length !== 6) return null;
    return s;
  } catch { return null; }
}

function saveSession(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

const emptySession = () => ({ step: 'intro', cursor: 0, records: [], started: false });

function roundInfo(cursor) {
  const task = TASKS[Math.floor(cursor / 2)];
  const round = (cursor % 2) + 1;
  return { task, round };
}

function SelfPerceptionApp() {
  const [session, setSession] = useStateM(() => loadSession() || emptySession());

  useEffectM(() => { if (!session.started && !session.records.length) { try { localStorage.removeItem(KEY); } catch {} } else saveSession(session); }, [session]);
  useEffectM(() => { window.scrollTo(0, 0); }, [session.step, session.cursor]);

  const { step, cursor, records } = session;
  const { task, round } = roundInfo(Math.min(cursor, TOTAL_ROUNDS - 1));

  const patch = p => setSession(s => ({ ...s, ...p }));

  /* --- navigation --- */
  const begin = () => setSession({ step: 'preview', cursor: 0, records: [], started: true });
  const reset = () => { try { localStorage.removeItem(KEY); } catch {} setSession(emptySession()); };

  const toPredict = () => patch({ step: 'predict' });

  const completeRound = (score, detail) => {
    setSession(s => {
      const { task: t, round: rr } = roundInfo(s.cursor);
      const rec = {
        task: t.id,
        round: rr,
        prediction: s.prediction,
        result: score,
        detail: detail || null,
      };
      const next = { ...s, records: [...s.records.filter(r => !(r.task === t.id && r.round === rr)), rec], step: 'reveal', prediction: null };
      return next;
    });
  };

  const afterReveal = () => {
    const cur = roundInfo(cursor);
    if (cur.round === 1) {
      patch({ cursor: cursor + 1, step: 'predict' }); // advance to the second, independent item set
    } else {
      const nextCursor = cursor + 1;
      if (nextCursor >= TOTAL_ROUNDS) patch({ step: 'report' });
      else patch({ cursor: nextCursor, step: 'preview' });
    }
  };

  const confirmPrediction = value => {
    setSession(s => ({ ...s, prediction: value, step: 'play' }));
  };

  /* --- current record / prior --- */
  const prior = round === 2 ? records.find(r => r.task === task.id && r.round === 1) || null : null;
  const recordedForCursor = records.find(r => r.task === task.id && r.round === round);
  const completedCount = records.length;

  /* --- header --- */
  const showTicks = session.started && step !== 'report' && step !== 'review';
  const headerRound = Math.min(completedCount + 1, TOTAL_ROUNDS);

  /* --- render --- */
  let body = null;

  if (step === 'intro') {
    const hasProgress = records.length > 0;
    body = (
      <IntroScreen
        onBegin={begin}
        hasProgress={hasProgress}
        onResume={() => patch({ step: session.pendingStep || 'predict', started: true })}
        onReset={reset}
      />
    );
  } else if (step === 'preview') {
    body = (
      <PreviewScreen
        task={task.id}
        round={round}
        onNext={toPredict}
        onBack={() => patch({ step: 'intro' })}
      />
    );
  } else if (step === 'predict') {
    body = (
      <PredictScreen
        task={task.id}
        round={round}
        prior={prior}
        onConfirm={confirmPrediction}
        onBack={() => patch({ step: round === 1 ? 'preview' : 'reveal' })}
      />
    );
  } else if (step === 'play') {
    body = <PlayScreen task={task.id} round={round} onDone={completeRound} />;
  } else if (step === 'reveal') {
    body = (
      <RevealScreen
        record={recordedForCursor}
        prior={prior}
        round={round}
        total={cursor + 1}
        taskIndex={TASKS.findIndex(t => t.id === task.id)}
        onNext={afterReveal}
      />
    );
  } else if (step === 'report') {
    body = (
      <ReportScreen
        records={records}
        onRestart={reset}
        onReview={() => patch({ step: 'review' })}
      />
    );
  } else if (step === 'review') {
    body = <ReviewScreen records={records} onBack={() => patch({ step: 'report' })} />;
  }

  return (
    <div className="self-perception-app"><div className="app">
      <TopBar round={headerRound} totalRounds={showTicks ? TOTAL_ROUNDS : 0} />
      <div className="pt">
        <div className="frame">{body}</div>
      </div>
      <footer>
        <div className="frame">
          <div className="footnote"><button type="button" className="link" onClick={reset}>Clear this session</button>
            <div className="rule" />
            <p>
              Records how a few short tasks compared with your own expectations.
              Not a measure of intelligence, personality, self-esteem or mental health.
              Nothing leaves this device. Your session is saved in this browser until you clear it.
            </p>
          </div>
        </div>
      </footer>
    </div></div>
  );
}


export default SelfPerceptionApp

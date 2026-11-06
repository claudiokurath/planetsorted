'use client'
import * as React from 'react'
import { MR_CALC } from '@/lib/reflections/money'
// Shared UI primitives — currency formatter, gauge, header, footer disclaimer.



const fmtGBP = (n) => {
  const v = Math.round(n || 0);
  return '£' + v.toLocaleString('en-GB');
};

// Circular gauge for the pressure score
function ScoreGauge({ score, label, size = 220, thickness = 14 }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;

  const colorFor = (l) => {
    if (l === 'stable') return '#22c55e';
    if (l === 'stretched') return '#FFD400';
    if (l === 'danger_zone') return '#f97316';
    return '#ef4444';
  };
  const color = colorFor(label);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={thickness}
        />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: size * 0.28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#f0f0f2' }}>
          {score}
        </div>
        <div style={{ fontSize: 11, color: '#5a6069', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
          out of 100
        </div>
      </div>
    </div>
  );
}

// Small pill badge
function Pill({ children, color = 'default', style = {} }) {
  const colors = {
    default: { bg: 'rgba(255,255,255,0.05)', fg: '#8a8f98', border: 'rgba(255,255,255,0.08)' },
    gold:    { bg: 'rgba(245,200,76,0.10)', fg: '#FFD400', border: 'rgba(245,200,76,0.24)' },
    purple:  { bg: 'rgba(139,92,246,0.12)', fg: '#a78bfa', border: 'rgba(139,92,246,0.28)' },
    green:   { bg: 'rgba(34,197,94,0.10)', fg: '#4ade80', border: 'rgba(34,197,94,0.24)' },
    orange:  { bg: 'rgba(249,115,22,0.10)', fg: '#fb923c', border: 'rgba(249,115,22,0.24)' },
    red:     { bg: 'rgba(239,68,68,0.10)', fg: '#f87171', border: 'rgba(239,68,68,0.24)' },
  };
  const c = colors[color] || colors.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 500, letterSpacing: '0.02em',
      ...style,
    }}>{children}</span>
  );
}

// App-level header (used on every internal screen)
function AppHeader({setView}) { return <div className="money-app-header"><a href="/adhd-money-reset">SOR7ED · ADHD Money Reset</a><button type="button" onClick={() => setView('landing')}>Back to start</button></div>; }

function FooterDisclaimer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: 80, padding: '32px 24px 40px',
      background: '#0a0b0e',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#5a6069', lineHeight: 1.7, margin: 0, textWrap: 'pretty' }}>
          This tool is for organisation and education only. It is not financial advice.
          For debt crisis or regulated advice, contact a qualified adviser or debt charity.
        </p>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16,
          fontSize: 11, color: '#5a6069', letterSpacing: '0.02em',
        }}>
          <span>StepChange · 0800 138 1111</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Citizens Advice · 0800 144 8848</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>National Debtline · 0808 808 4000</span>
        </div>
      </div>
    </footer>
  );
}

// A neat labeled input group used across the form
function FieldGroup({ label, hint, children, prefix, suffix, style = {} }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <span style={{ fontSize: 13, color: '#f0f0f2', fontWeight: 500 }}>{label}</span>
      {hint && <span style={{ fontSize: 12, color: '#8a8f98', lineHeight: 1.5, marginBottom: 2 }}>{hint}</span>}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#14171c', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, padding: '0 14px',
        transition: 'border-color 160ms',
      }}
      onFocusCapture={(e) => e.currentTarget.style.borderColor = 'rgba(245,200,76,0.5)'}
      onBlurCapture={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
      >
        {prefix && <span style={{ color: '#8a8f98', fontSize: 14, marginRight: 4, fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{prefix}</span>}
        {children}
        {suffix && <span style={{ color: '#5a6069', fontSize: 12, marginLeft: 8 }}>{suffix}</span>}
      </div>
    </label>
  );
}

const inputStyle = {
  background: 'transparent', border: 0, outline: 'none',
  color: '#f0f0f2', fontSize: 15, padding: '13px 0',
  flex: 1, width: '100%', minWidth: 0,
  fontFamily: 'var(--font-jetbrains-mono), monospace',
};

// Number input with proper handling
function NumberInput({ value, onChange, placeholder = '0', min, max, step = 1 }) {
  return (
    <input
      type="number"
      value={value === 0 ? '' : value}
      onChange={(e) => {
        const v = e.target.value === '' ? 0 : Number(e.target.value);
        onChange(Number.isFinite(v) ? Math.max(min ?? 0, Math.min(max ?? 100000000, v)) : 0);
      }}
      placeholder={placeholder}
      min={min} max={max} step={step}
      style={inputStyle}
    />
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, fontFamily: 'var(--font-jost), sans-serif' }}
    />
  );
}

// Segmented control (used for enum-style choices)
function Segmented({ options, value, onChange, wrap = false }) {
  return (
    <div style={{
      display: wrap ? 'flex' : 'grid',
      flexWrap: wrap ? 'wrap' : undefined,
      gridTemplateColumns: wrap ? undefined : `repeat(${options.length}, 1fr)`,
      gap: 8,
    }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} type="button"
            style={{
              padding: '12px 14px', borderRadius: 10,
              background: active ? 'rgba(245,200,76,0.12)' : '#14171c',
              border: `1px solid ${active ? 'rgba(245,200,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: active ? '#FFD400' : '#f0f0f2',
              fontSize: 13, fontWeight: active ? 500 : 400,
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 160ms',
              flex: wrap ? '1 1 140px' : undefined,
            }}>
            <div style={{ fontWeight: 500 }}>{opt.label}</div>
            {opt.hint && <div style={{ fontSize: 11, color: active ? 'rgba(245,200,76,0.7)' : '#5a6069', marginTop: 2 }}>{opt.hint}</div>}
          </button>
        );
      })}
    </div>
  );
}

// Slider with value display
function Slider({ value, onChange, min = 1, max = 10, leftLabel, rightLabel }) {
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10,
      }}>
        <span style={{ fontSize: 12, color: '#8a8f98' }}>{leftLabel}</span>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#FFD400', fontFamily: 'var(--font-jetbrains-mono), monospace', letterSpacing: '-0.02em' }}>
          {value}<span style={{ fontSize: 14, color: '#5a6069', fontWeight: 400 }}>/{max}</span>
        </span>
        <span style={{ fontSize: 12, color: '#8a8f98' }}>{rightLabel}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', accentColor: '#FFD400',
          height: 6,
        }}
      />
    </div>
  );
}

// Toggle switch
function Toggle({ value, onChange, label, hint }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer',
      padding: '14px 16px', background: '#14171c',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
    }}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          flexShrink: 0, marginTop: 2,
          width: 40, height: 24, borderRadius: 999,
          background: value ? '#FFD400' : 'rgba(255,255,255,0.10)',
          border: 0, position: 'relative', cursor: 'pointer',
          transition: 'background 160ms',
        }}>
        <span style={{
          position: 'absolute', top: 3, left: value ? 19 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: value ? '#000000' : '#f0f0f2',
          transition: 'left 160ms',
        }} />
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#f0f0f2', fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: '#8a8f98', marginTop: 2, lineHeight: 1.5 }}>{hint}</div>}
      </div>
    </label>
  );
}

// Primary + secondary buttons
function PrimaryButton({ children, onClick, disabled, style = {}, type = 'button' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      padding: '14px 28px', borderRadius: 999,
      background: disabled ? 'rgba(245,200,76,0.24)' : '#FFD400',
      color: '#000000', border: 0, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em',
      transition: 'transform 120ms, background 160ms',
      ...style,
    }}
    onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, style = {} }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '14px 28px', borderRadius: 999,
      background: 'transparent', color: '#f0f0f2',
      border: '1px solid rgba(255,255,255,0.14)',
      cursor: 'pointer', fontSize: 14, fontWeight: 500,
      transition: 'border-color 160ms, background 160ms',
      ...style,
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
    >
      {children}
    </button>
  );
}



// Landing page — calm, one clear promise, no fintech clichés.

function LandingPage({ onStart, onLoadSample }) {
  return (
    <div style={{ background: '#000000', color: '#f0f0f2' }}>
      {/* Subtle top nav — logo + tiny disclaimer link */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '24px 24px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(135deg, #FFD400 0%, #d9a828 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000000', fontWeight: 800, fontSize: 16,
          }}>R</div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>ADHD Money Reset</span>
        </div>
        <div style={{ fontSize: 12, color: '#5a6069' }}>
          Organisation tool · Not financial advice
        </div>
      </div>

      {/* Hero */}
      <section style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '80px 24px 40px',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
          gap: 64, alignItems: 'center',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(245,200,76,0.08)', border: '1px solid rgba(245,200,76,0.20)',
              color: '#FFD400', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 28,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FFD400' }} />
              A 4-minute reset
            </div>

            <h1 style={{
              fontSize: 62, fontWeight: 600, lineHeight: 1.02, letterSpacing: '-0.035em',
              margin: '0 0 24px', textWrap: 'balance',
            }}>
              You're not bad<br />with money.
              <br />
              <span style={{ color: '#8a8f98' }}>The system wasn't</span>
              <br />
              <span style={{ color: '#8a8f98' }}>built for your brain.</span>
            </h1>

            <p style={{
              fontSize: 18, color: '#8a8f98', lineHeight: 1.55, textWrap: 'pretty',
              margin: '0 0 40px', maxWidth: 480,
            }}>
              Answer six honest questions. Get a Money Pressure Score, a payday
              split you can actually stick to, and a 7-day rescue plan built for
              how your brain actually works.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <PrimaryButton onClick={onStart}>Start my reset →</PrimaryButton>
              <SecondaryButton onClick={onLoadSample}>See a sample result</SecondaryButton>
            </div>

            <div style={{
              display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap',
              fontSize: 12, color: '#5a6069',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                No account required
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                Stays on your device
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                Zero shame
              </div>
            </div>
          </div>

          {/* Right — pressure gauge preview */}
          <div style={{
            background: 'linear-gradient(180deg, #14171c 0%, #0f1114 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20, padding: 36,
            boxShadow: '0 24px 72px rgba(0,0,0,0.35)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: '#5a6069', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                  Money Pressure Score
                </div>
                <div style={{ fontSize: 13, color: '#8a8f98', marginTop: 4 }}>Sample: Sarah, £2,400/mo</div>
              </div>
              <Pill color="orange">Stretched</Pill>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
              <ScoreGauge score={62} label="danger_zone" size={200} />
            </div>

            <div style={{
              padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.04)',
              fontSize: 12, color: '#8a8f98', lineHeight: 1.6, textWrap: 'pretty',
            }}>
              "Your bills and debt minimums are putting real pressure on your income.
              This is common and fixable — we'll stabilise first, then shrink leaks."
            </div>

            {/* Mini bar breakdown */}
            <div style={{ marginTop: 20 }}>
              {[
                { label: 'Essential load', v: 24, max: 30 },
                { label: 'Cash-flow shortfall', v: 10, max: 20 },
                { label: 'Buffer gap', v: 11, max: 15 },
                { label: 'Behavioural risk', v: 12, max: 20 },
                { label: 'Urgency flags', v: 5, max: 15 },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1, fontSize: 11, color: '#8a8f98' }}>{row.label}</div>
                  <div style={{ width: 100, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${(row.v/row.max)*100}%`, height: '100%', background: '#FFD400' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#5a6069', fontFamily: 'var(--font-jetbrains-mono), monospace', width: 36, textAlign: 'right' }}>
                    {row.v}/{row.max}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '60px 24px 40px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 40, gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#5a6069', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 12 }}>
              How the reset works
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.15 }}>
              Six honest answers. One plan you can actually follow.
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            {
              n: '01',
              title: 'Answer six honest questions',
              body: 'Income, bills, debts, savings, leaks, goals. No judgement, no shame — just what actually is. Takes about four minutes.',
            },
            {
              n: '02',
              title: 'Get your Money Pressure Score',
              body: 'A single number 0–100 across five bounded categories, so no one factor dominates. See exactly where the pressure is coming from.',
            },
            {
              n: '03',
              title: 'Follow a plan built for ADHD',
              body: 'Six-part payday split, debt priority in your chosen style, 7-day rescue and 30-day reset — all automatic, no willpower required.',
            },
          ].map(step => (
            <div key={step.n} style={{
              padding: 28, borderRadius: 16,
              background: '#14171c', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontSize: 11, color: '#FFD400', letterSpacing: '0.08em', fontFamily: 'var(--font-jetbrains-mono), monospace',
                marginBottom: 20,
              }}>{step.n}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 10px', lineHeight: 1.25 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: '#8a8f98', lineHeight: 1.6, margin: 0, textWrap: 'pretty' }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What you actually get — a slim spec list */}
      <section style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '40px 24px 80px',
      }}>
        <div style={{
          background: 'linear-gradient(180deg, #0f1114 0%, #000000 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20, padding: 40,
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)', gap: 48, alignItems: 'start',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#5a6069', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 12 }}>
              What lands in your dashboard
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 12px', lineHeight: 1.2 }}>
              Every module built around one principle: no willpower required.
            </h3>
            <p style={{ fontSize: 14, color: '#8a8f98', lineHeight: 1.6, margin: 0, textWrap: 'pretty' }}>
              Free view unlocks the score, the snapshot and your top two leaks.
              Premium unlocks the full payday split, debt priority, plans, rules and scripts.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { title: 'Money Pressure Score', body: 'Where the weight sits, across five categories.', pill: 'Free' },
              { title: 'Monthly snapshot', body: 'Income · fixed bills · debt · leaks · shortfall.', pill: 'Free' },
              { title: 'Leak Map', body: 'Impulse, subs, late fees, replacements, takeaways.', pill: 'Free · top 2' },
              { title: '7-day rescue plan', body: 'Between 5 and 7 conditional actions.', pill: 'Free · 3 shown' },
              { title: 'Six-part payday split', body: 'Bills · debt · buffer · emergency · spending · flex.', pill: 'Premium' },
              { title: 'Debt priority plan', body: 'Snowball, avalanche or balanced — you choose.', pill: 'Premium' },
              { title: '30-day reset', body: 'Stabilise · automate · reduce leaks · review.', pill: 'Premium' },
              { title: 'ADHD-proof rules + scripts', body: '24-hour pause, payment plan emails, more.', pill: 'Premium' },
            ].map(f => (
              <div key={f.title} style={{
                padding: '18px 20px', borderRadius: 12,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, color: '#f0f0f2', fontWeight: 500, letterSpacing: '-0.005em' }}>{f.title}</div>
                  <Pill color={f.pill.startsWith('Premium') ? 'gold' : 'default'}>{f.pill}</Pill>
                </div>
                <div style={{ fontSize: 12, color: '#8a8f98', lineHeight: 1.5 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterDisclaimer />
    </div>
  );
}



// Six-step money reset form. One step per screen, sticky progress, Back/Next.

const STEP_META = [
  { key: 'income',  title: 'Income',       hint: 'What actually lands in your account.',           icon: '01' },
  { key: 'bills',   title: 'Fixed bills',  hint: 'The stuff that goes out no matter what.',        icon: '02' },
  { key: 'debts',   title: 'Debts',        hint: 'Every balance, plus your total minimums.',       icon: '03' },
  { key: 'savings', title: 'Savings & buffer', hint: 'What sits in accounts today.',               icon: '04' },
  { key: 'leaks',   title: 'ADHD money leaks', hint: 'The stuff that disappears without a trace.', icon: '05' },
  { key: 'goals',   title: 'Goals & plan style', hint: 'What you actually want from this reset.',  icon: '06' },
];

// Wrapper for a form step
function StepShell({ step, total, meta, children, onBack, onNext, nextLabel = 'Continue', canContinue = true }) {
  return (
    <div style={{
      maxWidth: 720, margin: '0 auto',
      padding: '48px 24px 120px',
      minHeight: 'calc(100vh - 72px)',
    }}>
      {/* Step badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '5px 12px', borderRadius: 999,
        background: 'rgba(245,200,76,0.08)', border: '1px solid rgba(245,200,76,0.20)',
        color: '#FFD400', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
        marginBottom: 20, fontFamily: 'var(--font-jetbrains-mono), monospace',
      }}>
        Step {step} · {meta.icon}
      </div>

      <h1 style={{
        fontSize: 40, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.08,
        margin: '0 0 12px',
      }}>{meta.title}</h1>
      <p style={{ fontSize: 16, color: '#8a8f98', margin: '0 0 40px', lineHeight: 1.55, textWrap: 'pretty' }}>
        {meta.hint}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {children}
      </div>

      {/* Sticky bottom actions */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)',
        gap: 16, flexWrap: 'wrap',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 0, color: '#8a8f98', cursor: 'pointer',
          fontSize: 14, padding: '10px 0', fontWeight: 500,
        }}>← Back</button>
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          {nextLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}

// Step 1 — Income
function StepIncome({ inputs, setInputs, onBack, onNext }) {
  const set = (patch) => setInputs({ ...inputs, ...patch });
  const canContinue = inputs.monthlyIncomeAfterTax > 0 && (inputs.incomeFrequency !== 'irregular' || (inputs.minMonthlyIncomeIfIrregular || 0) > 0);

  return (
    <StepShell step={1} total={6} meta={STEP_META[0]} onBack={onBack} onNext={onNext} canContinue={canContinue}>
      <FieldGroup
        label={inputs.incomeFrequency === 'weekly' ? 'How much lands in your account each week?' : 'How much lands in your account each month?'}
        hint={inputs.incomeFrequency === 'weekly' ? 'After tax. We multiply this weekly amount by 4.33 to plan a monthly budget.' : 'After tax and any deductions — the actual number you can spend.'}
        prefix="£">
        <NumberInput value={inputs.monthlyIncomeAfterTax} onChange={v => set({ monthlyIncomeAfterTax: v })} placeholder="e.g. 2400" />
      </FieldGroup>

      <div>
        <div style={{ fontSize: 13, color: '#f0f0f2', fontWeight: 500, marginBottom: 8 }}>How often are you paid?</div>
        <Segmented
          value={inputs.incomeFrequency}
          onChange={v => set({ incomeFrequency: v })}
          options={[
            { value: 'monthly',   label: 'Monthly',   hint: 'One payday a month' },
            { value: 'weekly',    label: 'Weekly',    hint: 'Every 7 days' },
            { value: 'irregular', label: 'Irregular', hint: 'Freelance, gig, varies' },
          ]}
        />
      </div>

      {inputs.incomeFrequency === 'irregular' && (
        <FieldGroup
          label="On a bad month, what's the minimum you can count on?"
          hint="We plan against the low end so a slow month never blows up the plan."
          prefix="£">
          <NumberInput
            value={inputs.minMonthlyIncomeIfIrregular || 0}
            onChange={v => set({ minMonthlyIncomeIfIrregular: v })}
            placeholder="Lowest realistic month"
          />
        </FieldGroup>
      )}

      <FieldGroup label="Payday date" hint="1–31. Used to time your payday split.">
        <NumberInput value={inputs.paydayDate} onChange={v => set({ paydayDate: Math.min(31, Math.max(1, v || 1)) })} min={1} max={31} />
      </FieldGroup>
    </StepShell>
  );
}

// Step 2 — Fixed bills
function StepBills({ inputs, setInputs, onBack, onNext }) {
  const set = (patch) => setInputs({ ...inputs, ...patch });

  const rows = [
    { key: 'rentMortgage',   label: 'Rent / mortgage',   hint: 'The big one.' },
    { key: 'councilTax',     label: 'Council tax',       hint: 'Divide the yearly bill by 12 if easier.' },
    { key: 'utilities',      label: 'Utilities',         hint: 'Gas, electric, water combined.' },
    { key: 'phoneInternet',  label: 'Phone & internet',  hint: 'Contracts, broadband, SIM.' },
    { key: 'transport',      label: 'Transport',         hint: 'Season ticket, car finance, fuel average.' },
    { key: 'insurance',      label: 'Insurance',         hint: 'Life, contents, car, pet.' },
    { key: 'subscriptions',  label: 'Subscriptions',     hint: 'The ones you know about, at least.' },
    { key: 'otherFixedBills',label: 'Other fixed bills', hint: 'Anything else that goes out every month.' },
  ];

  const total = rows.reduce((s, r) => s + (inputs[r.key] || 0), 0);

  return (
    <StepShell step={2} total={6} meta={STEP_META[1]} onBack={onBack} onNext={onNext}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {rows.map(r => (
          <FieldGroup key={r.key} label={r.label} prefix="£">
            <NumberInput value={inputs[r.key]} onChange={v => set({ [r.key]: v })} placeholder="0" />
          </FieldGroup>
        ))}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', background: 'rgba(245,200,76,0.06)',
        border: '1px solid rgba(245,200,76,0.16)', borderRadius: 12,
        marginTop: 8,
      }}>
        <span style={{ fontSize: 13, color: '#FFD400', letterSpacing: '0.02em' }}>Total fixed bills / month</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#FFD400', fontFamily: 'var(--font-jetbrains-mono), monospace', letterSpacing: '-0.02em' }}>
          {fmtGBP(total)}
        </span>
      </div>
    </StepShell>
  );
}

// Step 3 — Debts
function StepDebts({ inputs, setInputs, onBack, onNext }) {
  const set = (patch) => setInputs({ ...inputs, ...patch });

  return (
    <StepShell step={3} total={6} meta={STEP_META[2]} onBack={onBack} onNext={onNext}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <FieldGroup label="Credit card balance" prefix="£">
          <NumberInput value={inputs.creditCardDebt} onChange={v => set({ creditCardDebt: v })} placeholder="0" />
        </FieldGroup>
        <FieldGroup label="Overdraft" prefix="£">
          <NumberInput value={inputs.overdraft} onChange={v => set({ overdraft: v })} placeholder="0" />
        </FieldGroup>
        <FieldGroup label="Personal loans" prefix="£">
          <NumberInput value={inputs.loans} onChange={v => set({ loans: v })} placeholder="0" />
        </FieldGroup>
        <FieldGroup label="Buy Now Pay Later" prefix="£" hint="Klarna, Clearpay, PayPal Pay-in-3.">
          <NumberInput value={inputs.buyNowPayLater} onChange={v => set({ buyNowPayLater: v })} placeholder="0" />
        </FieldGroup>
        <FieldGroup label="Arrears" prefix="£" hint="Missed rent, council tax, energy — anything behind.">
          <NumberInput value={inputs.arrears} onChange={v => set({ arrears: v })} placeholder="0" />
        </FieldGroup>
        <FieldGroup label="Total minimum payments / month" prefix="£" hint="All debts combined.">
          <NumberInput value={inputs.minMonthlyDebtPayments} onChange={v => set({ minMonthlyDebtPayments: v })} placeholder="0" />
        </FieldGroup>
      </div>

      <FieldGroup label="Highest-interest debt (name)" hint="Only matters if you pick the avalanche method later.">
        <TextInput value={inputs.highestInterestDebtName} onChange={v => set({ highestInterestDebtName: v })} placeholder="e.g. Barclaycard, Vanquis" />
      </FieldGroup>

      <Toggle
        value={inputs.urgentDebtLetters}
        onChange={v => set({ urgentDebtLetters: v })}
        label="I've got urgent letters from creditors right now"
        hint="Default notices, court letters, bailiff warnings. This bumps the strategy to arrears-first."
      />
    </StepShell>
  );
}

// Step 4 — Savings & buffer
function StepSavings({ inputs, setInputs, onBack, onNext }) {
  const set = (patch) => setInputs({ ...inputs, ...patch });

  return (
    <StepShell step={4} total={6} meta={STEP_META[3]} onBack={onBack} onNext={onNext}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <FieldGroup label="Current bank balance" prefix="£" hint="Right now, main account.">
          <NumberInput value={inputs.currentBankBalance} onChange={v => set({ currentBankBalance: v })} />
        </FieldGroup>
        <FieldGroup label="Savings (any pot)" prefix="£" hint="Emergency fund, ISA, jar.">
          <NumberInput value={inputs.currentSavings} onChange={v => set({ currentSavings: v })} />
        </FieldGroup>
      </div>

      <FieldGroup label="Emergency fund target" prefix="£" hint="Aim for about one month of essentials. £1,000 is a good starter.">
        <NumberInput value={inputs.emergencyFundTarget} onChange={v => set({ emergencyFundTarget: v })} />
      </FieldGroup>

      <Toggle
        value={inputs.runsOutBeforePayday}
        onChange={v => set({ runsOutBeforePayday: v })}
        label="I usually run out of money before payday"
        hint="Non-judgemental — most people do. Just helps us calibrate the plan."
      />

      {inputs.runsOutBeforePayday && (
        <FieldGroup label="Roughly how many days early?" suffix="days before payday">
          <NumberInput value={inputs.daysBeforePaydayRunOut || 0} onChange={v => set({ daysBeforePaydayRunOut: v })} min={1} max={31} />
        </FieldGroup>
      )}
    </StepShell>
  );
}

// Step 5 — Leaks
function StepLeaks({ inputs, setInputs, onBack, onNext }) {
  const set = (patch) => setInputs({ ...inputs, ...patch });

  const rows = [
    { key: 'monthlyImpulseSpending', label: 'Impulse / "treat" spending', hint: 'Amazon at midnight, unplanned coffee runs.' },
    { key: 'forgottenSubscriptions', label: 'Forgotten subscriptions',    hint: 'The ones you forget about until you spot them.' },
    { key: 'lateFees',               label: 'Late fees & charges',        hint: 'Overdraft, missed payment, direct-debit bounces.' },
    { key: 'lostItemSpending',       label: 'Replacing lost items',       hint: 'Keys, chargers, headphones, umbrellas.' },
    { key: 'takeawaySpending',       label: 'Takeaway & convenience',     hint: 'When cooking felt impossible.' },
  ];

  return (
    <StepShell step={5} total={6} meta={STEP_META[4]} onBack={onBack} onNext={onNext}>
      <div style={{
        padding: '14px 18px', background: 'rgba(139,92,246,0.06)',
        border: '1px solid rgba(139,92,246,0.16)', borderRadius: 12,
        fontSize: 13, color: '#a78bfa', lineHeight: 1.55,
        marginBottom: 4, textWrap: 'pretty',
      }}>
        Estimate honestly. Under-reporting leaks is normal and the point of this step
        is to see the number, not judge it. Nothing here is stored anywhere but your device.
      </div>

      {rows.map(r => (
        <FieldGroup key={r.key} label={r.label} hint={r.hint} prefix="£" suffix="/mo">
          <NumberInput value={inputs[r.key]} onChange={v => set({ [r.key]: v })} placeholder="0" />
        </FieldGroup>
      ))}

      <Toggle
        value={inputs.unopenedMoneyLetters}
        onChange={v => set({ unopenedMoneyLetters: v })}
        label="I have unopened money letters or emails"
        hint="Not a problem to fix here — it just informs the plan."
      />

      <div style={{
        padding: '20px 22px', background: '#14171c',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
      }}>
        <Slider
          value={inputs.avoidanceLevel}
          onChange={v => setInputs({ ...inputs, avoidanceLevel: v })}
          min={1} max={10}
          leftLabel="I check often"
          rightLabel="I avoid completely"
        />
        <div style={{ fontSize: 12, color: '#5a6069', marginTop: 12, textAlign: 'center' }}>
          How much do you avoid opening bank apps and letters?
        </div>
      </div>
    </StepShell>
  );
}

// Step 6 — Goals & plan style
function StepGoals({ inputs, setInputs, onBack, onNext }) {
  const set = (patch) => setInputs({ ...inputs, ...patch });

  return (
    <StepShell step={6} total={6} meta={STEP_META[5]} onBack={onBack} onNext={onNext} nextLabel="See my reset →">
      <div>
        <div style={{ fontSize: 13, color: '#f0f0f2', fontWeight: 500, marginBottom: 10 }}>
          What's the main thing you want from this?
        </div>
        <Segmented wrap
          value={inputs.mainGoal}
          onChange={v => set({ mainGoal: v })}
          options={[
            { value: 'stop_overspending', label: 'Stop overspending' },
            { value: 'clear_debt',        label: 'Clear debt' },
            { value: 'build_savings',     label: 'Build savings' },
            { value: 'survive_this_month',label: 'Survive this month' },
            { value: 'organise_bills',    label: 'Organise bills' },
            { value: 'prepare_big_cost',  label: 'Prepare for a big cost' },
          ]}
        />
      </div>

      <div>
        <div style={{ fontSize: 13, color: '#f0f0f2', fontWeight: 500, marginBottom: 10 }}>
          What plan style feels right?
        </div>
        <Segmented
          value={inputs.planStyle}
          onChange={v => set({ planStyle: v })}
          options={[
            { value: 'strict',   label: 'Strict',   hint: 'Numbers-first. Optimise interest.' },
            { value: 'balanced', label: 'Balanced', hint: 'A bit of both.' },
            { value: 'gentle',   label: 'Gentle',   hint: 'Fast wins. Motivation-first.' },
          ]}
        />
      </div>

      <div style={{
        padding: '20px 22px', background: '#14171c',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
      }}>
        <Slider
          value={inputs.stressLevel}
          onChange={v => setInputs({ ...inputs, stressLevel: v })}
          min={1} max={10}
          leftLabel="Calm"
          rightLabel="Crisis"
        />
        <div style={{ fontSize: 12, color: '#5a6069', marginTop: 12, textAlign: 'center' }}>
          How stressful does money feel right now?
        </div>
      </div>

      <FieldGroup
        label="One thing you refuse to give up"
        hint="Optional. It stays in the plan — no one is coming for your coffee.">
        <TextInput
          value={inputs.protectedExpense}
          onChange={v => set({ protectedExpense: v })}
          placeholder="e.g. Weekly coffee-shop routine, yoga class"
        />
      </FieldGroup>
    </StepShell>
  );
}

// Master form router
function MoneyResetForm({ view, setView, inputs, setInputs, onComplete }) {
  // view is 'step-1' through 'step-6'
  const stepNum = parseInt(view.split('-')[1], 10);

  const goto = (n) => {
    if (n < 1) { setView('landing'); return; }
    if (n > 6) { onComplete(); return; }
    setView(`step-${n}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const props = {
    inputs, setInputs,
    onBack: () => goto(stepNum - 1),
    onNext: () => goto(stepNum + 1),
  };

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      <AppHeader
        view={view} setView={setView}
        planView="free" setPlanView={() => {}}
        showProgress
        progress={{ current: stepNum, total: 6, label: STEP_META[stepNum - 1].title }}
      />
      {stepNum === 1 && <StepIncome {...props} />}
      {stepNum === 2 && <StepBills {...props} />}
      {stepNum === 3 && <StepDebts {...props} />}
      {stepNum === 4 && <StepSavings {...props} />}
      {stepNum === 5 && <StepLeaks {...props} />}
      {stepNum === 6 && <StepGoals {...props} />}
      <FooterDisclaimer />
    </div>
  );
}



// Individual dashboard modules.

// -- Card shell -------------------------------------------------
function Card({ children, title, subtitle, actions, tone = 'default', style = {} }) {
  const bg = tone === 'purple' ? 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, #14171c 60%)' : '#14171c';
  const border = tone === 'purple' ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.06)';
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 20, padding: 28,
      ...style,
    }}>
      {(title || subtitle || actions) && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 20, gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            {subtitle && (
              <div style={{ fontSize: 11, color: '#5a6069', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 6 }}>
                {subtitle}
              </div>
            )}
            {title && <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.015em', margin: 0, lineHeight: 1.25 }}>{title}</h3>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// -- Locked module overlay (Premium gate) -----------------------
function LockedModule({ title, oneLine, onUpgrade, children, height }) {
  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', minHeight: height }}>
      <div style={{
        filter: 'blur(6px)', pointerEvents: 'none', opacity: 0.55,
        transform: 'scale(1.02)', transformOrigin: 'center',
      }}>
        {children}
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(11,13,16,0.6) 20%, rgba(11,13,16,0.95) 70%)',
        padding: 32, textAlign: 'center',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(245,200,76,0.12)', border: '1px solid rgba(245,200,76,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="10" width="16" height="11" rx="2" stroke="#FFD400" strokeWidth="1.6"/>
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#FFD400" strokeWidth="1.6"/>
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f2', marginBottom: 6, letterSpacing: '-0.01em' }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: '#8a8f98', maxWidth: 320, lineHeight: 1.55, marginBottom: 18, textWrap: 'pretty' }}>
          {oneLine}
        </div>
        <PrimaryButton onClick={onUpgrade} style={{ padding: '10px 22px', fontSize: 13 }}>
          Unlock with Premium
        </PrimaryButton>
      </div>
    </div>
  );
}

// -- 1. Hero Result ---------------------------------------------
function HeroResult({ pressure, inputs }) {
  const bandName = {
    stable: 'Stable', stretched: 'Stretched', danger_zone: 'Danger zone', urgent_reset: 'Urgent reset',
  }[pressure.label];
  const bandColor = {
    stable: 'green', stretched: 'gold', danger_zone: 'orange', urgent_reset: 'red',
  }[pressure.label];

  const factors = [
    { name: 'Essential load', short: 'Bills + debt minimums vs income', v: pressure.breakdown.B, max: 30 },
    { name: 'Cash-flow shortfall', short: 'Surplus/shortfall after leaks', v: pressure.breakdown.F, max: 20 },
    { name: 'Buffer gap', short: 'Savings vs emergency target', v: pressure.breakdown.G, max: 15 },
    { name: 'Behavioural risk', short: 'Avoidance, stress, unopened letters', v: pressure.breakdown.R, max: 20 },
    { name: 'Urgency flags', short: 'Arrears / urgent debt letters', v: pressure.breakdown.U, max: 15 },
  ];

  return (
    <Card subtitle="Money Pressure Score">
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 40, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <ScoreGauge score={pressure.score} label={pressure.label} size={220} />
          <Pill color={bandColor} style={{ fontSize: 12, padding: '6px 14px' }}>{bandName}</Pill>
        </div>

        <div>
          <p style={{
            fontSize: 17, color: '#f0f0f2', lineHeight: 1.5, margin: '0 0 20px',
            textWrap: 'pretty', letterSpacing: '-0.005em',
          }}>
            {pressure.explanation}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 8 }}>
            {factors.map(f => (
              <div key={f.name} style={{
                display: 'grid', gridTemplateColumns: '160px 1fr 60px',
                alignItems: 'center', gap: 12,
                padding: '8px 0',
              }}>
                <div>
                  <div style={{ fontSize: 12, color: '#f0f0f2', fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: '#5a6069' }}>{f.short}</div>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(f.v / f.max) * 100}%`, height: '100%',
                    background: '#FFD400',
                    transition: 'width 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
                <div style={{ fontSize: 12, color: '#8a8f98', fontFamily: 'var(--font-jetbrains-mono), monospace', textAlign: 'right' }}>
                  {f.v}<span style={{ color: '#5a6069' }}>/{f.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// -- 2. Monthly Snapshot ----------------------------------------
function MonthlySnapshot({ snapshot }) {
  const rows = [
    { label: 'Monthly income',    v: snapshot.totalIncome,          tone: 'in' },
    { label: 'Fixed bills',       v: snapshot.totalFixedBills,      tone: 'out' },
    { label: 'Debt minimums',     v: snapshot.totalDebtMinimums,    tone: 'out' },
    { label: 'Estimated leaks',   v: snapshot.totalLeaksEstimated,  tone: 'leak' },
  ];

  const surplusPositive = snapshot.surplusOrShortfall >= 0;

  return (
    <Card subtitle="Monthly snapshot" title="Where your money actually goes">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {rows.map(r => (
          <div key={r.label} style={{
            padding: '16px 18px', borderRadius: 12,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontSize: 11, color: '#5a6069', letterSpacing: '0.02em', marginBottom: 6 }}>
              {r.label}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
              color: r.tone === 'in' ? '#f0f0f2' : r.tone === 'leak' ? '#a78bfa' : '#f0f0f2',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}>
              {r.tone === 'in' ? '' : '−'}{fmtGBP(r.v).replace('£', '£')}
            </div>
          </div>
        ))}
      </div>

      {/* Flow bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: `${snapshot.totalFixedBills}fr ${snapshot.totalDebtMinimums}fr ${snapshot.totalLeaksEstimated}fr ${Math.max(0, snapshot.surplusOrShortfall)}fr`.replace(/(^| )0fr/g, '$10.0001fr'),
        height: 12, borderRadius: 999, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: 8,
      }}>
        <div style={{ background: '#FFD400' }} title="Fixed bills" />
        <div style={{ background: '#8B5CF6' }} title="Debt minimums" />
        <div style={{ background: '#f97316' }} title="Leaks" />
        <div style={{ background: surplusPositive ? '#22c55e' : '#ef4444' }} title={surplusPositive ? 'Surplus' : 'Shortfall'} />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
        {[
          { c: '#FFD400', l: 'Fixed bills' },
          { c: '#8B5CF6', l: 'Debt minimums' },
          { c: '#f97316', l: 'Leaks' },
          { c: surplusPositive ? '#22c55e' : '#ef4444', l: surplusPositive ? 'Surplus' : 'Shortfall' },
        ].map(x => (
          <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#8a8f98' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
            {x.l}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20, padding: '16px 20px',
        background: surplusPositive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${surplusPositive ? 'rgba(34,197,94,0.20)' : 'rgba(239,68,68,0.20)'}`,
        borderRadius: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 13, color: surplusPositive ? '#4ade80' : '#f87171' }}>
          {surplusPositive
            ? 'After leaks, you\'ve got room to breathe every month.'
            : 'After leaks, you\'re running short every month by:'}
        </div>
        <div style={{
          fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
          color: surplusPositive ? '#4ade80' : '#f87171',
          fontFamily: 'var(--font-jetbrains-mono), monospace',
        }}>
          {surplusPositive ? '+' : '−'}{fmtGBP(Math.abs(snapshot.surplusOrShortfall))}
        </div>
      </div>
    </Card>
  );
}

// -- 3. Leak Map ------------------------------------------------
function LeakMap({ leaks, isPaid, onUpgrade }) {
  const total = leaks.reduce((s, l) => s + l.monthly, 0);
  const max = Math.max(...leaks.map(l => l.monthly), 1);
  const visible = isPaid ? leaks : leaks.slice(0, 2);
  const hidden  = isPaid ? [] : leaks.slice(2);

  return (
    <Card
      subtitle="Leak map"
      title="Where your money quietly disappears"
      actions={
        <Pill color={total > 100 ? 'orange' : 'gold'} style={{ fontSize: 12, padding: '6px 12px' }}>
          {fmtGBP(total)}/mo · {fmtGBP(total * 12)}/yr
        </Pill>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map(leak => (
          <div key={leak.key} style={{
            padding: '14px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 14, color: '#f0f0f2', fontWeight: 500 }}>{leak.label}</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#FFD400', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                  {fmtGBP(leak.monthly)}<span style={{ fontSize: 11, color: '#5a6069' }}>/mo</span>
                </span>
                <span style={{ fontSize: 12, color: '#8a8f98', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                  ({fmtGBP(leak.annual)}/yr)
                </span>
              </div>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                width: `${(leak.monthly / max) * 100}%`, height: '100%',
                background: '#FFD400',
              }} />
            </div>
          </div>
        ))}
      </div>

      {hidden.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <LockedModule
            title={`${hidden.length} more leaks hidden`}
            oneLine="Unlock the full leak map to see every category, sorted by size."
            onUpgrade={onUpgrade}
            height={140}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hidden.map(leak => (
                <div key={leak.key} style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, color: '#f0f0f2' }}>{leak.label}</div>
                    <div style={{ fontSize: 16, color: '#FFD400', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                      {fmtGBP(leak.monthly)}/mo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </LockedModule>
        </div>
      )}
    </Card>
  );
}

// -- 4. Payday Split (Premium) ----------------------------------
function PaydaySplit({ split, isPaid, onUpgrade, paydayDate }) {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {split.map((row, i) => {
        const toneColor = row.tone === 'core' ? '#FFD400' : row.tone === 'save' ? '#8B5CF6' : '#22c55e';
        return (
          <div key={row.bucket} style={{
            padding: '18px 20px', borderRadius: 14,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 16, alignItems: 'center',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${toneColor}22`, border: `1px solid ${toneColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: toneColor, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}>{String(i + 1).padStart(2, '0')}</div>
            <div>
              <div style={{ fontSize: 15, color: '#f0f0f2', fontWeight: 500, letterSpacing: '-0.005em', marginBottom: 3 }}>
                {row.bucket}
              </div>
              <div style={{ fontSize: 12, color: '#8a8f98', lineHeight: 1.55, marginBottom: 4 }}>{row.why}</div>
              <div style={{ fontSize: 11, color: '#5a6069', letterSpacing: '0.02em' }}>{row.when}</div>
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
              color: toneColor, fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}>{fmtGBP(row.amount)}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card
      subtitle="Payday split"
      title={`Six accounts. Automatic. No willpower required.`}
      actions={<Pill color="gold" style={{ fontSize: 11 }}>Runs on day {paydayDate}</Pill>}
      tone="purple"
    >
      {isPaid ? content : (
        <LockedModule
          title="Six-part payday split"
          oneLine="Automatic transfers into six accounts on payday — the plan does the discipline for you."
          onUpgrade={onUpgrade}
          height={520}
        >
          {content}
        </LockedModule>
      )}
    </Card>
  );
}

// -- 5. Debt Priority (Premium) ---------------------------------
function DebtPriority({ debtPlan, isPaid, onUpgrade }) {
  const content = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Pill color="purple" style={{ fontSize: 12 }}>Strategy</Pill>
        <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', color: '#f0f0f2' }}>
          {debtPlan.strategy}
        </span>
      </div>
      <p style={{ fontSize: 14, color: '#8a8f98', lineHeight: 1.6, margin: '0 0 20px', textWrap: 'pretty' }}>
        {debtPlan.reason}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {debtPlan.firstThree.map((task, i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 10,
            background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.14)',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(139,92,246,0.16)', color: '#a78bfa',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}>{i + 1}</div>
            <div style={{ fontSize: 14, color: '#f0f0f2', lineHeight: 1.5 }}>{task}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card subtitle="Debt priority" title="One clear focus. Not everything at once." tone="purple">
      {isPaid ? content : (
        <LockedModule
          title="Debt priority plan"
          oneLine="Personalised to your plan style: snowball, avalanche, balanced, or arrears-first."
          onUpgrade={onUpgrade}
          height={340}
        >
          {content}
        </LockedModule>
      )}
    </Card>
  );
}

// -- 6. Action Plan (7-day + 30-day) ----------------------------
function ActionPlan({ sevenDay, thirtyDay, isPaid, onUpgrade }) {
  const visibleSevenDay = isPaid ? sevenDay : sevenDay.slice(0, 3);
  const hiddenSevenDay  = isPaid ? [] : sevenDay.slice(3);

  return (
    <>
      <Card subtitle="7-day rescue plan" title="One tiny action per day. That's it.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleSevenDay.map((action, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: 'rgba(245,200,76,0.12)', color: '#FFD400',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                fontFamily: 'var(--font-jetbrains-mono), monospace',
              }}>D{i + 1}</div>
              <div style={{ fontSize: 14, color: '#f0f0f2', lineHeight: 1.55 }}>{action}</div>
            </div>
          ))}
        </div>

        {hiddenSevenDay.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <LockedModule
              title={`${hiddenSevenDay.length} more days hidden`}
              oneLine="Unlock the full 7-day rescue plan tailored to your inputs."
              onUpgrade={onUpgrade}
              height={180}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {hiddenSevenDay.map((action, i) => (
                  <div key={i} style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <span style={{ color: '#f0f0f2' }}>{action}</span>
                  </div>
                ))}
              </div>
            </LockedModule>
          </div>
        )}
      </Card>

      <Card subtitle="30-day reset" title="Four weeks. Four themes. No hero moves." tone="purple">
        {isPaid ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {thirtyDay.map(week => (
              <div key={week.week} style={{
                padding: 20, borderRadius: 14,
                background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.14)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#a78bfa', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {week.week}
                  </span>
                  <span style={{ fontSize: 15, color: '#f0f0f2', fontWeight: 600, letterSpacing: '-0.01em' }}>
                    {week.theme}
                  </span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {week.tasks.map((t, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#8a8f98', lineHeight: 1.5 }}>
                      <span style={{ color: '#8B5CF6', flexShrink: 0 }}>◦</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <LockedModule
            title="30-day reset plan"
            oneLine="Four weeks of light, specific actions — never more than one theme at a time."
            onUpgrade={onUpgrade}
            height={320}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {thirtyDay.map(week => (
                <div key={week.week} style={{
                  padding: 20, borderRadius: 14,
                  background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.14)',
                  minHeight: 140,
                }}>
                  <div style={{ fontSize: 11, color: '#a78bfa', marginBottom: 8 }}>{week.week}</div>
                  <div style={{ fontSize: 15, color: '#f0f0f2' }}>{week.theme}</div>
                </div>
              ))}
            </div>
          </LockedModule>
        )}
      </Card>
    </>
  );
}

// -- 7. Rules ---------------------------------------------------
function RulesList({ rules, isPaid, onUpgrade }) {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rules.map((rule, i) => (
        <div key={i} style={{
          padding: '16px 18px', borderRadius: 12,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'rgba(245,200,76,0.12)', color: '#FFD400',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
            fontFamily: 'var(--font-jetbrains-mono), monospace',
          }}>{String(i + 1).padStart(2, '0')}</div>
          <div style={{ fontSize: 14, color: '#f0f0f2', lineHeight: 1.55, textWrap: 'pretty' }}>{rule}</div>
        </div>
      ))}
    </div>
  );

  return (
    <Card subtitle="ADHD-proof rules" title="Automatic thresholds so you don't have to remember.">
      {isPaid ? content : (
        <LockedModule
          title="Personalised money rules"
          oneLine="Calculated from your income and protected expenses — a small, memorable set."
          onUpgrade={onUpgrade}
          height={280}
        >
          {content}
        </LockedModule>
      )}
    </Card>
  );
}

// -- 8. Scripts Pack --------------------------------------------
function ScriptsPack({ scripts, isPaid, onUpgrade }) {
  const [openIdx, setOpenIdx] = React.useState(0);
  const [copied, setCopied] = React.useState(null);

  const copy = (idx) => {
    navigator.clipboard.writeText(scripts[idx].body).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const content = (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {scripts.map((s, i) => (
          <button key={i} onClick={() => setOpenIdx(i)} style={{
            padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
            background: openIdx === i ? 'rgba(245,200,76,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${openIdx === i ? 'rgba(245,200,76,0.32)' : 'rgba(255,255,255,0.06)'}`,
            color: openIdx === i ? '#FFD400' : '#8a8f98',
            fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em',
          }}>{s.title}</button>
        ))}
      </div>

      <div style={{
        padding: 20, borderRadius: 12,
        background: '#000000', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: '#8a8f98', textWrap: 'pretty' }}>{scripts[openIdx].when}</span>
          <button onClick={() => copy(openIdx)} style={{
            padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
            background: copied === openIdx ? 'rgba(34,197,94,0.16)' : 'rgba(245,200,76,0.10)',
            border: `1px solid ${copied === openIdx ? 'rgba(34,197,94,0.32)' : 'rgba(245,200,76,0.24)'}`,
            color: copied === openIdx ? '#4ade80' : '#FFD400',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>{copied === openIdx ? '✓ Copied' : 'Copy'}</button>
        </div>
        <pre style={{
          margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word',
          fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 13, lineHeight: 1.7,
          color: '#f0f0f2',
        }}>{scripts[openIdx].body}</pre>
      </div>
    </div>
  );

  return (
    <Card subtitle="Scripts pack" title="Copy-paste emails for the hard conversations.">
      {isPaid ? content : (
        <LockedModule
          title="Copy-paste money scripts"
          oneLine="Breathing space, affordable payment plans, cancellations, late-fee waivers — pre-written."
          onUpgrade={onUpgrade}
          height={280}
        >
          {content}
        </LockedModule>
      )}
    </Card>
  );
}



// The full dashboard
function ResultsDashboard({ inputs, setView, planView, setPlanView }) {


  const snapshot = React.useMemo(() => MR_CALC.buildSnapshot(inputs), [inputs]);
  const pressure = React.useMemo(() => MR_CALC.calculateMoneyPressure(inputs, snapshot), [inputs, snapshot]);
  const leaks    = React.useMemo(() => MR_CALC.buildLeakMap(inputs), [inputs]);
  const split    = React.useMemo(() => MR_CALC.buildPaydaySplit(inputs, snapshot), [inputs, snapshot]);
  const debtPlan = React.useMemo(() => MR_CALC.buildDebtPriority(inputs), [inputs]);
  const sevenDay = React.useMemo(() => MR_CALC.build7DayPlan(inputs, snapshot), [inputs, snapshot]);
  const rules    = React.useMemo(() => MR_CALC.buildRules(inputs), [inputs]);
  const scripts  = React.useMemo(() => MR_CALC.buildScripts(inputs), [inputs]);

  const isPaid = true;
  const onUpgrade = () => {};

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      <AppHeader
        view="results" setView={setView}
        planView={planView} setPlanView={setPlanView}
        showProgress={false}
      />

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '40px 24px 60px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Top intro strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
          padding: '0 4px', marginBottom: 8, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#5a6069', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 6 }}>
              Your money reset
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>
              Here's where you actually are.
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <SecondaryButton onClick={() => setView('landing')} style={{ padding: '10px 18px', fontSize: 13 }}>
              Start over
            </SecondaryButton>
            <SecondaryButton onClick={() => setView('step-1')} style={{ padding: '10px 18px', fontSize: 13 }}>
              Edit answers
            </SecondaryButton>
            <PrimaryButton
              onClick={() => setView('export')}
              style={{ padding: '10px 20px', fontSize: 13 }}>
              Export plan
            </PrimaryButton>
          </div>
        </div>

        <p style={{ color:'#a3a3a3', fontSize:14 }}>An illustrative planning indicator based on your answers, not a diagnosis, credit score or financial assessment.</p>
        {snapshot.surplusOrShortfall < 0 ? <p role="status" style={{ borderLeft:'2px solid #FFD400', padding:16 }}>Your stated commitments and estimated leaks exceed your income. The amounts below show the gap; they are not all affordable transfers. If you are struggling with bills or debt, contact MoneyHelper or a free debt adviser before setting up a payment plan.</p> : null}
        <HeroResult pressure={pressure} inputs={inputs} />

        <MonthlySnapshot snapshot={snapshot} />

        <LeakMap leaks={leaks} isPaid={isPaid} onUpgrade={onUpgrade} />

        <PaydaySplit split={split} isPaid={isPaid} onUpgrade={onUpgrade} paydayDate={inputs.paydayDate} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          <DebtPriority debtPlan={debtPlan} isPaid={isPaid} onUpgrade={onUpgrade} />
          <RulesList rules={rules} isPaid={isPaid} onUpgrade={onUpgrade} />
        </div>

        <ActionPlan sevenDay={sevenDay} thirtyDay={MR_CALC.THIRTY_DAY_PLAN} isPaid={isPaid} onUpgrade={onUpgrade} />

        <ScriptsPack scripts={scripts} isPaid={isPaid} onUpgrade={onUpgrade} />

      </div>

      <FooterDisclaimer />


    </div>
  );
}



// Export page — print-friendly white layout with real window.print()

function ExportPage({ inputs, setView }) {
  const snapshot = React.useMemo(() => MR_CALC.buildSnapshot(inputs), [inputs]);
  const pressure = React.useMemo(() => MR_CALC.calculateMoneyPressure(inputs, snapshot), [inputs, snapshot]);
  const leaks    = React.useMemo(() => MR_CALC.buildLeakMap(inputs), [inputs]);
  const split    = React.useMemo(() => MR_CALC.buildPaydaySplit(inputs, snapshot), [inputs, snapshot]);
  const debtPlan = React.useMemo(() => MR_CALC.buildDebtPriority(inputs), [inputs]);
  const sevenDay = React.useMemo(() => MR_CALC.build7DayPlan(inputs, snapshot), [inputs, snapshot]);
  const rules    = React.useMemo(() => MR_CALC.buildRules(inputs), [inputs]);

  const bandName = {
    stable: 'Stable', stretched: 'Stretched', danger_zone: 'Danger zone', urgent_reset: 'Urgent reset',
  }[pressure.label];

  return (
    <div>
      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .export-page {
            background: white !important;
            color: #111 !important;
            padding: 0 !important;
            min-height: 0 !important;
          }
          .export-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 40px !important;
            max-width: none !important;
          }
          body { background: white !important; }
        }
        .export-page { background: #f4f4f5; color: #111; min-height: 100vh; padding: 40px 20px; }
        .export-sheet {
          max-width: 780px; margin: 0 auto;
          background: white; padding: 56px; border-radius: 8px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.08);
          font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
        }
        .export-sheet h1 { font-size: 32px; font-weight: 700; letter-spacing: -0.03em; margin: 0 0 6px; }
        .export-sheet h2 { font-size: 18px; font-weight: 600; letter-spacing: -0.015em; margin: 40px 0 14px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
        .export-sheet h3 { font-size: 14px; font-weight: 600; margin: 20px 0 8px; color: #222; }
        .export-sheet p, .export-sheet li { font-size: 13px; line-height: 1.55; color: #333; }
        .export-sheet .mono { font-family: 'Geist Mono', ui-monospace, monospace; }
      `}</style>

      {/* Top actions bar (screen only) */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#000000', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button onClick={() => setView('results')} style={{
          background: 'none', border: 0, color: '#8a8f98', cursor: 'pointer',
          fontSize: 13, fontWeight: 500,
        }}>← Back to dashboard</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <SecondaryButton onClick={() => window.print()} style={{ padding: '10px 18px', fontSize: 13 }}>
            Print / Save as PDF
          </SecondaryButton>
        </div>
      </div>

      <div className="export-page">
        <div className="export-sheet">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 11, color: '#999', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 6 }}>
                ADHD Money Reset
              </div>
              <h1>Your reset plan</h1>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#999', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
                Money Pressure
              </div>
              <div className="mono" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4, color: '#111' }}>
                {pressure.score}<span style={{ fontSize: 16, color: '#999' }}>/100</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginTop: 2 }}>{bandName}</div>
            </div>
          </div>

          <p style={{ fontStyle: 'italic', color: '#555', margin: 0 }}>{pressure.explanation}</p>

          {/* Snapshot */}
          <h2>Monthly snapshot</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              <tr><td style={{ padding: '8px 0', color: '#666' }}>Total monthly income</td><td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{fmtGBP(snapshot.totalIncome)}</td></tr>
              <tr><td style={{ padding: '8px 0', color: '#666' }}>Fixed bills</td><td className="mono" style={{ textAlign: 'right' }}>−{fmtGBP(snapshot.totalFixedBills)}</td></tr>
              <tr><td style={{ padding: '8px 0', color: '#666' }}>Debt minimums</td><td className="mono" style={{ textAlign: 'right' }}>−{fmtGBP(snapshot.totalDebtMinimums)}</td></tr>
              <tr><td style={{ padding: '8px 0', color: '#666' }}>Estimated leaks</td><td className="mono" style={{ textAlign: 'right' }}>−{fmtGBP(snapshot.totalLeaksEstimated)}</td></tr>
              <tr style={{ borderTop: '2px solid #111' }}><td style={{ padding: '10px 0', fontWeight: 600 }}>Surplus / shortfall after leaks</td><td className="mono" style={{ textAlign: 'right', fontWeight: 700 }}>{snapshot.surplusOrShortfall >= 0 ? '+' : '−'}{fmtGBP(Math.abs(snapshot.surplusOrShortfall))}</td></tr>
            </tbody>
          </table>

          {/* Payday split */}
          <h2>Payday split (Day {inputs.paydayDate})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px 0', color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bucket</th>
                <th style={{ textAlign: 'left', padding: '10px 0', color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>When</th>
                <th style={{ textAlign: 'right', padding: '10px 0', color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {split.map(row => (
                <tr key={row.bucket} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>
                    {row.bucket}
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{row.why}</div>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: 12, color: '#666' }}>{row.when}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '12px 0', fontWeight: 600 }}>{fmtGBP(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Debt priority */}
          <h2>Debt strategy: {debtPlan.strategy}</h2>
          <p style={{ marginBottom: 12 }}>{debtPlan.reason}</p>
          <h3>First three actions</h3>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {debtPlan.firstThree.map((t, i) => <li key={i} style={{ marginBottom: 6 }}>{t}</li>)}
          </ol>

          {/* 7-day */}
          <h2>7-day rescue plan</h2>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {sevenDay.map((a, i) => <li key={i} style={{ marginBottom: 6 }}>{a}</li>)}
          </ol>

          {/* 30-day */}
          <h2>30-day reset</h2>
          {MR_CALC.THIRTY_DAY_PLAN.map(w => (
            <div key={w.week} style={{ marginBottom: 14 }}>
              <h3 style={{ margin: '10px 0 4px' }}>{w.week} · {w.theme}</h3>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {w.tasks.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ))}

          {/* Rules */}
          <h2>ADHD-proof rules</h2>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {rules.map((r, i) => <li key={i} style={{ marginBottom: 6 }}>{r}</li>)}
          </ol>

          {/* Leaks */}
          <h2>Leak map</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px 0', color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '10px 0', color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly</th>
                <th style={{ textAlign: 'right', padding: '10px 0', color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Annual</th>
              </tr>
            </thead>
            <tbody>
              {leaks.map(l => (
                <tr key={l.key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 0' }}>{l.label}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '10px 0' }}>{fmtGBP(l.monthly)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '10px 0', color: '#666' }}>{fmtGBP(l.annual)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Disclaimer */}
          <div style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid #e5e5e5' }}>
            <p style={{ fontSize: 11, color: '#888', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
              This plan is for organisation and education only. It is not financial advice.
              For debt crisis or regulated advice, contact a qualified adviser or debt charity
              (StepChange 0800 138 1111, Citizens Advice 0800 144 8848, National Debtline 0808 808 4000).
            </p>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 12 }}>
              Coming soon: control your reset from WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



export { LandingPage, MoneyResetForm, ResultsDashboard, ExportPage };

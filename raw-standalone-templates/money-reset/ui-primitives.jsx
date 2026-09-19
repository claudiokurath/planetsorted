// Shared UI primitives — currency formatter, gauge, header, footer disclaimer.

const { useState, useEffect, useMemo, useRef } = React;

const fmtGBP = (n) => {
  const v = Math.round(n || 0);
  return '£' + v.toLocaleString('en-GB');
};
const fmtGBPDec = (n) => '£' + (n || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// Circular gauge for the pressure score
function ScoreGauge({ score, label, size = 220, thickness = 14 }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;

  const colorFor = (l) => {
    if (l === 'stable') return '#22c55e';
    if (l === 'stretched') return '#F5C84C';
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
        <div style={{ fontSize: size * 0.28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'Geist Mono, monospace', color: '#f0f0f2' }}>
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
    gold:    { bg: 'rgba(245,200,76,0.10)', fg: '#F5C84C', border: 'rgba(245,200,76,0.24)' },
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
function AppHeader({ view, setView, planView, setPlanView, showProgress, progress }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(11,13,16,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <button onClick={() => setView('landing')} style={{
          display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 0,
          color: '#f0f0f2', cursor: 'pointer', padding: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #F5C84C 0%, #d9a828 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0b0d10', fontWeight: 800, fontSize: 15,
          }}>R</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>ADHD Money Reset</span>
            <span style={{ fontSize: 10, color: '#5a6069', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Private beta</span>
          </div>
        </button>

        {showProgress && (
          <div style={{ flex: 1, maxWidth: 360, margin: '0 24px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: 6,
              fontSize: 11, color: '#8a8f98', letterSpacing: '0.04em',
            }}>
              <span>Step {progress.current} of {progress.total}</span>
              <span>{progress.label}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                width: `${(progress.current / progress.total) * 100}%`,
                height: '100%', background: '#F5C84C',
                transition: 'width 320ms cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {view === 'results' && (
            <div style={{
              display: 'inline-flex', padding: 3, borderRadius: 999,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['free', 'premium'].map(p => (
                <button key={p} onClick={() => setPlanView(p)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, border: 0, cursor: 'pointer',
                    background: planView === p ? (p === 'premium' ? '#F5C84C' : 'rgba(255,255,255,0.10)') : 'transparent',
                    color: planView === p ? (p === 'premium' ? '#0b0d10' : '#f0f0f2') : '#8a8f98',
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                    transition: 'all 160ms',
                  }}>
                  {p === 'free' ? 'View: Free' : 'View: Premium'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Persistent footer disclaimer (required)
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
        {prefix && <span style={{ color: '#8a8f98', fontSize: 14, marginRight: 4, fontFamily: 'Geist Mono, monospace' }}>{prefix}</span>}
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
  fontFamily: 'Geist Mono, monospace',
};

// Number input with proper handling
function NumberInput({ value, onChange, placeholder = '0', min, max, step = 1 }) {
  return (
    <input
      type="number"
      value={value === 0 ? '' : value}
      onChange={(e) => {
        const v = e.target.value === '' ? 0 : Number(e.target.value);
        onChange(isNaN(v) ? 0 : v);
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
      style={{ ...inputStyle, fontFamily: 'Geist, sans-serif' }}
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
              color: active ? '#F5C84C' : '#f0f0f2',
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
        <span style={{ fontSize: 28, fontWeight: 700, color: '#F5C84C', fontFamily: 'Geist Mono, monospace', letterSpacing: '-0.02em' }}>
          {value}<span style={{ fontSize: 14, color: '#5a6069', fontWeight: 400 }}>/{max}</span>
        </span>
        <span style={{ fontSize: 12, color: '#8a8f98' }}>{rightLabel}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', accentColor: '#F5C84C',
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
          background: value ? '#F5C84C' : 'rgba(255,255,255,0.10)',
          border: 0, position: 'relative', cursor: 'pointer',
          transition: 'background 160ms',
        }}>
        <span style={{
          position: 'absolute', top: 3, left: value ? 19 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: value ? '#0b0d10' : '#f0f0f2',
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
      background: disabled ? 'rgba(245,200,76,0.24)' : '#F5C84C',
      color: '#0b0d10', border: 0, cursor: disabled ? 'not-allowed' : 'pointer',
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

Object.assign(window, {
  fmtGBP, fmtGBPDec,
  ScoreGauge, Pill, AppHeader, FooterDisclaimer,
  FieldGroup, NumberInput, TextInput, Segmented, Slider, Toggle,
  PrimaryButton, SecondaryButton,
});

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
            <rect x="4" y="10" width="16" height="11" rx="2" stroke="#F5C84C" strokeWidth="1.6"/>
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#F5C84C" strokeWidth="1.6"/>
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
                    background: '#F5C84C',
                    transition: 'width 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
                <div style={{ fontSize: 12, color: '#8a8f98', fontFamily: 'Geist Mono, monospace', textAlign: 'right' }}>
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
              fontFamily: 'Geist Mono, monospace',
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
        <div style={{ background: '#F5C84C' }} title="Fixed bills" />
        <div style={{ background: '#8B5CF6' }} title="Debt minimums" />
        <div style={{ background: '#f97316' }} title="Leaks" />
        <div style={{ background: surplusPositive ? '#22c55e' : '#ef4444' }} title={surplusPositive ? 'Surplus' : 'Shortfall'} />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
        {[
          { c: '#F5C84C', l: 'Fixed bills' },
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
          fontFamily: 'Geist Mono, monospace',
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
                <span style={{ fontSize: 16, fontWeight: 600, color: '#F5C84C', fontFamily: 'Geist Mono, monospace' }}>
                  {fmtGBP(leak.monthly)}<span style={{ fontSize: 11, color: '#5a6069' }}>/mo</span>
                </span>
                <span style={{ fontSize: 12, color: '#8a8f98', fontFamily: 'Geist Mono, monospace' }}>
                  ({fmtGBP(leak.annual)}/yr)
                </span>
              </div>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                width: `${(leak.monthly / max) * 100}%`, height: '100%',
                background: '#F5C84C',
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
                    <div style={{ fontSize: 16, color: '#F5C84C', fontFamily: 'Geist Mono, monospace' }}>
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
        const toneColor = row.tone === 'core' ? '#F5C84C' : row.tone === 'save' ? '#8B5CF6' : '#22c55e';
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
              color: toneColor, fontSize: 12, fontWeight: 700, fontFamily: 'Geist Mono, monospace',
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
              color: toneColor, fontFamily: 'Geist Mono, monospace',
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
              fontFamily: 'Geist Mono, monospace',
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
                background: 'rgba(245,200,76,0.12)', color: '#F5C84C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                fontFamily: 'Geist Mono, monospace',
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
            background: 'rgba(245,200,76,0.12)', color: '#F5C84C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
            fontFamily: 'Geist Mono, monospace',
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
            color: openIdx === i ? '#F5C84C' : '#8a8f98',
            fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em',
          }}>{s.title}</button>
        ))}
      </div>

      <div style={{
        padding: 20, borderRadius: 12,
        background: '#0b0d10', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: '#8a8f98', textWrap: 'pretty' }}>{scripts[openIdx].when}</span>
          <button onClick={() => copy(openIdx)} style={{
            padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
            background: copied === openIdx ? 'rgba(34,197,94,0.16)' : 'rgba(245,200,76,0.10)',
            border: `1px solid ${copied === openIdx ? 'rgba(34,197,94,0.32)' : 'rgba(245,200,76,0.24)'}`,
            color: copied === openIdx ? '#4ade80' : '#F5C84C',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>{copied === openIdx ? '✓ Copied' : 'Copy'}</button>
        </div>
        <pre style={{
          margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word',
          fontFamily: 'Geist Mono, monospace', fontSize: 13, lineHeight: 1.7,
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

Object.assign(window, {
  Card, LockedModule,
  HeroResult, MonthlySnapshot, LeakMap, PaydaySplit,
  DebtPriority, ActionPlan, RulesList, ScriptsPack,
});

// Landing page — calm, one clear promise, no fintech clichés.

function LandingPage({ onStart, onLoadSample }) {
  return (
    <div style={{ background: '#0b0d10', color: '#f0f0f2' }}>
      {/* Subtle top nav — logo + tiny disclaimer link */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '24px 24px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(135deg, #F5C84C 0%, #d9a828 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0b0d10', fontWeight: 800, fontSize: 16,
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
              color: '#F5C84C', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 28,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F5C84C' }} />
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
                    <div style={{ width: `${(row.v/row.max)*100}%`, height: '100%', background: '#F5C84C' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#5a6069', fontFamily: 'Geist Mono, monospace', width: 36, textAlign: 'right' }}>
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
                fontSize: 11, color: '#F5C84C', letterSpacing: '0.08em', fontFamily: 'Geist Mono, monospace',
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
          background: 'linear-gradient(180deg, #0f1114 0%, #0b0d10 100%)',
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

Object.assign(window, { LandingPage });

// Results dashboard — stitches the modules together with the free/paid gate.

function UpgradeModal({ onClose }) {
  const [joined, setJoined] = React.useState(false);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(5,6,8,0.75)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', width: '100%', maxWidth: 440,
        background: '#14171c', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: 32,
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'none', border: 0,
          color: '#5a6069', cursor: 'pointer', fontSize: 22, lineHeight: 1,
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, #F5C84C 0%, #d9a828 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0b0d10', fontWeight: 800, fontSize: 18, marginBottom: 20,
        }}>R</div>

        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Unlock your full reset
        </h2>
        <p style={{ fontSize: 13, color: '#8a8f98', margin: '0 0 20px', lineHeight: 1.55 }}>
          Free gets you the diagnosis. Premium builds the actual plan you follow.
        </p>

        <ul style={{ margin: '0 0 24px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Full six-part payday split',
            'Debt priority plan with reasoning',
            '7-day rescue + 30-day reset plan',
            'Personalised ADHD money rules',
            'Copy-paste scripts pack',
            'Export / print-friendly plan + saved history',
          ].map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#f0f0f2' }}>
              <span style={{ color: '#F5C84C' }}>✓</span> {f}
            </li>
          ))}
        </ul>

        <div style={{
          textAlign: 'center', padding: 16, borderRadius: 12,
          background: 'rgba(245,200,76,0.06)', border: '1px solid rgba(245,200,76,0.16)',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: '#F5C84C',
            fontFamily: 'Geist Mono, monospace',
          }}>£5.99<span style={{ fontSize: 12, color: '#8a8f98', fontFamily: 'Geist, sans-serif', fontWeight: 400, marginLeft: 4 }}>/month</span></div>
          <div style={{ fontSize: 11, color: '#5a6069', marginTop: 4 }}>Cancel anytime, obviously</div>
        </div>

        {!joined ? (
          <PrimaryButton onClick={() => setJoined(true)} style={{ width: '100%' }}>
            Join the waitlist
          </PrimaryButton>
        ) : (
          <div style={{
            padding: 14, borderRadius: 10,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.24)',
            color: '#4ade80', fontSize: 13, textAlign: 'center',
          }}>
            You're on the list — we'll email you when Premium launches.
          </div>
        )}

        <p style={{ fontSize: 10, color: '#5a6069', textAlign: 'center', marginTop: 14, letterSpacing: '0.02em' }}>
          Payments are not live yet. This is a design preview.
        </p>
      </div>
    </div>
  );
}

// The full dashboard
function ResultsDashboard({ inputs, setView, planView, setPlanView }) {
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  const snapshot = React.useMemo(() => MR_CALC.buildSnapshot(inputs), [inputs]);
  const pressure = React.useMemo(() => MR_CALC.calculateMoneyPressure(inputs, snapshot), [inputs, snapshot]);
  const leaks    = React.useMemo(() => MR_CALC.buildLeakMap(inputs), [inputs]);
  const split    = React.useMemo(() => MR_CALC.buildPaydaySplit(inputs, snapshot), [inputs, snapshot]);
  const debtPlan = React.useMemo(() => MR_CALC.buildDebtPriority(inputs), [inputs]);
  const sevenDay = React.useMemo(() => MR_CALC.build7DayPlan(inputs, snapshot), [inputs, snapshot]);
  const rules    = React.useMemo(() => MR_CALC.buildRules(inputs), [inputs]);
  const scripts  = React.useMemo(() => MR_CALC.buildScripts(inputs), [inputs]);

  const isPaid = planView === 'premium';
  const onUpgrade = () => setShowUpgrade(true);

  return (
    <div style={{ background: '#0b0d10', minHeight: '100vh' }}>
      <AppHeader
        view="results" setView={setView}
        planView={planView} setPlanView={setPlanView}
        showProgress={false}
      />

      <main style={{
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
              onClick={() => isPaid ? setView('export') : setShowUpgrade(true)}
              style={{ padding: '10px 20px', fontSize: 13 }}>
              {isPaid ? 'Export plan' : 'Unlock export →'}
            </PrimaryButton>
          </div>
        </div>

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

        {/* Bottom conversion strip — only if free */}
        {!isPaid && (
          <div style={{
            padding: 32, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(245,200,76,0.08) 0%, rgba(139,92,246,0.06) 100%)',
            border: '1px solid rgba(245,200,76,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
          }}>
            <div style={{ maxWidth: 500 }}>
              <div style={{ fontSize: 11, color: '#F5C84C', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
                Ready when you are
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.2 }}>
                You've got the diagnosis. Premium builds the plan you actually follow.
              </h3>
              <p style={{ fontSize: 13, color: '#8a8f98', margin: 0, lineHeight: 1.55 }}>
                Six-part payday split, debt priority, 7-day + 30-day plans, ADHD-proof rules, scripts, export. £5.99/month.
              </p>
            </div>
            <PrimaryButton onClick={() => setShowUpgrade(true)}>Unlock Premium</PrimaryButton>
          </div>
        )}
      </main>

      <FooterDisclaimer />

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}

Object.assign(window, { ResultsDashboard, UpgradeModal });

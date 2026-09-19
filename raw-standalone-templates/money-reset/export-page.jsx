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
        background: '#0b0d10', borderBottom: '1px solid rgba(255,255,255,0.06)',
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

Object.assign(window, { ExportPage });

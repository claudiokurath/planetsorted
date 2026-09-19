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
        color: '#F5C84C', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
        marginBottom: 20, fontFamily: 'Geist Mono, monospace',
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
  const canContinue = inputs.monthlyIncomeAfterTax > 0;

  return (
    <StepShell step={1} total={6} meta={STEP_META[0]} onBack={onBack} onNext={onNext} canContinue={canContinue}>
      <FieldGroup
        label="How much lands in your account each month?"
        hint="After tax and any deductions — the actual number you can spend."
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
        <span style={{ fontSize: 13, color: '#F5C84C', letterSpacing: '0.02em' }}>Total fixed bills / month</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#F5C84C', fontFamily: 'Geist Mono, monospace', letterSpacing: '-0.02em' }}>
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
    <div style={{ background: '#0b0d10', minHeight: '100vh' }}>
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

Object.assign(window, { MoneyResetForm, STEP_META });

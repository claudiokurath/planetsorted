// Calculation engine — all constants exported for easy tuning
// Mirrors lib/calculations.ts from the spec exactly.

const WEEKS_PER_MONTH = 4.33;
const SAVINGS_BUFFER_PCT = 0.05;
const EMERGENCY_FUND_PCT = 0.10;
const ESSENTIAL_SPEND_SPLIT = 0.5;

function monthlyIncome(i) {
  if (i.incomeFrequency === 'weekly') return i.monthlyIncomeAfterTax * WEEKS_PER_MONTH;
  if (i.incomeFrequency === 'irregular') return i.minMonthlyIncomeIfIrregular || i.monthlyIncomeAfterTax;
  return i.monthlyIncomeAfterTax;
}

function buildSnapshot(i) {
  const totalIncome = monthlyIncome(i);
  const totalFixedBills =
    (i.rentMortgage || 0) + (i.councilTax || 0) + (i.utilities || 0) +
    (i.phoneInternet || 0) + (i.transport || 0) + (i.insurance || 0) +
    (i.subscriptions || 0) + (i.otherFixedBills || 0);
  const totalDebtMinimums = i.minMonthlyDebtPayments || 0;
  const totalLeaksEstimated =
    (i.monthlyImpulseSpending || 0) + (i.forgottenSubscriptions || 0) +
    (i.lateFees || 0) + (i.lostItemSpending || 0) + (i.takeawaySpending || 0);
  const flexibleSpendEstimate = Math.max(0, totalIncome - totalFixedBills - totalDebtMinimums);
  const surplusOrShortfall = totalIncome - totalFixedBills - totalDebtMinimums - totalLeaksEstimated;
  const savingsBuffer = (i.currentSavings || 0) + (i.currentBankBalance || 0);
  return {
    totalIncome, totalFixedBills, totalDebtMinimums, totalLeaksEstimated,
    flexibleSpendEstimate, surplusOrShortfall, savingsBuffer
  };
}

function calculateMoneyPressure(i, s) {
  const billsRatio = (s.totalFixedBills + s.totalDebtMinimums) / Math.max(s.totalIncome, 1);
  const bufferRatio = s.savingsBuffer / Math.max(i.emergencyFundTarget || 1, 1);

  let B = billsRatio >= 1 ? 30 : billsRatio >= 0.8 ? 24 : billsRatio >= 0.6 ? 18 : billsRatio >= 0.4 ? 10 : 5;

  let F;
  if (s.surplusOrShortfall < -300) F = 20;
  else if (s.surplusOrShortfall < 0) F = 15;
  else if (s.surplusOrShortfall < 200) F = 10;
  else F = 3;

  let G = bufferRatio < 0.1 ? 15 : bufferRatio < 0.25 ? 11 : bufferRatio < 0.5 ? 7 : 2;

  const R = Math.min(20,
    (i.avoidanceLevel / 10) * 8 +
    (i.stressLevel / 10) * 6 +
    (i.runsOutBeforePayday ? 4 : 0) +
    (i.unopenedMoneyLetters ? 2 : 0)
  );

  const U = (i.urgentDebtLetters ? 8 : 0) + ((i.arrears || 0) > 0 ? 7 : 0);

  const score = Math.min(100, Math.round(B + F + G + R + U));
  const label = score < 25 ? 'stable' : score < 50 ? 'stretched' : score < 75 ? 'danger_zone' : 'urgent_reset';

  const explanations = {
    stable: 'Your income is covering your essentials with room to breathe. The focus now is tightening leaks and building automatic habits so this stays calm.',
    stretched: 'You are covering the essentials, but there is very little slack. One surprise cost or impulse spend could tip things over — we will build a payday split so you stop guessing.',
    danger_zone: 'Your bills and debt minimums are putting real pressure on your income. This is common and fixable — we will stabilise first, then shrink leaks and pick one clear debt focus.',
    urgent_reset: 'Either your fixed costs and debts exceed your income, or arrears/urgent letters are stacking up. This tool will help you organise and draft scripts, but for formal debt advice please contact a qualified adviser or debt charity.',
  };

  return {
    score, label,
    explanation: explanations[label],
    breakdown: { B: Math.round(B), F: Math.round(F), G: Math.round(G), R: Math.round(R), U: Math.round(U) },
  };
}

function buildLeakMap(i) {
  return [
    { key: 'impulse', label: 'Impulse / "treat" spending', monthly: i.monthlyImpulseSpending || 0 },
    { key: 'forgotten_subs', label: 'Forgotten subscriptions', monthly: i.forgottenSubscriptions || 0 },
    { key: 'late_fees', label: 'Late fees / missed payment charges', monthly: i.lateFees || 0 },
    { key: 'lost_items', label: 'Replacing lost items', monthly: i.lostItemSpending || 0 },
    { key: 'takeaway', label: 'Takeaway & convenience spending', monthly: i.takeawaySpending || 0 },
  ].map(x => ({ ...x, annual: x.monthly * 12 })).sort((a, b) => b.monthly - a.monthly);
}

function buildPaydaySplit(i, s) {
  const leftoverAfterEssentials = Math.max(0, s.totalIncome - s.totalFixedBills - s.totalDebtMinimums);
  const savingsBufferAmt = Math.round(leftoverAfterEssentials * SAVINGS_BUFFER_PCT);
  const emergencyFundAmt = Math.round(leftoverAfterEssentials * EMERGENCY_FUND_PCT);
  const trueLeftover = Math.max(0, leftoverAfterEssentials - savingsBufferAmt - emergencyFundAmt);
  const spendingMoneyAmt = Math.round(trueLeftover * ESSENTIAL_SPEND_SPLIT);
  const flexibleSpendAmt = trueLeftover - spendingMoneyAmt;

  return [
    { bucket: 'Bills account', amount: s.totalFixedBills, when: 'On payday, before anything else', why: 'Rent, council tax and essentials are protected first.', tone: 'core' },
    { bucket: 'Debt payments', amount: s.totalDebtMinimums, when: 'Same day as payday', why: 'Avoids late fees and protects your credit file.', tone: 'core' },
    { bucket: 'Savings buffer', amount: savingsBufferAmt, when: 'Payday +1 day, automatic transfer', why: 'A small cushion so a £20 surprise never becomes a crisis.', tone: 'save' },
    { bucket: 'Emergency fund', amount: emergencyFundAmt, when: 'Payday +1 day, automatic transfer', why: 'Builds toward your emergency target so real emergencies do not go on credit.', tone: 'save' },
    { bucket: 'Spending money', amount: spendingMoneyAmt, when: 'Move to an everyday spends account', why: 'Covers groceries and daily essentials without touching bill money.', tone: 'spend' },
    { bucket: 'Flexible spending', amount: flexibleSpendAmt, when: 'Leave in main account or a separate card', why: 'Genuinely free-to-spend money — no guilt, because everything else is already covered.', tone: 'spend' },
  ];
}

function buildDebtPriority(i) {
  if ((i.arrears || 0) > 0 || i.urgentDebtLetters) {
    return {
      strategy: 'Urgent arrears / letters first',
      reason: 'Arrears and urgent letters carry the highest risk (enforcement, bailiffs, disconnection). These get contacted first, before any interest-optimisation strategy.',
      firstThree: [
        'Open every urgent letter this week, even if you cannot act on them yet.',
        'Contact the most urgent creditor and ask for a payment plan using the breathing-space script.',
        'List every other debt by balance so nothing else gets missed.',
      ],
    };
  }
  if (i.planStyle === 'strict' && i.highestInterestDebtName) {
    return {
      strategy: 'Avalanche method',
      reason: `You prefer a precise, numbers-first approach. Paying extra toward ${i.highestInterestDebtName} first saves the most money in interest over time.`,
      firstThree: [
        `Confirm the exact balance and rate on ${i.highestInterestDebtName}.`,
        'Keep every other debt at its minimum payment.',
        'Direct any spare money from your payday split toward this one debt.',
      ],
    };
  }
  if (i.planStyle === 'gentle') {
    return {
      strategy: 'Snowball method',
      reason: 'You asked for a gentler approach — clearing your smallest debt completely gives a fast, visible win that builds momentum without needing perfect numbers.',
      firstThree: [
        'List all debts smallest balance to largest.',
        'Pay minimums on everything except the smallest.',
        'Put any spare money toward the smallest until it is gone, then move to the next.',
      ],
    };
  }
  return {
    strategy: 'Balanced approach',
    reason: 'A mix of avalanche (interest savings) and snowball (motivation) usually works best when you are not in crisis and do not have a strong preference either way.',
    firstThree: [
      'Confirm your total minimum payments are automated.',
      'Pick either your highest-interest or smallest debt to focus spare money on.',
      'Review progress in 30 days and switch strategy if it is not sticking.',
    ],
  };
}

function build7DayPlan(i, s) {
  const actions = ['Move bills money to a separate account the moment your next income lands.'];
  if (i.unopenedMoneyLetters || i.urgentDebtLetters) actions.push('Open every money letter this week — you do not have to solve them today, just open them.');
  if (s.totalLeaksEstimated > 0) actions.push('Spend 10 minutes checking subscriptions and cancel anything you do not actively use.');
  if ((i.takeawaySpending || 0) > 0) actions.push('Freeze takeaways for 7 days and pre-decide one easy backup meal.');
  actions.push('Set calendar reminders for your next 2–3 key payments.');
  if (i.urgentDebtLetters || (i.arrears || 0) > 0) actions.push('Send one payment-plan email using the script in your plan.');
  actions.push('Check your bank balance today, right now, even if it is uncomfortable.');
  return actions.slice(0, 7);
}

const THIRTY_DAY_PLAN = [
  { week: 'Week 1', theme: 'Stabilise', tasks: ['Move bills money on payday without skipping', 'Automate all debt minimums', 'Open any unopened letters', 'Cancel one unused subscription'] },
  { week: 'Week 2', theme: 'Automate', tasks: ['Set up standing orders for every bill', 'Create a dedicated bills-only account', 'Automate the savings buffer transfer', 'Set a weekly 5-minute money check-in'] },
  { week: 'Week 3', theme: 'Reduce leaks', tasks: ['Audit every subscription again', 'Add a purchase-pause rule', 'Batch-cook once to cut takeaway spend', 'Query any late fees for a goodwill waiver'] },
  { week: 'Week 4', theme: 'Review & adjust', tasks: ['Compare actual spend to the plan', 'Keep what worked, change what did not', 'Re-run the reset next month to track the score'] },
];

function buildRules(i) {
  const pauseAmount = Math.max(20, Math.round(((i.monthlyIncomeAfterTax || 0) * 0.02) / 5) * 5);
  return [
    `No purchases over £${pauseAmount} without a 24-hour pause.`,
    'Bills money moves on payday before anything else — automated, not manual.',
    'Subscriptions get reviewed on the 1st of every month.',
    'One dedicated card is used for flexible spending only — never bills.',
    i.protectedExpense ? `${i.protectedExpense} stays protected — it never gets cut to cover a leak.` : 'Essentials (food, transport) are budgeted for first, always.',
  ];
}

function buildScripts(i) {
  return [
    {
      title: 'Breathing-space request',
      when: 'When a creditor is chasing and you need 30 days of no contact.',
      body: `Hi,

I'm writing about account [REFERENCE]. I'm currently going through financial difficulty and putting together a plan to deal with my debts responsibly. Could you please pause interest, charges and contact for 30 days while I organise this?

I'll be in touch by [DATE] with a proposed payment plan. Please confirm this in writing.

Thank you,
[Your name]`
    },
    {
      title: 'Affordable payment plan proposal',
      when: 'When you can afford something, but not the full amount.',
      body: `Hi,

Following on from my previous message about account [REFERENCE], I've now worked out what I can realistically afford.

I can commit to £[AMOUNT] per month, paid on the [DATE] of each month, starting [START DATE]. Please confirm in writing that this arrangement is accepted and that interest and charges will be frozen while I keep to it.

Thank you,
[Your name]`
    },
    {
      title: 'Cancel a subscription (in writing)',
      when: "When you don't want the phone call.",
      body: `Hi,

Please cancel my subscription to [SERVICE] effective from the next billing date. My account reference is [REF].

Please confirm the cancellation in writing and confirm no further payments will be taken.

Thank you,
[Your name]`
    },
    {
      title: 'Late-fee goodwill waiver',
      when: 'When a late fee has just landed and this is a one-off.',
      body: `Hi,

I've just noticed a late fee of £[AMOUNT] on account [REFERENCE]. This is out of character for my account and was down to [BRIEF REASON].

As a gesture of goodwill, would you be able to waive this charge? I've now set up an automatic payment so it will not happen again.

Thank you,
[Your name]`
    },
  ];
}

// ---- Sample inputs ----
const SAMPLE_STRETCHED = {
  monthlyIncomeAfterTax: 2400,
  paydayDate: 28,
  incomeFrequency: 'monthly',
  incomeVaries: false,
  rentMortgage: 950,
  councilTax: 145,
  utilities: 180,
  phoneInternet: 65,
  transport: 140,
  insurance: 55,
  subscriptions: 42,
  otherFixedBills: 30,
  creditCardDebt: 1800,
  overdraft: 500,
  loans: 3200,
  buyNowPayLater: 240,
  arrears: 0,
  minMonthlyDebtPayments: 210,
  highestInterestDebtName: 'Barclaycard',
  urgentDebtLetters: false,
  currentSavings: 120,
  emergencyFundTarget: 1500,
  runsOutBeforePayday: true,
  daysBeforePaydayRunOut: 5,
  currentBankBalance: 180,
  monthlyImpulseSpending: 120,
  forgottenSubscriptions: 24,
  lateFees: 18,
  lostItemSpending: 15,
  takeawaySpending: 160,
  unopenedMoneyLetters: true,
  avoidanceLevel: 7,
  mainGoal: 'stop_overspending',
  stressLevel: 7,
  planStyle: 'balanced',
  protectedExpense: 'My weekly coffee-shop routine',
};

const EMPTY_INPUTS = {
  monthlyIncomeAfterTax: 0, paydayDate: 25, incomeFrequency: 'monthly', incomeVaries: false,
  rentMortgage: 0, councilTax: 0, utilities: 0, phoneInternet: 0, transport: 0, insurance: 0, subscriptions: 0, otherFixedBills: 0,
  creditCardDebt: 0, overdraft: 0, loans: 0, buyNowPayLater: 0, arrears: 0, minMonthlyDebtPayments: 0, highestInterestDebtName: '', urgentDebtLetters: false,
  currentSavings: 0, emergencyFundTarget: 1000, runsOutBeforePayday: false, currentBankBalance: 0,
  monthlyImpulseSpending: 0, forgottenSubscriptions: 0, lateFees: 0, lostItemSpending: 0, takeawaySpending: 0,
  unopenedMoneyLetters: false, avoidanceLevel: 5,
  mainGoal: 'stop_overspending', stressLevel: 5, planStyle: 'balanced', protectedExpense: '',
};

// Export to window so other JSX files can access
Object.assign(window, {
  MR_CALC: {
    WEEKS_PER_MONTH, SAVINGS_BUFFER_PCT, EMERGENCY_FUND_PCT, ESSENTIAL_SPEND_SPLIT,
    monthlyIncome, buildSnapshot, calculateMoneyPressure, buildLeakMap, buildPaydaySplit,
    buildDebtPriority, build7DayPlan, THIRTY_DAY_PLAN, buildRules, buildScripts,
    SAMPLE_STRETCHED, EMPTY_INPUTS,
  }
});

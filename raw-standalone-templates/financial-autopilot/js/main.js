/* =========================================================
   Financial Autopilot — calculation engine & UI wiring
   Logic (verbatim from template):
   savings_rate = MAX(0, (monthly_income - monthly_expenses) / monthly_income)
   investment_allocation = IF(risk_tolerance < 3, 0.3, 0.7)
   retirement_contribution = IF(years_to_retirement < 10, monthly_income*0.2, monthly_income*0.1)
   ========================================================= */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const form = $('autopilot-form');
  const resultsSection = $('results-section');
  const riskSlider = $('risk_tolerance');
  const riskValueLabel = $('risk_tolerance_value');

  let allocationChart = null;
  let growthChart = null;

  // ---- live slider label ----
  riskSlider.addEventListener('input', () => {
    riskValueLabel.textContent = riskSlider.value;
  });

  // ---- helpers ----
  const fmtUSD = (n) => {
    if (!isFinite(n)) return '$0';
    return '$' + Math.round(n).toLocaleString('en-US');
  };
  const fmtPct = (n) => `${Math.round(n * 1000) / 10}%`;
  const clamp0 = (n) => (isFinite(n) && n > 0 ? n : 0);

  function computePlan(inputs) {
    const {
      monthly_income,
      monthly_expenses,
      current_savings,
      debt_amount,
      years_to_retirement,
      risk_tolerance,
      automate_investments,
    } = inputs;

    // --- core logic (from template) ---
    const savings_rate = monthly_income > 0
      ? Math.max(0, (monthly_income - monthly_expenses) / monthly_income)
      : 0;

    const investment_allocation = risk_tolerance < 3 ? 0.3 : 0.7;

    const retirement_contribution = years_to_retirement < 10
      ? monthly_income * 0.2
      : monthly_income * 0.1;

    // --- derived figures for the dashboard ---
    const raw_surplus = monthly_income - monthly_expenses;
    const surplus = clamp0(raw_surplus); // money left to automate each month

    // How much of the surplus gets invested (only if automation is on)
    const invest_amount = automate_investments ? surplus * investment_allocation : 0;
    const leftover = surplus - invest_amount;

    // Leftover is auto-split between debt payoff and savings/emergency fund
    const has_debt = debt_amount > 0;
    const debt_share = has_debt ? 0.7 : 0;
    const savings_share = 1 - debt_share;

    const debt_payment = leftover * debt_share;
    const savings_contribution = leftover * savings_share;

    // Debt payoff estimate (simple, no-interest amortization on the auto-payment)
    let payoffMonths = null;
    if (debt_amount > 0 && debt_payment > 0) {
      payoffMonths = Math.ceil(debt_amount / debt_payment);
    }

    // Debt-to-income ratio (annualized)
    const annual_income = monthly_income * 12;
    const dti = annual_income > 0 ? debt_amount / annual_income : 0;

    // Emergency fund target = 6 months of expenses
    const emergency_target = monthly_expenses * 6;
    const emergency_progress = emergency_target > 0
      ? Math.min(1, current_savings / emergency_target)
      : (current_savings > 0 ? 1 : 0);

    // Growth projection for retirement contribution (assume 7% annual return)
    const ANNUAL_RETURN = 0.07;
    const monthlyRate = ANNUAL_RETURN / 12;
    const months = Math.max(1, Math.round(years_to_retirement * 12));
    const growthSeries = [];
    let balance = current_savings;
    const yearsToPlot = Math.min(years_to_retirement, 40) || 1;
    for (let y = 0; y <= yearsToPlot; y++) {
      growthSeries.push({ year: y, value: balance });
      // advance 12 months of contributions with monthly compounding
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyRate) + retirement_contribution;
      }
    }

    return {
      savings_rate,
      investment_allocation,
      retirement_contribution,
      surplus,
      invest_amount,
      leftover,
      debt_payment,
      savings_contribution,
      payoffMonths,
      dti,
      emergency_target,
      emergency_progress,
      growthSeries,
      current_savings,
      debt_amount,
      monthly_income,
      monthly_expenses,
      years_to_retirement,
      automate_investments,
      has_debt,
    };
  }

  function renderStats(plan) {
    $('stat_savings_rate').textContent = fmtPct(plan.savings_rate);
    $('stat_savings_rate_sub').textContent = plan.savings_rate > 0
      ? 'of your income saved each month'
      : "you're spending your full income — let's fix that";

    $('stat_surplus').textContent = fmtUSD(plan.surplus);
    $('stat_surplus_sub').textContent = plan.surplus > 0
      ? 'automatically put to work'
      : 'no surplus available yet';

    $('stat_dti').textContent = fmtPct(plan.dti);
    $('stat_dti_sub').textContent = plan.dti < 0.36
      ? 'healthy range'
      : 'above the recommended 36%';

    $('stat_retirement').textContent = fmtUSD(plan.retirement_contribution);
    $('stat_retirement_sub').textContent = plan.years_to_retirement < 10
      ? 'accelerated (20% of income)'
      : 'steady pace (10% of income)';
  }

  function renderAllocationChart(plan) {
    const ctx = document.getElementById('allocationChart').getContext('2d');
    const labels = [];
    const data = [];
    const colors = [];

    if (plan.invest_amount > 0) { labels.push('Investing'); data.push(plan.invest_amount); colors.push('#22c99e'); }
    if (plan.debt_payment > 0) { labels.push('Debt Payoff'); data.push(plan.debt_payment); colors.push('#e0563f'); }
    if (plan.savings_contribution > 0) { labels.push('Savings / Emergency Fund'); data.push(plan.savings_contribution); colors.push('#1d6fb8'); }
    if (data.length === 0) { labels.push('No Surplus Yet'); data.push(1); colors.push('#cfd8e3'); }

    if (allocationChart) allocationChart.destroy();
    allocationChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { display: false } },
      },
    });

    const legend = $('allocation-legend');
    legend.innerHTML = '';
    const total = data.reduce((a, b) => a + b, 0) || 1;
    labels.forEach((label, i) => {
      const li = document.createElement('li');
      const pct = Math.round((data[i] / total) * 100);
      li.innerHTML = `
        <span class="legend-label"><span class="dot" style="background:${colors[i]}"></span>${label}</span>
        <span class="legend-value">${fmtUSD(data[i])} · ${pct}%</span>`;
      legend.appendChild(li);
    });
  }

  function renderGrowthChart(plan) {
    $('retirement-year-label').textContent = `year ${Math.round(plan.years_to_retirement)}`;
    $('growth-rate-label').textContent = '7%';

    const ctx = document.getElementById('growthChart').getContext('2d');
    const labels = plan.growthSeries.map((p) => `Yr ${p.year}`);
    const values = plan.growthSeries.map((p) => Math.round(p.value));

    if (growthChart) growthChart.destroy();
    growthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Projected Balance',
          data: values,
          borderColor: '#146c5b',
          backgroundColor: 'rgba(34,201,158,0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => fmtUSD(c.parsed.y) } },
        },
        scales: {
          y: { ticks: { callback: (v) => fmtUSD(v) }, grid: { color: '#eef1f5' } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  function renderActionPlan(plan) {
    const container = $('action-plan');
    container.innerHTML = '';
    const items = [];

    items.push({
      icon: 'fa-arrow-right',
      title: `Save ${fmtPct(plan.savings_rate)} of every paycheck`,
      desc: `You currently have a monthly surplus of ${fmtUSD(plan.surplus)}. Automating this now locks in the habit before it can be spent.`,
    });

    if (plan.automate_investments && plan.invest_amount > 0) {
      items.push({
        icon: 'fa-chart-pie',
        title: `Auto-invest ${fmtUSD(plan.invest_amount)}/month`,
        desc: `With a risk tolerance of ${riskSlider.value}/5, ${Math.round(plan.investment_allocation * 100)}% of your surplus is routed into investments automatically.`,
      });
    } else if (!plan.automate_investments) {
      items.push({
        icon: 'fa-toggle-off',
        title: 'Turn on investment automation',
        desc: 'Automation is currently off — your surplus is only being routed to savings and debt paydown, not growth investments.',
      });
    }

    if (plan.has_debt) {
      items.push({
        icon: 'fa-fire',
        title: `Auto-pay ${fmtUSD(plan.debt_payment)}/month toward debt`,
        desc: plan.payoffMonths
          ? `At this pace, your ${fmtUSD(plan.debt_amount)} debt is paid off in about ${formatMonths(plan.payoffMonths)}.`
          : `Increase your surplus to start making automatic progress on your ${fmtUSD(plan.debt_amount)} debt.`,
      });
    } else {
      items.push({
        icon: 'fa-circle-check',
        title: "You're debt-free — redirect that capacity",
        desc: 'With no outstanding debt, your full surplus can accelerate savings and long-term investing.',
      });
    }

    items.push({
      icon: 'fa-umbrella-beach',
      title: `Contribute ${fmtUSD(plan.retirement_contribution)}/month to retirement`,
      desc: plan.years_to_retirement < 10
        ? `With fewer than 10 years to go, we recommend an accelerated 20% of income to close the gap.`
        : `With ${Math.round(plan.years_to_retirement)} years to go, a steady 10% of income keeps compounding working in your favor.`,
    });

    items.push({
      icon: 'fa-shield-heart',
      title: `Build your emergency fund to ${fmtUSD(plan.emergency_target)}`,
      desc: `That's 6 months of expenses. You're currently at ${Math.round(plan.emergency_progress * 100)}% of this target.`,
    });

    items.forEach((it) => {
      const div = document.createElement('div');
      div.className = 'action-item';
      div.innerHTML = `
        <div class="action-ico"><i class="fa-solid ${it.icon}"></i></div>
        <div><h5>${it.title}</h5><p>${it.desc}</p></div>`;
      container.appendChild(div);
    });
  }

  function formatMonths(months) {
    const years = Math.floor(months / 12);
    const rem = months % 12;
    const parts = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (rem > 0) parts.push(`${rem} mo${rem > 1 ? 's' : ''}`);
    return parts.length ? parts.join(' ') : 'less than a month';
  }

  function renderDebtPayoff(plan) {
    $('stat_debt_total').textContent = fmtUSD(plan.debt_amount);
    $('stat_debt_payment').textContent = fmtUSD(plan.debt_payment);
    $('stat_debt_time').textContent = plan.payoffMonths ? formatMonths(plan.payoffMonths) : (plan.has_debt ? 'Add surplus to begin' : 'No debt 🎉');

    const fill = $('debt-progress-fill');
    const caption = $('debt-progress-caption');
    if (!plan.has_debt) {
      fill.style.width = '100%';
      caption.textContent = "You're debt-free! Autopilot is now fully focused on growth.";
    } else if (plan.payoffMonths) {
      const pctPerMonth = 100 / plan.payoffMonths;
      fill.style.width = `${Math.min(100, pctPerMonth)}%`;
      caption.textContent = `Auto-paying ${fmtUSD(plan.debt_payment)}/month · projected payoff in ${formatMonths(plan.payoffMonths)}.`;
    } else {
      fill.style.width = '4%';
      caption.textContent = 'No surplus is currently allocated to debt — increase income or reduce expenses to activate autopilot payoff.';
    }
  }

  function renderEmergencyFund(plan) {
    const fill = $('emergency-progress-fill');
    const caption = $('emergency-progress-caption');
    const pct = Math.round(plan.emergency_progress * 100);
    fill.style.width = `${pct}%`;
    caption.textContent = `${fmtUSD(plan.current_savings)} saved of your ${fmtUSD(plan.emergency_target)} target (6 months of expenses) — ${pct}% funded.`;
  }

  function getInputs() {
    return {
      monthly_income: parseFloat($('monthly_income').value) || 0,
      monthly_expenses: parseFloat($('monthly_expenses').value) || 0,
      current_savings: parseFloat($('current_savings').value) || 0,
      debt_amount: parseFloat($('debt_amount').value) || 0,
      years_to_retirement: parseFloat($('years_to_retirement').value) || 0,
      risk_tolerance: parseInt(riskSlider.value, 10) || 3,
      automate_investments: $('automate_investments').checked,
    };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = getInputs();
    const plan = computePlan(inputs);

    renderStats(plan);
    renderAllocationChart(plan);
    renderGrowthChart(plan);
    renderActionPlan(plan);
    renderDebtPayoff(plan);
    renderEmergencyFund(plan);

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('recalculate-btn').addEventListener('click', () => {
    document.getElementById('planner-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

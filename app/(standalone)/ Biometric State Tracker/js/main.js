/* ==========================================================
   Biometric State Tracker — main application logic
   ========================================================== */

const TABLE = 'biometric_entries';

/* ---------- DOM refs ---------- */
const form = document.getElementById('biometric-form');
const submitBtn = document.getElementById('submit-btn');
const resultsSection = document.getElementById('results');
const historyTableBody = document.getElementById('history-table-body');
const refreshBtn = document.getElementById('refresh-history');

const activityDisplay = document.getElementById('activity_level_display');
const sleepQualityDisplay = document.getElementById('sleep_quality_display');
const stressDisplay = document.getElementById('stress_level_display');

const ACTIVITY_LABELS = ['', 'Sedentary', 'Light', 'Moderate', 'Intense', 'Very Intense'];
const SLEEP_Q_LABELS = ['', 'Poor', 'Fair', 'OK', 'Good', 'Great'];
const STRESS_LABELS = ['', 'None', 'Low', 'Moderate', 'High', 'Severe'];
const MOOD_EMOJI = { Energized: '😄', Balanced: '🙂', Tired: '😴', Foggy: '🌫️', Anxious: '😬', Low: '😔' };

let chartInstances = {};
let entriesCache = [];

/* ---------- live slider labels ---------- */
document.getElementById('activity_level').addEventListener('input', (e) => {
  activityDisplay.textContent = ACTIVITY_LABELS[e.target.value];
});
document.getElementById('sleep_quality').addEventListener('input', (e) => {
  sleepQualityDisplay.textContent = SLEEP_Q_LABELS[e.target.value];
});
document.getElementById('stress_level').addEventListener('input', (e) => {
  stressDisplay.textContent = STRESS_LABELS[e.target.value];
});

/* ==========================================================
   Calculation engine
   ========================================================== */

function computeHydrationTarget(data) {
  const weight = parseFloat(data.weight) || 70;
  const activity = parseFloat(data.activity_level) || 3;
  const caffeine = parseFloat(data.caffeine_intake) || 0;
  const alcohol = parseFloat(data.alcohol_intake) || 0;
  const temp = data.temperature !== '' && data.temperature !== undefined ? parseFloat(data.temperature) : 22;

  let target = weight * 35; // baseline ml/kg
  target += (activity - 1) * 300; // extra activity demands more fluids
  target += caffeine * 1.2; // diuretic offset
  target += alcohol * 250; // diuretic offset
  if (temp > 25) target += (temp - 25) * 50;
  if (temp < 5) target += (5 - temp) * 10;

  target = Math.max(1500, Math.min(5000, Math.round(target / 50) * 50));
  return target;
}

function computeBiometricScore(data, hydrationTarget) {
  let score = 70;

  const sleepHours = data.sleep_hours !== '' ? parseFloat(data.sleep_hours) : null;
  const sleepQuality = parseFloat(data.sleep_quality) || 3;
  const stress = parseFloat(data.stress_level) || 3;
  const activity = parseFloat(data.activity_level) || 3;
  const caffeine = data.caffeine_intake !== '' ? parseFloat(data.caffeine_intake) : 0;
  const alcohol = data.alcohol_intake !== '' ? parseFloat(data.alcohol_intake) : 0;
  const heartRate = data.heart_rate !== '' ? parseFloat(data.heart_rate) : null;
  const water = data.water_intake !== '' ? parseFloat(data.water_intake) : null;

  // sleep hours: ideal 7-9
  if (sleepHours !== null) {
    if (sleepHours >= 7 && sleepHours <= 9) score += 12;
    else if (sleepHours >= 6 && sleepHours < 7) score += 4;
    else if (sleepHours > 9 && sleepHours <= 10) score += 4;
    else score -= 10;
  }

  // sleep quality
  score += (sleepQuality - 3) * 4;

  // stress (lower is better)
  score += (3 - stress) * 5;

  // activity: moderate (3) is ideal, very sedentary or extreme intense slightly penalized
  if (activity === 3 || activity === 4) score += 6;
  else if (activity === 1) score -= 6;
  else if (activity === 5) score -= 2;

  // caffeine: moderate ok, high is penalized
  if (caffeine > 400) score -= 10;
  else if (caffeine > 250) score -= 4;
  else if (caffeine <= 200) score += 2;

  // alcohol
  if (alcohol > 0) score -= alcohol * 4;

  // heart rate: resting 55-75 ideal
  if (heartRate !== null) {
    if (heartRate >= 55 && heartRate <= 75) score += 8;
    else if (heartRate > 90) score -= 8;
    else if (heartRate < 45) score -= 6;
  }

  // hydration progress relative to target (assume check-in mid-day, expect ~40-70% consumed)
  if (water !== null && hydrationTarget) {
    const ratio = water / hydrationTarget;
    if (ratio >= 0.4 && ratio <= 1.1) score += 6;
    else if (ratio < 0.2) score -= 6;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

function scoreLabel(score) {
  if (score >= 85) return 'Peak State';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Balanced';
  if (score >= 40) return 'Needs Attention';
  return 'Low — Recover Today';
}

function generateRecommendations(data, score, hydrationTarget) {
  const recs = [];
  const sleepHours = data.sleep_hours !== '' ? parseFloat(data.sleep_hours) : null;
  const sleepQuality = parseFloat(data.sleep_quality) || 3;
  const stress = parseFloat(data.stress_level) || 3;
  const caffeine = data.caffeine_intake !== '' ? parseFloat(data.caffeine_intake) : 0;
  const alcohol = data.alcohol_intake !== '' ? parseFloat(data.alcohol_intake) : 0;
  const water = data.water_intake !== '' ? parseFloat(data.water_intake) : 0;
  const heartRate = data.heart_rate !== '' ? parseFloat(data.heart_rate) : null;
  const temp = data.temperature !== '' ? parseFloat(data.temperature) : null;
  const activity = parseFloat(data.activity_level) || 3;

  // Hydration
  const ratio = hydrationTarget ? water / hydrationTarget : 0;
  if (ratio < 0.3) {
    recs.push({ type: 'bad', icon: 'fa-droplet', text: `You've only had ${water || 0}ml so far — that's well below your ${hydrationTarget}ml target. Drink a large glass of water now and set a reminder every 2 hours.` });
  } else if (ratio < 0.6) {
    recs.push({ type: 'warn', icon: 'fa-droplet', text: `You're at ${Math.round(ratio*100)}% of your ${hydrationTarget}ml hydration target. Keep sipping steadily through the day.` });
  } else {
    recs.push({ type: 'good', icon: 'fa-droplet', text: `Great hydration progress — ${Math.round(ratio*100)}% of your ${hydrationTarget}ml target reached.` });
  }

  // Sleep
  if (sleepHours !== null) {
    if (sleepHours < 6) {
      recs.push({ type: 'bad', icon: 'fa-bed', text: `Only ${sleepHours}h of sleep last night. Aim for 7-9h tonight — consider an earlier wind-down routine and avoid screens 1h before bed.` });
    } else if (sleepHours > 9.5) {
      recs.push({ type: 'warn', icon: 'fa-bed', text: `${sleepHours}h of sleep is on the longer side. Oversleeping can sometimes signal fatigue or poor sleep quality — check how rested you feel.` });
    } else {
      recs.push({ type: 'good', icon: 'fa-bed', text: `Solid ${sleepHours}h of sleep — right in the optimal 7-9h range.` });
    }
  }
  if (sleepQuality <= 2) {
    recs.push({ type: 'warn', icon: 'fa-moon', text: 'Sleep quality was low. Try a cooler, darker room and consistent sleep/wake times to improve deep sleep.' });
  }

  // Stress
  if (stress >= 4) {
    recs.push({ type: 'bad', icon: 'fa-brain', text: 'Stress is running high. A 10-minute breathing exercise or short walk can meaningfully lower cortisol right now.' });
  } else if (stress <= 2) {
    recs.push({ type: 'good', icon: 'fa-brain', text: 'Stress levels are well managed today — keep up whatever you\'re doing.' });
  }

  // Caffeine
  if (caffeine > 400) {
    recs.push({ type: 'bad', icon: 'fa-mug-hot', text: `${caffeine}mg of caffeine is above the recommended daily ceiling (400mg). Cut off intake now to protect tonight's sleep.` });
  } else if (caffeine > 200) {
    recs.push({ type: 'warn', icon: 'fa-mug-hot', text: `${caffeine}mg of caffeine so far — consider switching to water or decaf after midday.` });
  }

  // Alcohol
  if (alcohol > 2) {
    recs.push({ type: 'bad', icon: 'fa-wine-glass', text: `${alcohol} units of alcohol will dehydrate you and disrupt sleep architecture — add an extra 250ml of water per unit and avoid further drinks tonight.` });
  } else if (alcohol > 0) {
    recs.push({ type: 'warn', icon: 'fa-wine-glass', text: `${alcohol} unit(s) of alcohol logged — extra water tonight will help offset the diuretic effect.` });
  }

  // Heart rate
  if (heartRate !== null) {
    if (heartRate > 90) {
      recs.push({ type: 'warn', icon: 'fa-heart-pulse', text: `Resting heart rate of ${heartRate}bpm is elevated. This can reflect stress, dehydration, poor sleep, or overtraining — consider a lighter day.` });
    } else if (heartRate >= 55 && heartRate <= 75) {
      recs.push({ type: 'good', icon: 'fa-heart-pulse', text: `Resting heart rate of ${heartRate}bpm is in a healthy range.` });
    }
  }

  // Temperature / climate
  if (temp !== null && temp > 28) {
    recs.push({ type: 'warn', icon: 'fa-temperature-half', text: `It's ${temp}°C — hot conditions increase fluid loss. Your hydration target has been raised accordingly; consider electrolytes too.` });
  }

  // Activity
  if (activity === 1) {
    recs.push({ type: 'warn', icon: 'fa-person-running', text: 'Very low activity today. A short walk or light movement can boost circulation and mood.' });
  } else if (activity === 5) {
    recs.push({ type: 'warn', icon: 'fa-person-running', text: 'Very intense activity — prioritize protein, electrolytes and extra recovery sleep tonight.' });
  }

  if (recs.length === 0) {
    recs.push({ type: 'good', icon: 'fa-circle-check', text: 'Everything looks balanced today. Keep up your current routine!' });
  }

  return recs;
}

/* ==========================================================
   Gauge / ring charts
   ========================================================== */

function renderGauge(canvasId, score, colorFrom, colorTo) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

  const pct = Math.max(0, Math.min(100, score));
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [pct, 100 - pct],
        backgroundColor: [colorFrom, 'rgba(255,255,255,0.06)'],
        borderWidth: 0,
        cutout: '78%',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      rotation: -90,
      circumference: 360,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { animateRotate: true },
    }
  });
}

/* ==========================================================
   Form submit
   ========================================================== */

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';

  const formData = new FormData(form);
  const data = {};
  formData.forEach((val, key) => { data[key] = val; });

  const hydrationTarget = computeHydrationTarget(data);
  const score = computeBiometricScore(data, hydrationTarget);
  const recs = generateRecommendations(data, score, hydrationTarget);

  const payload = {
    entry_date: new Date().toISOString(),
    weight: parseFloat(data.weight) || null,
    activity_level: parseFloat(data.activity_level) || null,
    caffeine_intake: data.caffeine_intake !== '' ? parseFloat(data.caffeine_intake) : 0,
    alcohol_intake: data.alcohol_intake !== '' ? parseFloat(data.alcohol_intake) : 0,
    temperature: data.temperature !== '' ? parseFloat(data.temperature) : null,
    sleep_hours: data.sleep_hours !== '' ? parseFloat(data.sleep_hours) : null,
    sleep_quality: parseFloat(data.sleep_quality) || null,
    heart_rate: data.heart_rate !== '' ? parseFloat(data.heart_rate) : null,
    stress_level: parseFloat(data.stress_level) || null,
    water_intake: data.water_intake !== '' ? parseFloat(data.water_intake) : 0,
    mood: data.mood || 'Balanced',
    notes: data.notes || '',
    hydration_target: hydrationTarget,
    biometric_score: score,
    recommendations: JSON.stringify(recs),
  };

  try {
    const res = await fetch(`tables/${TABLE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Save failed');
    showToast('Check-in saved successfully!');
  } catch (err) {
    console.error(err);
    showToast('Could not save entry (showing results anyway).', true);
  }

  displayResults(score, hydrationTarget, recs, data);
  await loadHistory();

  form.reset();
  document.getElementById('activity_level').value = 3;
  document.getElementById('sleep_quality').value = 3;
  document.getElementById('stress_level').value = 2;
  activityDisplay.textContent = 'Moderate';
  sleepQualityDisplay.textContent = 'OK';
  stressDisplay.textContent = 'Low';

  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Analyze &amp; Save Check-In';
});

function displayResults(score, hydrationTarget, recs, data) {
  resultsSection.classList.remove('hidden');

  document.getElementById('result-score').textContent = score;
  document.getElementById('result-score-label').textContent = scoreLabel(score);
  document.getElementById('result-hydration').textContent = hydrationTarget.toLocaleString();

  const water = data.water_intake !== '' ? parseFloat(data.water_intake) : 0;
  const pct = Math.min(100, Math.round((water / hydrationTarget) * 100));
  document.getElementById('result-hydration-pct').textContent = pct + '%';

  renderGauge('scoreGauge', score, '#22e5d0', '#8b7bff');
  document.getElementById('snapshot-score').textContent = score;
  document.getElementById('snapshot-hydration').textContent = hydrationTarget.toLocaleString() + 'ml';
  document.getElementById('snapshot-mood').textContent = (MOOD_EMOJI[data.mood] || '🙂') + ' ' + (data.mood || 'Balanced');

  renderGauge('hydrationRing', pct, '#8b7bff', '#22e5d0');

  const list = document.getElementById('recommendations-list');
  list.innerHTML = '';
  recs.forEach((r) => {
    const li = document.createElement('li');
    li.className = `rec-item rec-${r.type}`;
    li.innerHTML = `<span class="rec-icon"><i class="fa-solid ${r.icon}"></i></span><p class="text-sm text-slate-200 leading-relaxed">${r.text}</p>`;
    list.appendChild(li);
  });

  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==========================================================
   Toast
   ========================================================== */

function showToast(msg, isWarn = false) {
  const toast = document.getElementById('toast');
  toast.innerHTML = `<i class="fa-solid ${isWarn ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i> ${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ==========================================================
   History loading + charts + table
   ========================================================== */

async function loadHistory() {
  try {
    const res = await fetch(`tables/${TABLE}?sort=entry_date&limit=200`);
    const json = await res.json();
    let entries = json.data || [];
    entries.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
    entriesCache = entries;
    renderStats(entries);
    renderHistoryTable(entries);
    renderTrendCharts(entries);
  } catch (err) {
    console.error('Failed to load history', err);
  }
}

function renderStats(entries) {
  document.getElementById('stat-entries').textContent = entries.length;
  if (entries.length) {
    const avgScore = Math.round(entries.reduce((s, e) => s + (e.biometric_score || 0), 0) / entries.length);
    const avgHydration = Math.round(entries.reduce((s, e) => s + (e.hydration_target || 0), 0) / entries.length);
    document.getElementById('stat-avg-score').textContent = avgScore;
    document.getElementById('stat-avg-hydration').textContent = avgHydration.toLocaleString() + 'ml';
  } else {
    document.getElementById('stat-avg-score').textContent = '—';
    document.getElementById('stat-avg-hydration').textContent = '—';
  }
}

function renderHistoryTable(entries) {
  historyTableBody.innerHTML = '';
  if (!entries.length) {
    historyTableBody.innerHTML = '<tr><td colspan="8" class="py-8 text-center text-slate-500">No entries yet — log your first check-in above.</td></tr>';
    return;
  }
  const reversed = [...entries].reverse();
  reversed.forEach((e) => {
    const tr = document.createElement('tr');
    const dateStr = e.entry_date ? new Date(e.entry_date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
    tr.innerHTML = `
      <td class="py-3 pr-4 whitespace-nowrap">${dateStr}</td>
      <td class="py-3 pr-4"><span class="font-semibold text-cyan-glow">${e.biometric_score ?? '—'}</span></td>
      <td class="py-3 pr-4">${e.hydration_target ? e.hydration_target.toLocaleString() + 'ml' : '—'}</td>
      <td class="py-3 pr-4">${e.weight ?? '—'} kg</td>
      <td class="py-3 pr-4">${e.sleep_hours ?? '—'} h</td>
      <td class="py-3 pr-4"><span class="mood-pill">${MOOD_EMOJI[e.mood] || ''} ${e.mood || '—'}</span></td>
      <td class="py-3 pr-4 max-w-[220px] truncate" title="${(e.notes || '').replace(/"/g, '&quot;')}">${e.notes || '—'}</td>
      <td class="py-3 pr-4 text-right"><button class="delete-btn" data-id="${e.id}" title="Delete entry"><i class="fa-solid fa-trash"></i></button></td>
    `;
    historyTableBody.appendChild(tr);
  });

  historyTableBody.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('Delete this entry?')) return;
      try {
        await fetch(`tables/${TABLE}/${id}`, { method: 'DELETE' });
        showToast('Entry deleted.');
        await loadHistory();
      } catch (err) {
        console.error(err);
        showToast('Could not delete entry.', true);
      }
    });
  });
}

function renderTrendCharts(entries) {
  const labels = entries.map((e) => e.entry_date ? new Date(e.entry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '');

  const commonGridColor = 'rgba(255,255,255,0.06)';
  const commonTextColor = '#94a3b8';

  buildLineChart('scoreTrendChart', labels, [
    { label: 'Biometric Score', data: entries.map(e => e.biometric_score), color: '#22e5d0' },
  ], commonGridColor, commonTextColor, { min: 0, max: 100 });

  buildLineChart('hydrationTrendChart', labels, [
    { label: 'Water Consumed (ml)', data: entries.map(e => e.water_intake), color: '#22e5d0' },
    { label: 'Hydration Target (ml)', data: entries.map(e => e.hydration_target), color: '#8b7bff' },
  ], commonGridColor, commonTextColor);

  buildLineChart('sleepStressChart', labels, [
    { label: 'Sleep Hours', data: entries.map(e => e.sleep_hours), color: '#22e5d0' },
    { label: 'Stress Level (1-5)', data: entries.map(e => e.stress_level), color: '#f87171' },
  ], commonGridColor, commonTextColor);

  buildLineChart('vitalsTrendChart', labels, [
    { label: 'Heart Rate (bpm)', data: entries.map(e => e.heart_rate), color: '#8b7bff' },
    { label: 'Weight (kg)', data: entries.map(e => e.weight), color: '#22e5d0' },
  ], commonGridColor, commonTextColor);
}

function buildLineChart(canvasId, labels, datasets, gridColor, textColor, yOverrides = {}) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((d) => ({
        label: d.label,
        data: d.data,
        borderColor: d.color,
        backgroundColor: d.color + '22',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: d.color,
        spanGaps: true,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: textColor, font: { size: 11 } } },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } }, ...yOverrides },
      },
    },
  });
}

refreshBtn.addEventListener('click', () => {
  loadHistory();
  showToast('History refreshed.');
});

/* ---------- init ---------- */
loadHistory();

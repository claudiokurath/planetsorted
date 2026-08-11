/* ==========================================================================
   DECISION PARALYSIS SOLVER — main.js
   Sections: Nav | Assessment Engine | Compare Matrix | Quick Decide Tools |
             Decision Journal (Table API) | Modal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initAssessment();
  initCompare();
  initQuickDecide();
  initJournal();
  initModal();
});

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ==========================================================================
   ASSESSMENT ENGINE
   ========================================================================== */
let lastAssessment = null;

function initAssessment() {
  ['risk_tolerance', 'impact_magnitude', 'information_sufficiency'].forEach(id => {
    const slider = document.getElementById(id);
    const valueEl = document.getElementById(id + '-value');
    slider.addEventListener('input', () => { valueEl.textContent = slider.value; });
  });

  const revToggle = document.getElementById('reversibility');
  const onLabel = document.getElementById('reversibility-on-label');
  const offLabel = document.getElementById('reversibility-off-label');
  revToggle.addEventListener('change', () => {
    onLabel.classList.toggle('active', revToggle.checked);
    offLabel.classList.toggle('active', !revToggle.checked);
  });

  document.getElementById('calc-btn').addEventListener('click', runAssessment);
  document.getElementById('recalc-btn').addEventListener('click', () => {
    document.getElementById('result-content').classList.add('hidden');
    document.getElementById('result-placeholder').classList.remove('hidden');
    document.getElementById('save-confirm').classList.add('hidden');
  });
  document.getElementById('save-decision-btn').addEventListener('click', saveAssessmentToJournal);
}

function computeConfidence(R, I, S, reversible) {
  const infoScore = S * 10; // 10-100
  const gap = R - I; // -9..9
  const fitScore = clamp(50 + gap * 5, 0, 100);
  const safetyScore = reversible ? 100 : clamp(100 - I * 8, 0, 100);
  const confidence = Math.round(0.45 * infoScore + 0.30 * fitScore + 0.25 * safetyScore);
  return { confidence: clamp(confidence, 0, 100), infoScore, fitScore, safetyScore };
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function getVerdict(score) {
  if (score >= 80) return {
    tier: 'Green Light — Decide Now',
    color: '#35d19c',
    desc: 'You have enough clarity and margin for error. Further delay costs more than it helps — commit and move.'
  };
  if (score >= 60) return {
    tier: 'Lean In',
    color: '#22d3c4',
    desc: 'Your confidence is solid. Do one last gut check, set a decision deadline, and commit.'
  };
  if (score >= 35) return {
    tier: 'Proceed with Caution',
    color: '#ffb545',
    desc: 'You are not fully ready. Shore up the weakest signal below, run a small test if you can, then decide.'
  };
  return {
    tier: 'Pump the Brakes',
    color: '#ff5d7a',
    desc: 'The stakes and uncertainty are high right now. Slow down, gather more information, and reduce the downside before committing.'
  };
}

function runAssessment() {
  const title = document.getElementById('decision-title').value.trim() || 'Untitled decision';
  const category = document.getElementById('decision-category').value;
  const R = Number(document.getElementById('risk_tolerance').value);
  const I = Number(document.getElementById('impact_magnitude').value);
  const S = Number(document.getElementById('information_sufficiency').value);
  const reversible = document.getElementById('reversibility').checked;

  const { confidence, infoScore, fitScore, safetyScore } = computeConfidence(R, I, S, reversible);
  const verdict = getVerdict(confidence);

  lastAssessment = { title, category, R, I, S, reversible, confidence, verdict: verdict.tier };

  // Update ring
  const circumference = 2 * Math.PI * 70;
  const ring = document.getElementById('score-ring-fg');
  ring.style.stroke = verdict.color;
  const offset = circumference - (confidence / 100) * circumference;
  // force reflow for transition
  ring.style.strokeDashoffset = circumference;
  requestAnimationFrame(() => { ring.style.strokeDashoffset = offset; });

  // Animate number count-up
  animateNumber(document.getElementById('score-num'), confidence);

  document.getElementById('verdict-title').textContent = verdict.tier;
  document.getElementById('verdict-title').style.color = verdict.color;
  document.getElementById('verdict-desc').textContent = verdict.desc;

  const doorBadge = document.getElementById('door-badge');
  if (reversible) {
    doorBadge.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Two-Way Door — easy to reverse';
    doorBadge.style.color = '#22d3c4';
    doorBadge.style.borderColor = '#22d3c4';
  } else {
    doorBadge.innerHTML = '<i class="fa-solid fa-lock"></i> One-Way Door — hard to undo';
    doorBadge.style.color = '#ff5d7a';
    doorBadge.style.borderColor = '#ff5d7a';
  }

  // Build advice list
  const advice = [];
  if (infoScore < 55) {
    advice.push({ icon: 'fa-magnifying-glass', text: 'Your information is thin. Spend focused time closing your single biggest unknown before deciding.' });
  }
  if (fitScore < 55) {
    advice.push({ icon: 'fa-scale-unbalanced', text: 'The potential impact currently outweighs your comfort with risk. Look for ways to shrink the downside — trials, contracts, safety nets.' });
  }
  if (!reversible && I >= 6) {
    advice.push({ icon: 'fa-door-closed', text: 'Because this is hard to undo, consider a smaller reversible test first, or ask someone who has made a similar call.' });
  }
  if (reversible && confidence < 60) {
    advice.push({ icon: 'fa-flask', text: 'Since you can adjust course later, a cheap, timely decision beats a perfect, delayed one — set a deadline and act.' });
  }
  if (advice.length === 0) {
    advice.push({ icon: 'fa-check-double', text: 'All four signals are aligned. Trust the analysis — write down your reasoning, then execute.' });
  }
  advice.push({ icon: 'fa-calendar-check', text: 'Set a hard decision deadline right now. Deadlines create the clarity that endless deliberation cannot.' });

  document.getElementById('advice-list').innerHTML = advice.map(a =>
    `<div class="advice-item"><i class="fa-solid ${a.icon}"></i><span>${escapeHtml(a.text)}</span></div>`
  ).join('');

  document.getElementById('result-placeholder').classList.add('hidden');
  document.getElementById('result-content').classList.remove('hidden');
  document.getElementById('save-confirm').classList.add('hidden');

  document.getElementById('assessment-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function animateNumber(el, target) {
  let current = 0;
  const step = Math.max(1, Math.round(target / 30));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 20);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function saveAssessmentToJournal() {
  if (!lastAssessment) return;
  const btn = document.getElementById('save-decision-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
  try {
    const payload = {
      title: lastAssessment.title,
      category: lastAssessment.category,
      risk_tolerance: lastAssessment.R,
      impact_magnitude: lastAssessment.I,
      information_sufficiency: lastAssessment.S,
      reversible: lastAssessment.reversible,
      confidence_score: lastAssessment.confidence,
      verdict: lastAssessment.verdict,
      chosen_option: '',
      notes: '',
      status: 'Open',
      outcome: ''
    };
    const res = await fetch('tables/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Save failed');
    document.getElementById('save-confirm').classList.remove('hidden');
    loadJournal();
  } catch (e) {
    alert('Could not save this decision. Please try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save to Journal';
  }
}

/* ==========================================================================
   COMPARE MATRIX (Options x Weighted Criteria)
   ========================================================================== */
let compareState = {
  options: [],
  criteria: [], // {name, weight}
  ratings: {} // ratings[optionIndex][criterionIndex] = 1-10
};

function initCompare() {
  document.getElementById('add-option-btn').addEventListener('click', addOptionFromInput);
  document.getElementById('new-option-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addOptionFromInput(); }
  });
  document.getElementById('add-criteria-btn').addEventListener('click', addCriteriaFromInput);
  document.getElementById('new-criteria-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addCriteriaFromInput(); }
  });
  renderOptionsChips();
  renderCriteriaList();
  renderMatrix();
}

function addOptionFromInput() {
  const input = document.getElementById('new-option-input');
  const val = input.value.trim();
  if (!val) return;
  compareState.options.push(val);
  input.value = '';
  renderOptionsChips();
  renderMatrix();
}

function removeOption(idx) {
  compareState.options.splice(idx, 1);
  Object.keys(compareState.ratings).forEach(key => {
    if (Number(key) === idx) delete compareState.ratings[key];
  });
  // reindex ratings keys above idx
  const newRatings = {};
  Object.keys(compareState.ratings).forEach(key => {
    const k = Number(key);
    newRatings[k > idx ? k - 1 : k] = compareState.ratings[key];
  });
  compareState.ratings = newRatings;
  renderOptionsChips();
  renderMatrix();
}

function addCriteriaFromInput() {
  const input = document.getElementById('new-criteria-input');
  const val = input.value.trim();
  if (!val) return;
  compareState.criteria.push({ name: val, weight: 3 });
  input.value = '';
  renderCriteriaList();
  renderMatrix();
}

function removeCriteria(idx) {
  compareState.criteria.splice(idx, 1);
  Object.keys(compareState.ratings).forEach(optKey => {
    if (compareState.ratings[optKey]) delete compareState.ratings[optKey][idx];
  });
  renderCriteriaList();
  renderMatrix();
}

function renderOptionsChips() {
  const wrap = document.getElementById('options-list');
  if (compareState.options.length === 0) {
    wrap.innerHTML = '<span class="slider-hint">No options yet — add at least two below.</span>';
    return;
  }
  wrap.innerHTML = compareState.options.map((opt, i) =>
    `<span class="chip">${escapeHtml(opt)}<button data-idx="${i}" class="remove-option-btn" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button></span>`
  ).join('');
  wrap.querySelectorAll('.remove-option-btn').forEach(b => b.addEventListener('click', () => removeOption(Number(b.dataset.idx))));
}

function renderCriteriaList() {
  const wrap = document.getElementById('criteria-list');
  if (compareState.criteria.length === 0) {
    wrap.innerHTML = '<span class="slider-hint">No criteria yet — what matters to you?</span>';
    return;
  }
  wrap.innerHTML = compareState.criteria.map((c, i) => `
    <div class="criteria-chip">
      <span class="crit-name">${escapeHtml(c.name)}</span>
      <input type="range" min="1" max="5" value="${c.weight}" data-idx="${i}" class="crit-weight-slider">
      <span class="crit-weight-val">${c.weight}</span>
      <button data-idx="${i}" class="remove-crit-btn" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
  wrap.querySelectorAll('.crit-weight-slider').forEach(s => s.addEventListener('input', () => {
    const idx = Number(s.dataset.idx);
    compareState.criteria[idx].weight = Number(s.value);
    s.nextElementSibling.textContent = s.value;
    renderMatrix();
  }));
  wrap.querySelectorAll('.remove-crit-btn').forEach(b => b.addEventListener('click', () => removeCriteria(Number(b.dataset.idx))));
}

function renderMatrix() {
  const wrap = document.getElementById('matrix-wrap');
  const empty = document.getElementById('matrix-empty');
  const resultBox = document.getElementById('matrix-result');

  if (compareState.options.length < 2 || compareState.criteria.length < 1) {
    wrap.innerHTML = '';
    wrap.appendChild(empty);
    empty.classList.remove('hidden');
    resultBox.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');

  let html = '<table class="matrix-table"><thead><tr><th>Option</th>';
  compareState.criteria.forEach(c => { html += `<th>${escapeHtml(c.name)} (w${c.weight})</th>`; });
  html += '</tr></thead><tbody>';

  compareState.options.forEach((opt, oi) => {
    html += `<tr><td>${escapeHtml(opt)}</td>`;
    compareState.criteria.forEach((c, ci) => {
      if (!compareState.ratings[oi]) compareState.ratings[oi] = {};
      if (compareState.ratings[oi][ci] === undefined) compareState.ratings[oi][ci] = 5;
      const val = compareState.ratings[oi][ci];
      html += `<td><div class="cell-rating">
        <input type="range" min="1" max="10" value="${val}" data-oi="${oi}" data-ci="${ci}" class="rating-slider">
        <span class="cell-val" data-cell-val="${oi}-${ci}">${val}</span>
      </div></td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;

  wrap.querySelectorAll('.rating-slider').forEach(s => {
    s.addEventListener('input', () => {
      const oi = Number(s.dataset.oi), ci = Number(s.dataset.ci);
      compareState.ratings[oi][ci] = Number(s.value);
      wrap.querySelector(`[data-cell-val="${oi}-${ci}"]`).textContent = s.value;
      computeWinner();
    });
  });

  computeWinner();
}

function computeWinner() {
  const resultBox = document.getElementById('matrix-result');
  if (compareState.options.length < 2 || compareState.criteria.length < 1) {
    resultBox.classList.add('hidden');
    return;
  }
  const totalWeight = compareState.criteria.reduce((s, c) => s + c.weight, 0) || 1;
  const scores = compareState.options.map((opt, oi) => {
    let weighted = 0;
    compareState.criteria.forEach((c, ci) => {
      const rating = (compareState.ratings[oi] && compareState.ratings[oi][ci]) || 5;
      weighted += rating * c.weight;
    });
    const score = Math.round((weighted / (totalWeight * 10)) * 100);
    return { opt, score };
  }).sort((a, b) => b.score - a.score);

  resultBox.classList.remove('hidden');
  const winner = scores[0];
  document.getElementById('winner-card').innerHTML =
    `<i class="fa-solid fa-trophy"></i> <div><div>${escapeHtml(winner.opt)}</div>
     <div style="font-size:.85rem;color:var(--text-faint);font-weight:600;">Weighted score: ${winner.score}/100</div></div>`;

  const maxScore = Math.max(...scores.map(s => s.score), 1);
  document.getElementById('ranking-bars').innerHTML = scores.map(s => `
    <div class="rank-row">
      <span class="rank-name">${escapeHtml(s.opt)}</span>
      <div class="rank-track"><div class="rank-fill" style="width:${(s.score / maxScore) * 100}%"></div></div>
      <span class="rank-score">${s.score}</span>
    </div>
  `).join('');
}

/* ==========================================================================
   QUICK DECIDE TOOLKIT
   ========================================================================== */
function initQuickDecide() {
  initCoinFlip();
  initWheel();
  initGutCheck();
}

function initCoinFlip() {
  const coin = document.getElementById('coin');
  const btn = document.getElementById('flip-coin-btn');
  const resultEl = document.getElementById('coin-result');
  let flipping = false;
  btn.addEventListener('click', () => {
    if (flipping) return;
    flipping = true;
    resultEl.textContent = '';
    coin.classList.remove('flipping', 'show-tails');
    void coin.offsetWidth; // reflow
    const isTails = Math.random() < 0.5;
    coin.classList.add(isTails ? 'show-tails' : 'flipping');
    btn.disabled = true;
    setTimeout(() => {
      resultEl.innerHTML = isTails
        ? '<i class="fa-solid fa-circle-check"></i> Tails! Go with option two.'
        : '<i class="fa-solid fa-circle-check"></i> Heads! Go with option one.';
      btn.disabled = false;
      flipping = false;
    }, 1650);
  });
}

let wheelOptions = [];
function initWheel() {
  const input = document.getElementById('wheel-option-input');
  const listEl = document.getElementById('wheel-list');
  const spinBtn = document.getElementById('spin-wheel-btn');
  const resultEl = document.getElementById('wheel-result');

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      wheelOptions.push(val);
      input.value = '';
      renderWheelList();
    }
  });

  function renderWheelList() {
    if (wheelOptions.length === 0) {
      listEl.innerHTML = '<li class="wheel-empty">Add two or more options above.</li>';
      return;
    }
    listEl.innerHTML = wheelOptions.map((opt, i) =>
      `<li data-idx="${i}"><span>${escapeHtml(opt)}</span><button data-idx="${i}" class="remove-wheel-btn" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button></li>`
    ).join('');
    listEl.querySelectorAll('.remove-wheel-btn').forEach(b => b.addEventListener('click', () => {
      wheelOptions.splice(Number(b.dataset.idx), 1);
      renderWheelList();
    }));
  }
  renderWheelList();

  spinBtn.addEventListener('click', () => {
    if (wheelOptions.length < 2) {
      resultEl.textContent = 'Add at least two options first.';
      return;
    }
    resultEl.textContent = '';
    spinBtn.disabled = true;
    const items = listEl.querySelectorAll('li');
    let cycles = 0;
    const maxCycles = 18 + Math.floor(Math.random() * 8);
    let currentIdx = 0;
    const interval = setInterval(() => {
      items.forEach(li => li.classList.remove('picked'));
      currentIdx = (currentIdx + 1) % items.length;
      items[currentIdx].classList.add('picked');
      cycles++;
      if (cycles >= maxCycles) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * wheelOptions.length);
        items.forEach(li => li.classList.remove('picked'));
        items[finalIdx].classList.add('picked');
        resultEl.innerHTML = `<i class="fa-solid fa-star"></i> Chosen: ${escapeHtml(wheelOptions[finalIdx])}`;
        spinBtn.disabled = false;
      }
    }, 110);
  });
}

function initGutCheck() {
  const btn = document.getElementById('gut-check-btn');
  const timerEl = document.getElementById('gut-timer');
  const resultEl = document.getElementById('gut-result');

  btn.addEventListener('click', () => {
    const a = document.getElementById('gut-option-a').value.trim() || 'Option A';
    const b = document.getElementById('gut-option-b').value.trim() || 'Option B';
    resultEl.innerHTML = '';
    btn.disabled = true;
    let count = 5;
    timerEl.textContent = count;
    const interval = setInterval(() => {
      count--;
      timerEl.classList.add('pulse');
      setTimeout(() => timerEl.classList.remove('pulse'), 150);
      if (count > 0) {
        timerEl.textContent = count;
      } else {
        clearInterval(interval);
        timerEl.textContent = '0';
        resultEl.innerHTML = `<i class="fa-solid fa-bell"></i> Time's up! Which came to mind first —
          <button class="btn btn-small btn-secondary gut-pick-btn" data-pick="${escapeHtml(a)}">${escapeHtml(a)}</button>
          or
          <button class="btn btn-small btn-secondary gut-pick-btn" data-pick="${escapeHtml(b)}">${escapeHtml(b)}</button>?`;
        resultEl.querySelectorAll('.gut-pick-btn').forEach(pb => pb.addEventListener('click', () => {
          resultEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Your gut says: <strong>${pb.dataset.pick}</strong>. Trust it.`;
        }));
        btn.disabled = false;
      }
    }, 1000);
  });
}

/* ==========================================================================
   DECISION JOURNAL (RESTful Table API)
   ========================================================================== */
let journalData = [];
let journalFilter = 'All';

function initJournal() {
  document.getElementById('refresh-journal-btn').addEventListener('click', loadJournal);
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      journalFilter = chip.dataset.filter;
      renderJournal();
    });
  });
  loadJournal();
}

async function loadJournal() {
  try {
    const res = await fetch('tables/decisions?sort=-created_at&limit=100');
    const json = await res.json();
    journalData = (json.data || []).filter(d => !d.deleted);
    renderJournal();
  } catch (e) {
    console.error('Failed to load journal', e);
  }
}

function renderJournal() {
  const list = document.getElementById('journal-list');
  const filtered = journalFilter === 'All' ? journalData : journalData.filter(d => d.status === journalFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<p class="journal-empty">No decisions found. Complete a Readiness Assessment above and save it here.</p>';
    return;
  }

  const scoreColor = s => s >= 80 ? '#35d19c' : s >= 60 ? '#22d3c4' : s >= 35 ? '#ffb545' : '#ff5d7a';

  list.innerHTML = filtered.map(d => `
    <article class="journal-card" data-id="${d.id}">
      <div class="jc-top">
        <span class="jc-title">${escapeHtml(d.title || 'Untitled')}</span>
        <span class="jc-score" style="color:${scoreColor(d.confidence_score || 0)}">${d.confidence_score ?? '—'}</span>
      </div>
      <div class="jc-meta">
        <span class="jc-tag">${escapeHtml(d.category || 'Other')}</span>
        <span class="jc-tag">${escapeHtml(d.status || 'Open')}</span>
        <span class="jc-tag">${d.reversible ? 'Two-way door' : 'One-way door'}</span>
      </div>
      <p class="jc-verdict">${escapeHtml(d.verdict || '')}</p>
      <span class="jc-date">${d.created_at ? new Date(d.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
    </article>
  `).join('');

  list.querySelectorAll('.journal-card').forEach(card => {
    card.addEventListener('click', () => openDecisionModal(card.dataset.id));
  });
}

/* ==========================================================================
   DECISION DETAIL MODAL
   ========================================================================== */
function initModal() {
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('decision-modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'decision-modal-overlay') closeModal();
  });
}

function closeModal() {
  document.getElementById('decision-modal-overlay').classList.add('hidden');
}

function openDecisionModal(id) {
  const d = journalData.find(x => x.id === id);
  if (!d) return;

  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <h3>${escapeHtml(d.title || 'Untitled')}</h3>
    <div class="modal-field">
      <label>Confidence Score</label>
      <div class="modal-field-value">${d.confidence_score ?? '—'} / 100 — ${escapeHtml(d.verdict || '')}</div>
    </div>
    <div class="modal-field">
      <label>Signals</label>
      <div class="modal-field-value">Risk Tolerance ${d.risk_tolerance} · Impact ${d.impact_magnitude} · Info ${d.information_sufficiency} · ${d.reversible ? 'Reversible' : 'Irreversible'}</div>
    </div>
    <div class="modal-field">
      <label>Status</label>
      <select class="modal-status-select" id="modal-status">
        <option value="Open" ${d.status === 'Open' ? 'selected' : ''}>Open</option>
        <option value="Decided" ${d.status === 'Decided' ? 'selected' : ''}>Decided</option>
        <option value="Reviewed" ${d.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
      </select>
    </div>
    <div class="modal-field">
      <label>Chosen Option</label>
      <input type="text" class="modal-textarea" id="modal-chosen" value="${escapeHtml(d.chosen_option || '')}" placeholder="What did you decide?">
    </div>
    <div class="modal-field">
      <label>Notes</label>
      <textarea class="modal-textarea" id="modal-notes" rows="3" placeholder="Any context worth remembering?">${escapeHtml(d.notes || '')}</textarea>
    </div>
    <div class="modal-field">
      <label>Outcome / Reflection</label>
      <textarea class="modal-textarea" id="modal-outcome" rows="3" placeholder="How did it turn out? What would you do differently?">${escapeHtml(d.outcome || '')}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="modal-save-btn"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>
      <button class="btn btn-ghost" id="modal-delete-btn"><i class="fa-solid fa-trash"></i> Delete</button>
    </div>
  `;

  document.getElementById('modal-save-btn').addEventListener('click', () => saveDecisionEdits(d.id));
  document.getElementById('modal-delete-btn').addEventListener('click', () => deleteDecision(d.id));

  document.getElementById('decision-modal-overlay').classList.remove('hidden');
}

async function saveDecisionEdits(id) {
  const payload = {
    status: document.getElementById('modal-status').value,
    chosen_option: document.getElementById('modal-chosen').value,
    notes: document.getElementById('modal-notes').value,
    outcome: document.getElementById('modal-outcome').value
  };
  try {
    const res = await fetch(`tables/decisions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Update failed');
    closeModal();
    loadJournal();
  } catch (e) {
    alert('Could not save changes. Please try again.');
  }
}

async function deleteDecision(id) {
  if (!confirm('Delete this decision from your journal? This cannot be undone.')) return;
  try {
    const res = await fetch(`tables/decisions/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Delete failed');
    closeModal();
    loadJournal();
  } catch (e) {
    alert('Could not delete this entry. Please try again.');
  }
}

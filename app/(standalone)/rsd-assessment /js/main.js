/**
 * RSD Reality Check — UI wiring: form handling, results rendering,
 * history persistence via the RESTful Table API, and small UX helpers.
 */
(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  const TABLE = 'assessments';

  // ---------- Elements ----------
  const form = document.getElementById('rsd-form');
  const messageInput = document.getElementById('message-input');
  const contextInput = document.getElementById('context-input');
  const intensitySlider = document.getElementById('intensity-slider');
  const intensityValue = document.getElementById('intensity-value');
  const intensityLabelEl = document.getElementById('intensity-label');
  const waitToggle = document.getElementById('wait-toggle');
  const messageGroup = messageInput.closest('.form-group');

  const resultsSection = document.getElementById('results-section');
  const waitRecommendationEl = document.getElementById('wait-recommendation');
  const interpretationsGrid = document.getElementById('interpretations-grid');
  const scriptPanels = document.getElementById('script-panels');
  const toneTabs = document.getElementById('tone-tabs');
  const saveBtn = document.getElementById('save-assessment-btn');
  const newBtn = document.getElementById('new-assessment-btn');
  const saveStatus = document.getElementById('save-status');

  const historyList = document.getElementById('history-list');
  const historyModal = document.getElementById('history-modal');
  const historyModalContent = document.getElementById('history-modal-content');
  const historyModalClose = document.getElementById('history-modal-close');
  const toast = document.getElementById('toast');

  let currentResult = null; // holds last generated assessment payload for saving

  // ---------- Slider readout ----------
  function updateIntensityReadout() {
    const v = intensitySlider.value;
    intensityValue.textContent = v;
    intensityLabelEl.textContent = RSDEngine.intensityLabel(v);
  }
  intensitySlider.addEventListener('input', updateIntensityReadout);
  updateIntensityReadout();

  // ---------- Toast ----------
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // ---------- Form submit ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const message = messageInput.value.trim();

    if (!message) {
      messageGroup.classList.add('has-error');
      messageInput.focus();
      return;
    }
    messageGroup.classList.remove('has-error');

    const context = contextInput.value.trim();
    const intensity = Number(intensitySlider.value);
    const suggestWait = waitToggle.checked;

    const interpretations = RSDEngine.generateInterpretations(message, context);
    const scripts = RSDEngine.generateScripts(message, context, intensity);
    const wait = RSDEngine.recommendWait(intensity, suggestWait);

    currentResult = {
      message, context, intensity, suggest_wait: suggestWait,
      interpretations: interpretations.map(i => `${i.title}: ${i.text}`),
      reply_neutral: scripts.neutral,
      reply_warm: scripts.warm,
      reply_firm: scripts.firm,
      wait_recommendation: wait.headline,
      wait_detail: wait.detail,
      title: message.length > 60 ? message.slice(0, 60).trim() + '…' : message
    };

    renderResults(currentResult, interpretations, scripts, wait);
    saveStatus.textContent = '';
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save to History';

    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---------- Render results ----------
  function renderResults(result, interpretations, scripts, wait) {
    // Wait card
    waitRecommendationEl.innerHTML = `
      <i class="fa-solid fa-hourglass-half wait-icon"></i>
      <div>
        <h4>${escapeHtml(wait.headline)}</h4>
        <p>${escapeHtml(wait.detail)}</p>
      </div>
    `;

    // Interpretations
    interpretationsGrid.innerHTML = interpretations.map((it, idx) => `
      <div class="interpretation-card">
        <h4><i class="fa-solid fa-circle-${idx + 1}"></i> ${escapeHtml(it.title)}</h4>
        <p>${escapeHtml(it.text)}</p>
      </div>
    `).join('');

    // Scripts panels
    const toneMeta = {
      neutral: { label: 'Neutral', icon: 'fa-scale-balanced', text: scripts.neutral },
      warm: { label: 'Warm', icon: 'fa-heart', text: scripts.warm },
      firm: { label: 'Firm', icon: 'fa-hand-fist', text: scripts.firm }
    };
    scriptPanels.innerHTML = Object.entries(toneMeta).map(([tone, meta], idx) => `
      <div class="script-panel ${idx === 0 ? 'active' : ''}" data-tone-panel="${tone}">
        <p class="script-tone-label"><i class="fa-solid ${meta.icon}"></i> ${meta.label} reply</p>
        <textarea readonly rows="4">${escapeHtml(meta.text)}</textarea>
        <button class="btn btn-ghost copy-btn" data-copy-tone="${tone}"><i class="fa-solid fa-copy"></i> Copy ${meta.label} Reply</button>
      </div>
    `).join('');

    // Reset tabs
    toneTabs.querySelectorAll('.tone-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tone === 'neutral');
    });

    // Wire copy buttons
    scriptPanels.querySelectorAll('[data-copy-tone]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tone = btn.dataset.copyTone;
        copyToClipboard(toneMeta[tone].text);
      });
    });
  }

  // Tone tab switching
  toneTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tone-tab');
    if (!btn) return;
    toneTabs.querySelectorAll('.tone-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tone = btn.dataset.tone;
    scriptPanels.querySelectorAll('.script-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.tonePanel === tone);
    });
  });

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast('Copied to clipboard!'),
        () => fallbackCopy(text)
      );
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Copied to clipboard!'); }
    catch (e) { showToast('Copy failed — please select the text manually.'); }
    document.body.removeChild(ta);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---------- Save to history ----------
  saveBtn.addEventListener('click', async () => {
    if (!currentResult) return;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…';
    try {
      const res = await fetch(`tables/${TABLE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentResult)
      });
      if (!res.ok) throw new Error('Save failed');
      saveStatus.textContent = 'Saved! Check your history below.';
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
      loadHistory();
    } catch (err) {
      saveStatus.textContent = '';
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save to History';
      showToast('Could not save — please try again.');
    }
  });

  newBtn.addEventListener('click', () => {
    form.reset();
    intensitySlider.value = 5;
    waitToggle.checked = true;
    updateIntensityReadout();
    resultsSection.hidden = true;
    currentResult = null;
    document.getElementById('assessment-form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---------- History ----------
  const INTENSITY_COLORS = (v) => {
    if (v <= 3) return '#38d9c9';
    if (v <= 6) return '#ffb454';
    if (v <= 8) return '#ff8f6b';
    return '#ff5c5c';
  };

  async function loadHistory() {
    historyList.innerHTML = '<p class="history-empty">Loading your history…</p>';
    try {
      const res = await fetch(`tables/${TABLE}?sort=-created_at&limit=50`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      const rows = (json.data || []).filter(r => !r.deleted);
      if (rows.length === 0) {
        historyList.innerHTML = '<p class="history-empty"><i class="fa-solid fa-inbox"></i> No assessments saved yet. Complete a Reality Check above and save it to see it here.</p>';
        return;
      }
      historyList.innerHTML = rows.map(r => historyItemHtml(r)).join('');

      historyList.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.closest('.history-delete')) return;
          openHistoryModal(el.dataset.id, rows);
        });
      });
      historyList.querySelectorAll('.history-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteHistoryItem(btn.dataset.id);
        });
      });
    } catch (err) {
      historyList.innerHTML = '<p class="history-empty">Could not load history right now. Please refresh to try again.</p>';
    }
  }

  function historyItemHtml(r) {
    const date = r.created_at ? new Date(r.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    const color = INTENSITY_COLORS(r.intensity || 0);
    const title = r.title || (r.message ? r.message.slice(0, 60) : 'Untitled assessment');
    return `
      <div class="history-item" data-id="${r.id}">
        <div class="history-intensity" style="background:${color}">${r.intensity ?? '-'}</div>
        <div class="history-main">
          <p class="history-title">${escapeHtml(title)}</p>
          <div class="history-meta">
            <span><i class="fa-regular fa-clock"></i> ${date}</span>
            <span><i class="fa-solid fa-hourglass-half"></i> ${escapeHtml(r.wait_recommendation || '')}</span>
          </div>
        </div>
        <button class="history-delete" data-id="${r.id}" aria-label="Delete assessment"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
  }

  function openHistoryModal(id, rows) {
    const r = rows.find(x => x.id === id);
    if (!r) return;
    let interp = r.interpretations;
    if (typeof interp === 'string') {
      try { interp = JSON.parse(interp); } catch (e) { interp = [interp]; }
    }
    if (!Array.isArray(interp)) interp = [];

    historyModalContent.innerHTML = `
      <h3 style="margin-top:0;"><i class="fa-solid fa-comment-dots"></i> ${escapeHtml(r.title || 'Assessment')}</h3>
      <p style="color:var(--ink-soft);font-size:.85rem;">${r.created_at ? new Date(r.created_at).toLocaleString() : ''} &middot; Intensity ${r.intensity}/10</p>
      <p><strong>Message:</strong><br>${escapeHtml(r.message || '')}</p>
      ${r.context ? `<p><strong>Context:</strong><br>${escapeHtml(r.context)}</p>` : ''}
      <div class="wait-card" style="margin:1.2rem 0;">
        <i class="fa-solid fa-hourglass-half wait-icon"></i>
        <div><h4>${escapeHtml(r.wait_recommendation || '')}</h4><p>${escapeHtml(r.wait_detail || '')}</p></div>
      </div>
      <h4><i class="fa-solid fa-glasses"></i> Perspectives</h4>
      <ul>${interp.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
      <h4><i class="fa-solid fa-message"></i> Reply scripts</h4>
      <p><strong>Neutral:</strong> ${escapeHtml(r.reply_neutral || '')}</p>
      <p><strong>Warm:</strong> ${escapeHtml(r.reply_warm || '')}</p>
      <p><strong>Firm:</strong> ${escapeHtml(r.reply_firm || '')}</p>
    `;
    historyModal.hidden = false;
  }

  historyModalClose.addEventListener('click', () => historyModal.hidden = true);
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.hidden = true;
  });

  async function deleteHistoryItem(id) {
    try {
      const res = await fetch(`tables/${TABLE}/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('delete failed');
      showToast('Assessment removed.');
      loadHistory();
    } catch (err) {
      showToast('Could not delete — please try again.');
    }
  }

  loadHistory();
})();

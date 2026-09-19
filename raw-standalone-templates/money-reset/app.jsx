// App shell — routes between landing, form steps, results, export.
// Persists inputs + view to localStorage.

const LS_INPUTS = 'moneyReset.inputs.v1';
const LS_VIEW   = 'moneyReset.view.v1';
const LS_PLAN   = 'moneyReset.plan.v1';

function loadFromLocalStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
}
function saveToLocalStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function App() {
  const [inputs, setInputsState] = React.useState(() =>
    loadFromLocalStorage(LS_INPUTS, MR_CALC.EMPTY_INPUTS)
  );
  const [view, setViewState] = React.useState(() =>
    loadFromLocalStorage(LS_VIEW, 'landing')
  );
  const [planView, setPlanViewState] = React.useState(() =>
    loadFromLocalStorage(LS_PLAN, 'free')
  );

  const setInputs = (next) => { setInputsState(next); saveToLocalStorage(LS_INPUTS, next); };
  const setView = (next) => { setViewState(next); saveToLocalStorage(LS_VIEW, next); };
  const setPlanView = (next) => { setPlanViewState(next); saveToLocalStorage(LS_PLAN, next); };

  const startForm = () => {
    // Reset to empty when starting fresh (only if we're jumping in from landing)
    if (JSON.stringify(inputs) === JSON.stringify(MR_CALC.SAMPLE_STRETCHED)) {
      // If sample was loaded, keep it; user might want to edit sample data
    }
    setView('step-1');
    window.scrollTo({ top: 0 });
  };

  const loadSample = () => {
    setInputs(MR_CALC.SAMPLE_STRETCHED);
    setView('results');
    window.scrollTo({ top: 0 });
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => { setInputs(MR_CALC.EMPTY_INPUTS); startForm(); }} onLoadSample={loadSample} />;
  }
  if (view.startsWith('step-')) {
    return (
      <MoneyResetForm
        view={view} setView={setView}
        inputs={inputs} setInputs={setInputs}
        onComplete={() => setView('results')}
      />
    );
  }
  if (view === 'results') {
    return (
      <ResultsDashboard
        inputs={inputs} setView={setView}
        planView={planView} setPlanView={setPlanView}
      />
    );
  }
  if (view === 'export') {
    return <ExportPage inputs={inputs} setView={setView} />;
  }
  // Fallback
  return <LandingPage onStart={startForm} onLoadSample={loadSample} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

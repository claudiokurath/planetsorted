'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface AutopilotInputs {
  monthly_income: number
  monthly_expenses: number
  current_savings: number
  debt_amount: number
  years_to_retirement: number
  risk_tolerance: number // 1 to 5
  automate_investments: boolean
}

interface PlanResult {
  savings_rate: number
  investment_allocation: number
  retirement_contribution: number
  surplus: number
  invest_amount: number
  leftover: number
  debt_payment: number
  savings_contribution: number
  payoffMonths: number | null
  dti: number
  emergency_target: number
  emergency_progress: number
  growthSeries: { year: number; value: number }[]
  has_debt: boolean
}

interface JournalEntry {
  id: string
  created_at: string
  output_text: string
}

const fmtUSD = (n: number) => {
  if (!isFinite(n)) return '$0'
  return '$' + Math.round(n).toLocaleString('en-US')
}

const fmtPct = (n: number) => `${Math.round(n * 1000) / 10}%`

function computePlan(inputs: AutopilotInputs): PlanResult {
  const {
    monthly_income,
    monthly_expenses,
    current_savings,
    debt_amount,
    years_to_retirement,
    risk_tolerance,
    automate_investments,
  } = inputs

  const savings_rate =
    monthly_income > 0 ? Math.max(0, (monthly_income - monthly_expenses) / monthly_income) : 0

  const investment_allocation = risk_tolerance < 3 ? 0.3 : 0.7

  const retirement_contribution =
    years_to_retirement < 10 ? monthly_income * 0.2 : monthly_income * 0.1

  const raw_surplus = monthly_income - monthly_expenses
  const surplus = Math.max(0, raw_surplus)

  const invest_amount = automate_investments ? surplus * investment_allocation : 0
  const leftover = surplus - invest_amount

  const has_debt = debt_amount > 0
  const debt_share = has_debt ? 0.7 : 0
  const savings_share = 1 - debt_share

  const debt_payment = leftover * debt_share
  const savings_contribution = leftover * savings_share

  let payoffMonths: number | null = null
  if (debt_amount > 0 && debt_payment > 0) {
    payoffMonths = Math.ceil(debt_amount / debt_payment)
  }

  const annual_income = monthly_income * 12
  const dti = annual_income > 0 ? debt_amount / annual_income : 0

  const emergency_target = monthly_expenses * 6
  const emergency_progress =
    emergency_target > 0
      ? Math.min(1, current_savings / emergency_target)
      : current_savings > 0
      ? 1
      : 0

  const ANNUAL_RETURN = 0.07
  const monthlyRate = ANNUAL_RETURN / 12
  const growthSeries: { year: number; value: number }[] = []
  let balance = current_savings
  const yearsToPlot = Math.min(years_to_retirement, 40) || 1

  for (let y = 0; y <= yearsToPlot; y++) {
    growthSeries.push({ year: y, value: Math.round(balance) })
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + retirement_contribution
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
    has_debt,
  }
}

export function FinancialAutopilotApp() {
  const supabase = useMemo(() => createBrowserClient(), [])
  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [inputs, setInputs] = useState<AutopilotInputs>({
    monthly_income: 5000,
    monthly_expenses: 3200,
    current_savings: 10000,
    debt_amount: 4000,
    years_to_retirement: 25,
    risk_tolerance: 3,
    automate_investments: true,
  })

  const [plan, setPlan] = useState<PlanResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [history, setHistory] = useState<JournalEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null)
      setAuthChecked(true)
    })
  }, [supabase])

  const fetchHistory = useCallback(async () => {
    if (!userId) return
    setHistoryLoading(true)
    const { data } = await supabase
      .from('tool_runs')
      .select('id, created_at, output_text')
      .eq('tool_slug', 'financial-autopilot')
      .order('created_at', { ascending: false })
      .limit(30)
    setHistory((data as JournalEntry[]) ?? [])
    setHistoryLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    if (userId) fetchHistory()
  }, [userId, fetchHistory])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = computePlan(inputs)
    setPlan(res)
    setSavedSuccess(false)

    if (!userId) return
    setSaving(true)
    try {
      const summary = JSON.stringify({
        income: inputs.monthly_income,
        savings_rate: res.savings_rate,
        surplus: res.surplus,
        retirement_monthly: res.retirement_contribution,
        dti: res.dti,
      })

      const { data: req } = await supabase
        .from('tool_requests')
        .insert({
          user_id: userId,
          keyword: 'FINANCIAL',
          input_text: JSON.stringify(inputs),
          channel: 'web',
          status: 'completed',
        })
        .select('id')
        .single()

      if (req) {
        await supabase.from('tool_runs').insert({
          tool_request_id: req.id,
          tool_slug: 'financial-autopilot',
          model: 'engine-v1',
          output_text: summary,
          success: true,
          latency_ms: 0,
        })
        setSavedSuccess(true)
        await fetchHistory()
      }
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteHistory = async (id: string) => {
    await supabase.from('tool_runs').delete().eq('id', id)
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <>
      <style>{`
        .fa-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: #22d3c4; cursor: pointer;
          box-shadow: 0 0 0 3px rgba(34,211,196,0.25); transition: box-shadow .15s;
        }
        .fa-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #22d3c4; border: none; cursor: pointer;
        }
        .glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); }
        @keyframes fa-fade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .fa-fade { animation: fa-fade .35s ease both; }
      `}</style>

      <div
        className="min-h-screen text-white"
        style={{ background: 'radial-gradient(ellipse 120% 60% at 50% 0%, #061826 0%, #030a14 60%, #02060a 100%)' }}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(6,24,38,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg,#22d3c4,#8b7bff)' }}>
                <span>🛤️</span>
              </span>
              <span className="font-bold tracking-tight text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Financial <span style={{ color: '#22d3c4' }}>Autopilot</span>
              </span>
            </div>
            <div className="hidden gap-6 text-sm font-medium text-slate-400 md:flex">
              <a href="#inputs" className="hover:text-white transition">Planner</a>
              <a href="#results" className="hover:text-white transition">Results</a>
              <a href="#history" className="hover:text-white transition">History</a>
            </div>
            <a
              href="#inputs"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:opacity-90"
              style={{ background: 'linear-gradient(90deg,#22d3c4,#8b7bff)' }}
            >
              ⚡ Autopilot Plan
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="py-16 md:py-24 grid gap-12 md:grid-cols-2 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{ borderColor: 'rgba(34,211,196,0.3)', background: 'rgba(34,211,196,0.05)', color: '#22d3c4' }}>
                ✨ Spend Smart · Personal Finance System
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                Put Your Money on{' '}
                <span style={{ background: 'linear-gradient(90deg,#22d3c4,#8b7bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Autopilot
                </span>
              </h1>
              <p className="mt-5 text-lg text-slate-400 max-w-lg">
                Automate your financial future. Personalised strategies, effortless execution, and a clear plan for savings, debt payoff, and retirement — all on autopilot.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#inputs" className="rounded-full px-6 py-3 font-bold text-slate-900 shadow-lg transition hover:opacity-90" style={{ background: 'linear-gradient(90deg,#22d3c4,#8b7bff)' }}>
                  🚀 Start My Plan
                </a>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4">Autopilot Snapshot</p>
              {plan ? (
                <div className="fa-fade space-y-4">
                  <p className="text-5xl font-black text-cyan-400">
                    {fmtPct(plan.savings_rate)}
                  </p>
                  <p className="text-sm font-semibold text-slate-300">
                    Savings Rate ({fmtUSD(plan.surplus)} monthly surplus)
                  </p>
                </div>
              ) : (
                <div className="py-12 text-slate-500 text-sm">
                  Enter your numbers below to generate your autopilot plan.
                </div>
              )}
            </div>
          </section>

          {/* Form */}
          <section id="inputs" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#22d3c4' }}>Step 1</p>
              <h2 className="text-3xl font-black sm:text-4xl">Tell Us About Your Money</h2>
              <p className="mt-2 text-slate-400">Enter your figures — calculated instantly and saved to your account.</p>
            </div>

            <form onSubmit={handleGenerate} className="glass rounded-3xl p-6 md:p-10 grid md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-white mb-4">💳 Financial Snapshot</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monthly Income (after taxes)</label>
                  <input
                    type="number" min={0} step={100}
                    value={inputs.monthly_income || ''}
                    onChange={(e) => setInputs({ ...inputs, monthly_income: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    placeholder="e.g. 5000" required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monthly Expenses</label>
                  <input
                    type="number" min={0} step={100}
                    value={inputs.monthly_expenses || ''}
                    onChange={(e) => setInputs({ ...inputs, monthly_expenses: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    placeholder="e.g. 3200" required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Total Savings</label>
                  <input
                    type="number" min={0} step={500}
                    value={inputs.current_savings || ''}
                    onChange={(e) => setInputs({ ...inputs, current_savings: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    placeholder="e.g. 10000" required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Total Debt Amount</label>
                  <input
                    type="number" min={0} step={500}
                    value={inputs.debt_amount || ''}
                    onChange={(e) => setInputs({ ...inputs, debt_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    placeholder="e.g. 4000" required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Years Until Retirement</label>
                  <input
                    type="number" min={1} max={60} step={1}
                    value={inputs.years_to_retirement || ''}
                    onChange={(e) => setInputs({ ...inputs, years_to_retirement: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    placeholder="e.g. 25" required
                  />
                </div>
              </div>

              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-white mb-4">⚙️ Autopilot Preferences</h3>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-300">Risk Tolerance</span>
                      <span className="text-cyan-400">{inputs.risk_tolerance} ({inputs.risk_tolerance < 3 ? 'Conservative' : 'Aggressive'})</span>
                    </div>
                    <input
                      type="range" min={1} max={5} value={inputs.risk_tolerance}
                      onChange={(e) => setInputs({ ...inputs, risk_tolerance: Number(e.target.value) })}
                      className="fa-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #22d3c4 ${((inputs.risk_tolerance - 1) / 4) * 100}%, rgba(255,255,255,0.1) ${((inputs.risk_tolerance - 1) / 4) * 100}%)` }}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Automate Investments</p>
                      <p className="text-xs text-slate-400">Auto-route surplus into investments monthly.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInputs({ ...inputs, automate_investments: !inputs.automate_investments })}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${inputs.automate_investments ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                    >
                      {inputs.automate_investments ? '✓ Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-full py-4 font-bold text-slate-900 shadow-lg transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(90deg,#22d3c4,#8b7bff)' }}
                  >
                    {saving ? 'Generating Plan…' : '✨ Generate My Autopilot Plan'}
                  </button>
                  {savedSuccess && <p className="text-center text-xs text-emerald-400">✓ Plan saved to history</p>}
                </div>
              </div>
            </form>
          </section>

          {/* Results */}
          {plan && (
            <section id="results" className="py-14 border-t fa-fade" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-center mb-10">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#8b7bff' }}>Step 2</p>
                <h2 className="text-3xl font-black sm:text-4xl">Your Automated System</h2>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Savings Rate</p>
                  <p className="text-3xl font-black text-cyan-400">{fmtPct(plan.savings_rate)}</p>
                  <p className="text-xs text-slate-400 mt-1">of monthly income</p>
                </div>
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Monthly Surplus</p>
                  <p className="text-3xl font-black text-emerald-400">{fmtUSD(plan.surplus)}</p>
                  <p className="text-xs text-slate-400 mt-1">available to automate</p>
                </div>
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Debt-to-Income</p>
                  <p className="text-3xl font-black text-amber-400">{fmtPct(plan.dti)}</p>
                  <p className="text-xs text-slate-400 mt-1">annual ratio</p>
                </div>
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Retirement Target</p>
                  <p className="text-3xl font-black text-violet-400">{fmtUSD(plan.retirement_contribution)}</p>
                  <p className="text-xs text-slate-400 mt-1">per month</p>
                </div>
              </div>

              {/* Allocation & Payoff Breakdown */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass rounded-3xl p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">📊 Monthly Surplus Allocation</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b border-white/10">
                      <span className="text-slate-300">Investments ({Math.round(plan.investment_allocation * 100)}%)</span>
                      <span className="font-mono font-bold text-cyan-400">{fmtUSD(plan.invest_amount)}</span>
                    </div>
                    {plan.has_debt && (
                      <div className="flex justify-between text-sm py-2 border-b border-white/10">
                        <span className="text-slate-300">Auto Debt Payment</span>
                        <span className="font-mono font-bold text-amber-400">{fmtUSD(plan.debt_payment)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm py-2">
                      <span className="text-slate-300">Emergency &amp; Liquid Savings</span>
                      <span className="font-mono font-bold text-emerald-400">{fmtUSD(plan.savings_contribution)}</span>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-3xl p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">🔥 Debt &amp; Emergency Targets</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300">Emergency Fund Target ({fmtUSD(plan.emergency_target)})</span>
                        <span className="text-emerald-400 font-bold">{Math.round(plan.emergency_progress * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${plan.emergency_progress * 100}%` }}></div>
                      </div>
                    </div>

                    {plan.has_debt && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-slate-400">Total Debt: <span className="text-white font-bold">{fmtUSD(inputs.debt_amount)}</span></p>
                        <p className="text-xs text-slate-400 mt-1">Est. Payoff Time: <span className="text-amber-400 font-bold">{plan.payoffMonths ? `${plan.payoffMonths} months` : '—'}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* History */}
          {userId && (
            <section id="history" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#22d3c4' }}>Saved Systems</p>
                  <h2 className="text-3xl font-black">History Log</h2>
                </div>
                <button onClick={fetchHistory} className="text-xs text-slate-500 hover:text-white transition">↻ Refresh</button>
              </div>

              {historyLoading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : history.length === 0 ? (
                <p className="glass rounded-2xl p-6 text-sm text-slate-500">No plans saved yet — generate a plan above.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => {
                    let income = '—', surplus = '—', savings_rate = '—'
                    try {
                      const p = JSON.parse(item.output_text)
                      income = p.income ? fmtUSD(p.income) : '—'
                      surplus = p.surplus ? fmtUSD(p.surplus) : '—'
                      savings_rate = p.savings_rate ? fmtPct(p.savings_rate) : '—'
                    } catch {}
                    return (
                      <div key={item.id} className="glass flex items-center justify-between gap-4 rounded-2xl px-5 py-4">
                        <div className="flex items-center gap-6 min-w-0 text-sm">
                          <span className="text-slate-500 shrink-0">
                            {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="font-bold text-white">Income: {income}</span>
                          <span className="text-cyan-400 font-semibold">Surplus: {surplus}</span>
                          <span className="text-slate-400 text-xs hidden md:inline">Rate: {savings_rate}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* Footer */}
          <footer className="border-t py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p>© 2026 PLANET SOR7ED · Financial Autopilot</p>
            <a href="/" className="hover:text-slate-400 transition">← Back to PLANET SOR7ED</a>
          </footer>
        </div>
      </div>
    </>
  )
}

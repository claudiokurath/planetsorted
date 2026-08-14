'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OptionItem {
  id: string
  name: string
}

interface CriterionItem {
  id: string
  name: string
  weight: number // 1-5
}

interface AssessmentInputs {
  title: string
  category: string
  risk_tolerance: number // 1-10
  impact_magnitude: number // 1-10
  information_sufficiency: number // 1-10
  reversibility: boolean // true = 2-way, false = 1-way
}

interface Verdict {
  tier: string
  color: string
  desc: string
}

interface AdviceItem {
  icon: string
  text: string
}

interface JournalEntry {
  id: string
  created_at: string
  output_text: string
}

const CATEGORIES = ['Career', 'Money & Purchases', 'Relationships', 'Health', 'Life Direction', 'Other']

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function computeConfidence(R: number, I: number, S: number, reversible: boolean) {
  const infoScore = S * 10
  const gap = R - I
  const fitScore = clamp(50 + gap * 5, 0, 100)
  const safetyScore = reversible ? 100 : clamp(100 - I * 8, 0, 100)
  const confidence = Math.round(0.45 * infoScore + 0.30 * fitScore + 0.25 * safetyScore)
  return { confidence: clamp(confidence, 0, 100), infoScore, fitScore, safetyScore }
}

function getVerdict(score: number): Verdict {
  if (score >= 80)
    return {
      tier: 'Green Light — Decide Now',
      color: '#35d19c',
      desc: 'You have enough clarity and margin for error. Further delay costs more than it helps — commit and move.',
    }
  if (score >= 60)
    return {
      tier: 'Lean In',
      color: '#22d3c4',
      desc: 'Your confidence is solid. Do one last gut check, set a decision deadline, and commit.',
    }
  if (score >= 35)
    return {
      tier: 'Proceed with Caution',
      color: '#ffb545',
      desc: 'You are not fully ready. Shore up the weakest signal below, run a small test if you can, then decide.',
    }
  return {
    tier: 'Pump the Brakes',
    color: '#ff5d7a',
    desc: 'The stakes and uncertainty are high right now. Slow down, gather more information, and reduce the downside before committing.',
  }
}

function generateAdvice(
  infoScore: number,
  fitScore: number,
  reversible: boolean,
  impact: number,
  confidence: number
): AdviceItem[] {
  const advice: AdviceItem[] = []
  if (infoScore < 55) {
    advice.push({
      icon: '🔍',
      text: 'Your information is thin. Spend focused time closing your single biggest unknown before deciding.',
    })
  }
  if (fitScore < 55) {
    advice.push({
      icon: '⚖️',
      text: 'The potential impact currently outweighs your comfort with risk. Look for ways to shrink the downside — trials, contracts, safety nets.',
    })
  }
  if (!reversible && impact >= 6) {
    advice.push({
      icon: '🔒',
      text: 'Because this is hard to undo, consider a smaller reversible test first, or ask someone who has made a similar call.',
    })
  }
  if (reversible && confidence < 60) {
    advice.push({
      icon: '🧪',
      text: 'Since you can adjust course later, a cheap, timely decision beats a perfect, delayed one — set a deadline and act.',
    })
  }
  if (advice.length === 0) {
    advice.push({
      icon: '✅',
      text: 'All four signals are aligned. Trust the analysis — write down your reasoning, then execute.',
    })
  }
  advice.push({
    icon: '📅',
    text: 'Set a hard decision deadline right now. Deadlines create the clarity that endless deliberation cannot.',
  })
  return advice
}

export function DecisionParalysisApp() {
  const supabase = useMemo(() => createBrowserClient(), [])
  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // ── Step 1: Assessment State ──
  const [assessment, setAssessment] = useState<AssessmentInputs>({
    title: '',
    category: 'Career',
    risk_tolerance: 5,
    impact_magnitude: 5,
    information_sufficiency: 5,
    reversibility: true,
  })

  const [assessmentResult, setAssessmentResult] = useState<{
    confidence: number
    verdict: Verdict
    advice: AdviceItem[]
  } | null>(null)

  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // ── Step 2: Compare Matrix State ──
  const [options, setOptions] = useState<OptionItem[]>([
    { id: 'opt1', name: 'Option A' },
    { id: 'opt2', name: 'Option B' },
  ])
  const [criteria, setCriteria] = useState<CriterionItem[]>([
    { id: 'crit1', name: 'Impact / Payoff', weight: 4 },
    { id: 'crit2', name: 'Ease / Low Effort', weight: 3 },
  ])
  const [matrixScores, setMatrixScores] = useState<Record<string, number>>({
    'opt1_crit1': 4,
    'opt1_crit2': 3,
    'opt2_crit1': 3,
    'opt2_crit2': 5,
  })

  const [newOptName, setNewOptName] = useState('')
  const [newCritName, setNewCritName] = useState('')

  // ── Step 3: Quick Tools State ──
  const [coinOpt1, setCoinOpt1] = useState('')
  const [coinOpt2, setCoinOpt2] = useState('')
  const [coinResult, setCoinResult] = useState<string | null>(null)
  const [coinFlipping, setCoinFlipping] = useState(false)

  const [t10_10_10_decision, setT10_10_10_decision] = useState('')
  const [t10m, setT10m] = useState('')
  const [t10mo, setT10mo] = useState('')
  const [t10y, setT10y] = useState('')

  // ── Journal State ──
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [journalLoading, setJournalLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null)
      setAuthChecked(true)
    })
  }, [supabase])

  const fetchJournal = useCallback(async () => {
    if (!userId) return
    setJournalLoading(true)
    const { data } = await supabase
      .from('tool_runs')
      .select('id, created_at, output_text')
      .eq('tool_slug', 'decision-paralysis-solver')
      .order('created_at', { ascending: false })
      .limit(30)
    setJournal((data as JournalEntry[]) ?? [])
    setJournalLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    if (!userId) return
    let ignore = false
    supabase
      .from('tool_runs')
      .select('id, created_at, output_text')
      .eq('tool_slug', 'decision-paralysis-solver')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (!ignore) {
          setJournal((data as JournalEntry[]) ?? [])
        }
      })
    return () => {
      ignore = true
    }
  }, [supabase, userId])

  // ── Assessment Handler ──
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const { confidence, infoScore, fitScore } = computeConfidence(
      assessment.risk_tolerance,
      assessment.impact_magnitude,
      assessment.information_sufficiency,
      assessment.reversibility
    )
    const verdict = getVerdict(confidence)
    const advice = generateAdvice(
      infoScore,
      fitScore,
      assessment.reversibility,
      assessment.impact_magnitude,
      confidence
    )
    setAssessmentResult({ confidence, verdict, advice })
    setSavedSuccess(false)
  }

  const handleSaveToJournal = async () => {
    if (!assessmentResult) return
    if (!userId) return

    setSaving(true)
    try {
      const summary = JSON.stringify({
        title: assessment.title || 'Untitled Decision',
        category: assessment.category,
        confidence: assessmentResult.confidence,
        verdict: assessmentResult.verdict.tier,
        reversibility: assessment.reversibility ? 'Two-Way Door' : 'One-Way Door',
      })

      const { data: req } = await supabase
        .from('tool_requests')
        .insert({
          user_id: userId,
          keyword: 'DECISION',
          input_text: JSON.stringify(assessment),
          channel: 'web',
          status: 'completed',
        })
        .select('id')
        .single()

      if (req) {
        await supabase.from('tool_runs').insert({
          tool_request_id: req.id,
          tool_slug: 'decision-paralysis-solver',
          model: 'engine-v1',
          output_text: summary,
          success: true,
          latency_ms: 0,
        })
        setSavedSuccess(true)
        await fetchJournal()
      }
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteJournal = async (id: string) => {
    await supabase.from('tool_runs').delete().eq('id', id)
    setJournal((prev) => prev.filter((item) => item.id !== id))
  }

  // ── Matrix calculations ──
  const matrixResults = useMemo(() => {
    if (options.length < 2 || criteria.length < 1) return null
    const scores: { option: OptionItem; total: number }[] = options.map((opt) => {
      let total = 0
      criteria.forEach((crit) => {
        const val = matrixScores[`${opt.id}_${crit.id}`] ?? 3
        total += val * crit.weight
      })
      return { option: opt, total }
    })
    scores.sort((a, b) => b.total - a.total)
    const maxPoss = criteria.reduce((sum, c) => sum + 5 * c.weight, 0)
    return { ranking: scores, maxPoss }
  }, [options, criteria, matrixScores])

  // ── Coin Flip ──
  const handleCoinFlip = () => {
    if (coinFlipping) return
    setCoinFlipping(true)
    setCoinResult(null)
    setTimeout(() => {
      const choice = Math.random() < 0.5 ? coinOpt1 || 'Option A' : coinOpt2 || 'Option B'
      setCoinResult(choice)
      setCoinFlipping(false)
    }, 600)
  }

  return (
    <>
      <style>{`
        .dps-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: #22d3c4; cursor: pointer;
          box-shadow: 0 0 0 3px rgba(34,211,196,0.25); transition: box-shadow .15s;
        }
        .dps-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #22d3c4; border: none; cursor: pointer;
        }
        .glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); }
        @keyframes dps-fade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .dps-fade { animation: dps-fade .35s ease both; }
      `}</style>

      <div
        className="min-h-screen text-white"
        style={{ background: 'radial-gradient(ellipse 120% 60% at 50% 0%, #061626 0%, #030912 60%, #020509 100%)' }}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(6,22,38,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg,#22d3c4,#8b7bff)' }}>
                <span>🧭</span>
              </span>
              <span className="font-bold tracking-tight text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Decision Paralysis <span style={{ color: '#22d3c4' }}>Solver</span>
              </span>
            </div>
            <div className="hidden gap-6 text-sm font-medium text-slate-400 md:flex">
              <a href="#assessment" className="hover:text-white transition">Assess</a>
              <a href="#compare" className="hover:text-white transition">Compare</a>
              <a href="#quick" className="hover:text-white transition">Quick Decide</a>
              <a href="#journal" className="hover:text-white transition">Journal</a>
            </div>
            <a
              href="#assessment"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:opacity-90"
              style={{ background: 'linear-gradient(90deg,#22d3c4,#8b7bff)' }}
            >
              ⚡ Assess Decision
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="py-16 md:py-24 grid gap-12 md:grid-cols-2 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{ borderColor: 'rgba(34,211,196,0.3)', background: 'rgba(34,211,196,0.05)', color: '#22d3c4' }}>
                ✨ Decision Science Engine
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                Break free from{' '}
                <span style={{ background: 'linear-gradient(90deg,#22d3c4,#8b7bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  decision paralysis
                </span>
              </h1>
              <p className="mt-5 text-lg text-slate-400 max-w-lg">
                Clarify your options, boost confidence, and execute — with a framework built on real decision science, not gut-flipping alone.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#assessment" className="rounded-full px-6 py-3 font-bold text-slate-900 shadow-lg transition hover:opacity-90" style={{ background: 'linear-gradient(90deg,#22d3c4,#8b7bff)' }}>
                  🎯 Readiness Check
                </a>
                <a href="#quick" className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/5 transition">
                  ⚡ Quick Decide
                </a>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4">Decision Readiness Score</p>
              {assessmentResult ? (
                <div className="dps-fade space-y-4">
                  <p className="text-6xl font-black" style={{ color: assessmentResult.verdict.color }}>
                    {assessmentResult.confidence}
                  </p>
                  <p className="text-lg font-bold" style={{ color: assessmentResult.verdict.color }}>
                    {assessmentResult.verdict.tier}
                  </p>
                </div>
              ) : (
                <div className="py-12 text-slate-500 text-sm">
                  Complete the readiness check below to view your score &amp; action plan.
                </div>
              )}
            </div>
          </section>

          {/* Step 1: Readiness Assessment */}
          <section id="assessment" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#22d3c4' }}>Step 1</p>
              <h2 className="text-3xl font-black sm:text-4xl">Decision Readiness Assessment</h2>
              <p className="mt-2 text-slate-400">Answer 4 quick signals to calculate your Decision Confidence Score.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <form onSubmit={handleCalculate} className="glass rounded-3xl p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">What decision are you facing?</label>
                  <input
                    type="text"
                    placeholder="e.g. Should I take the new job offer?"
                    value={assessment.title}
                    onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
                  <select
                    value={assessment.category}
                    onChange={(e) => setAssessment({ ...assessment, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Risk tolerance */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-300">🔥 Risk Tolerance</span>
                    <span className="text-cyan-400">{assessment.risk_tolerance}/10</span>
                  </div>
                  <input
                    type="range" min={1} max={10} value={assessment.risk_tolerance}
                    onChange={(e) => setAssessment({ ...assessment, risk_tolerance: Number(e.target.value) })}
                    className="dps-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #22d3c4 ${((assessment.risk_tolerance - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((assessment.risk_tolerance - 1) / 9) * 100}%)` }}
                  />
                </div>

                {/* Impact magnitude */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-300">💥 Potential Impact</span>
                    <span className="text-cyan-400">{assessment.impact_magnitude}/10</span>
                  </div>
                  <input
                    type="range" min={1} max={10} value={assessment.impact_magnitude}
                    onChange={(e) => setAssessment({ ...assessment, impact_magnitude: Number(e.target.value) })}
                    className="dps-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #22d3c4 ${((assessment.impact_magnitude - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((assessment.impact_magnitude - 1) / 9) * 100}%)` }}
                  />
                </div>

                {/* Information sufficiency */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-300">📊 Information Sufficiency</span>
                    <span className="text-cyan-400">{assessment.information_sufficiency}/10</span>
                  </div>
                  <input
                    type="range" min={1} max={10} value={assessment.information_sufficiency}
                    onChange={(e) => setAssessment({ ...assessment, information_sufficiency: Number(e.target.value) })}
                    className="dps-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #22d3c4 ${((assessment.information_sufficiency - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((assessment.information_sufficiency - 1) / 9) * 100}%)` }}
                  />
                </div>

                {/* Reversibility */}
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Is this decision reversible?</p>
                    <p className="text-xs text-slate-400">Can you undo it later without major cost?</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssessment({ ...assessment, reversibility: !assessment.reversibility })}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${assessment.reversibility ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}
                  >
                    {assessment.reversibility ? '🔄 Two-Way Door' : '🔒 One-Way Door'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full py-4 font-bold text-slate-900 shadow-lg transition hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(90deg,#22d3c4,#8b7bff)' }}
                >
                  ✨ Calculate Confidence
                </button>
              </form>

              {/* Result card */}
              <div className="glass rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                {assessmentResult ? (
                  <div className="space-y-6 dps-fade">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">Score Result</p>
                      <h3 className="text-3xl font-black" style={{ color: assessmentResult.verdict.color }}>
                        {assessmentResult.verdict.tier}
                      </h3>
                      <p className="mt-2 text-sm text-slate-300">{assessmentResult.verdict.desc}</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Action Plan</p>
                      {assessmentResult.advice.map((adv, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-200">
                          <span className="text-base">{adv.icon}</span>
                          <span>{adv.text}</span>
                        </div>
                      ))}
                    </div>

                    {authChecked && userId && (
                      <button
                        onClick={handleSaveToJournal}
                        disabled={saving}
                        className="w-full rounded-full border border-cyan-400/40 bg-cyan-500/10 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 transition disabled:opacity-50"
                      >
                        {saving ? 'Saving…' : savedSuccess ? '✓ Saved to Journal' : '💾 Save to Journal'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="my-auto text-center text-slate-500 py-12">
                    Fill out the signals on the left to calculate your score.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Step 2: Compare Matrix */}
          <section id="compare" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#8b7bff' }}>Step 2</p>
              <h2 className="text-3xl font-black sm:text-4xl">Option Comparison Matrix</h2>
              <p className="mt-2 text-slate-400">Stuck between choices? Weigh your criteria and let the math rank your options.</p>
            </div>

            <div className="glass rounded-3xl p-6 md:p-8 space-y-8">
              {/* Options & Criteria management */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Options</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {options.map((opt) => (
                      <span key={opt.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3.5 py-1 text-xs font-medium text-white">
                        {opt.name}
                        {options.length > 2 && (
                          <button
                            onClick={() => setOptions(options.filter((o) => o.id !== opt.id))}
                            className="text-slate-500 hover:text-red-400"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an option…"
                      value={newOptName}
                      onChange={(e) => setNewOptName(e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => {
                        if (!newOptName.trim()) return
                        setOptions([...options, { id: 'opt_' + Date.now(), name: newOptName.trim() }])
                        setNewOptName('')
                      }}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Criteria &amp; Weights (1-5)</label>
                  <div className="space-y-2 mb-3">
                    {criteria.map((crit) => (
                      <div key={crit.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs text-white">
                        <span>{crit.name}</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="number" min={1} max={5} value={crit.weight}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(5, parseInt(e.target.value) || 1))
                              setCriteria(criteria.map((c) => (c.id === crit.id ? { ...c, weight: val } : c)))
                            }}
                            className="w-12 rounded border border-white/10 bg-slate-950 px-2 py-1 text-center text-xs text-cyan-400"
                          />
                          {criteria.length > 1 && (
                            <button onClick={() => setCriteria(criteria.filter((c) => c.id !== crit.id))} className="text-slate-500 hover:text-red-400">
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a criterion…"
                      value={newCritName}
                      onChange={(e) => setNewCritName(e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => {
                        if (!newCritName.trim()) return
                        setCriteria([...criteria, { id: 'crit_' + Date.now(), name: newCritName.trim(), weight: 3 }])
                        setNewCritName('')
                      }}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Option Ratings per Criterion */}
              <div className="pt-6 border-t border-white/10 overflow-x-auto">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Option Ratings per Criterion (1-5)</label>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-2 pr-4 font-semibold">Option</th>
                      {criteria.map((crit) => (
                        <th key={crit.id} className="py-2 px-3 font-semibold">{crit.name} (w: {crit.weight})</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((opt) => (
                      <tr key={opt.id} className="border-b border-white/5">
                        <td className="py-2.5 pr-4 font-medium text-white">{opt.name}</td>
                        {criteria.map((crit) => {
                          const key = `${opt.id}_${crit.id}`
                          const val = matrixScores[key] ?? 3
                          return (
                            <td key={crit.id} className="py-2.5 px-3">
                              <input
                                type="number" min={1} max={5} value={val}
                                onChange={(e) => {
                                  const score = Math.max(1, Math.min(5, parseInt(e.target.value) || 1))
                                  setMatrixScores((prev) => ({ ...prev, [key]: score }))
                                }}
                                className="w-12 rounded border border-white/10 bg-slate-950 px-2 py-1 text-center text-xs text-cyan-400"
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ranking display */}
              {matrixResults && (
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Front-Runner Ranking</p>
                  <div className="space-y-3">
                    {matrixResults.ranking.map((res, idx) => (
                      <div key={res.option.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-300'}`}>
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-white truncate">{res.option.name}</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-cyan-400">
                          {res.total} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Step 3: Quick Decide Tools */}
          <section id="quick" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#22d3c4' }}>Step 3</p>
              <h2 className="text-3xl font-black sm:text-4xl">Quick Decide Toolkit</h2>
              <p className="mt-2 text-slate-400">For lower stakes or quick mental unblocking.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Coin Flip */}
              <div className="glass rounded-3xl p-6 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">🪙 50/50 Coin Flip</h3>
                <p className="text-xs text-slate-400">Can&apos;t pick between two options? Flip the coin — pay attention to how you feel while it is in the air.</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text" placeholder="Option 1" value={coinOpt1}
                    onChange={(e) => setCoinOpt1(e.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text" placeholder="Option 2" value={coinOpt2}
                    onChange={(e) => setCoinOpt2(e.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  onClick={handleCoinFlip}
                  disabled={coinFlipping}
                  className="w-full rounded-xl bg-cyan-400 py-3 text-xs font-bold text-slate-900 hover:bg-cyan-300 transition"
                >
                  {coinFlipping ? 'Flipping…' : '🎲 Flip Coin'}
                </button>
                {coinResult && (
                  <p className="text-center text-lg font-bold text-emerald-400 dps-fade">
                    Result: {coinResult}
                  </p>
                )}
              </div>

              {/* 10-10-10 Rule */}
              <div className="glass rounded-3xl p-6 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">⏳ 10-10-10 Rule</h3>
                <p className="text-xs text-slate-400">How will you feel about this choice in 10 minutes, 10 months, and 10 years?</p>
                <input
                  type="text" placeholder="Decision topic…" value={t10_10_10_decision}
                  onChange={(e) => setT10_10_10_decision(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
                <div className="space-y-2">
                  <input
                    type="text" placeholder="In 10 Minutes?" value={t10m}
                    onChange={(e) => setT10m(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                  <input
                    type="text" placeholder="In 10 Months?" value={t10mo}
                    onChange={(e) => setT10mo(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                  <input
                    type="text" placeholder="In 10 Years?" value={t10y}
                    onChange={(e) => setT10y(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Decision Journal */}
          {userId && (
            <section id="journal" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#22d3c4' }}>History</p>
                  <h2 className="text-3xl font-black">Decision Journal</h2>
                </div>
                <button onClick={fetchJournal} className="text-xs text-slate-500 hover:text-white transition">↻ Refresh</button>
              </div>

              {journalLoading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : journal.length === 0 ? (
                <p className="glass rounded-2xl p-6 text-sm text-slate-500">No decisions saved yet — calculate an assessment and tap &quot;Save to Journal&quot;.</p>
              ) : (
                <div className="space-y-3">
                  {journal.map((item) => {
                    let title = 'Decision', verdict = '—', confidence = '—'
                    try {
                      const p = JSON.parse(item.output_text)
                      title = p.title || 'Decision'
                      verdict = p.verdict || '—'
                      confidence = p.confidence ?? '—'
                    } catch {}
                    return (
                      <div key={item.id} className="glass flex items-center justify-between gap-4 rounded-2xl px-5 py-4">
                        <div className="flex items-center gap-6 min-w-0 text-sm">
                          <span className="text-slate-500 shrink-0">
                            {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="font-bold text-white truncate">{title}</span>
                          <span className="text-cyan-400 font-semibold shrink-0">Score: {confidence}</span>
                          <span className="text-slate-400 text-xs hidden md:inline truncate">{verdict}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteJournal(item.id)}
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
            <p>© 2026 PLANET SOR7ED · Decision Paralysis Solver</p>
            <Link href="/" className="hover:text-slate-400 transition">← Back to PLANET SOR7ED</Link>
          </footer>
        </div>
      </div>
    </>
  )
}

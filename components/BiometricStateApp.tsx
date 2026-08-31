'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type Mood = 'Energized' | 'Balanced' | 'Tired' | 'Foggy' | 'Anxious' | 'Low'
type RecType = 'good' | 'warn' | 'bad'

interface Recommendation {
  type: RecType
  icon: string
  text: string
}

interface EntryInputs {
  weight: number
  activity_level: number
  caffeine_intake: number
  alcohol_intake: number
  temperature: number
  sleep_hours: number
  sleep_quality: number
  heart_rate: number
  stress_level: number
  water_intake: number
  mood: Mood
  notes: string
}

interface HistoryEntry {
  id: string
  created_at: string
  output_text: string
}

const ACTIVITY_LABELS = ['', 'Sedentary', 'Light', 'Moderate', 'Intense', 'Very Intense']
const SLEEP_Q_LABELS  = ['', 'Poor', 'Fair', 'OK', 'Good', 'Great']
const STRESS_LABELS   = ['', 'None', 'Low', 'Moderate', 'High', 'Severe']
const MOOD_EMOJI: Record<Mood, string> = {
  Energized: '😄', Balanced: '🙂', Tired: '😴', Foggy: '🌫️', Anxious: '😬', Low: '😔',
}

// ─── Calculation engine (ported 1:1 from main.js) ────────────────────────────

function computeHydrationTarget(d: EntryInputs): number {
  let target = d.weight * 35
  target += (d.activity_level - 1) * 300
  target += d.caffeine_intake * 1.2
  target += d.alcohol_intake * 250
  if (d.temperature > 25) target += (d.temperature - 25) * 50
  if (d.temperature < 5)  target += (5 - d.temperature) * 10
  return Math.max(1500, Math.min(5000, Math.round(target / 50) * 50))
}

function computeBiometricScore(d: EntryInputs, hydrationTarget: number): number {
  let score = 70
  if (d.sleep_hours >= 7 && d.sleep_hours <= 9) score += 12
  else if (d.sleep_hours >= 6 && d.sleep_hours < 7) score += 4
  else if (d.sleep_hours > 9 && d.sleep_hours <= 10) score += 4
  else score -= 10
  score += (d.sleep_quality - 3) * 4
  score += (3 - d.stress_level) * 5
  if (d.activity_level === 3 || d.activity_level === 4) score += 6
  else if (d.activity_level === 1) score -= 6
  else if (d.activity_level === 5) score -= 2
  if (d.caffeine_intake > 400) score -= 10
  else if (d.caffeine_intake > 250) score -= 4
  else if (d.caffeine_intake <= 200) score += 2
  if (d.alcohol_intake > 0) score -= d.alcohol_intake * 4
  if (d.heart_rate >= 55 && d.heart_rate <= 75) score += 8
  else if (d.heart_rate > 90) score -= 8
  else if (d.heart_rate < 45 && d.heart_rate > 0) score -= 6
  if (hydrationTarget > 0) {
    const ratio = d.water_intake / hydrationTarget
    if (ratio >= 0.4 && ratio <= 1.1) score += 6
    else if (ratio < 0.2) score -= 6
  }
  return Math.max(0, Math.min(100, Math.round(score)))
}

function scoreLabel(s: number) {
  if (s >= 85) return 'Peak State'
  if (s >= 70) return 'Strong'
  if (s >= 55) return 'Balanced'
  if (s >= 40) return 'Needs Attention'
  return 'Low — Recover Today'
}

function scoreBand(s: number): string {
  if (s >= 85) return 'text-[#F5C518]'
  if (s >= 70) return 'text-[#F5C518]'
  if (s >= 55) return 'text-[#F5C518]'
  if (s >= 40) return 'text-[#F5C518]'
  return 'text-[#F5C518]'
}

function generateRecommendations(d: EntryInputs, hydrationTarget: number): Recommendation[] {
  const recs: Recommendation[] = []
  const ratio = hydrationTarget > 0 ? d.water_intake / hydrationTarget : 0

  if (ratio < 0.3)
    recs.push({ type: 'bad', icon: '💧', text: `You've only had ${d.water_intake}ml so far — well below your ${hydrationTarget}ml target. Drink a large glass now and set a reminder every 2 hours.` })
  else if (ratio < 0.6)
    recs.push({ type: 'warn', icon: '💧', text: `You're at ${Math.round(ratio * 100)}% of your ${hydrationTarget}ml hydration target. Keep sipping steadily.` })
  else
    recs.push({ type: 'good', icon: '💧', text: `Great hydration — ${Math.round(ratio * 100)}% of your ${hydrationTarget}ml target reached.` })

  if (d.sleep_hours < 6)
    recs.push({ type: 'bad', icon: '🛏️', text: `Only ${d.sleep_hours}h of sleep. Aim for 7–9h tonight — wind down earlier and avoid screens 1h before bed.` })
  else if (d.sleep_hours > 9.5)
    recs.push({ type: 'warn', icon: '🛏️', text: `${d.sleep_hours}h of sleep is on the longer side — check how rested you actually feel.` })
  else
    recs.push({ type: 'good', icon: '🛏️', text: `Solid ${d.sleep_hours}h of sleep — right in the optimal range.` })

  if (d.sleep_quality <= 2)
    recs.push({ type: 'warn', icon: '🌙', text: 'Sleep quality was low. Try a cooler, darker room and consistent sleep/wake times.' })

  if (d.stress_level >= 4)
    recs.push({ type: 'bad', icon: '🧠', text: 'Stress is running high. A 10-minute breathing exercise or short walk can lower cortisol right now.' })
  else if (d.stress_level <= 2)
    recs.push({ type: 'good', icon: '🧠', text: "Stress levels are well managed today — keep up whatever you're doing." })

  if (d.caffeine_intake > 400)
    recs.push({ type: 'bad', icon: '☕', text: `${d.caffeine_intake}mg of caffeine is above the 400mg daily ceiling. Cut off intake now to protect tonight's sleep.` })
  else if (d.caffeine_intake > 200)
    recs.push({ type: 'warn', icon: '☕', text: `${d.caffeine_intake}mg of caffeine — consider switching to water or decaf after midday.` })

  if (d.alcohol_intake > 2)
    recs.push({ type: 'bad', icon: '🍷', text: `${d.alcohol_intake} units of alcohol will dehydrate you and disrupt sleep — add 250ml of water per unit.` })
  else if (d.alcohol_intake > 0)
    recs.push({ type: 'warn', icon: '🍷', text: `${d.alcohol_intake} unit(s) of alcohol logged — extra water tonight will help offset the diuretic effect.` })

  if (d.heart_rate > 90)
    recs.push({ type: 'warn', icon: '❤️', text: `Resting HR of ${d.heart_rate}bpm is elevated. This can reflect stress, dehydration, or overtraining.` })
  else if (d.heart_rate >= 55 && d.heart_rate <= 75)
    recs.push({ type: 'good', icon: '❤️', text: `Resting heart rate of ${d.heart_rate}bpm is in a healthy range.` })

  if (d.temperature > 28)
    recs.push({ type: 'warn', icon: '🌡️', text: `It's ${d.temperature}°C — your hydration target has been raised. Consider electrolytes too.` })

  if (d.activity_level === 1)
    recs.push({ type: 'warn', icon: '🏃', text: 'Very low activity today. A short walk can boost circulation and mood.' })
  else if (d.activity_level === 5)
    recs.push({ type: 'warn', icon: '🏃', text: 'Very intense activity — prioritize protein, electrolytes, and extra recovery sleep.' })

  if (recs.length === 0)
    recs.push({ type: 'good', icon: '✅', text: 'Everything looks balanced today. Keep up your current routine!' })

  return recs
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-300 mb-2">{children}</label>
}

function FieldInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]/30 transition"
    />
  )
}

function SliderRow({
  id, label, value, min, max, display, onChange,
}: {
  id: string; label: string; value: number; min: number; max: number; display: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bst-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #F5C518 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%)` }}
      />
      <p className="mt-1 text-center text-xs font-medium text-[#F5C518]">{display}</p>
    </div>
  )
}

function StatRing({ score }: { score: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const col = score >= 70 ? '#F5C518' : score >= 40 ? '#F5C518' : '#C25A5A'

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r} fill="none"
        stroke={col} strokeWidth="10"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="60" y="58" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="22" fontWeight="700">{score}</text>
      <text x="60" y="76" textAnchor="middle" dominantBaseline="middle" fill={col} fontSize="9">{scoreLabel(score).toUpperCase()}</text>
    </svg>
  )
}

const REC_STYLES: Record<RecType, string> = {
  good: 'border-[#F5C518]/30 bg-[#F5C518]/10 text-[#F5C518]',
  warn: 'border-[#F5C518]/30 bg-[#F5C518]/10 text-[#F5C518]',
  bad:  'border-[#F5C518]/30 bg-[#F5C518]/10 text-[#F5C518]',
}

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULTS: EntryInputs = {
  weight: 70,
  activity_level: 3,
  caffeine_intake: 0,
  alcohol_intake: 0,
  temperature: 20,
  sleep_hours: 7.5,
  sleep_quality: 3,
  heart_rate: 65,
  stress_level: 2,
  water_intake: 0,
  mood: 'Balanced',
  notes: '',
}

export function BiometricStateApp() {
  const supabase = useMemo(() => createBrowserClient(), [])
  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [inputs, setInputs] = useState<EntryInputs>(DEFAULTS)
  const [result, setResult] = useState<{
    score: number
    hydrationTarget: number
    recs: Recommendation[]
    mood: Mood
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const set = useCallback(<K extends keyof EntryInputs>(key: K, val: EntryInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: val }))
  }, [])

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
      .eq('tool_slug', 'biometric-state-tracker')
      .order('created_at', { ascending: false })
      .limit(30)
    setHistory((data as HistoryEntry[]) ?? [])
    setHistoryLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    if (!userId) return
    let ignore = false
    supabase
      .from('tool_runs')
      .select('id, created_at, output_text')
      .eq('tool_slug', 'biometric-state-tracker')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (!ignore) {
          setHistory((data as HistoryEntry[]) ?? [])
        }
      })
    return () => {
      ignore = true
    }
  }, [supabase, userId])

  const handleAnalyze = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const hydrationTarget = computeHydrationTarget(inputs)
    const score = computeBiometricScore(inputs, hydrationTarget)
    const recs = generateRecommendations(inputs, hydrationTarget)
    setResult({ score, hydrationTarget, recs, mood: inputs.mood })
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    setSaveError(null)

    if (!userId) return
    setSaving(true)
    try {
      const summary = JSON.stringify({ score, hydrationTarget, mood: inputs.mood, recs: recs.map(r => r.text) })
      const { data: req, error: reqErr } = await supabase
        .from('tool_requests')
        .insert({ user_id: userId, keyword: 'BIOMETRIC', input_text: JSON.stringify(inputs), channel: 'web', status: 'completed' })
        .select('id').single()
      if (reqErr || !req) throw new Error('Could not save your check-in.')
      const { error: runErr } = await supabase.from('tool_runs').insert({
        tool_request_id: req.id,
        tool_slug: 'biometric-state-tracker',
        model: 'engine-v1',
        output_text: summary,
        success: true,
        latency_ms: 0,
      })
      if (runErr) throw new Error('Check-in generated but could not be saved.')
      await fetchHistory()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }, [inputs, userId, supabase, fetchHistory])

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from('tool_runs').delete().eq('id', id)
    setHistory((prev) => prev.filter((r) => r.id !== id))
  }, [supabase])

  const hydrationPct = result ? Math.min(100, Math.round((inputs.water_intake / result.hydrationTarget) * 100)) : 0

  return (
    <>
      <style>{`
        .bst-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: #F5C518; cursor: pointer;
          box-shadow: 0 0 0 3px rgba(34,229,208,0.25); transition: box-shadow .15s;
        }
        .bst-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #F5C518; border: none; cursor: pointer;
        }
        .bst-slider:focus::-webkit-slider-thumb { box-shadow: 0 0 0 5px rgba(34,229,208,0.35); }
        .glass { background: #000000; border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); }
        @keyframes bst-fade-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .bst-fade { animation: bst-fade-in .4s ease both; }
      `}</style>

      <div
        className="min-h-screen text-white"
        style={{ background: '#000000' }}
      >
        {/* ── Sticky nav ── */}
        <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg,#F5C518,#F5C518)' }}>
                <span className="text-base">💧</span>
              </span>
              <span className="font-medium tracking-normal" style={{ fontFamily: 'var(--font-anton), Oswald, sans-serif' }}>
                Biometric<span style={{ color: '#F5C518' }}>State</span>
              </span>
            </div>
            <div className="hidden gap-7 text-sm font-medium text-slate-400 md:flex">
              {['Log Entry', 'Insights', 'History'].map((label) => (
                <button key={label} className="hover:text-white transition">{label}</button>
              ))}
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hidden items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-slate-900 sm:inline-flex"
              style={{ background: 'linear-gradient(90deg,#F5C518,#F5C518)' }}
            >
              ⚡ New Check-In
            </button>
          </nav>
        </header>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* ── Hero ── */}
          <section className="py-16 md:py-24 grid gap-12 md:grid-cols-2 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider"
                style={{ borderColor: 'rgba(34,229,208,0.3)', background: 'rgba(34,229,208,0.05)', color: '#F5C518' }}>
                ✨ AI-Powered Insights
              </span>
              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-6xl font-normal leading-[1.1] tracking-normal" style={{ fontFamily: 'var(--font-anton), Oswald, sans-serif' }}>
                Optimize your{' '}
                <span style={{ background: 'linear-gradient(90deg,#F5C518,#F5C518)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  cognitive & physical
                </span>{' '}
                performance
              </h1>
              <p className="mt-5 text-lg text-slate-400 max-w-lg">
                Log your daily biometrics — weight, activity, sleep, stress and more — and get a personalized hydration target plus AI-style recommendations, instantly.
              </p>

              <div className="mt-10 flex items-center gap-10 text-sm text-slate-500">
                <div><span className="block text-2xl font-medium text-slate-100">{history.length || '—'}</span>Entries Logged</div>
                {history.length > 0 && (() => {
                  const scores = history.map(h => { try { return JSON.parse(h.output_text)?.score || 0 } catch { return 0 } })
                  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                  return <div><span className="block text-2xl font-medium text-slate-100">{avg}</span>Avg. Score</div>
                })()}
              </div>
            </div>

            {/* Snapshot card */}
            <div className="glass rounded-none p-8 shadow-2xl">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Today&apos;s Snapshot</p>
              <div className="mt-6 flex justify-center">
                {result ? <StatRing score={result.score} /> : (
                  <div className="flex h-32 items-center justify-center text-slate-600 text-sm">
                    Complete a check-in to see your score
                  </div>
                )}
              </div>
              {result && (
                <div className="mt-6 grid grid-cols-2 gap-4 text-center bst-fade">
                  <div className="rounded-none py-4 px-2" style={{ background: '#000000' }}>
                    <p className="text-lg font-medium text-[#F5C518]">{result.hydrationTarget.toLocaleString()}ml</p>
                    <p className="text-xs text-slate-400 mt-1">Hydration Target</p>
                  </div>
                  <div className="rounded-none py-4 px-2" style={{ background: '#000000' }}>
                    <p className="text-lg font-medium text-[#F5C518]">{MOOD_EMOJI[result.mood]} {result.mood}</p>
                    <p className="text-xs text-slate-400 mt-1">Mood</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Check-In Form ── */}
          <section className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-center mb-10">
              <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#F5C518' }}>Daily Check-In</p>
              <h2 className="text-3xl font-normal sm:text-4xl">Log Today&apos;s Biometric State</h2>
              <p className="mt-3 text-slate-400 max-w-lg mx-auto">Fill in what you know — the engine calculates your personalized hydration target and biometric score instantly.</p>
            </div>

            <form onSubmit={handleAnalyze} className="glass rounded-none p-6 md:p-10 grid md:grid-cols-2 gap-7">

              {/* Weight */}
              <div>
                <FieldLabel>⚖️ Weight (kg)</FieldLabel>
                <FieldInput type="number" min={40} max={200} step={0.1} placeholder="e.g. 72" required
                  value={inputs.weight} onChange={(e) => set('weight', parseFloat(e.target.value) || 70)} />
              </div>

              {/* Activity */}
              <SliderRow id="activity" label="🏃 Activity Level" value={inputs.activity_level} min={1} max={5}
                display={ACTIVITY_LABELS[inputs.activity_level]} onChange={(v) => set('activity_level', v)} />

              {/* Caffeine */}
              <div>
                <FieldLabel>☕ Caffeine (mg)</FieldLabel>
                <FieldInput type="number" min={0} max={500} step={10} placeholder="e.g. 150"
                  value={inputs.caffeine_intake || ''} onChange={(e) => set('caffeine_intake', parseFloat(e.target.value) || 0)} />
                <p className="mt-1 text-xs text-slate-500">1 espresso ≈ 63mg · 1 coffee ≈ 95mg · 1 energy drink ≈ 80mg</p>
              </div>

              {/* Alcohol */}
              <div>
                <FieldLabel>🍷 Alcohol (units)</FieldLabel>
                <FieldInput type="number" min={0} max={5} step={0.5} placeholder="e.g. 1"
                  value={inputs.alcohol_intake || ''} onChange={(e) => set('alcohol_intake', parseFloat(e.target.value) || 0)} />
                <p className="mt-1 text-xs text-slate-500">1 unit ≈ 1 small glass of wine or 1 beer</p>
              </div>

              {/* Temperature */}
              <div>
                <FieldLabel>🌡️ Ambient Temperature (°C)</FieldLabel>
                <FieldInput type="number" min={-10} max={50} step={1} placeholder="e.g. 22"
                  value={inputs.temperature} onChange={(e) => set('temperature', parseFloat(e.target.value) || 20)} />
              </div>

              {/* Sleep hours */}
              <div>
                <FieldLabel>🛏️ Sleep Last Night (hrs)</FieldLabel>
                <FieldInput type="number" min={0} max={12} step={0.5} placeholder="e.g. 7.5"
                  value={inputs.sleep_hours} onChange={(e) => set('sleep_hours', parseFloat(e.target.value) || 0)} />
              </div>

              {/* Sleep quality */}
              <SliderRow id="sleep_quality" label="🌙 Sleep Quality" value={inputs.sleep_quality} min={1} max={5}
                display={SLEEP_Q_LABELS[inputs.sleep_quality]} onChange={(v) => set('sleep_quality', v)} />

              {/* Heart rate */}
              <div>
                <FieldLabel>❤️ Resting Heart Rate (bpm)</FieldLabel>
                <FieldInput type="number" min={30} max={150} step={1} placeholder="e.g. 65"
                  value={inputs.heart_rate || ''} onChange={(e) => set('heart_rate', parseFloat(e.target.value) || 0)} />
              </div>

              {/* Stress */}
              <SliderRow id="stress" label="🧠 Stress Level" value={inputs.stress_level} min={1} max={5}
                display={STRESS_LABELS[inputs.stress_level]} onChange={(v) => set('stress_level', v)} />

              {/* Water */}
              <div>
                <FieldLabel>💧 Water Consumed Today (ml)</FieldLabel>
                <FieldInput type="number" min={0} max={6000} step={50} placeholder="e.g. 800"
                  value={inputs.water_intake || ''} onChange={(e) => set('water_intake', parseFloat(e.target.value) || 0)} />
              </div>

              {/* Mood */}
              <div>
                <FieldLabel>😊 Mood</FieldLabel>
                <select
                  value={inputs.mood}
                  onChange={(e) => set('mood', e.target.value as Mood)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#F5C518] transition"
                >
                  {(['Energized', 'Balanced', 'Tired', 'Foggy', 'Anxious', 'Low'] as Mood[]).map((m) => (
                    <option key={m} value={m}>{MOOD_EMOJI[m]} {m}</option>
                  ))}
                </select>
              </div>

              {/* Notes — full width */}
              <div className="md:col-span-2">
                <FieldLabel>📝 Notes (optional)</FieldLabel>
                <textarea
                  rows={3}
                  value={inputs.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Anything else worth noting today?"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#F5C518] transition"
                />
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-medium text-slate-900 shadow-lg transition hover:opacity-90 active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(90deg,#F5C518,#F5C518)' }}
                >
                  {saving ? '⏳ Saving…' : '✨ Analyze & Save Check-In'}
                </button>
                {authChecked && !userId && (
                  <p className="text-xs text-slate-500">
                    Results won&apos;t be saved.{' '}
                    <a href="/signup" className="text-[#F5C518] underline hover:text-[#F5C518]">Log in</a> to keep a history.
                  </p>
                )}
                {saveError && <p className="text-xs text-[#F5C518]">{saveError}</p>}
              </div>
            </form>
          </section>

          {/* ── Results ── */}
          {result && (
            <section ref={resultsRef} className="py-14 border-t bst-fade" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-center mb-10">
                <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#F5C518' }}>Your Insights</p>
                <h2 className="text-3xl font-normal sm:text-4xl">AI-Powered Recommendations</h2>
              </div>

              {/* Score cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="glass rounded-none p-6 text-center">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">Biometric State Score</p>
                  <p className={`text-5xl font-normal ${scoreBand(result.score)}`}>{result.score}</p>
                  <p className="mt-2 text-sm font-medium text-slate-300">{scoreLabel(result.score)}</p>
                </div>
                <div className="glass rounded-none p-6 text-center">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">Personalized Hydration</p>
                  <p className="text-5xl font-normal text-[#F5C518]">{result.hydrationTarget.toLocaleString()}</p>
                  <p className="mt-2 text-sm font-medium text-slate-300">ml / day</p>
                </div>
                <div className="glass rounded-none p-6 text-center">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">Hydration Progress</p>
                  <p className="text-5xl font-normal text-[#F5C518]">{hydrationPct}%</p>
                  <p className="mt-2 text-sm font-medium text-slate-300">of daily target reached</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass rounded-none p-6 md:p-10">
                <h3 className="text-xl font-medium mb-6 flex items-center gap-2">💡 Recommendations for you</h3>
                <ul className="space-y-4">
                  {result.recs.map((r, i) => (
                    <li key={i} className={`flex items-start gap-4 rounded-none border px-5 py-4 text-sm ${REC_STYLES[r.type]}`}>
                      <span className="shrink-0 text-lg">{r.icon}</span>
                      <span className="leading-relaxed">{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ── History ── */}
          {userId && (
            <section className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: '#F5C518' }}>Track Progress</p>
                  <h2 className="text-3xl font-normal">Check-In History</h2>
                </div>
                <button onClick={fetchHistory} className="text-xs text-slate-500 hover:text-white transition">↻ Refresh</button>
              </div>

              {historyLoading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : history.length === 0 ? (
                <p className="glass rounded-none p-6 text-sm text-slate-500">No check-ins yet — log your first one above.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((row) => {
                    let score = '—', hydration = '—', mood: string = '—'
                    try {
                      const parsed = JSON.parse(row.output_text)
                      score = parsed.score ?? '—'
                      hydration = parsed.hydrationTarget ? `${parsed.hydrationTarget.toLocaleString()}ml` : '—'
                      mood = parsed.mood ?? '—'
                    } catch {}
                    return (
                      <div key={row.id} className="glass flex items-center justify-between gap-4 rounded-none px-5 py-4">
                        <div className="flex items-center gap-6 min-w-0 text-sm">
                          <span className="text-slate-500 shrink-0">
                            {new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="font-medium text-[#F5C518]">Score: {score}</span>
                          <span className="text-slate-400 hidden sm:block">Hydration: {hydration}</span>
                          <span className="text-slate-400 hidden md:block">Mood: {mood}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(row.id)}
                          aria-label="Delete"
                          className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition hover:bg-[#F5C518]/10 hover:text-[#F5C518]"
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

          {/* ── About ── */}
          <section className="py-14 border-t grid md:grid-cols-3 gap-8 text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { icon: '💧', title: 'Personalized Hydration', body: 'Your target adapts daily to weight, activity, caffeine, alcohol, and climate.' },
              { icon: '🧠', title: 'AI-Style Insights', body: 'A rule-based recommendation engine flags what\'s helping — and hurting — your state.' },
              { icon: '📈', title: 'Trend Tracking', body: 'Log daily and watch your score, hydration, sleep, and vitals evolve over time.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="glass rounded-none p-8">
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-4 mb-2 text-lg font-medium">{title}</h3>
                <p className="text-sm text-slate-400">{body}</p>
              </div>
            ))}
          </section>

          {/* ── Footer ── */}
          <footer className="border-t py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p>© 2026 PLANET SOR7ED · Biometric State Tracker · Not medical advice.</p>
            <Link href="/" className="hover:text-slate-400 transition">← Back to PLANET SOR7ED</Link>
          </footer>

        </div>
      </div>
    </>
  )
}

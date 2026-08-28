'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = 'proud' | 'gentle' | 'hype'

interface WinInputs {
  tasksCompleted: number
  bodyDoublingSessions: number
  spiralUses: number
  hardThing: string
  weekLabel: string
  tone: Tone
}

interface HistoryRow {
  id: string
  created_at: string
  tool_slug: string
  output_text: string
  success: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekLabel(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  )
  return `Week ${week}, ${now.getFullYear()}`
}

function calcWinScore(inputs: Pick<WinInputs, 'tasksCompleted' | 'bodyDoublingSessions' | 'spiralUses'>): number {
  return inputs.tasksCompleted + inputs.bodyDoublingSessions * 2 + inputs.spiralUses * 3
}

function scoreBand(score: number): { label: string; colour: string } {
  if (score >= 80) return { label: 'On fire 🔥', colour: '#f59e0b' }
  if (score >= 50) return { label: 'Solid week ✓', colour: '#22c55e' }
  if (score >= 20) return { label: 'You showed up', colour: '#38bdf8' }
  return { label: 'Still counts', colour: '#a78bfa' }
}

function generateTitle(tone: Tone, weekLabel: string, score: number): string {
  const band = scoreBand(score)
  if (tone === 'proud') return `${weekLabel} — ${band.label}`
  if (tone === 'gentle') return `${weekLabel} — You Did Enough`
  return `${weekLabel} — BEAST MODE ACTIVATED 🚀`
}

function generateMeta(tone: Tone, score: number): string {
  if (tone === 'proud') return `Win score ${score} — here's exactly what I did this week and why it matters.`
  if (tone === 'gentle') return `A quiet but real win week. Score: ${score}. Every bit of it counts.`
  return `Score ${score} — we went absolutely feral this week. Here's the receipts.`
}

function generateSummary(inputs: WinInputs, score: number): string {
  const { tasksCompleted, bodyDoublingSessions, spiralUses, hardThing, weekLabel, tone } = inputs

  const taskLine = tasksCompleted === 1 ? '1 task' : `${tasksCompleted} tasks`
  const bdLine = bodyDoublingSessions === 1 ? '1 body-doubling session' : `${bodyDoublingSessions} body-doubling sessions`
  const spiralLine = spiralUses === 1 ? '1 spiral or tool' : `${spiralUses} spirals / tool uses`
  const hardLine = hardThing.trim()
    ? `The hard thing I did anyway: "${hardThing.trim()}".`
    : ''

  if (tone === 'proud') {
    return (
      `${weekLabel} — win score ${score}. ` +
      `This week I completed ${taskLine}, showed up for ${bdLine}, and used ${spiralLine} to stay regulated. ` +
      (hardLine ? `${hardLine} ` : '') +
      `These aren't small things. They're evidence.`
    )
  }

  if (tone === 'gentle') {
    return (
      `${weekLabel}. Score: ${score} — and that's more than enough. ` +
      `I managed ${taskLine}, got through ${bdLine}, and reached for ${spiralLine} when things got noisy. ` +
      (hardLine ? `${hardLine} ` : '') +
      `Showing up at all is the win. The rest is just counting.`
    )
  }

  // hype
  return (
    `${weekLabel}: WE GO AGAIN. Win score ${score} — DEMOLISHED. ` +
    `${taskLine} DONE. ${bdLine} LOCKED IN. ${spiralLine} — regulated and dangerous. ` +
    (hardLine ? `${hardLine} ` : '') +
    `Unstoppable. See you next week.`
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderField({
  id,
  label,
  sublabel,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  sublabel: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-neutral-200">
          {label}
        </label>
        <span className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="weekly-wins-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #1FD7CF ${(value / max) * 100}%, #374151 ${(value / max) * 100}%)`,
        }}
      />
      <p className="text-xs text-neutral-500">{sublabel}</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WeeklyWinsApp() {
  const supabase = useMemo(() => createBrowserClient(), [])

  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [tasksCompleted, setTasksCompleted] = useState(10)
  const [bodyDoublingSessions, setBodyDoublingSessions] = useState(2)
  const [spiralUses, setSpiralUses] = useState(1)
  const [hardThing, setHardThing] = useState('')
  const [weekLabel, setWeekLabel] = useState(getWeekLabel)
  const [tone, setTone] = useState<Tone>('proud')

  const [draft, setDraft] = useState<{
    title: string
    meta: string
    summary: string
    score: number
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [history, setHistory] = useState<HistoryRow[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null)
      setAuthChecked(true)
    })
  }, [supabase])

  // ── Fetch history ───────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!userId) return
    setHistoryLoading(true)
    const { data } = await supabase
      .from('tool_runs')
      .select('id, created_at, tool_slug, output_text, success')
      .eq('tool_slug', 'weekly-wins-generator')
      .order('created_at', { ascending: false })
      .limit(20)
    setHistory((data as HistoryRow[]) ?? [])
    setHistoryLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    if (!userId) return
    let ignore = false
    supabase
      .from('tool_runs')
      .select('id, created_at, tool_slug, output_text, success')
      .eq('tool_slug', 'weekly-wins-generator')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!ignore) {
          setHistory((data as HistoryRow[]) ?? [])
        }
      })
    return () => {
      ignore = true
    }
  }, [supabase, userId])

  // ── Live score ──────────────────────────────────────────────────────────────
  const winScore = useMemo(
    () => calcWinScore({ tasksCompleted, bodyDoublingSessions, spiralUses }),
    [tasksCompleted, bodyDoublingSessions, spiralUses],
  )
  const band = useMemo(() => scoreBand(winScore), [winScore])

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    const inputs: WinInputs = { tasksCompleted, bodyDoublingSessions, spiralUses, hardThing, weekLabel, tone }
    const score = calcWinScore(inputs)
    const title = generateTitle(tone, weekLabel, score)
    const meta = generateMeta(tone, score)
    const summary = generateSummary(inputs, score)

    setDraft({ title, meta, summary, score })
    setSaveError(null)

    if (!userId) return

    setSaving(true)
    try {
      const { data: req, error: reqErr } = await supabase
        .from('tool_requests')
        .insert({
          user_id: userId,
          keyword: 'WEEKLY-WINS',
          input_text: JSON.stringify({ tasksCompleted, bodyDoublingSessions, spiralUses, hardThing, weekLabel, tone }),
          channel: 'web',
          status: 'completed',
        })
        .select('id')
        .single()

      if (reqErr || !req) throw new Error('Could not record your run. Please try again.')

      const { error: runErr } = await supabase.from('tool_runs').insert({
        tool_request_id: req.id,
        tool_slug: 'weekly-wins-generator',
        model: 'template-v1',
        output_text: summary,
        success: true,
        latency_ms: 0,
      })

      if (runErr) throw new Error('Your summary was generated but could not be saved.')

      await fetchHistory()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong saving your win.')
    } finally {
      setSaving(false)
    }
  }, [
    tasksCompleted, bodyDoublingSessions, spiralUses,
    hardThing, weekLabel, tone, userId, supabase, fetchHistory,
  ])

  // ── Copy ────────────────────────────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    if (!draft) return
    const text = `# ${draft.title}\n\n${draft.meta}\n\n${draft.summary}\n\nWin score: ${draft.score}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [draft])

  // ── WhatsApp share ──────────────────────────────────────────────────────────
  const handleWhatsApp = useCallback(() => {
    if (!draft) return
    const text = encodeURIComponent(`${draft.title}\n\n${draft.summary}\n\nWin score: ${draft.score}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }, [draft])

  // ── Delete history row ──────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (id: string) => {
      await supabase.from('tool_runs').delete().eq('id', id)
      setHistory((prev) => prev.filter((r) => r.id !== id))
    },
    [supabase],
  )

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .weekly-wins-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1FD7CF;
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.25);
          transition: box-shadow 0.15s;
        }
        .weekly-wins-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1FD7CF;
          border: none;
          cursor: pointer;
        }
        .weekly-wins-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 5px rgba(192,57,43,0.35);
        }
      `}</style>

      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">

          {/* Header */}
          <header className="rounded-3xl border border-white/10 bg-black p-8 shadow-2xl backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#1FD7CF]">
              PLANET SOR7ED LAB — Body
            </p>
            <h1
              className="mt-3 text-6xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.95] tracking-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Weekly Wins Generator
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-neutral-300">
              Log your week, pick a tone, and generate a publish-ready summary of everything you actually did. Because you did more than you think.
            </p>

            {/* Live score preview */}
            <div className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-black px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Live win score</p>
                <p
                  className="mt-1 text-5xl font-black leading-none"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", color: band.colour }}
                >
                  {winScore}
                </p>
              </div>
              <div className="h-12 w-px bg-black" />
              <p className="text-sm font-medium" style={{ color: band.colour }}>
                {band.label}
              </p>
            </div>
          </header>

          {/* Main grid */}
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

            {/* Inputs panel */}
            <section className="rounded-3xl border border-white/10 bg-black p-6 shadow-xl backdrop-blur space-y-8">
              <h2 className="text-lg font-semibold text-white">Your week</h2>

              {/* Week label */}
              <div className="space-y-1">
                <label htmlFor="week-label" className="text-sm font-medium text-neutral-200">
                  Week label
                </label>
                <input
                  id="week-label"
                  type="text"
                  value={weekLabel}
                  onChange={(e) => setWeekLabel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#1FD7CF]"
                />
              </div>

              <SliderField
                id="tasks-completed"
                label="Tasks completed"
                sublabel="Anything that was on your list counts"
                value={tasksCompleted}
                min={0}
                max={100}
                onChange={setTasksCompleted}
              />

              <SliderField
                id="body-doubling-sessions"
                label="Body-doubling sessions"
                sublabel="Working alongside someone (in person or virtual)"
                value={bodyDoublingSessions}
                min={0}
                max={20}
                onChange={setBodyDoublingSessions}
              />

              <SliderField
                id="spiral-uses"
                label="Tool / spiral uses"
                sublabel="Times you caught a spiral and used a tool to get back on track"
                value={spiralUses}
                min={0}
                max={20}
                onChange={setSpiralUses}
              />

              {/* Hard thing */}
              <div className="space-y-1">
                <label htmlFor="hard-thing" className="text-sm font-medium text-neutral-200">
                  Hard thing you did anyway{' '}
                  <span className="text-neutral-500">(optional)</span>
                </label>
                <textarea
                  id="hard-thing"
                  value={hardThing}
                  onChange={(e) => setHardThing(e.target.value.slice(0, 280))}
                  rows={3}
                  placeholder="e.g. Made a phone call I'd been avoiding for three weeks."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#1FD7CF]"
                />
                <p className="text-right text-xs text-neutral-500">{hardThing.length}/280</p>
              </div>
            </section>

            {/* Tone + generate panel */}
            <section className="flex flex-col gap-6">
              <div className="rounded-3xl border border-white/10 bg-black p-6 shadow-xl backdrop-blur">
                <h2 className="text-lg font-semibold text-white">Tone</h2>
                <p className="mt-1 text-sm text-neutral-400">How do you want to frame this week?</p>
                <div className="mt-4 flex flex-col gap-3">
                  {([
                    { value: 'proud' as Tone, label: 'Proud', desc: 'Clear, factual, owned' },
                    { value: 'gentle' as Tone, label: 'Gentle', desc: 'Soft, self-compassionate' },
                    { value: 'hype' as Tone, label: 'Hype', desc: 'Loud, celebratory, chaotic good' },
                  ]).map((t) => (
                    <button
                      key={t.value}
                      id={`tone-${t.value}`}
                      onClick={() => setTone(t.value)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        tone === t.value
                          ? 'border-[#1FD7CF] bg-[#1FD7CF]/20 text-white'
                          : 'border-white/10 bg-black text-neutral-300 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                          tone === t.value ? 'border-[#1FD7CF] bg-[#1FD7CF]' : 'border-neutral-500'
                        }`}
                      />
                      <span>
                        <span className="font-semibold">{t.label}</span>
                        <span className="ml-2 text-xs text-neutral-400">{t.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Score breakdown */}
              <div className="rounded-3xl border border-white/10 bg-black p-6 shadow-xl backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Score breakdown</p>
                <div className="mt-4 space-y-2 text-sm">
                  {[
                    { label: 'Tasks', value: tasksCompleted },
                    { label: 'Body-doubling × 2', value: bodyDoublingSessions * 2 },
                    { label: 'Tool uses × 3', value: spiralUses * 3 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-neutral-400">{row.label}</span>
                      <span className="font-semibold text-white">+{row.value}</span>
                    </div>
                  ))}
                  <div className="mt-3 border-t border-white/10 pt-3 flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span style={{ color: band.colour }}>{winScore}</span>
                  </div>
                </div>
              </div>

              {/* Generate CTA */}
              <button
                id="generate-wins"
                onClick={handleGenerate}
                disabled={saving}
                className="w-full rounded-2xl bg-[#1FD7CF] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#050608] shadow-lg transition-all hover:bg-[#18BDB7] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Generate my wins →'}
              </button>

              {saveError && (
                <p className="text-sm text-red-400">{saveError}</p>
              )}

              {authChecked && !userId && (
                <p className="rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-neutral-400">
                  Your summary will generate but won&apos;t be saved.{' '}
                  <a href="/signup" className="text-[#1FD7CF] underline hover:text-[#5095FF]">
                    Log in
                  </a>{' '}
                  to keep a wins history.
                </p>
              )}
            </section>
          </div>

          {/* Draft card */}
          {draft && (
            <section className="rounded-3xl border border-[#1FD7CF]/40 bg-[#1FD7CF]/10 p-6 shadow-2xl backdrop-blur space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1FD7CF]">Generated draft</p>
                  <h2
                    className="mt-2 text-3xl font-black uppercase sm:text-4xl"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {draft.title}
                  </h2>
                </div>
                <span
                  className="shrink-0 rounded-xl px-4 py-2 text-sm font-bold"
                  style={{ background: `${band.colour}22`, color: band.colour, border: `1px solid ${band.colour}44` }}
                >
                  Score: {draft.score}
                </span>
              </div>

              <p className="text-sm italic text-neutral-400">{draft.meta}</p>

              <p className="text-base leading-relaxed text-neutral-200">{draft.summary}</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  id="copy-draft"
                  onClick={handleCopy}
                  className="rounded-xl border border-white/20 bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
                >
                  {copied ? 'Copied ✓' : 'Copy draft'}
                </button>
                <button
                  id="share-whatsapp"
                  onClick={handleWhatsApp}
                  className="rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-400 transition hover:bg-green-500/20 active:scale-95"
                >
                  Share on WhatsApp
                </button>
              </div>
            </section>
          )}

          {/* History log */}
          {userId && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl font-black uppercase"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  Your wins history
                </h2>
                <button
                  onClick={fetchHistory}
                  className="text-xs text-neutral-500 hover:text-white transition"
                >
                  Refresh
                </button>
              </div>

              {historyLoading ? (
                <p className="text-sm text-neutral-500">Loading…</p>
              ) : history.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black p-6 text-sm text-neutral-500">
                  No wins saved yet — generate your first one above.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((row) => {
                    const firstLine = row.output_text?.split('.')[0] ?? ''
                    return (
                      <div
                        key={row.id}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black px-5 py-4 backdrop-blur"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-neutral-500">{formatDate(row.created_at)}</p>
                          <p className="mt-1 truncate text-sm text-neutral-200">{firstLine}.</p>
                        </div>
                        <button
                          onClick={() => handleDelete(row.id)}
                          aria-label="Delete this entry"
                          className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400"
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

        </div>
      </div>
    </>
  )
}

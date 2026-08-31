'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

interface SortedResult {
  tasks: string[]
  ideas: string[]
  emotions: string[]
}

interface JournalEntry {
  id: string
  created_at: string
  output_text: string
}

function classifyText(rawText: string): SortedResult {
  const lines = rawText
    .split(/(?:\.|\n|;|\band\b)+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)

  const tasks: string[] = []
  const ideas: string[] = []
  const emotions: string[] = []

  const taskRegex = /\b(need to|must|call|email|send|buy|finish|do|book|clean|fix|schedule|update|create|submit|pay|invoice|write|pick up|draft)\b/i
  const ideaRegex = /\b(idea|what if|maybe|could|pitch|project|concept|feature|app|strategy|build|explore|design|plan|thought)\b/i
  const emotionRegex = /\b(feel|feeling|anxious|tired|overwhelmed|stressed|happy|worried|exhausted|frustrated|scared|hopeful|behind|sad|angry)\b/i

  lines.forEach((line) => {
    if (taskRegex.test(line)) {
      tasks.push(line)
    } else if (ideaRegex.test(line)) {
      ideas.push(line)
    } else if (emotionRegex.test(line)) {
      emotions.push(line)
    } else {
      // Default heuristics: shorter action-like sentences to task, others to idea
      if (line.length < 35) {
        tasks.push(line)
      } else {
        ideas.push(line)
      }
    }
  })

  return { tasks, ideas, emotions }
}

export function BrainDumpSorterApp() {
  const supabase = useMemo(() => createBrowserClient(), [])
  const [userId, setUserId] = useState<string | null>(null)

  const [inputText, setInputText] = useState(
    'BRAINDUMP need to email the invoice to accounting, also what if the onboarding flow used a interactive checklist instead of a video? feeling kind of overwhelmed today tbh'
  )
  const [sorted, setSorted] = useState<SortedResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [history, setHistory] = useState<JournalEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null)
    })
  }, [supabase])

  const fetchHistory = useCallback(async () => {
    if (!userId) return
    setHistoryLoading(true)
    const { data } = await supabase
      .from('tool_runs')
      .select('id, created_at, output_text')
      .eq('tool_slug', 'brain-dump-sorter')
      .order('created_at', { ascending: false })
      .limit(30)
    setHistory((data as JournalEntry[]) ?? [])
    setHistoryLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    if (!userId) return
    let ignore = false
    supabase
      .from('tool_runs')
      .select('id, created_at, output_text')
      .eq('tool_slug', 'brain-dump-sorter')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (!ignore) {
          setHistory((data as JournalEntry[]) ?? [])
        }
      })
    return () => {
      ignore = true
    }
  }, [supabase, userId])

  const handleSort = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    // Strip keyword if prepended
    const cleanText = inputText.replace(/^BRAINDUMP\s*/i, '').trim()
    const result = classifyText(cleanText)
    setSorted(result)
    setSavedSuccess(false)

    if (!userId) return
    setSaving(true)
    try {
      const summary = JSON.stringify({
        input: cleanText,
        tasksCount: result.tasks.length,
        ideasCount: result.ideas.length,
        emotionsCount: result.emotions.length,
        result,
      })

      const { data: req } = await supabase
        .from('tool_requests')
        .insert({
          user_id: userId,
          keyword: 'BRAINDUMP',
          input_text: cleanText,
          channel: 'web',
          status: 'completed',
        })
        .select('id')
        .single()

      if (req) {
        await supabase.from('tool_runs').insert({
          tool_request_id: req.id,
          tool_slug: 'brain-dump-sorter',
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
        .glass { background: #000000; border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); }
        @keyframes bds-fade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .bds-fade { animation: bds-fade .35s ease both; }
      `}</style>

      <div
        className="min-h-screen text-white"
        style={{ background: '#000000' }}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg,#F5C518,#F5C518)' }}>
                <span>🧠</span>
              </span>
              <span className="font-medium tracking-normal text-white" style={{ fontFamily: 'var(--font-anton), Oswald, sans-serif' }}>
                Brain Dump <span style={{ color: '#F5C518' }}>Sorter</span>
              </span>
            </div>
            <div className="hidden gap-6 text-sm font-medium text-slate-400 md:flex">
              <a href="#sorter" className="hover:text-white transition">Live Classifier</a>
              <a href="#how" className="hover:text-white transition">How it Works</a>
              <a href="#history" className="hover:text-white transition">History Log</a>
            </div>
            <a href="#sorter" className="inline-flex items-center rounded-full border border-[#F5C518]/40 px-5 py-2 text-xs font-medium uppercase tracking-widest text-[#F5C518] hover:bg-[#F5C518]/10 transition">
              Use Classifier
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="py-16 md:py-24 grid gap-12 md:grid-cols-2 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider"
                style={{ borderColor: 'rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.05)', color: '#F5C518' }}>
                ✨ NLP Thought Classifier
              </span>
              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-normal leading-[0.98] tracking-normal" style={{ fontFamily: 'var(--font-anton), Oswald, sans-serif' }}>
                Dump your thoughts.{' '}
                <span style={{ background: 'linear-gradient(90deg,#F5C518,#F5C518)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Sort the mess.
                </span>
              </h1>
              <p className="mt-5 text-lg text-slate-400 max-w-lg">
                Instantly classify raw, unfiltered brain dumps into 3 organized buckets — <strong className="text-white">Tasks, Ideas, and Emotions</strong> — so nothing you think ever gets lost.
              </p>
              <div className="mt-8 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="rounded-full bg-black border border-white/10 px-3 py-1 text-[#F5C518]">WhatsApp Keyword: BRAINDUMP</span>
                <span>Auto-sorts into Notion</span>
              </div>
            </div>

            <div className="glass rounded-none p-8 space-y-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-2">Classifier Preview</p>
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-medium">
                <div className="rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/10 py-3 text-[#F5C518]">
                  <span className="block text-lg">📋</span> Task
                </div>
                <div className="rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/10 py-3 text-[#F5C518]">
                  <span className="block text-lg">💡</span> Idea
                </div>
                <div className="rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/10 py-3 text-[#F5C518]">
                  <span className="block text-lg">❤️</span> Emotion
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Paste any unstructured thoughts below to see live NLP classification in action.
              </p>
            </div>
          </section>

          {/* Sorter Interactive Tool */}
          <section id="sorter" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-center mb-10">
              <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#F5C518' }}>Interactive Tool</p>
              <h2 className="text-3xl font-normal sm:text-4xl">Sort Your Brain Dump</h2>
              <p className="mt-2 text-slate-400 max-w-lg mx-auto">Type or paste your raw stream-of-consciousness thoughts below.</p>
            </div>

            <form onSubmit={handleSort} className="glass rounded-none p-6 md:p-10 space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Raw Brain Dump Input</label>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. BRAINDUMP need to email invoice, what if we made an interactive widget, feeling stressed today..."
                  className="w-full resize-none rounded-none border border-white/10 bg-black p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#F5C518] transition"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto rounded-full px-8 py-3.5 font-medium text-slate-900 shadow-lg transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg,#F5C518,#F5C518)' }}
                >
                  {saving ? 'Sorting…' : '⚡ Sort My Brain Dump'}
                </button>
                {savedSuccess && <p className="text-xs text-[#F5C518] font-medium">✓ Sorted and saved to history log</p>}
              </div>
            </form>

            {/* Results Grid */}
            {sorted && (
              <div className="mt-10 grid md:grid-cols-3 gap-6 bds-fade">
                {/* Tasks */}
                <div className="glass rounded-none p-6 space-y-4 border-t border-white/15">
                  <h3 className="text-lg font-medium text-[#F5C518] flex items-center gap-2">
                    📋 Tasks ({sorted.tasks.length})
                  </h3>
                  {sorted.tasks.length === 0 ? (
                    <p className="text-xs text-slate-500">No task items detected.</p>
                  ) : (
                    <ul className="space-y-2">
                      {sorted.tasks.map((item, idx) => (
                        <li key={idx} className="rounded-xl border border-white/10 bg-black p-3 text-xs text-slate-200 leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Ideas */}
                <div className="glass rounded-none p-6 space-y-4 border-t border-white/15">
                  <h3 className="text-lg font-medium text-[#F5C518] flex items-center gap-2">
                    💡 Ideas ({sorted.ideas.length})
                  </h3>
                  {sorted.ideas.length === 0 ? (
                    <p className="text-xs text-slate-500">No idea items detected.</p>
                  ) : (
                    <ul className="space-y-2">
                      {sorted.ideas.map((item, idx) => (
                        <li key={idx} className="rounded-xl border border-white/10 bg-black p-3 text-xs text-slate-200 leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Emotions */}
                <div className="glass rounded-none p-6 space-y-4 border-t border-white/15">
                  <h3 className="text-lg font-medium text-[#F5C518] flex items-center gap-2">
                    ❤️ Emotions ({sorted.emotions.length})
                  </h3>
                  {sorted.emotions.length === 0 ? (
                    <p className="text-xs text-slate-500">No emotion items detected.</p>
                  ) : (
                    <ul className="space-y-2">
                      {sorted.emotions.map((item, idx) => (
                        <li key={idx} className="rounded-xl border border-white/10 bg-black p-3 text-xs text-slate-200 leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* How it works */}
          <section id="how" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-center mb-10">
              <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#F5C518' }}>3-Step System</p>
              <h2 className="text-3xl font-normal sm:text-4xl">How It Works</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-none p-6 text-center space-y-3">
                <span className="text-3xl">📱</span>
                <h3 className="text-base font-medium text-white">1. Send on WhatsApp</h3>
                <p className="text-xs text-slate-400">Message keyword <code className="text-[#F5C518] font-mono">BRAINDUMP</code> followed by whatever is on your mind.</p>
              </div>
              <div className="glass rounded-none p-6 text-center space-y-3">
                <span className="text-3xl">⚡</span>
                <h3 className="text-base font-medium text-white">2. AI Classifies</h3>
                <p className="text-xs text-slate-400">NLP prompt parses raw text into Task, Idea, or Emotion categories instantly.</p>
              </div>
              <div className="glass rounded-none p-6 text-center space-y-3">
                <span className="text-3xl">📊</span>
                <h3 className="text-base font-medium text-white">3. Auto-Sync to Notion</h3>
                <p className="text-xs text-slate-400">Classified notes land directly into your Notion board or account history.</p>
              </div>
            </div>
          </section>

          {/* History */}
          {userId && (
            <section id="history" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: '#F5C518' }}>Saved Dumps</p>
                  <h2 className="text-3xl font-normal">History Log</h2>
                </div>
                <button onClick={fetchHistory} className="text-xs text-slate-500 hover:text-white transition">↻ Refresh</button>
              </div>

              {historyLoading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : history.length === 0 ? (
                <p className="glass rounded-none p-6 text-sm text-slate-500">No brain dumps saved yet — sort a dump above.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => {
                    let input = 'Brain dump', tasksCount = 0, ideasCount = 0, emotionsCount = 0
                    try {
                      const p = JSON.parse(item.output_text)
                      input = p.input || 'Brain dump'
                      tasksCount = p.tasksCount || 0
                      ideasCount = p.ideasCount || 0
                      emotionsCount = p.emotionsCount || 0
                    } catch {}
                    return (
                      <div key={item.id} className="glass flex items-center justify-between gap-4 rounded-none px-5 py-4">
                        <div className="flex items-center gap-6 min-w-0 text-sm">
                          <span className="text-slate-500 shrink-0">
                            {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="font-medium text-white truncate max-w-xs">{input}</span>
                          <span className="text-[#F5C518] text-xs font-medium shrink-0">📋 {tasksCount} tasks</span>
                          <span className="text-[#F5C518] text-xs font-medium shrink-0">💡 {ideasCount} ideas</span>
                          <span className="text-[#F5C518] text-xs font-medium shrink-0">❤️ {emotionsCount} emotions</span>
                        </div>
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-[#F5C518]/10 hover:text-[#F5C518] transition"
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
            <p>© 2026 PLANET SOR7ED · Brain Dump Sorter</p>
            <Link href="/" className="hover:text-slate-400 transition">← Back to PLANET SOR7ED</Link>
          </footer>
        </div>
      </div>
    </>
  )
}

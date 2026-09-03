'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

type Phase = 'form' | 'loading' | 'result' | 'error'

interface ResultData {
  result: string
  whatsapp: boolean
}

export function TaskBreakdownWizardClient() {
  const [phase, setPhase] = useState<Phase>('form')
  const [task, setTask] = useState('')
  const [context, setContext] = useState('')
  const [data, setData] = useState<ResultData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!task.trim()) return
    setPhase('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/tools/task-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: task.trim(), context: context.trim() }),
      })

      const json = await res.json()

      if (res.status === 401) {
        // Redirect to sign in, come back after
        window.location.href = `/signup?mode=first-time&next=${encodeURIComponent('/tools/task-breakdown-wizard')}`
        return
      }

      if (res.status === 422 && json.error === 'no_whatsapp') {
        window.location.href = `/connect?next=${encodeURIComponent('/tools/task-breakdown-wizard')}`
        return
      }

      if (!json.result) {
        setErrorMsg(json.error || 'Something went wrong generating your next step.')
        setPhase('error')
        return
      }

      setData({ result: json.result, whatsapp: json.whatsapp ?? false })
      setPhase('result')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      setErrorMsg("We couldn't reach the server. Your answers are still here.")
      setPhase('error')
    }
  }

  function handleReset() {
    setPhase('form')
    setData(null)
    setErrorMsg('')
    setCopied(false)
  }

  async function handleCopy() {
    if (!data?.result) return
    try {
      await navigator.clipboard.writeText(data.result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* ── FORM ─────────────────────────────────────────────────────────── */}
      {(phase === 'form' || phase === 'error') && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="tbw-task"
              className="mb-2 block text-sm font-medium uppercase tracking-widest text-[#F5C518]"
            >
              What task are you trying to do?
            </label>
            <textarea
              id="tbw-task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={3}
              required
              placeholder="For example: reply to an email I've been avoiding."
              className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-[#F5C518]/60 focus:outline-none focus:ring-1 focus:ring-[#F5C518]/40"
            />
          </div>

          <div>
            <label
              htmlFor="tbw-context"
              className="mb-2 block text-sm font-medium uppercase tracking-widest text-neutral-400"
            >
              Anything making it harder today?{' '}
              <span className="normal-case font-normal tracking-normal text-neutral-500">
                (You can leave this blank.)
              </span>
            </label>
            <textarea
              id="tbw-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              placeholder="For example: low energy, not sure where to start, anxious about the reply."
              className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-[#F5C518]/60 focus:outline-none focus:ring-1 focus:ring-[#F5C518]/40"
            />
          </div>

          {/* Error message */}
          {phase === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMsg}
            </div>
          )}

          {/* First-time note */}
          <p className="text-xs leading-relaxed text-neutral-500">
            First time? We&rsquo;ll ask you to sign in with a magic link and connect your WhatsApp once.
            After that, your results just arrive.
          </p>

          {/* Privacy note */}
          <p className="text-xs leading-relaxed text-neutral-600">
            Your answers are used to generate your result. We keep them only as long as needed
            to deliver it and improve the tool.{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-neutral-400">
              Full details in our privacy policy.
            </Link>
          </p>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#F5C518] py-4 text-sm font-semibold uppercase tracking-[0.16em] text-black transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Send my first step to WhatsApp
          </button>
        </form>
      )}

      {/* ── LOADING ──────────────────────────────────────────────────────── */}
      {phase === 'loading' && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#F5C518]" />
          <p className="text-sm text-neutral-400">Working on your next step&hellip;</p>
        </div>
      )}

      {/* ── RESULT ───────────────────────────────────────────────────────── */}
      {phase === 'result' && data && (
        <div ref={resultRef} className="space-y-8">
          {/* Status line */}
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[#F5C518]">
              {data.whatsapp ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.28 7.044L.787 23.25l4.32-1.383A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.957 0-3.803-.527-5.393-1.448l-.387-.225-3.995 1.046 1.07-3.878-.254-.4A9.955 9.955 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
            </span>
            <div>
              <p className="font-medium text-white">Your next step is on its way.</p>
              <p className="mt-1 text-sm text-neutral-400">
                {data.whatsapp
                  ? "It's arriving in your WhatsApp now. Here's a copy, in case you want it here too."
                  : "Here's your result. We couldn't reach WhatsApp, but you can copy it below."}
              </p>
            </div>
          </div>

          {/* Result card */}
          <div className="rounded-lg border border-[#F5C518]/25 bg-white/4 p-6">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-[#F5C518]">
              Your next step
            </p>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white">
              {data.result}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="rounded-lg border border-white/20 px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:border-white/40"
            >
              {copied ? 'Copied!' : 'Copy result'}
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg border border-[#F5C518]/30 px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-[#F5C518] transition-colors hover:border-[#F5C518]/60"
            >
              Break down a different task
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { TaskBreakdownWizardClient } from '@/components/TaskBreakdownWizardClient'

export const metadata: Metadata = {
  title: 'Task Breakdown Wizard — Planet Sorted',
  description:
    'Turn a task you\'re avoiding into smaller steps. Your first action arrives in your WhatsApp.',
}

export default function TaskBreakdownWizardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-5 pt-16 pb-24 sm:pt-20">

        {/* ── Above the fold ─────────────────────────────────────────────── */}
        <div className="mb-12">
          <Link
            href="/start"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </Link>

          <div className="mt-8">
            <span className="sor7ed-pill">Mind</span>
            <h1 className="mt-4 font-bebas text-4xl uppercase leading-[1.15] tracking-normal text-white sm:text-5xl">
              Task Breakdown Wizard
            </h1>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-neutral-400">
              Turn a task that feels too big into a smaller place to start.
            </p>
          </div>
        </div>

        {/* ── Form / Result ──────────────────────────────────────────────── */}
        <TaskBreakdownWizardClient />

        {/* ── Below the fold ─────────────────────────────────────────────── */}
        <div className="mt-20 space-y-16 border-t border-white/8 pt-16">

          {/* How it works */}
          <section>
            <h2 className="mb-6 font-bebas text-2xl uppercase tracking-normal text-white">
              How it works
            </h2>
            <ol className="space-y-4">
              {[
                'Describe the task you\'re avoiding in your own words.',
                'Optionally tell us anything that\'s making it harder today.',
                'We generate one concrete first action — small enough to actually start.',
                'Your result arrives in your WhatsApp and shows here.',
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5C518] font-bebas text-sm text-black">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-neutral-400 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Who it's for */}
          <section>
            <h2 className="mb-4 font-bebas text-2xl uppercase tracking-normal text-white">
              Who it&rsquo;s for
            </h2>
            <p className="text-sm leading-relaxed text-neutral-400">
              This tool is designed for anyone whose brain makes starting things harder than finishing
              them — whether that&rsquo;s ADHD task paralysis, autistic demand avoidance, executive
              function difficulties, or just a low-energy day. The goal is one action small enough
              to be real.
            </p>
          </section>

          {/* Related */}
          <section>
            <h2 className="mb-4 font-bebas text-2xl uppercase tracking-normal text-white">
              Related tools
            </h2>
            <Link
              href="/adhd-tax-calculator"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm text-white transition-colors hover:border-[#F5C518]/40 hover:text-[#F5C518]"
            >
              ADHD Tax Calculator
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}

'use client'

import Image from 'next/image'
import { GetSortedButton } from '@/components/buttons/GetSortedButton'

interface ToolClientProps {
  slug: string
  hasPaidPlan?: boolean
}

const TOOL_DATA: Record<string, { keyword: string; title: string; promise: string; cover: string; features: string[] }> = {
  'adhd-tax-calculator': {
    keyword: 'TAX',
    title: 'ADHD Tax Calculator',
    promise: 'Calculate subscription leaks, late fees, and impulse buying overhead in 3 minutes.',
    cover: '/images/tool-tax.jpg',
    features: [
      'Instant monthly and yearly tax calculation',
      'Category leak breakdown (subscriptions, fees, replacements)',
      '24-hour & 7-day recovery action plan delivered to WhatsApp',
    ],
  },
  'financial-autopilot': {
    keyword: 'AUTOPILOT',
    title: 'Financial Autopilot',
    promise: 'Build a friction-free bill and savings automation system in 5 minutes.',
    cover: '/images/tool-autopilot.jpg',
    features: [
      'Fixed bill & guilt-free spending breakdown',
      'Payday transfer sequence recommendation',
      'Custom banking standing order blueprint',
    ],
  },
  'decision-paralysis-solver': {
    keyword: 'CLARITY',
    title: 'Decision Paralysis Solver',
    promise: 'Break through overthinking with forced binary elimination in 2 minutes.',
    cover: '/images/tool-clarity.jpg',
    features: [
      'Binary option comparison & safety margins',
      'Fear-mitigation framing to eliminate regret',
      '72-hour decision guardrail protocol',
    ],
  },
}

export function ToolClient({ slug, hasPaidPlan = false }: ToolClientProps) {
  const tool = TOOL_DATA[slug] ?? TOOL_DATA['adhd-tax-calculator']

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Premium Hero Teaser Section */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-neutral-800">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image src={tool.cover} alt={tool.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/95" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <div className="mx-auto h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
          <p className="font-bold text-xs tracking-[0.25em] uppercase text-[#3498DB]">Sorted Lab Tool</p>
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-black uppercase leading-none tracking-tight text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {tool.title}
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {tool.promise}
          </p>

          {/* Explainer */}
          <div className="pt-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              ⚡ Runs entirely in WhatsApp — no forms, no download, no friction.
            </p>
          </div>

          {/* CTA Button pointing at the plain keyword */}
          <div className="pt-4 flex justify-center">
            <GetSortedButton slug={tool.keyword} context="tool" />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* What You Get */}
        <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            What This Tool Delivers
          </h2>
          <ul className="space-y-4 text-base text-neutral-300">
            {tool.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#C0392B] font-bold text-lg shrink-0">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Plus-Tier Upsell Block */}
        {!hasPaidPlan && (
          <div className="rounded-2xl border border-[#C0392B]/40 bg-[#1A1112] p-8 text-center space-y-4 shadow-2xl">
            <div className="text-3xl">✨</div>
            <h3 className="text-3xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Unlock Plus Deliverables &amp; History
            </h3>
            <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Get unlimited tool runs, saved history, PDF exports, and multi-account blueprints with Plus — £5.99/month or £49/year. Scholarships available, no questions asked.
            </p>
            <a
              href="/r/upgrade"
              className="inline-block rounded-full bg-[#C0392B] px-8 py-3 font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors text-sm"
            >
              Upgrade to Plus →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

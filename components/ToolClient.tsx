'use client'

import { useState } from 'react'
import Image from 'next/image'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'

interface ToolClientProps {
  slug: string
  hasPaidPlan?: boolean
}

const TOOL_META: Record<string, { keyword: string; title: string; promise: string; cover: string; steps: string[]; freeFeatures: string[]; plusFeatures: string[] }> = {
  'adhd-tax-calculator': {
    keyword: 'TAX',
    title: 'ADHD Tax Calculator',
    promise: 'Calculate subscription leaks, late fees, and impulse buying overhead in 3 minutes.',
    cover: '/images/tool-tax.jpg',
    steps: [
      'Enter your estimated monthly costs across key leak areas.',
      'Get your instant yearly ADHD tax calculation & leak breakdown.',
      'Receive a custom step-by-step action plan to plug the leaks.'
    ],
    freeFeatures: [
      'Instant monthly and yearly tax calculation',
      'Category leak breakdown',
      'Save summary result to phone'
    ],
    plusFeatures: [
      'Full 24-hour & 7-day recovery action plan',
      'Impulse purchase cooling-off checklist',
      'Export detailed PDF breakdown',
      'Sync history & compare monthly progress'
    ]
  },
  'financial-autopilot': {
    keyword: 'AUTOPILOT',
    title: 'Financial Autopilot',
    promise: 'Build a friction-free bill and savings automation system in 5 minutes.',
    cover: '/images/tool-autopilot.jpg',
    steps: [
      'Enter your take-home income, payday, and savings target.',
      'Generate an automated money flow sequence tied to your payday.',
      'Copy exact transfer rules to your banking app.'
    ],
    freeFeatures: [
      'Fixed bill & guilt-free spending breakdown',
      'Payday transfer sequence recommendation',
      'Basic money allocation summary'
    ],
    plusFeatures: [
      'Custom banking standing order instructions',
      'Multi-account routing blueprint',
      'Downloadable Autopilot cheatsheet',
      'WhatsApp automated reminder triggers'
    ]
  },
  'decision-paralysis-solver': {
    keyword: 'CLARITY',
    title: 'Decision Paralysis Solver',
    promise: 'Break through overthinking with forced binary elimination in 2 minutes.',
    cover: '/images/tool-clarity.jpg',
    steps: [
      'Input the decision, option A, option B, and your primary fear.',
      'Apply structured safety margins to isolate the risk.',
      'Get a firm preference recommendation and cutoff deadline.'
    ],
    freeFeatures: [
      'Binary option comparison',
      'Fear-mitigation framing',
      'Clear decision recommendation'
    ],
    plusFeatures: [
      '72-hour decision guardrail protocol',
      'Secondary fallback trigger system',
      'Save decision brief to WhatsApp library',
      'Historical decision log & audit trail'
    ]
  }
}

export function ToolClient({ slug, hasPaidPlan = false }: ToolClientProps) {
  const [submitted, setSubmitted] = useState(false)
  const meta = TOOL_META[slug] ?? TOOL_META['adhd-tax-calculator']

  // 1) ADHD Tax Calculator Form State
  const [subscriptions, setSubscriptions] = useState('20')
  const [lateFees, setLateFees] = useState('15')
  const [replacements, setReplacements] = useState('30')
  const [impulse, setImpulse] = useState('100')

  // 2) Financial Autopilot Form State
  const [income, setIncome] = useState('2500')
  const [payday, setPayday] = useState('1')
  const [savingsGoal, setSavingsGoal] = useState('300')

  // 3) Decision Paralysis Solver Form State
  const [decision, setDecision] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [fear, setFear] = useState('')

  const handleReset = () => {
    setSubmitted(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  // Calculations
  const subVal = parseFloat(subscriptions) || 0
  const lateVal = parseFloat(lateFees) || 0
  const repVal = parseFloat(replacements) || 0
  const impVal = parseFloat(impulse) || 0
  
  const monthlyTax = subVal + lateVal + repVal + impVal
  const yearlyTax = monthlyTax * 12

  const incomeVal = parseFloat(income) || 0
  const goalVal = parseFloat(savingsGoal) || 0
  const billsVal = Math.round(incomeVal * 0.4)
  const spendingVal = Math.round(incomeVal - billsVal - goalVal)

  const waDirectUrl = `https://wa.me/447591922247?text=${encodeURIComponent(meta.keyword)}`

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-neutral-800">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image src={meta.cover} alt={meta.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/95" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
          <p className="font-bold text-xs tracking-[0.25em] uppercase text-[#3498DB]">Sorted Lab Tool</p>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase leading-none tracking-tight text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {meta.title}
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 max-w-2xl leading-relaxed">
            {meta.promise}
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <a
              href={waDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#C0392B] px-8 py-3.5 text-base font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors shadow-lg"
            >
              <span>RUN ON WHATSAPP ({meta.keyword}) →</span>
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {!submitted ? (
          <div className="space-y-16">
            {/* Interactive Browser Tool Form */}
            <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-6 sm:p-10 shadow-2xl space-y-6">
              {slug === 'adhd-tax-calculator' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      Try Interactive Preview Below
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Enter your estimated monthly numbers to calculate your total ADHD tax leak in real-time.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Unused Subscriptions (£ / mo)
                      </label>
                      <input
                        type="number"
                        value={subscriptions}
                        onChange={(e) => setSubscriptions(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Late Fees &amp; Fines (£ / mo)
                      </label>
                      <input
                        type="number"
                        value={lateFees}
                        onChange={(e) => setLateFees(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Replacing Lost Items (£ / mo)
                      </label>
                      <input
                        type="number"
                        value={replacements}
                        onChange={(e) => setReplacements(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Impulse Purchases (£ / mo)
                      </label>
                      <input
                        type="number"
                        value={impulse}
                        onChange={(e) => setImpulse(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#C0392B] py-4 font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors text-base shadow-lg"
                  >
                    Calculate My ADHD Tax Result →
                  </button>
                </form>
              )}

              {slug === 'financial-autopilot' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      Try Interactive Preview Below
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Enter your monthly pay details to build your automated payday allocation.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Monthly Take-Home Income (£)
                      </label>
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Payday (Day of Month, 1-31)
                      </label>
                      <input
                        type="number"
                        value={payday}
                        onChange={(e) => setPayday(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Monthly Savings/Investing Goal (£)
                      </label>
                      <input
                        type="number"
                        value={savingsGoal}
                        onChange={(e) => setSavingsGoal(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#C0392B] py-4 font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors text-base shadow-lg"
                  >
                    Generate Autopilot Plan →
                  </button>
                </form>
              )}

              {slug === 'decision-paralysis-solver' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      Try Interactive Preview Below
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Got a choice you can&apos;t make? Input your parameters below to isolate the risk.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        The Decision to Make
                      </label>
                      <input
                        type="text"
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        required
                        placeholder="e.g. Booking a holiday vs saving the money"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Option A
                      </label>
                      <input
                        type="text"
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        required
                        placeholder="e.g. Book the trip to Spain"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Option B
                      </label>
                      <input
                        type="text"
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        required
                        placeholder="e.g. Keep the money in savings"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        What is the biggest worry about picking Option A?
                      </label>
                      <input
                        type="text"
                        value={fear}
                        onChange={(e) => setFear(e.target.value)}
                        required
                        placeholder="e.g. Feeling guilty or running out of emergency funds"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#C0392B] py-4 font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors text-base shadow-lg"
                  >
                    Resolve Decision →
                  </button>
                </form>
              )}
            </div>

            {/* How It Works Section */}
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                How It Works
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {meta.steps.map((step, idx) => (
                  <div key={idx} className="rounded-2xl border border-neutral-800 bg-[#141414] p-6 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#C0392B] flex items-center justify-center text-white text-3xl font-black shrink-0" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {idx + 1}
                    </div>
                    <p className="text-base text-neutral-300 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What You Get Section (Free vs Plus) */}
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                What You Get
              </h2>

              <div className="grid gap-8 sm:grid-cols-2">
                {/* Free Card */}
                <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-8 space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Free Tier</span>
                    <h3 className="text-3xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Instant Result</h3>
                    <p className="text-sm text-neutral-400 mt-1">Included for everyone. Instant clarity in your browser.</p>
                  </div>
                  <ul className="space-y-3 text-sm text-neutral-300">
                    {meta.freeFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#C0392B] font-bold shrink-0">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plus Card */}
                <div className="relative rounded-2xl border border-[#C0392B]/50 bg-[#1A1112] p-8 space-y-6 shadow-2xl">
                  <span className="absolute top-4 right-4 bg-[#C0392B] text-white text-xs uppercase px-3 py-1 font-bold rounded-full">
                    Most popular
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Plus Tier</span>
                    <h3 className="text-3xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Full Action Plan</h3>
                    <p className="text-sm text-neutral-400 mt-1">£5.99/mo or £49/yr. Deliverables + history.</p>
                  </div>
                  <ul className="space-y-3 text-sm text-neutral-200">
                    {meta.plusFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">★</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results Mode — Instant Interactive Breakdown */
          <div className="space-y-8">
            {/* 1. Hero Result */}
            <div className="rounded-2xl border border-[#C0392B]/40 bg-[#1A1112] p-8 text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C0392B]">Your Actionable Result</span>
              
              {slug === 'adhd-tax-calculator' && (
                <div>
                  <p className="text-5xl sm:text-6xl font-extrabold text-white">£{monthlyTax}/mo</p>
                  <p className="mt-1 text-sm text-neutral-300">Estimated ADHD Tax leak (£{yearlyTax} / year)</p>
                </div>
              )}

              {slug === 'financial-autopilot' && (
                <div>
                  <p className="text-4xl font-extrabold text-white">Autopilot Configured</p>
                  <p className="mt-1 text-sm text-neutral-300">Ready to run on Day {payday} of the month</p>
                </div>
              )}

              {slug === 'decision-paralysis-solver' && (
                <div>
                  <p className="text-4xl font-extrabold text-white">Option A is Preferred</p>
                  <p className="mt-1 text-sm text-neutral-300">Under the condition that we manage the fear: &quot;{fear}&quot;</p>
                </div>
              )}
            </div>

            {/* 2. Breakdown */}
            <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-6">
              <h2 className="text-2xl font-black uppercase text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Calculation Breakdown</h2>
              
              {slug === 'adhd-tax-calculator' && (
                <div className="space-y-3 text-sm text-neutral-300">
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Subscriptions:</span>
                    <span className="font-semibold text-white">£{subVal}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Late Fees:</span>
                    <span className="font-semibold text-white">£{lateVal}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Lost Item Replacement:</span>
                    <span className="font-semibold text-white">£{repVal}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Impulse Buys:</span>
                    <span className="font-semibold text-white">£{impVal}</span>
                  </div>
                </div>
              )}

              {slug === 'financial-autopilot' && (
                <div className="space-y-3 text-sm text-neutral-300">
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Total Income:</span>
                    <span className="font-semibold text-white">£{incomeVal}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Fixed Bills (40%):</span>
                    <span className="font-semibold text-white">£{billsVal}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Savings Target:</span>
                    <span className="font-semibold text-white">£{goalVal}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Guilt-Free Spending:</span>
                    <span className="font-semibold text-white">£{spendingVal}</span>
                  </div>
                </div>
              )}

              {slug === 'decision-paralysis-solver' && (
                <div className="space-y-3 text-sm text-neutral-300">
                  <p>
                    We analysed your options for <strong>&quot;{decision}&quot;</strong>.
                  </p>
                  <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 space-y-1">
                    <p><span className="font-semibold text-white">Choice A:</span> {optionA}</p>
                    <p><span className="font-semibold text-white">Choice B:</span> {optionB}</p>
                  </div>
                  <p>
                    To eliminate paralysis, we apply safety margins: limit downside of Choice A, set a firm cutoff date, and automate follow-through.
                  </p>
                </div>
              )}
            </div>

            {/* Direct WhatsApp CTA Button & Save to Phone */}
            <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-8 text-center space-y-4">
              <h3 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Send This Result To WhatsApp
              </h3>
              <p className="text-sm text-neutral-400 max-w-md mx-auto">
                Save your calculation to your WhatsApp library so you can access it any time.
              </p>
              <div className="pt-2 flex justify-center">
                <a
                  href={waDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C0392B] px-8 py-3.5 text-base font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors shadow-lg"
                >
                  <span>GET RESULT ON WHATSAPP →</span>
                </a>
              </div>
            </div>

            {/* Rerun loop */}
            <div className="flex items-center justify-between border-t border-neutral-800 pt-6">
              <p className="text-xs text-neutral-500">
                Suggested cadence: {slug === 'decision-paralysis-solver' ? 'Run whenever stuck' : 'Run monthly'}
              </p>
              <button
                onClick={handleReset}
                className="rounded-full border border-neutral-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
              >
                Rerun Tool
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

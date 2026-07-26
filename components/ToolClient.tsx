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

  const waDirectUrl = `https://wa.me/447591922247?text=${encodeURIComponent(meta.keyword)}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  // Calculations
  const subNum = parseFloat(subscriptions) || 0
  const lateNum = parseFloat(lateFees) || 0
  const repNum = parseFloat(replacements) || 0
  const impNum = parseFloat(impulse) || 0

  const monthlyTax = subNum + lateNum + repNum + impNum
  const yearlyTax = monthlyTax * 12

  const incNum = parseFloat(income) || 0
  const savNum = parseFloat(savingsGoal) || 0
  const fixedBills = Math.round(incNum * 0.5)
  const guiltFree = Math.max(0, incNum - fixedBills - savNum)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Tool Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-neutral-800">
        <div className="absolute inset-0 z-0 opacity-50">
          <Image src={meta.cover} alt={meta.title} fill unoptimized priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
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
        {/* Banner Graphic Card */}
        <div className="mb-10 relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl">
          <Image
            src={meta.cover}
            alt={`${meta.title} Banner`}
            fill
            unoptimized
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-neutral-700">
              Interactive Web App Tool
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C0392B]">
              KEYWORD: {meta.keyword}
            </span>
          </div>
        </div>

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
                    className="w-full rounded-full bg-[#C0392B] px-8 py-4 text-base font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors shadow-lg"
                  >
                    CALCULATE MY TAX LEAK →
                  </button>
                </form>
              )}

              {slug === 'financial-autopilot' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      Configure Payday Automation
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Input your income and savings target to build a zero-friction payday flow.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Monthly Net Income (£)
                      </label>
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Payday (Day of Month)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={payday}
                        onChange={(e) => setPayday(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Monthly Savings Goal (£)
                      </label>
                      <input
                        type="number"
                        value={savingsGoal}
                        onChange={(e) => setSavingsGoal(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#C0392B] px-8 py-4 text-base font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors shadow-lg"
                  >
                    GENERATE PAYDAY FLOW →
                  </button>
                </form>
              )}

              {slug === 'decision-paralysis-solver' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      Binary Decision Framework
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Force binary clarity in 60 seconds. Eliminate analysis paralysis.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        What decision are you stuck on?
                      </label>
                      <input
                        type="text"
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        placeholder="e.g. Should I accept the new job offer or stay?"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                          Option A
                        </label>
                        <input
                          type="text"
                          value={optionA}
                          onChange={(e) => setOptionA(e.target.value)}
                          placeholder="Accept new job offer"
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                          required
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
                          placeholder="Stay in current role"
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        What is your worst-case fear if option A goes wrong?
                      </label>
                      <input
                        type="text"
                        value={fear}
                        onChange={(e) => setFear(e.target.value)}
                        placeholder="e.g. Not fitting into the team culture"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#C0392B] px-8 py-4 text-base font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors shadow-lg"
                  >
                    BREAK THE PARALYSIS →
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Output Results Screen */}
            <div className="rounded-2xl border border-[#C0392B]/50 bg-[#141414] p-6 sm:p-10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#3498DB]">
                  Calculation Result
                </span>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white underline"
                >
                  Edit Input
                </button>
              </div>

              {slug === 'adhd-tax-calculator' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Estimated Leak</span>
                    <div className="text-6xl sm:text-7xl font-black uppercase text-[#C0392B] mt-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      £{monthlyTax.toLocaleString()} / mo (£{yearlyTax.toLocaleString()} / yr)
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-sm text-neutral-300">
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Subscriptions</span>
                      <span className="text-xl font-bold text-white">£{subNum} / mo</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Late Fees</span>
                      <span className="text-xl font-bold text-white">£{lateNum} / mo</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Replacing Items</span>
                      <span className="text-xl font-bold text-white">£{repNum} / mo</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Impulse Purchases</span>
                      <span className="text-xl font-bold text-white">£{impNum} / mo</span>
                    </div>
                  </div>
                </div>
              )}

              {slug === 'financial-autopilot' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Payday Transfer Sequence</span>
                    <div className="text-5xl sm:text-6xl font-black uppercase text-[#C0392B] mt-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      Day {payday} Automated Flow
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 text-sm text-neutral-300">
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Fixed Bills (50%)</span>
                      <span className="text-xl font-bold text-white">£{fixedBills}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Automated Savings</span>
                      <span className="text-xl font-bold text-white">£{savNum}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Guilt-Free Spending</span>
                      <span className="text-xl font-bold text-white">£{guiltFree}</span>
                    </div>
                  </div>
                </div>
              )}

              {slug === 'decision-paralysis-solver' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Decision Recommendation</span>
                    <div className="text-4xl sm:text-5xl font-black uppercase text-[#C0392B] mt-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      Choose: {optionA || 'Option A'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-300 space-y-2">
                    <p><strong className="text-white">Decision:</strong> {decision}</p>
                    <p><strong className="text-white">Eliminated:</strong> {optionB}</p>
                    {fear && <p><strong className="text-white">Mitigated Fear:</strong> {fear}</p>}
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <a
                  href={waDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C0392B] px-8 py-3.5 text-base font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors shadow-lg"
                >
                  <span>SEND RESULT TO WHATSAPP ({meta.keyword}) →</span>
                </a>
                <SaveToPhoneButton slug={slug} context="tool" isLoggedIn={false} whatsappVerified={false} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

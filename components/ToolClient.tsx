'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { GetSortedButton } from '@/components/buttons/GetSortedButton'
import { calculateAdhdTax } from '@/lib/adhdTaxCalculator'
import type { Protocol } from '@/lib/types/database'

interface ToolClientProps {
  slug: string
  toolData: Protocol
}

function ToolBlogPost({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)

  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        const heading = block.match(/^#{1,6}\s+(.+)$/)
        if (heading) {
          return (
            <h2 key={`${heading[1]}-${index}`} className="border-b border-neutral-800 pb-3 text-3xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {heading[1]}
            </h2>
          )
        }

        return <p key={index} className="whitespace-pre-line text-lg leading-relaxed text-neutral-200">{block}</p>
      })}
    </div>
  )
}

export function ToolClient({ slug, toolData }: ToolClientProps) {
  const [submitted, setSubmitted] = useState(false)
  const meta = {
    title: toolData.title,
    promise: toolData.summary,
  }

  // 1) ADHD Tax Calculator Form State
  const [lateFees, setLateFees] = useState('15')
  const [weeklyImpulsePurchases, setWeeklyImpulsePurchases] = useState('60')
  const [forgottenSubscriptions, setForgottenSubscriptions] = useState('20')
  const [lostItemReplacement, setLostItemReplacement] = useState('30')
  const [productivityLossPercent, setProductivityLossPercent] = useState('15')
  const [monthlyIncome, setMonthlyIncome] = useState('2500')
  const [missedOpportunities, setMissedOpportunities] = useState('25')

  // 2) Financial Autopilot Form State
  const [income, setIncome] = useState('2500')
  const [payday, setPayday] = useState('1')
  const [savingsGoal, setSavingsGoal] = useState('300')

  // 3) Decision Paralysis Solver Form State
  const [decision, setDecision] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [fear, setFear] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  // Calculations
  const adhdTaxResult = useMemo(() => calculateAdhdTax({
    lateFees: parseFloat(lateFees) || 0,
    weeklyImpulsePurchases: parseFloat(weeklyImpulsePurchases) || 0,
    forgottenSubscriptions: parseFloat(forgottenSubscriptions) || 0,
    lostItemReplacement: parseFloat(lostItemReplacement) || 0,
    productivityLossPercent: parseFloat(productivityLossPercent) || 0,
    monthlyIncome: parseFloat(monthlyIncome) || 0,
    missedOpportunities: parseFloat(missedOpportunities) || 0,
  }), [lateFees, weeklyImpulsePurchases, forgottenSubscriptions, lostItemReplacement, productivityLossPercent, monthlyIncome, missedOpportunities])

  const { monthlyTotal, yearlyTotal, breakdown, actionPlan } = adhdTaxResult

  const incNum = parseFloat(income) || 0
  const savNum = parseFloat(savingsGoal) || 0
  const fixedBills = Math.round(incNum * 0.5)
  const guiltFree = Math.max(0, incNum - fixedBills - savNum)

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-950 to-black shadow-2xl min-h-[340px] sm:min-h-[420px] flex items-end">
          {toolData.cover_image && (
            <>
              <Image
                src={toolData.cover_image}
                alt={toolData.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10" />
            </>
          )}
          <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-3xl space-y-4">
            <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-2" />
            <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tight text-white drop-shadow-lg" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {meta.title}
            </h1>
            <p className="text-lg sm:text-2xl text-neutral-200 max-w-2xl leading-relaxed drop-shadow">
              {meta.promise}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <GetSortedButton slug={slug} context="tool" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-[#141414] px-5 py-4 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-neutral-700">
              Interactive Web App Tool
            </span>
        </div>

        {toolData.problem && (
          <article className="mb-16 rounded-2xl border border-neutral-800 bg-[#141414] p-6 shadow-2xl sm:p-10">
            <ToolBlogPost body={toolData.problem} />
          </article>
        )}

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
                        Weekly Impulse Purchases (£ / week)
                      </label>
                      <input
                        type="number"
                        value={weeklyImpulsePurchases}
                        onChange={(e) => setWeeklyImpulsePurchases(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Forgotten Subscriptions (£ / mo)
                      </label>
                      <input
                        type="number"
                        value={forgottenSubscriptions}
                        onChange={(e) => setForgottenSubscriptions(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Lost Item Replacement (£ / mo)
                      </label>
                      <input
                        type="number"
                        value={lostItemReplacement}
                        onChange={(e) => setLostItemReplacement(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Productivity Loss (%)
                      </label>
                      <input
                        type="number"
                        value={productivityLossPercent}
                        onChange={(e) => setProductivityLossPercent(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="%"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Monthly Income (£)
                      </label>
                      <input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white focus:border-[#C0392B] focus:outline-none"
                        placeholder="£"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Missed Opportunities (£ / mo)
                      </label>
                      <input
                        type="number"
                        value={missedOpportunities}
                        onChange={(e) => setMissedOpportunities(e.target.value)}
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

              {slug !== 'adhd-tax-calculator' && slug !== 'financial-autopilot' && slug !== 'decision-paralysis-solver' && (
                <div className="space-y-6 text-center py-6">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8">
                    <h3 className="text-xl font-bold text-white mb-2">{meta.title}</h3>
                    <p className="text-sm text-neutral-300 max-w-md mx-auto mb-6">
                      {meta.promise}
                    </p>
                    <GetSortedButton slug={slug} context="tool" />
                  </div>
                </div>
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
                      £{monthlyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} / mo (£{yearlyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} / yr)
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-sm text-neutral-300">
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Late Fees</span>
                      <span className="text-xl font-bold text-white">£{breakdown.lateFees.toFixed(2)} / mo</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Impulse Purchases</span>
                      <span className="text-xl font-bold text-white">£{breakdown.impulsePurchases.toFixed(2)} / mo</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Forgotten Subscriptions</span>
                      <span className="text-xl font-bold text-white">£{breakdown.forgottenSubscriptions.toFixed(2)} / mo</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Lost Item Replacement</span>
                      <span className="text-xl font-bold text-white">£{breakdown.lostItemReplacement.toFixed(2)} / mo</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Productivity Loss</span>
                      <span className="text-xl font-bold text-white">£{breakdown.productivityLoss.toFixed(2)} / mo</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-neutral-400 uppercase block">Missed Opportunities</span>
                      <span className="text-xl font-bold text-white">£{breakdown.missedOpportunities.toFixed(2)} / mo</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                    <h3 className="text-lg font-black uppercase tracking-wide text-white">Your 30-day reset plan</h3>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                      {actionPlan.map((step) => (
                        <li key={step} className="flex gap-2">
                          <span className="text-[#C0392B]">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
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
                <GetSortedButton slug={slug} context="tool" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

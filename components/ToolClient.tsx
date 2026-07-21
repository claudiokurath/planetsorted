'use client'

import { useState } from 'react'
import { SaveToPhoneButton } from '@/components/SaveToPhoneButton'

interface ToolClientProps {
  slug: string
  hasPaidPlan?: boolean
}

export function ToolClient({ slug, hasPaidPlan = false }: ToolClientProps) {
  const [submitted, setSubmitted] = useState(false)

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

  // Submit handlers
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 font-sans">
      {!submitted ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          {slug === 'adhd-tax-calculator' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ADHD Tax Calculator</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Find out how much money is slipping through the cracks and get a plan to stop it.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Unused Subscriptions (Monthly)
                  </label>
                  <input
                    type="number"
                    value={subscriptions}
                    onChange={(e) => setSubscriptions(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                    placeholder="£"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Late Payment Fees / Parking Fines (Monthly)
                  </label>
                  <input
                    type="number"
                    value={lateFees}
                    onChange={(e) => setLateFees(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                    placeholder="£"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Replacing Lost Items (Monthly)
                  </label>
                  <input
                    type="number"
                    value={replacements}
                    onChange={(e) => setReplacements(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                    placeholder="£"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Impulse Purchases (Monthly)
                  </label>
                  <input
                    type="number"
                    value={impulse}
                    onChange={(e) => setImpulse(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                    placeholder="£"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-green-500 py-3 font-bold text-white hover:bg-green-600 transition-colors"
              >
                Calculate My ADHD Tax
              </button>
            </form>
          )}

          {slug === 'financial-autopilot' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Financial Autopilot Map</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Build a system to auto-allocate your money the day you get paid.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Monthly Take-Home Income
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                    placeholder="£"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Payday (Day of Month)
                  </label>
                  <input
                    type="number"
                    value={payday}
                    onChange={(e) => setPayday(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Monthly Savings/Investing Goal
                  </label>
                  <input
                    type="number"
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                    placeholder="£"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-green-500 py-3 font-bold text-white hover:bg-green-600 transition-colors"
              >
                Generate Autopilot Plan
              </button>
            </form>
          )}

          {slug === 'decision-paralysis-solver' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Decision Paralysis Solver</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Got a choice you can&apos;t make? Let&apos;s build guardrails to pick a path.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    The Decision to Make
                  </label>
                  <input
                    type="text"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    required
                    placeholder="e.g. Booking a holiday vs saving the money"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Option A
                  </label>
                  <input
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    required
                    placeholder="e.g. Book the trip to Spain"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Option B
                  </label>
                  <input
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    required
                    placeholder="e.g. Keep the money in savings"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    What is the biggest worry about picking Option A?
                  </label>
                  <input
                    type="text"
                    value={fear}
                    onChange={(e) => setFear(e.target.value)}
                    required
                    placeholder="e.g. Feeling guilty or running out of emergency funds"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-green-500 py-3 font-bold text-white hover:bg-green-600 transition-colors"
              >
                Resolve Decision
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Results Mode — Tool OS Layout */
        <div className="space-y-8">
          {/* 1. Hero Result */}
          <div className="rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-green-700">Your Actionable Result</span>
            
            {slug === 'adhd-tax-calculator' && (
              <div className="mt-2">
                <p className="text-4xl font-extrabold text-gray-900">£{monthlyTax}/mo</p>
                <p className="mt-1 text-sm text-gray-500">Estimated ADHD Tax leak (£{yearlyTax} / year)</p>
              </div>
            )}

            {slug === 'financial-autopilot' && (
              <div className="mt-2">
                <p className="text-3xl font-extrabold text-gray-900">Autopilot Configured</p>
                <p className="mt-1 text-sm text-gray-500">Ready to run on Day {payday} of the month</p>
              </div>
            )}

            {slug === 'decision-paralysis-solver' && (
              <div className="mt-2">
                <p className="text-3xl font-extrabold text-gray-900">Option A is Preferred</p>
                <p className="mt-1 text-sm text-gray-500">Under the condition that we manage the fear: &quot;{fear}&quot;</p>
              </div>
            )}
          </div>

          {/* 2. Breakdown */}
          <div className="rounded-2xl border border-gray-150 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Calculation Breakdown</h2>
            
            {slug === 'adhd-tax-calculator' && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between border-b pb-1">
                  <span>Subscriptions:</span>
                  <span className="font-semibold">£{subVal}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Late Fees:</span>
                  <span className="font-semibold">£{lateVal}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Lost Item Replacement:</span>
                  <span className="font-semibold">£{repVal}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Impulse Buys:</span>
                  <span className="font-semibold">£{impVal}</span>
                </div>
              </div>
            )}

            {slug === 'financial-autopilot' && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between border-b pb-1">
                  <span>Total Income:</span>
                  <span className="font-semibold">£{incomeVal}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Fixed Bills (40%):</span>
                  <span className="font-semibold">£{billsVal}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Savings Target:</span>
                  <span className="font-semibold">£{goalVal}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Guilt-Free Spending:</span>
                  <span className="font-semibold">£{spendingVal}</span>
                </div>
              </div>
            )}

            {slug === 'decision-paralysis-solver' && (
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  We analysed your options for <strong>&quot;{decision}&quot;</strong>.
                </p>
                <div className="rounded-lg bg-gray-50 p-3">
                  <span className="font-semibold text-gray-800">Choice A:</span> {optionA} <br/>
                  <span className="font-semibold text-gray-800">Choice B:</span> {optionB}
                </div>
                <p>
                  To eliminate paralysis, we apply safety margins: limit downside of Choice A, set a firm cutoff date, and automate follow-through.
                </p>
              </div>
            )}
          </div>

          {/* 3. Action Plan, 4. Artifacts, 5. Save + Compare Gated by Paywall */}
          {hasPaidPlan ? (
            <>
              {/* 3. Action Plan */}
              <div className="rounded-2xl border border-gray-150 bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Action Plan</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">1</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Next 24 Hours</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {slug === 'adhd-tax-calculator' && 'Open your banking app and list all direct debits on paper.'}
                        {slug === 'financial-autopilot' && `Set calendar reminder for Day ${payday} to confirm auto-transfer setup.`}
                        {slug === 'decision-paralysis-solver' && `Write down a mitigation action specifically addressing: "${fear}".`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">2</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Next 7 Days</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {slug === 'adhd-tax-calculator' && 'Cancel at least one subscription you have not used this month.'}
                        {slug === 'financial-autopilot' && 'Log into bank, set standing order for savings target immediately after payday.'}
                        {slug === 'decision-paralysis-solver' && `Commit to choice A. If you cannot, choice B will be auto-selected.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Artifacts */}
              <div className="rounded-2xl border border-gray-150 bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Checklists & Guidelines</h2>
                <div className="rounded-lg bg-gray-50 p-4 font-mono text-xs text-gray-700 whitespace-pre-wrap">
                  {slug === 'adhd-tax-calculator' && 
    `[ ] Check Apple/Google subscriptions (Settings -> Subscriptions)
    [ ] Sort mail: place bills directly next to your keys
    [ ] Set calendar alerts with sound for appointment cancel cutoffs
    [ ] Create a 24h cooling-off window for impulse purchases > £20`}

                  {slug === 'financial-autopilot' && 
    `Autopilot Transfer Rules:
    1. Payday (Day ${payday}): Income hits Account.
    2. Day ${parseInt(payday) + 1}: Auto-transfer £${goalVal} to Savings.
    3. Day ${parseInt(payday) + 1}: Auto-transfer £${billsVal} to Bills account.
    4. Remaining £${spendingVal} is guilt-free spending limit.`}

                  {slug === 'decision-paralysis-solver' && 
    `Decision brief guardrails:
    - Maximum budget allocation: £300
    - Fear factor limit: 1-hour conversation to resolve "${fear}"
    - Decision window expires: 72 hours
    - Secondary backup plan: default to "${optionB}"`}
                </div>
              </div>

              {/* 5. Save + Compare */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <SaveToPhoneButton
                  slug={slug}
                  context="result"
                  isLoggedIn={true}
                  whatsappVerified={true}
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-green-100 bg-green-50/50 p-8 text-center space-y-4">
              <div className="text-2xl">✨</div>
              <h3 className="text-lg font-bold text-gray-900">Unlock your full Action Plan</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Unlock your full action plan, scripts, and PDF export with Plus — £5.99/month or £49/year. Scholarships available, no questions asked.
              </p>
              <a
                href="/r/upgrade"
                className="inline-block rounded-full bg-green-500 px-6 py-2.5 font-bold text-white hover:bg-green-600 transition-colors text-sm"
              >
                Upgrade to Plus
              </a>
            </div>
          )}

          {/* 6. Rerun loop */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400">
              Suggested cadence: {slug === 'decision-paralysis-solver' ? 'Run whenever stuck' : 'Run monthly'}
            </p>
            <button
              onClick={handleReset}
              className="rounded-full border border-gray-250 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Rerun Tool
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

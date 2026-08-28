'use client'

import { useMemo, useState } from 'react'
import { calculateAdhdTax } from '@/lib/adhdTaxCalculator'

export function StandaloneAdhdTaxApp() {
  const [lateFees, setLateFees] = useState('15')
  const [weeklyImpulsePurchases, setWeeklyImpulsePurchases] = useState('60')
  const [forgottenSubscriptions, setForgottenSubscriptions] = useState('20')
  const [lostItemReplacement, setLostItemReplacement] = useState('30')
  const [productivityLossPercent, setProductivityLossPercent] = useState('15')
  const [monthlyIncome, setMonthlyIncome] = useState('2500')
  const [missedOpportunities, setMissedOpportunities] = useState('25')

  const result = useMemo(() => calculateAdhdTax({
    lateFees: parseFloat(lateFees) || 0,
    weeklyImpulsePurchases: parseFloat(weeklyImpulsePurchases) || 0,
    forgottenSubscriptions: parseFloat(forgottenSubscriptions) || 0,
    lostItemReplacement: parseFloat(lostItemReplacement) || 0,
    productivityLossPercent: parseFloat(productivityLossPercent) || 0,
    monthlyIncome: parseFloat(monthlyIncome) || 0,
    missedOpportunities: parseFloat(missedOpportunities) || 0,
  }), [lateFees, weeklyImpulsePurchases, forgottenSubscriptions, lostItemReplacement, productivityLossPercent, monthlyIncome, missedOpportunities])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-black p-8 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Independent app</p>
          <h1 className="mt-3 text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95]">ADHD Tax Calculator</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">
            See the hidden monthly and yearly cost of late fees, impulse purchases, forgotten subscriptions, and productivity leaks.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-black p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold">Your inputs</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Late fees (£ / mo)', value: lateFees, setValue: setLateFees, placeholder: '0' },
                { label: 'Weekly impulse purchases (£ / week)', value: weeklyImpulsePurchases, setValue: setWeeklyImpulsePurchases, placeholder: '0' },
                { label: 'Forgotten subscriptions (£ / mo)', value: forgottenSubscriptions, setValue: setForgottenSubscriptions, placeholder: '0' },
                { label: 'Lost item replacement (£ / mo)', value: lostItemReplacement, setValue: setLostItemReplacement, placeholder: '0' },
                { label: 'Productivity loss (%)', value: productivityLossPercent, setValue: setProductivityLossPercent, placeholder: '0' },
                { label: 'Monthly income (£)', value: monthlyIncome, setValue: setMonthlyIncome, placeholder: '0' },
                { label: 'Missed opportunities (£ / mo)', value: missedOpportunities, setValue: setMissedOpportunities, placeholder: '0' },
              ].map((field) => (
                <label key={field.label} className="block text-sm text-slate-300">
                  <span className="mb-2 block font-medium">{field.label}</span>
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.setValue(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none ring-0 focus:border-cyan-400"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Estimated annual leak</p>
            <div className="mt-3 text-5xl font-black sm:text-6xl">£{result.yearlyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <p className="mt-2 text-slate-200">That’s about £{result.monthlyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} per month.</p>

            <div className="mt-6 space-y-3">
              {Object.entries(result.breakdown).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm">
                  <span className="capitalize text-slate-300">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-semibold text-white">£{value.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black p-4">
              <h3 className="text-lg font-semibold">Quick reset plan</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {result.actionPlan.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="text-cyan-300">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

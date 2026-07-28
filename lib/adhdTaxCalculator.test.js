import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateAdhdTax } from './adhdTaxCalculator.js'

test('calculates monthly and yearly ADHD tax totals from the tool inputs', () => {
  const result = calculateAdhdTax({
    lateFees: 12,
    weeklyImpulsePurchases: 20,
    forgottenSubscriptions: 18,
    lostItemReplacement: 10,
    productivityLossPercent: 15,
    monthlyIncome: 2400,
    missedOpportunities: 25,
  })

  assert.equal(result.monthlyTotal, 12 + 86.6 + 18 + 10 + 360 + 25)
  assert.equal(result.yearlyTotal, result.monthlyTotal * 12)
  assert.equal(result.breakdown.lateFees, 12)
  assert.equal(result.breakdown.impulsePurchases, 86.6)
  assert.equal(result.breakdown.productivityLoss, 360)
  assert.ok(result.actionPlan.length >= 3)
})

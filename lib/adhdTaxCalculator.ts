export interface AdhdTaxInputs {
  lateFees?: string | number
  weeklyImpulsePurchases?: string | number
  monthlyIncome?: string | number
  productivityLossPercent?: string | number
  forgottenSubscriptions?: string | number
  lostItemReplacement?: string | number
  missedOpportunities?: string | number
}

export interface AdhdTaxBreakdown {
  lateFees: number
  impulsePurchases: number
  forgottenSubscriptions: number
  lostItemReplacement: number
  productivityLoss: number
  missedOpportunities: number
}

export interface AdhdTaxResult {
  monthlyTotal: number
  yearlyTotal: number
  breakdown: AdhdTaxBreakdown
  actionPlan: string[]
}

export function calculateAdhdTax(rawInputs: AdhdTaxInputs): AdhdTaxResult {
  // Converts any blank field, undefined value, or stray text into a safe 0
  // instead of letting it produce NaN or string concatenation downstream.
  const safeNum = (val: unknown): number => {
    const num = parseFloat(String(val))
    return isNaN(num) ? 0 : num
  }

  const lateFees = safeNum(rawInputs.lateFees)
  const weeklyImpulsePurchases = safeNum(rawInputs.weeklyImpulsePurchases)
  const monthlyIncome = safeNum(rawInputs.monthlyIncome)
  const productivityLossPercent = safeNum(rawInputs.productivityLossPercent)
  const forgottenSubscriptions = safeNum(rawInputs.forgottenSubscriptions)
  const lostItemReplacement = safeNum(rawInputs.lostItemReplacement)
  const missedOpportunities = safeNum(rawInputs.missedOpportunities)

  const impulsePurchases = weeklyImpulsePurchases * 4.33
  const productivityLoss = (productivityLossPercent / 100) * monthlyIncome

  const monthlyTotal =
    lateFees +
    impulsePurchases +
    forgottenSubscriptions +
    lostItemReplacement +
    productivityLoss +
    missedOpportunities

  const breakdown: AdhdTaxBreakdown = {
    lateFees,
    impulsePurchases,
    forgottenSubscriptions,
    lostItemReplacement,
    productivityLoss,
    missedOpportunities,
  }

  const actionPlan = [
    'Set one recurring bill reminder for the day before each due date.',
    'Create a 24-hour pause rule for any purchase over your comfort threshold.',
    'Review subscriptions once a month and cancel the ones you forgot you had.',
    'Keep a tiny “lost item” kit so replacements happen less often.',
  ]

  return {
    monthlyTotal,
    yearlyTotal: monthlyTotal * 12,
    breakdown,
    actionPlan,
  }
}
  
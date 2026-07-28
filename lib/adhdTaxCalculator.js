export function calculateAdhdTax(inputs) {
  const impulsePurchases = inputs.weeklyImpulsePurchases * 4.33
  const productivityLoss = (inputs.productivityLossPercent / 100) * inputs.monthlyIncome
  const monthlyTotal =
    inputs.lateFees +
    impulsePurchases +
    inputs.forgottenSubscriptions +
    inputs.lostItemReplacement +
    productivityLoss +
    inputs.missedOpportunities

  const breakdown = {
    lateFees: inputs.lateFees,
    impulsePurchases,
    forgottenSubscriptions: inputs.forgottenSubscriptions,
    lostItemReplacement: inputs.lostItemReplacement,
    productivityLoss,
    missedOpportunities: inputs.missedOpportunities,
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

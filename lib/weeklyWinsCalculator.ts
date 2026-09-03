export interface WeeklyWinsInputs {
  tasksCompleted?: string | number
  bodyDoublingSessions?: string | number
  spiralUses?: string | number
  hardThing?: string
  tone?: 'proud' | 'gentle' | 'hype'
  weekLabel?: string
}

export interface WeeklyWinsBreakdown {
  tasksCompleted: number
  bodyDoublingPoints: number
  spiralRegulationPoints: number
  totalWinScore: number
}

export interface WeeklyWinsResult {
  totalWinScore: number
  scoreBand: string
  summary: string
  breakdown: WeeklyWinsBreakdown
  actionPlan: string[]
}

function getWeekLabel(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  return `Week ${week}, ${now.getFullYear()}`
}

export function calculateWeeklyWins(rawInputs: WeeklyWinsInputs): WeeklyWinsResult {
  const safeNum = (val: unknown): number => {
    const num = parseFloat(String(val))
    return isNaN(num) ? 0 : Math.max(0, Math.floor(num))
  }

  const tasksCompleted = safeNum(rawInputs.tasksCompleted ?? 5)
  const bodyDoublingSessions = safeNum(rawInputs.bodyDoublingSessions ?? 2)
  const spiralUses = safeNum(rawInputs.spiralUses ?? 1)
  const hardThing = String(rawInputs.hardThing ?? '').trim()
  const tone = rawInputs.tone || 'proud'
  const weekLabel = rawInputs.weekLabel || getWeekLabel()

  const totalWinScore = tasksCompleted + bodyDoublingSessions * 2 + spiralUses * 3

  let scoreBand = 'Still counts'
  if (totalWinScore >= 80) scoreBand = 'On fire 🔥'
  else if (totalWinScore >= 50) scoreBand = 'Solid week ✓'
  else if (totalWinScore >= 20) scoreBand = 'You showed up'

  const taskLine = tasksCompleted === 1 ? '1 task' : `${tasksCompleted} tasks`
  const bdLine = bodyDoublingSessions === 1 ? '1 body-doubling session' : `${bodyDoublingSessions} body-doubling sessions`
  const spiralLine = spiralUses === 1 ? '1 spiral reset' : `${spiralUses} spiral resets`
  const hardLine = hardThing ? `The hard thing you did anyway: "${hardThing}".` : ''

  let summary = ''
  if (tone === 'gentle') {
    summary = `${weekLabel}. Win score: ${totalWinScore} — and that is more than enough. You finished ${taskLine}, got through ${bdLine}, and reached for ${spiralLine} when friction hit. ${hardLine ? `${hardLine} ` : ''}Showing up at all is the real win.`
  } else if (tone === 'hype') {
    summary = `${weekLabel}: WIN SCORE ${totalWinScore} — DEMOLISHED. ${taskLine} DONE. ${bdLine} LOCKED IN. ${spiralLine} REGULATED. ${hardLine ? `${hardLine} ` : ''}Unstoppable momentum. See you next week.`
  } else {
    summary = `${weekLabel} — win score ${totalWinScore}. You completed ${taskLine}, showed up for ${bdLine}, and activated ${spiralLine} to protect your focus. ${hardLine ? `${hardLine} ` : ''}These aren't small feats. They're tangible proof of progress.`
  }

  const actionPlan: string[] = [
    `Acknowledge the win: do something deliberately restorative before planning next week.`,
    hardThing
      ? `You conquered "${hardThing}" — give yourself full credit for pushing through resistance.`
      : `Pick one friction point you overcame this week and log it as evidence against imposter syndrome.`,
    `Send yourself this recap via WhatsApp to anchor the positive reinforcement loop.`,
  ]

  return {
    totalWinScore,
    scoreBand,
    summary,
    breakdown: {
      tasksCompleted,
      bodyDoublingPoints: bodyDoublingSessions * 2,
      spiralRegulationPoints: spiralUses * 3,
      totalWinScore,
    },
    actionPlan,
  }
}

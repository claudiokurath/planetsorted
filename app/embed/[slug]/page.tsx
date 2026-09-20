import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StandaloneAdhdTaxApp } from '@/components/StandaloneAdhdTaxApp'
import { BiometricStateApp } from '@/components/BiometricStateApp'
import { BrainDumpSorterApp } from '@/components/BrainDumpSorterApp'
import { DecisionParalysisApp } from '@/components/DecisionParalysisApp'
import { FinancialAutopilotApp } from '@/components/FinancialAutopilotApp'
import { WeeklyWinsApp } from '@/components/WeeklyWinsApp'

/**
 * Public embed surface for the standalone tools, so they can be iframed into
 * Gamma (see the frame-ancestors rule in next.config.ts).
 *
 * Deliberately separate from the /(standalone) routes rather than unlocking
 * them. Those stay link-only behind verifyStandaloneAccess: an iframe carries
 * no access token and cannot hold a cross-site cookie, so embedding through
 * them is impossible without dismantling that gate for every visitor.
 *
 * Anything reachable here is public to whoever holds the embed URL — which is
 * the point of putting it in a shared deck, but it does mean these tools are
 * no longer link-only. Add a slug here only when that is intended.
 *
 * task-breakdown-wizard is deliberately absent: it requires a signed-in member
 * with a connected WhatsApp number and bounces to /connect, which cannot work
 * inside a frame.
 */
const EMBEDDABLE = {
  'adhd-tax-calculator': {
    title: 'ADHD Tax Calculator',
    Component: StandaloneAdhdTaxApp,
  },
  'biometric-state-tracker': {
    title: 'Biometric State Tracker',
    Component: BiometricStateApp,
  },
  'brain-dump-sorter': {
    title: 'Brain Dump Sorter',
    Component: BrainDumpSorterApp,
  },
  'decision-paralysis-solver': {
    title: 'Decision Paralysis Solver',
    Component: DecisionParalysisApp,
  },
  'financial-autopilot': {
    title: 'Financial Autopilot',
    Component: FinancialAutopilotApp,
  },
  'weekly-wins-generator': {
    title: 'Weekly Wins Generator',
    Component: WeeklyWinsApp,
  },
} as const

type EmbedSlug = keyof typeof EMBEDDABLE

export function generateStaticParams() {
  return Object.keys(EMBEDDABLE).map((slug) => ({ slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = EMBEDDABLE[slug as EmbedSlug]
  if (!entry) return { title: 'Not found — SOR7ED' }

  return {
    title: `${entry.title} — SOR7ED`,
    // Kept out of search so the embed does not compete with /tools/[slug].
    robots: { index: false, follow: false },
  }
}

export default async function EmbedPage({ params }: Props) {
  const { slug } = await params
  const entry = EMBEDDABLE[slug as EmbedSlug]
  if (!entry) notFound()

  const { Component } = entry
  return <Component />
}

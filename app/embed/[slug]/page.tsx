import { isContentPublished } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { verifyToolGrant } from '@/lib/button/toolGrant'

import { StandaloneAdhdTaxApp } from '@/components/StandaloneAdhdTaxApp'
import { BiometricStateApp } from '@/components/BiometricStateApp'
import { BrainDumpSorterApp } from '@/components/BrainDumpSorterApp'
import { DecisionParalysisApp } from '@/components/DecisionParalysisApp'
import { FinancialAutopilotApp } from '@/components/FinancialAutopilotApp'
import { WeeklyWinsApp } from '@/components/WeeklyWinsApp'

// Native tools are opened by the separate authenticated Button library.
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

export const dynamic = 'force-dynamic'

type EmbedSlug = keyof typeof EMBEDDABLE

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ access?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = EMBEDDABLE[slug as EmbedSlug]
  if (!entry || !await isContentPublished(slug, 'Tool')) notFound()

  return {
    title: `${entry.title} — SOR7ED`,
    // Kept out of search so the embed does not compete with /tools/[slug].
    robots: { index: false, follow: false },
  }
}

export default async function EmbedPage({ params, searchParams }: Props) {
  const { slug } = await params
  const entry = EMBEDDABLE[slug as EmbedSlug]
  if (!entry || !await isContentPublished(slug, 'Tool')) notFound()

  const { access } = await searchParams
  if (!verifyToolGrant(process.env.BUTTON_RELAY_SECRET, slug, access)) {
    redirect(`https://www.sor7ed.com/resource?context=tool&slug=${encodeURIComponent(slug)}`)
  }

  const { Component } = entry
  return <><LiveContentRefresh /><Component /></>
}

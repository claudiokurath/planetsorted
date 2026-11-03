'use client'

import dynamic from 'next/dynamic'

const Perception = dynamic(() => import('./SelfPerceptionApp'), {
  ssr: false,
  loading: () => <section className="mx-auto max-w-4xl px-6 py-16"><h1 className="font-bebas text-5xl">The Self-Perception Gap</h1><p role="status" className="mt-6">Loading your reflection…</p></section>,
})
const Money = dynamic(() => import('./MoneyResetApp'), {
  ssr: false,
  loading: () => <section className="mx-auto max-w-4xl px-6 py-16"><h1 className="font-bebas text-5xl">ADHD Money Reset</h1><p role="status" className="mt-6">Loading your reset…</p></section>,
})
export function SelfPerceptionExperience() { return <Perception /> }
export function MoneyResetExperience() { return <Money /> }

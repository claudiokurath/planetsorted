import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { BrainTypeProfiler } from '@/components/BrainTypeProfiler'

const display = localFont({ src: './fonts/league-gothic.ttf', weight: '400', variable: '--font-brain-display', display: 'swap' })
const body = localFont({ src: [
  { path: './fonts/roboto-300.ttf', weight: '300' },
  { path: './fonts/roboto-400.ttf', weight: '400' },
  { path: './fonts/roboto-500.ttf', weight: '500' },
], variable: '--font-brain-body', display: 'swap' })

export const metadata: Metadata = {
  title: 'How your brain runs — SOR7ED',
  description: 'A two-minute reflection: twelve questions about how you work, start and recover, then a profile and tools to try.',
}

export default function BrainTypePage() {
  return <div className={`${display.variable} ${body.variable}`}><BrainTypeProfiler /></div>
}

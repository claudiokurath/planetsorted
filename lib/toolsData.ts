export interface ToolMeta {
  slug: string
  title: string
  summary: string
  image: string
  category: string
}

export const PRIORITY_TOOLS: ToolMeta[] = [
  {
    slug: 'adhd-tax-calculator',
    title: 'ADHD Tax Calculator',
    summary: 'Find your ADHD Tax and get a 30-day plan to cut it.',
    image: '/images/tool-tax.jpg',
    category: 'Wealth',
  },
  {
    slug: 'financial-autopilot',
    title: 'Financial Autopilot',
    summary: 'Set up your finances to run on autopilot in 15 minutes.',
    image: '/images/tool-autopilot.jpg',
    category: 'Wealth',
  },
  {
    slug: 'decision-paralysis-solver',
    title: 'Decision Paralysis Solver',
    summary: 'Get unstuck in 5 minutes: decision + guardrails + next step.',
    image: '/images/tool-clarity.jpg',
    category: 'Mind',
  },
]

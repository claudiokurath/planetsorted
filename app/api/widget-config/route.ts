import { NextResponse } from 'next/server'

// Public endpoint — returns the list of tools available for the SOR7ED partner widget.
// Partners use data-tool="<slug>" on the script tag to target a specific tool.
// No auth required — this is intentionally public.

const WIDGET_TOOLS = [
  {
    slug: 'adhd-tax-calculator',
    label: 'ADHD Tax Calculator',
    description: 'See the hidden monthly and yearly cost of ADHD-related money leaks.',
    url: 'https://planetsorted.com/adhd-tax-calculator',
    category: 'Wealth',
  },
  {
    slug: 'weekly-wins-generator',
    label: 'Weekly Wins Generator',
    description: 'Log your week and generate a publish-ready summary of everything you actually did.',
    url: 'https://planetsorted.com/weekly-wins-generator',
    category: 'Body',
  },
  {
    slug: 'biometric-state-tracker',
    label: 'Biometric State Tracker',
    description: 'Daily biometric check-in with personalized hydration target and AI-style recommendations.',
    url: 'https://planetsorted.com/biometric-state-tracker',
    category: 'Body',
  },
  {
    slug: 'decision-paralysis-solver',
    label: 'Decision Paralysis Solver',
    description: 'Framework to clarify options, boost confidence, and break decision paralysis.',
    url: 'https://planetsorted.com/decision-paralysis-solver',
    category: 'Mind',
  },
  {
    slug: 'financial-autopilot',
    label: 'Financial Autopilot',
    description: 'Automate your financial future: savings, debt payoff, and retirement on autopilot.',
    url: 'https://planetsorted.com/financial-autopilot',
    category: 'Wealth',
  },
  {
    slug: 'brain-dump-sorter',
    label: 'Brain Dump Sorter',
    description: 'NLP sorter: classify raw dumps into Task, Idea, and Emotion categories for Notion.',
    url: 'https://planetsorted.com/brain-dump-sorter',
    category: 'Mind',
  },
]

export async function GET() {
  return NextResponse.json(
    {
      tools: WIDGET_TOOLS,
      widget_src: 'https://planetsorted.com/widget.js',
      usage: '<script src="https://planetsorted.com/widget.js" data-tool="adhd-tax-calculator" async></script>',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}

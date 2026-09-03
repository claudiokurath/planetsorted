/**
 * Central Tools Registry
 * Single source of truth for all configuration-driven tools
 * Add new tools here following the ToolConfig schema
 */

import type { ToolConfig } from '@/lib/types/toolConfig'

/**
 * ADHD Tax Calculator Config
 * Calculates the hidden monthly/yearly cost of ADHD-related expenses
 */
const ADHD_TAX_CALCULATOR: ToolConfig = {
  slug: 'adhd-tax-calculator',
  metadata: {
    title: 'ADHD Tax Calculator',
    seo_title: 'ADHD Tax Calculator | Hidden Costs of ADHD',
    meta_description: 'Calculate the hidden monthly and yearly cost of late fees, impulse purchases, forgotten subscriptions, and productivity leaks.',
    fallback_description: 'See the hidden monthly and yearly cost of late fees, impulse purchases, forgotten subscriptions, and productivity leaks.',
    category: 'Mind',
    read_time: '4 min',
    cover_image: '/images/tools/adhd-tax-calculator-hero.jpg',
  },
  inputs: [
    {
      name: 'lateFees',
      label: 'Late fees (£ / mo)',
      type: 'number',
      default: 15,
      placeholder: '0',
      help: 'Monthly cost of late fees and penalties',
      min: 0,
      step: 1,
    },
    {
      name: 'weeklyImpulsePurchases',
      label: 'Weekly impulse purchases (£ / week)',
      type: 'number',
      default: 60,
      placeholder: '0',
      help: 'Unplanned spending on non-essentials',
      min: 0,
      step: 5,
    },
    {
      name: 'forgottenSubscriptions',
      label: 'Forgotten subscriptions (£ / mo)',
      type: 'number',
      default: 20,
      placeholder: '0',
      help: 'Subscriptions you forget to cancel',
      min: 0,
      step: 1,
    },
    {
      name: 'lostItemReplacement',
      label: 'Lost item replacement (£ / mo)',
      type: 'number',
      default: 30,
      placeholder: '0',
      help: 'Cost to replace lost keys, cards, devices',
      min: 0,
      step: 5,
    },
    {
      name: 'productivityLossPercent',
      label: 'Productivity loss (%)',
      type: 'slider',
      default: 15,
      help: 'Estimated % of work capacity lost to ADHD friction',
      min: 0,
      max: 50,
      step: 1,
    },
    {
      name: 'monthlyIncome',
      label: 'Monthly income (£)',
      type: 'number',
      default: 2500,
      placeholder: '0',
      help: 'Your gross monthly income for productivity calculations',
      min: 0,
      step: 100,
    },
    {
      name: 'missedOpportunities',
      label: 'Missed opportunities (£ / mo)',
      type: 'number',
      default: 25,
      placeholder: '0',
      help: 'Revenue/savings you missed due to ADHD friction',
      min: 0,
      step: 5,
    },
  ],
  computation: {
    engine: 'adhdTaxCalculator',
    type: 'calculator',
  },
  output: {
    headline: {
      label: 'Estimated annual leak',
      value_path: 'yearlyTotal',
      format: 'currency',
    },
    subheading: {
      label: "That's about £{monthlyTotal} per month.",
    },
    sections: [
      {
        title: 'Breakdown by category',
        type: 'breakdown',
        data: 'breakdown',
        format: 'currency',
      },
      {
        title: 'Quick reset plan',
        type: 'action_list',
        data: 'actionPlan',
      },
    ],
  },
  saveable: true,
  historySaved: true,
}

/**
 * Weekly Wins Generator Config
 * Calculates non-linear progress across tasks, focus sessions, and regulation
 */
const WEEKLY_WINS_GENERATOR: ToolConfig = {
  slug: 'weekly-wins-generator',
  metadata: {
    title: 'Weekly Wins Generator',
    seo_title: 'Weekly Wins Generator | ADHD Progress Tracker',
    meta_description: 'Capture and celebrate non-linear progress. Calculate your weekly win score across tasks, body-doubling, and nervous system regulation.',
    fallback_description: 'Capture and celebrate non-linear progress across tasks, focus sessions, and regulation.',
    category: 'Growth',
    read_time: '3 min',
    cover_image: '/images/tools/weekly-wins-hero.jpg',
  },
  inputs: [
    {
      name: 'tasksCompleted',
      label: 'Tasks completed this week',
      type: 'number',
      default: 5,
      placeholder: '0',
      help: 'Every finished task counts, no matter the size',
      min: 0,
      step: 1,
    },
    {
      name: 'bodyDoublingSessions',
      label: 'Body-doubling sessions attended',
      type: 'number',
      default: 2,
      placeholder: '0',
      help: 'Focusmate, co-working, or working alongside someone',
      min: 0,
      step: 1,
    },
    {
      name: 'spiralUses',
      label: 'Spirals & reset tools used',
      type: 'number',
      default: 1,
      placeholder: '0',
      help: 'Times you recognized dysregulation and used a tool to reset',
      min: 0,
      step: 1,
    },
    {
      name: 'hardThing',
      label: 'The hard thing I did anyway',
      type: 'text',
      default: '',
      placeholder: 'e.g. Sent the delayed email, filed the invoice, attended the medical checkup...',
      help: 'Optional: name the one thing that required exceptional activation energy',
    },
    {
      name: 'tone',
      label: 'Celebration tone',
      type: 'select',
      default: 'proud',
      options: [
        { value: 'proud', label: 'Proud & Grounded' },
        { value: 'gentle', label: 'Gentle & Validating' },
        { value: 'hype', label: 'Hype & Beast Mode 🔥' },
      ],
      help: 'How you want your weekly recap framed',
    },
  ],
  computation: {
    engine: 'weeklyWinsCalculator',
    type: 'calculator',
  },
  output: {
    headline: {
      label: 'Weekly Win Score',
      value_path: 'totalWinScore',
      format: 'number',
    },
    subheading: {
      label: '{scoreBand}',
    },
    sections: [
      {
        title: 'Weekly Recap',
        type: 'text',
        data: 'summary',
      },
      {
        title: 'Points Breakdown',
        type: 'breakdown',
        data: 'breakdown',
      },
      {
        title: 'Celebration & Next Steps',
        type: 'action_list',
        data: 'actionPlan',
      },
    ],
  },
  saveable: true,
  historySaved: true,
}

/**
 * Central registry of all tools
 * To add a new tool:
 * 1. Create ToolConfig object with slug, metadata, inputs, computation, output
 * 2. Add to TOOLS_CONFIG array
 * 3. Implement CalculatorFunction for the engine
 * 4. Done! Route + rendering auto-generated
 */
export const TOOLS_CONFIG: ToolConfig[] = [
  ADHD_TAX_CALCULATOR,
  WEEKLY_WINS_GENERATOR,
]

/**
 * Map config by slug for fast lookups
 */
export const TOOLS_MAP: Record<string, ToolConfig> = Object.fromEntries(
  TOOLS_CONFIG.map((tool) => [tool.slug, tool])
)

/**
 * List of all tool slugs (for generateStaticParams)
 */
export const TOOL_SLUGS = TOOLS_CONFIG.map((tool) => tool.slug)

/**
 * Get tool config by slug
 */
export function getToolConfig(slug: string): ToolConfig | undefined {
  return TOOLS_MAP[slug]
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: string): ToolConfig[] {
  return TOOLS_CONFIG.filter((tool) => tool.metadata.category === category)
}

export const DIMENSIONS = ['spark', 'sustain', 'sort', 'steady'] as const
export type BrainDimension = typeof DIMENSIONS[number]
export type BrainScores = Record<BrainDimension, number>
export interface BrainQuestion { q: string; a: { t: string; d: BrainDimension }[] }
export interface BrainType { name: string; tag: string; identity: string; strengths: string[]; friction: string[]; tools: string[][] }

export const DIMENSION_LABELS: Record<BrainDimension, string> = {
  "spark": "Spark",
  "sustain": "Sustain",
  "sort": "Sort",
  "steady": "Steady"
}

export const QUESTIONS: BrainQuestion[] = [
  {
    "q": "A new project lands in front of you. First instinct?",
    "a": [
      {
        "t": "I dive in before I’ve read the details",
        "d": "spark"
      },
      {
        "t": "I work out how it fits my usual routine",
        "d": "sustain"
      },
      {
        "t": "I map the whole thing before I start",
        "d": "sort"
      },
      {
        "t": "I sit with it a day to see how I feel",
        "d": "steady"
      }
    ]
  },
  {
    "q": "You’re most likely to finish something when…",
    "a": [
      {
        "t": "It’s genuinely interesting to me",
        "d": "spark"
      },
      {
        "t": "It’s on a schedule I trust",
        "d": "sustain"
      },
      {
        "t": "I know exactly what “done” looks like",
        "d": "sort"
      },
      {
        "t": "Nothing else is pressing on me that day",
        "d": "steady"
      }
    ]
  },
  {
    "q": "Your ideal working session is…",
    "a": [
      {
        "t": "Short, intense, something new",
        "d": "spark"
      },
      {
        "t": "Same time, same place, steady pace",
        "d": "sustain"
      },
      {
        "t": "Uninterrupted, deep, one thing",
        "d": "sort"
      },
      {
        "t": "Calm, unhurried, no clock",
        "d": "steady"
      }
    ]
  },
  {
    "q": "Plans change at the last minute. You…",
    "a": [
      {
        "t": "Feel a jolt — could be a thrill, could be a grumble",
        "d": "spark"
      },
      {
        "t": "Get thrown; I liked the plan",
        "d": "sustain"
      },
      {
        "t": "Immediately start re-planning the new version",
        "d": "sort"
      },
      {
        "t": "Roll with it once I’ve checked in with myself",
        "d": "steady"
      }
    ]
  },
  {
    "q": "The thing most likely to derail you is…",
    "a": [
      {
        "t": "Boredom",
        "d": "spark"
      },
      {
        "t": "Losing my routine",
        "d": "sustain"
      },
      {
        "t": "Not knowing where to start",
        "d": "sort"
      },
      {
        "t": "Feeling overwhelmed or criticised",
        "d": "steady"
      }
    ]
  },
  {
    "q": "You make a decision best when…",
    "a": [
      {
        "t": "I follow the pull of what feels alive",
        "d": "spark"
      },
      {
        "t": "I sleep on it and keep to my usual process",
        "d": "sustain"
      },
      {
        "t": "I lay the options out side by side",
        "d": "sort"
      },
      {
        "t": "I check how each option actually feels",
        "d": "steady"
      }
    ]
  },
  {
    "q": "After a big task, you recover by…",
    "a": [
      {
        "t": "Chasing the next interesting thing",
        "d": "spark"
      },
      {
        "t": "Returning to my normal rhythm",
        "d": "sustain"
      },
      {
        "t": "Tidying and resetting everything",
        "d": "sort"
      },
      {
        "t": "Doing nothing at all for a while",
        "d": "steady"
      }
    ]
  },
  {
    "q": "Your notes and reminders tend to be…",
    "a": [
      {
        "t": "Scattered, wherever I had the thought",
        "d": "spark"
      },
      {
        "t": "Consistent and reviewed",
        "d": "sustain"
      },
      {
        "t": "Organised into systems",
        "d": "sort"
      },
      {
        "t": "Minimal — only what matters right now",
        "d": "steady"
      }
    ]
  },
  {
    "q": "Unexpected feedback lands. You…",
    "a": [
      {
        "t": "Want to talk it through right away",
        "d": "spark"
      },
      {
        "t": "Take it away and process it quietly",
        "d": "sustain"
      },
      {
        "t": "Want the specifics and examples",
        "d": "sort"
      },
      {
        "t": "Need a moment before I can really hear it",
        "d": "steady"
      }
    ]
  },
  {
    "q": "You start your best work…",
    "a": [
      {
        "t": "On a wave of motivation, whenever it hits",
        "d": "spark"
      },
      {
        "t": "At my usual time, however I feel",
        "d": "sustain"
      },
      {
        "t": "Once everything is set up exactly right",
        "d": "sort"
      },
      {
        "t": "When I feel settled and unhurried",
        "d": "steady"
      }
    ]
  },
  {
    "q": "The phrase that fits you best…",
    "a": [
      {
        "t": "“I need it to be interesting.”",
        "d": "spark"
      },
      {
        "t": "“I need it to be reliable.”",
        "d": "sustain"
      },
      {
        "t": "“I need it to be clear.”",
        "d": "sort"
      },
      {
        "t": "“I need it to be calm.”",
        "d": "steady"
      }
    ]
  },
  {
    "q": "At the end of a good day, what’s true?",
    "a": [
      {
        "t": "I learned or tried something new",
        "d": "spark"
      },
      {
        "t": "I did what I said I’d do",
        "d": "sustain"
      },
      {
        "t": "I finished something properly",
        "d": "sort"
      },
      {
        "t": "I felt steady and unhurried",
        "d": "steady"
      }
    ]
  }
]

export const BRAIN_TYPES: Record<BrainDimension, BrainType> = {
  "spark": {
    "name": "The Spark",
    "tag": "You run on interest.",
    "identity": "Novelty is your fuel and boredom is the wall. When something is alive to you, you move fast and far — the trick is the finish line, not the start.",
    "strengths": [
      "Fast, energised starts",
      "Sees possibility before detail",
      "Learns by trying things"
    ],
    "friction": [
      "Finishing what you started",
      "Routine that feels dead",
      "Too many open loops"
    ],
    "tools": [
      [
        "Brain Dump Sorter",
        "Get the open loops out of your head"
      ],
      [
        "Weekly Wins Generator",
        "See what you actually finished"
      ]
    ]
  },
  "sustain": {
    "name": "The Anchor",
    "tag": "You run on rhythm.",
    "identity": "A routine you trust is your fuel. You keep promises to yourself and build slowly — the trick is staying flexible when the plan has to move.",
    "strengths": [
      "Consistency and follow-through",
      "Keeps promises to yourself",
      "Builds steadily, no drama"
    ],
    "friction": [
      "Last-minute change",
      "Starting without a plan",
      "Novelty for its own sake"
    ],
    "tools": [
      [
        "Weekly Wins Generator",
        "Keep the rhythm visible"
      ],
      [
        "Financial Autopilot",
        "Steady, repeatable money habits"
      ]
    ]
  },
  "sort": {
    "name": "The Architect",
    "tag": "You run on clarity.",
    "identity": "Understanding is your fuel. You see the whole system and plan before you move — the trick is starting before it is all clear.",
    "strengths": [
      "Sees the whole system",
      "Plans before acting",
      "Notices what doesn’t fit"
    ],
    "friction": [
      "Starting before it’s clear",
      "Vague briefs and ambiguity",
      "Analysis that stalls the action"
    ],
    "tools": [
      [
        "Decision Paralysis Solver",
        "Get unstuck and choose"
      ],
      [
        "Brain Dump Sorter",
        "Turn a mess into structure"
      ]
    ]
  },
  "steady": {
    "name": "The Still Point",
    "tag": "You run on calm.",
    "identity": "A settled nervous system is your fuel. You stay level under pressure and read the room — the trick is protecting your calm before it’s gone.",
    "strengths": [
      "Stays level under pressure",
      "Reads people and mood well",
      "Patient and unhurried"
    ],
    "friction": [
      "Overload and rushing",
      "Harsh or sudden feedback",
      "Deciding while unsettled"
    ],
    "tools": [
      [
        "Biometric State Tracker",
        "Notice when you’re running low"
      ],
      [
        "ADHD Tax Calculator",
        "See the hidden cost of friction"
      ]
    ]
  }
}

export const RECOMMENDED_TOOL_URLS: Record<string, string> = {
  'Brain Dump Sorter': '/embed/brain-dump-sorter',
  'Weekly Wins Generator': '/embed/weekly-wins-generator',
  'Financial Autopilot': '/embed/financial-autopilot',
  'Decision Paralysis Solver': '/embed/decision-paralysis-solver',
  'Biometric State Tracker': '/embed/biometric-state-tracker',
  'ADHD Tax Calculator': '/embed/adhd-tax-calculator',
}

export function emptyBrainScores(): BrainScores {
  return { spark: 0, sustain: 0, sort: 0, steady: 0 }
}

/** Preserve the handoff's deterministic tie order: Spark, Sustain, Sort, Steady. */
export function getBrainType(scores: BrainScores): BrainDimension {
  return DIMENSIONS.reduce((best, dimension) => scores[dimension] > scores[best] ? dimension : best, DIMENSIONS[0])
}

/** Public recommendations are the intersection of profile fit and Notion publication. */
export function publishedRecommendations(type: BrainType, publishedSlugs: string[]): string[][] {
  const available = new Set(publishedSlugs)
  return type.tools.filter(([name]) => {
    const slug = RECOMMENDED_TOOL_URLS[name]?.split('/').at(-1)
    return Boolean(slug && available.has(slug))
  })
}

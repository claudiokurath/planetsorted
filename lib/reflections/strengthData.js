/* Task definitions. All items are design-time fixed; answers were checked by hand. */

const PRED = [
  { v: 0, label: "I might struggle", short: "might struggle" },
  { v: 1, label: "I should manage", short: "should manage" },
  { v: 2, label: "I expect to do well", short: "expect to do well" }
];

const BAND = ["Developing", "Solid", "Strong"];

const ENJ = {
  1: "not enjoyable",
  2: "a little enjoyable",
  3: "moderately enjoyable",
  4: "very enjoyable",
  5: "extremely enjoyable"
};

const DRAIN = {
  1: "very easy",
  2: "fairly easy",
  3: "moderately demanding",
  4: "quite demanding",
  5: "very draining"
};

const TASKS = [
  {
    id: "pattern",
    name: "Pattern finding",
    label: "Pattern Hunter",
    kind: "mc",
    asks: "Find the next number in four sequences",
    intro: "Choose the next number in each sequence, using the simplest consistent rule.",
    next: "Try logic puzzles, strategy games, or anything where you test a theory about a rule.",
    items: [
      { q: "3, 6, 12, 24, …", options: ["30", "36", "48", "60"], answer: 2, explain: "48 — double each number." },
      { q: "2, 5, 9, 14, …", options: ["18", "19", "20", "28"], answer: 2, explain: "20 — add 3, then 4, 5, 6." },
      { q: "1, 4, 9, 16, …", options: ["20", "24", "25", "32"], answer: 2, explain: "25 — consecutive square numbers." },
      { q: "2, 7, 3, 8, 4, 9, …", options: ["5", "10", "11", "14"], answer: 0, explain: "5 — two interleaved runs, 2,3,4,5 and 7,8,9." }
    ]
  },
  {
    id: "detail",
    name: "Detail spotting",
    label: "Detail Detective",
    kind: "mc",
    asks: "Compare four originals with their copies",
    intro: "Each pair has an original and a copy. Decide whether they are exactly the same.",
    next: "Try proofreading a short document, or comparing two versions of something you use daily.",
    pair: true,
    items: [
      { q: { a: "6842-917", b: "6842-971" }, options: ["Exactly the same", "Different"], answer: 1, explain: "Different — the last two digits are swapped." },
      { q: { a: "K7M2-P8", b: "K7M2-P8" }, options: ["Exactly the same", "Different"], answer: 0, explain: "The same, character for character." },
      { q: { a: "TRAIL-46", b: "TRIAL-46" }, options: ["Exactly the same", "Different"], answer: 1, explain: "Different — TRAIL versus TRIAL." },
      { q: { a: "5296-183", b: "5296-183" }, options: ["Exactly the same", "Different"], answer: 0, explain: "The same, character for character." }
    ]
  },
  {
    id: "adapt",
    name: "Adaptation",
    label: "Quick Switcher",
    kind: "adapt",
    asks: "Sort eight circles, and cope when the rule flips",
    intro: "You will sort coloured circles left or right using a rule. Partway through, the rule changes. The current rule stays on screen the whole time — this is about adjusting, not memorising.",
    next: "Try learning a new set of keyboard shortcuts, or a different route to a familiar place.",
    trials: 8,
    switchAt: 4,
    sequence: ["blue", "yellow", "yellow", "blue", "yellow", "blue", "blue", "yellow"]
  },
  {
    id: "recall",
    name: "Recall",
    label: "Recall Explorer",
    kind: "recall",
    asks: "Study six words, then type what stays",
    intro: "Study six words for as long as you like, then hide them and type what you remember. Please don't write them down.",
    next: "Try holding a short list with a mental image or a tiny story, and see whether it helps.",
    words: ["lamp", "river", "lemon", "violin", "cloud", "velvet"]
  },
  {
    id: "plan",
    name: "Planning",
    label: "Route Planner",
    kind: "mc",
    asks: "Solve three puzzles with fixed constraints",
    intro: "Each puzzle has exactly one option that satisfies every rule.",
    next: "Try a scheduling puzzle, or plan a small event with a few fixed constraints.",
    items: [
      {
        q: "Deliver Blue, Red and Green. Blue must come before Red. Green cannot be last.",
        options: ["Red, Green, Blue", "Blue, Red, Green", "Green, Red, Blue", "Blue, Green, Red"],
        answer: 3,
        explain: "Blue, Green, Red — Blue comes before Red, and Green is not last."
      },
      {
        q: "Visit Bank, Cafe, Library and Post office. Bank is before Cafe. Library is not first. Post office is immediately after Cafe.",
        options: [
          "Library, Bank, Cafe, Post office",
          "Bank, Cafe, Post office, Library",
          "Bank, Library, Post office, Cafe",
          "Cafe, Post office, Bank, Library"
        ],
        answer: 1,
        explain: "Bank, Cafe, Post office, Library satisfies all three rules."
      },
      {
        q: "Seat Ana, Ben and Cy in a row. Ana is not next to Cy. Ben sits to the left of Cy.",
        options: ["Ben, Ana, Cy", "Cy, Ben, Ana", "Ana, Ben, Cy", "Ben, Cy, Ana"],
        answer: 2,
        explain: "Ana, Ben, Cy — Ana and Cy are apart, and Ben sits left of Cy."
      }
    ]
  }
];


export { PRED, BAND, ENJ, DRAIN, TASKS };

import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { RotatingHero } from '@/components/RotatingHero'

function getHeroImages(): string[] {
  const dir = path.join(process.cwd(), 'public', 'images', 'heroes')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort()
    .map((f) => `/images/heroes/${f}`)
}

interface Tool {
  slug: string
  title: string
  description: string
  time: string
}

const TOOLS: Tool[] = [
  {
    slug: 'adhd-tax-calculator',
    title: 'ADHD Tax Calculator',
    description: 'Calculate the hidden financial & energy cost of forgotten subscriptions, late fees, and impulse buys — with a 3-step reclamation plan.',
    time: '3 min run',
  },
  {
    slug: 'financial-autopilot',
    title: 'Financial Autopilot',
    description: 'Set up friction-free money systems so your bills, savings, and guilt-free spending run without executive function overhead.',
    time: '5 min setup',
  },
  {
    slug: 'decision-paralysis-solver',
    title: 'Decision Paralysis Solver',
    description: 'Stuck overthinking options? Break through cognitive fatigue with binary elimination and forced prioritization.',
    time: '2 min run',
  },
  {
    slug: 'dopamine-menu-generator',
    title: 'Dopamine Menu Generator',
    description: 'Build your customized menu of starters, mains, sides, and desserts to reset your brain without doomscrolling.',
    time: '4 min builder',
  },
  {
    slug: 'task-triage',
    title: 'Task Triage & Matrix',
    description: 'Dump your chaotic to-do list into a neurodivergent-friendly urgency/energy matrix that picks your next single task.',
    time: '3 min run',
  },
  {
    slug: 'rsd-response-scripts',
    title: 'RSD Response Scripts',
    description: 'Rejection Sensitive Dysphoria hitting hard? Instant text and email templates for setting boundaries without spiraling.',
    time: 'Instant',
  },
  {
    slug: 'sensory-audit',
    title: 'Sensory Audit & Reset',
    description: 'Identify background sensory friction (lighting, sound, textures) that drains your battery before lunchtime.',
    time: '4 min audit',
  },
  {
    slug: 'burnout-assessment',
    title: 'Burnout Assessment & Recovery',
    description: 'Evaluate your current neurodivergent burnout tier and get a realistic, non-shame restoration protocol.',
    time: '5 min assessment',
  },
]

export default function HomePage() {
  const heroImages = getHeroImages()

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Container */}
      <section className="relative pt-8 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <RotatingHero images={heroImages} />

          <div className="mt-8 text-center sm:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Sorted Lab — Practical Tools & Protocols
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
              Practical protocols for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                neurodivergent minds.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-gray-400 leading-relaxed sm:text-lg">
              No productivity shame. No endless app setup. Practical tools, instant templates, and step-by-step protocols delivered on the web and remote-controlled via WhatsApp.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/signup"
                className="glow-button w-full sm:w-auto rounded-full px-8 py-3.5 text-base font-bold text-gray-950 shadow-lg shadow-emerald-500/20 text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-full border border-gray-800 bg-gray-900/60 px-8 py-3.5 text-base font-semibold text-gray-300 hover:border-gray-700 hover:bg-gray-800 hover:text-white transition-all backdrop-blur-md text-center"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tools & Protocols Grid (No category labels visible) */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Tools & Protocols</h2>
          <p className="text-sm text-gray-400 mt-1">Run any tool directly in your browser or text WhatsApp to send to your phone.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => (
            <div
              key={tool.slug}
              className="glass-card glass-card-hover flex flex-col justify-between rounded-2xl p-6 relative group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-medium text-emerald-400 font-mono">
                    {tool.time}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {tool.title}
                </h3>

                <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Run Tool &rarr;
                </Link>
                <Link
                  href={`https://wa.me/447591922247?text=${encodeURIComponent(`RUN ${tool.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-gray-800 bg-gray-900/90 px-3 py-1 text-[11px] font-semibold text-gray-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
                >
                  GET IT SORTED
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp Remote Control Section */}
      <section className="mx-auto max-w-6xl px-6 mt-12">
        <div className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4">
                WhatsApp Remote Control
              </div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                No new app to download. <br />
                Control everything via text.
              </h2>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                Save protocols, request decision scripts, or trigger tools right from WhatsApp. Your saved history automatically syncs back to your web dashboard.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">✓</span>
                  <span>Text <code className="bg-gray-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">TAX</code> for quick budget triage</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">✓</span>
                  <span>Text <code className="bg-gray-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">MENU</code> for all available tools</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">✓</span>
                  <span>Text <code className="bg-gray-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">LOGIN</code> for an instant magic link</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-white">WhatsApp Live Session</span>
                <span className="ml-auto text-[10px] text-gray-500">+44 7591 922247</span>
              </div>
              <div className="mt-4 space-y-3 font-sans text-xs">
                <div className="ml-auto max-w-[80%] rounded-2xl bg-emerald-600 p-3 text-gray-950 font-medium">
                  TAX
                </div>
                <div className="mr-auto max-w-[85%] rounded-2xl bg-gray-900 p-3 border border-gray-800 text-gray-200 leading-relaxed">
                  <strong className="block text-emerald-400 mb-1">ADHD Tax Calculator</strong>
                  Here is your quick calculation protocol & next action steps 👇
                  <br />
                  <span className="mt-2 block text-[11px] text-emerald-300 underline font-mono">planetsorted.com/r/adhd-tax-calculator</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

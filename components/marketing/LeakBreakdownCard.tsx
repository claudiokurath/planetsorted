/**
 * Right-column preview card for the "ADHD Tax Calculator" showcase section.
 * Purely presentational — no state, no wiring. Values are sample data.
 */
const LEAKS = [
  { label: 'Forgotten subscriptions', amt: 980, pct: 34 },
  { label: 'Impulse buys',            amt: 837, pct: 29 },
  { label: 'Late fees & overdrafts',  amt: 620, pct: 22 },
  { label: 'Duplicate purchases',     amt: 410, pct: 14 },
]

export function LeakBreakdownCard() {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-neutral-950 p-6 md:p-10">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#F5C518]" />

      <div className="mb-5 flex items-center justify-between">
        <span className="themed-idx">Your leak · last 12 months</span>
        <span className="sor7ed-pill">62% avoidable</span>
      </div>

      <div className="font-bebas text-[72px] uppercase leading-none tracking-normal text-white md:text-[104px]">
        £2,847
        <span className="ml-3 text-[36px] text-white/50 md:text-[56px]">/yr</span>
      </div>
      <p className="mt-5 max-w-md text-[14px] text-neutral-400 md:text-[15px]">
        That's £237/month — roughly one weekend a month, gone.
      </p>

      <div className="mt-10">
        <div className="themed-idx mb-4">Breakdown · where it came from</div>
        <ul className="space-y-4">
          {LEAKS.map((l) => (
            <li key={l.label} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4">
              <span className="text-[13px] text-neutral-300 md:text-sm">{l.label}</span>
              <span className="font-mono text-[13px] text-white md:text-sm">£{l.amt}</span>
              <span className="font-mono text-[11px] text-neutral-500">{l.pct}%</span>
              <span className="col-span-3 mt-1.5 block h-[2px] w-full bg-white/[0.06]">
                <span
                  className="block h-full bg-[#F5C518]"
                  style={{ width: `${l.pct}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

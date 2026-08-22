import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Widget Install Test — PLANET SOR7ED',
  robots: { index: false, follow: false },
}

export default function WidgetTestPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1
          className="font-bebas text-5xl sm:text-6xl font-black uppercase text-white tracking-tight leading-[0.95]"
        >
          Widget Install Test
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-300">
          This page embeds the real, live <code className="text-emerald-400">widget.js</code> script exactly the
          way a partner site would — nothing simulated. Look for the floating SOR7ED button in the bottom-right
          corner. With <code className="text-emerald-400">data-partner</code> set it opens a lead-capture
          panel (phone number → stored for the partner, then WhatsApp). Without a partner slug it opens
          WhatsApp directly.
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-[#141414] p-6 space-y-3">
          <h2 className="font-bebas text-2xl font-black uppercase text-white">
            The exact install snippet
          </h2>
          <pre className="overflow-x-auto rounded-xl bg-black p-4 text-xs sm:text-sm text-neutral-300">
            <code>{`<script src="https://planetsorted.com/widget.js" data-tool="decision-paralysis-solver" data-partner="demo-clinic" async></script>`}</code>
          </pre>
          <p className="text-sm text-neutral-400">
            That single line is all a partner site pastes in. data-partner turns on lead capture (numbers land in partner_leads). No build step, no npm install.
          </p>
        </div>
      </div>

      <Script
        src="/widget.js"
        data-tool="decision-paralysis-solver"
        data-partner="demo-clinic"
        strategy="afterInteractive"
      />
    </div>
  )
}

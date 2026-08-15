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
          className="text-5xl sm:text-6xl font-black uppercase text-white tracking-tight leading-[0.95]"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Widget Install Test
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-300">
          This page embeds the real, live <code className="text-emerald-400">widget.js</code> script exactly the
          way a partner site would — nothing simulated. Look for the floating SOR7ED button in the bottom-right
          corner of this page and tap it.
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-[#141414] p-6 space-y-3">
          <h2 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            The exact install snippet
          </h2>
          <pre className="overflow-x-auto rounded-xl bg-black p-4 text-xs sm:text-sm text-neutral-300">
            <code>{`<script src="https://planetsorted.com/widget.js" data-tool="decision-paralysis-solver" async></script>`}</code>
          </pre>
          <p className="text-sm text-neutral-400">
            That single line is all a partner site pastes in. No build step, no account, no npm install.
          </p>
        </div>
      </div>

      <Script src="/widget.js" data-tool="decision-paralysis-solver" strategy="afterInteractive" />
    </div>
  )
}

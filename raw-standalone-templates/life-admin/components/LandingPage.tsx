export function LandingPage({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-6 py-16 text-center life-admin-theme">
      <span className="inline-block bg-[#f5c51820] border border-[#f5c51840] text-[var(--yellow)] text-xs font-bold uppercase tracking-wide rounded-full px-4 py-1 mb-6">
        Admin Command Centre
      </span>
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
        Dump your life admin.<br /><span className="text-[var(--yellow)]">Get a clear action plan.</span>
      </h1>
      <p className="text-[var(--text-secondary)] max-w-xl mx-auto mb-8 text-lg">
        Bills, letters, forms, appointments — paste it all in one place and get a sorted plan
        with deadlines and ready-to-send scripts.
      </p>
      <div className="flex justify-center gap-3 flex-wrap">
        <button onClick={onStart} className="bg-[var(--yellow)] text-[#0a0a0b] font-semibold rounded-xl px-8 py-3 hover:bg-yellow-500 transition-colors">
          Start your Inbox
        </button>
        <button onClick={onDemo} className="border border-[var(--border)] rounded-xl px-8 py-3 hover:bg-[#1e1e24] transition-colors">
          See a demo
        </button>
      </div>
    </main>
  );
}

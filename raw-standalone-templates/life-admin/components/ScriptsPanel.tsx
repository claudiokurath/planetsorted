import { AdminItem } from '../types';
import { generateScripts } from '../logic';

export function ScriptsPanel({ items, isPaid, onUpgrade }: { items: AdminItem[]; isPaid: boolean; onUpgrade: () => void }) {
  if (!isPaid) {
    return (
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">Ready-to-use Scripts</h3>
          <p className="mb-6 text-sm text-[var(--text-secondary)] max-w-md mx-auto">Don't know what to say? Copy-paste scripts for asking for more time, complaining, or cancelling unlock with Premium.</p>
          <button onClick={onUpgrade} className="bg-[var(--yellow)] text-[#0a0a0b] rounded-xl px-8 py-3 font-semibold hover:bg-yellow-500 transition-colors">Upgrade to unlock</button>
        </div>
      </section>
    );
  }
  
  const worstItem = [...items].sort((a, b) => b.urgencyScore - a.urgencyScore)[0];
  const scripts = worstItem ? generateScripts(worstItem) : [];
  
  if (scripts.length === 0) return null;

  return (
    <section>
      <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Scripts for: <span className="font-normal text-[var(--text-secondary)]">{worstItem.title}</span></h3>
      <div className="grid md:grid-cols-2 gap-4">
        {scripts.map(s => (
          <div key={s.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col shadow-sm">
            <div className="font-bold text-[var(--text-primary)] mb-3">{s.title}</div>
            <div className="flex-1 bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border)] mb-4">
              <pre className="whitespace-pre-wrap text-sm text-[var(--text-secondary)] font-sans">{s.body}</pre>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(s.body)} 
              className="text-xs border border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[#2a2a35] text-[var(--text-primary)] font-semibold rounded-lg px-4 py-2 self-start transition-colors"
            >
              Copy to clipboard
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

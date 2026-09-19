import { AdminItem } from '../types';
import { buildWeeklyPlan } from '../logic';

export function WeeklyPlan({ items, isPaid, onUpgrade }: { items: AdminItem[]; isPaid: boolean; onUpgrade: () => void }) {
  if (!isPaid) {
    return (
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">Your 7-day admin plan</h3>
          <p className="mb-6 text-sm text-[var(--text-secondary)] max-w-md mx-auto">Get a balanced day-by-day plan so you don't burn out. Unlocks with Premium.</p>
          <button onClick={onUpgrade} className="bg-[var(--yellow)] text-[#0a0a0b] rounded-xl px-8 py-3 font-semibold hover:bg-yellow-500 transition-colors">Upgrade to unlock</button>
        </div>
      </section>
    );
  }
  
  const plan = buildWeeklyPlan(items);
  const byId = Object.fromEntries(items.map(i => [i.id, i]));
  
  return (
    <section>
      <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Weekly Plan</h3>
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
        {plan.map(block => (
          <div key={block.dayIndex} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 min-h-[140px] shadow-sm">
            <div className="text-xs font-bold text-[var(--text-muted)] mb-3 uppercase tracking-wider">{block.label}</div>
            <div className="space-y-2">
              {block.items.map((id, idx) => (
                <div key={`${id}-${idx}`} className="text-xs bg-[#f5c51815] border border-[#f5c51830] text-[var(--yellow)] rounded-md px-2 py-1.5 leading-snug">
                  {id === "weekly_review" ? "Weekly review" : byId[id]?.title}
                </div>
              ))}
              {block.items.length === 0 && (
                <div className="text-xs text-[var(--text-muted)] italic">Rest day</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

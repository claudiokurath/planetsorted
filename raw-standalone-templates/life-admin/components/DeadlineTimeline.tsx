import { AdminItem } from '../types';
import { daysUntil } from '../logic';

export function DeadlineTimeline({ items, isPaid, onUpgrade }: { items: AdminItem[]; isPaid: boolean; onUpgrade: () => void }) {
  const withDeadlines = [...items].filter(i => i.deadline).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  const visible = isPaid ? withDeadlines : withDeadlines.slice(0, 2);

  if (withDeadlines.length === 0) return null;

  return (
    <section>
      <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Deadline timeline</h3>
      <div className="space-y-4 border-l-2 border-[var(--border)] pl-6 relative">
        {visible.map(item => {
          const days = daysUntil(item.deadline);
          const color = days !== null && days <= 2 ? "var(--red)" : days !== null && days <= 7 ? "var(--orange)" : "var(--yellow)";
          return (
            <div key={item.id} className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
              <div className="absolute w-3 h-3 rounded-full -left-[31px] top-5" style={{ backgroundColor: color }}></div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>{item.deadline} ({days}d)</div>
              <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
            </div>
          );
        })}
      </div>
      {!isPaid && withDeadlines.length > 2 && (
        <button onClick={onUpgrade} className="mt-4 text-sm text-[var(--yellow)] underline hover:text-yellow-500 transition-colors">
          See all {withDeadlines.length} deadlines →
        </button>
      )}
    </section>
  );
}

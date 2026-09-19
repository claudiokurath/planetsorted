import { AdminItem, SortedBucket } from '../types';
import { daysUntil } from '../logic';

export function ActionItemRow({ item }: { item: AdminItem }) {
  const days = daysUntil(item.deadline);
  
  const getBucketLabel = (b: SortedBucket) => {
    return {
      do_today: "🔴 Do today", do_this_week: "🟠 Do this week", schedule: "🟡 Schedule",
      waiting: "🔵 Waiting", archive: "🟢 Can ignore", needs_info: "🟣 Needs info",
    }[b];
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
      <div>
        <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
        <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2">
          <span>{getBucketLabel(item.bucket)}</span>
          {item.deadline && (
            <span>· Due: {item.deadline} {days !== null && `(${days}d)`}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-1 rounded">
          {item.category}
        </span>
        <span className="text-xs font-bold w-12 text-center" style={{ color: item.urgencyScore >= 75 ? 'var(--red)' : item.urgencyScore >= 50 ? 'var(--orange)' : 'var(--text-secondary)' }}>
          {item.urgencyScore}
        </span>
      </div>
    </div>
  );
}

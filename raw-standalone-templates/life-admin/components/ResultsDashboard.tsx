import { AdminRun, SortedBucket } from '../types';
import { PressureScoreCard } from './PressureScoreCard';
import { ActionItemRow } from './ActionItemRow';
import { DeadlineTimeline } from './DeadlineTimeline';
import { ActionCards } from './ActionCards';
import { ScriptsPanel } from './ScriptsPanel';
import { WeeklyPlan } from './WeeklyPlan';

export function ResultsDashboard({ run, isPaid, onUpgrade, onExport }: {
  run: AdminRun; isPaid: boolean; onUpgrade: () => void; onExport: () => void;
}) {
  const topFive = [...run.items].sort((a, b) => b.urgencyScore - a.urgencyScore).slice(0, 5);
  const buckets: SortedBucket[] = ["do_today","do_this_week","schedule","waiting","archive","needs_info"];

  const bucketLabel = (b: SortedBucket) => {
    return {
      do_today: "🔴 Do today", do_this_week: "🟠 Do this week", schedule: "🟡 Schedule",
      waiting: "🔵 Waiting on someone else", archive: "🟢 Can ignore / archive", needs_info: "🟣 Needs more information",
    }[b];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 life-admin-theme">
      <PressureScoreCard score={run.pressureScore} level={run.pressureLevel} />

      <section>
        <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Top priority actions</h3>
        {topFive.map(item => <ActionItemRow key={item.id} item={item} />)}
      </section>

      <section className={isPaid ? "" : "relative"}>
        <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">All Buckets</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {buckets.map(b => {
            const bucketItems = run.items.filter(i => i.bucket === b);
            if (bucketItems.length === 0) return null;
            return (
              <div key={b}>
                <h4 className="text-sm font-bold uppercase text-[var(--text-secondary)] mb-3">{bucketLabel(b)}</h4>
                {bucketItems.map(i => <ActionItemRow key={i.id} item={i} />)}
              </div>
            );
          })}
        </div>
        {!isPaid && (
          <div className="absolute inset-0 backdrop-blur-md bg-black/70 flex flex-col items-center justify-center rounded-2xl border border-[var(--border)]">
            <p className="mb-4 text-sm text-[var(--text-primary)] font-medium">Unlock every bucket, all action cards, and scripts</p>
            <button onClick={onUpgrade} className="bg-[var(--yellow)] text-[#0a0a0b] rounded-xl px-6 py-2 font-semibold hover:bg-yellow-500 transition-colors">
              Upgrade
            </button>
          </div>
        )}
      </section>

      <DeadlineTimeline items={run.items} isPaid={isPaid} onUpgrade={onUpgrade} />
      <ActionCards items={run.items} isPaid={isPaid} onUpgrade={onUpgrade} />
      <ScriptsPanel items={run.items} isPaid={isPaid} onUpgrade={onUpgrade} />
      <WeeklyPlan items={run.items} isPaid={isPaid} onUpgrade={onUpgrade} />

      <div className="flex justify-end mt-12 border-t border-[var(--border)] pt-8">
        <button onClick={isPaid ? onExport : onUpgrade} className="bg-[var(--yellow)] text-[#0a0a0b] rounded-xl px-6 py-3 font-semibold hover:bg-yellow-500 transition-colors">
          {isPaid ? "Export plan" : "Unlock export & reminders"}
        </button>
      </div>
    </div>
  );
}

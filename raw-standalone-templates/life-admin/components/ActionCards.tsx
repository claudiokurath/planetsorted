import { AdminItem, NextAction, AdminCategory } from '../types';

function buildNextAction(item: AdminItem): NextAction {
  const tinySteps: Record<AdminCategory, string> = {
    money: "Open the bill and note the exact amount and reference number.",
    housing: "Write down the issue and the date it started.",
    car: "Find your V5C logbook and check the current dates.",
    tax: "Log into your tax portal and check what's outstanding.",
    health: "Call to explain what you need in one sentence.",
    family: "Read the form or letter through once.",
    legal: "Write down the key facts and dates.",
    benefits: "Find your claim reference number on the last letter.",
    utilities: "Find your account number on a recent bill.",
    work: "Write a one-sentence summary of what's needed.",
    education: "Find the relevant contact email.",
    other: "Write down everything you know about this in one line.",
  };
  return {
    adminItemId: item.id,
    tinyStep: tinySteps[item.category],
    fullNextStep: item.whatNeedsToHappen && item.whatNeedsToHappen.length > 5 ? item.whatNeedsToHappen : "Contact them and ask what's needed to resolve this.",
    whoToContact: item.involves,
    whatToSay: `Hi, I'm calling/writing about ${item.title}. My reference is [REF]. Could you tell me what my next step is?`,
    documentsNeeded: item.hasDocument ? ["Related letter/document"] : [],
    estimatedTimeMinutes: item.urgencyScore >= 75 ? 20 : item.urgencyScore >= 50 ? 15 : 10,
    energyLevel: item.stressLevel >= 7 ? "high" : item.stressLevel >= 4 ? "medium" : "low",
  };
}

export function ActionCards({ items, isPaid, onUpgrade }: { items: AdminItem[]; isPaid: boolean; onUpgrade: () => void }) {
  const sorted = [...items].sort((a, b) => b.urgencyScore - a.urgencyScore);
  const visible = isPaid ? sorted : sorted.slice(0, 5);

  if (items.length === 0) return null;

  return (
    <section>
      <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Action cards</h3>
      <div className="space-y-4">
        {visible.map(item => {
          const action = buildNextAction(item);
          return (
            <div key={item.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <div className="font-bold text-[var(--text-primary)] mb-4 text-lg border-b border-[var(--border)] pb-3">{item.title}</div>
              
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)] inline-block w-24">Tiny step:</span> 
                  {action.tinyStep}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)] inline-block w-24">Full step:</span> 
                  {action.fullNextStep}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)] inline-block w-24">Contact:</span> 
                  {action.whoToContact || "—"}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)] inline-block w-24">Effort:</span> 
                  ~{action.estimatedTimeMinutes} min · Energy: <span className="capitalize">{action.energyLevel}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {!isPaid && items.length > 5 && (
        <button onClick={onUpgrade} className="mt-4 text-sm text-[var(--yellow)] underline hover:text-yellow-500 transition-colors">
          See action cards for all {items.length} items →
        </button>
      )}
    </section>
  );
}

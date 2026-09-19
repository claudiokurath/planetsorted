export function UpgradeModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  const features = [
    "Full action plan across every bucket",
    "Copy-paste scripts for every item",
    "Deadline timeline & calendar export",
    "Print/export action plan",
    "Saved admin inboxes",
    "Recurring reminders",
    "Weekly review flow",
  ];
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 life-admin-theme" onClick={onClose}>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-5 top-5 text-[var(--text-muted)] hover:text-white transition-colors">✕</button>
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Unlock your full command centre</h2>
        <ul className="space-y-3 mb-8">
          {features.map(f => (
            <li key={f} className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <span className="text-[var(--green)]">✓</span> {f}
            </li>
          ))}
        </ul>
        <button onClick={onUpgrade} className="w-full bg-[var(--yellow)] text-[#0a0a0b] rounded-xl py-3 font-semibold hover:bg-yellow-500 transition-colors">
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}

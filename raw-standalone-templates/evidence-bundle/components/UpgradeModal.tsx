export function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm evidence-theme">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-white transition-colors">✕</button>
        <h2 className="text-xl font-bold text-white mb-6">Unlock Full Evidence Bundle</h2>
        <ul className="space-y-3 text-sm text-gray-300 mb-8">
          <li className="flex gap-2"><span>✅</span> Full exhibit index (A/B/C/D)</li>
          <li className="flex gap-2"><span>✅</span> Keep/Maybe/Remove sorter</li>
          <li className="flex gap-2"><span>✅</span> Risk & contradiction review</li>
          <li className="flex gap-2"><span>✅</span> Adviser email draft</li>
          <li className="flex gap-2"><span>✅</span> Export / print bundle</li>
          <li className="flex gap-2"><span>✅</span> Saved cases & version history</li>
        </ul>
        <div className="text-center text-3xl font-bold text-[var(--yellow)] mb-6">
          £4.99<span className="text-sm font-normal text-gray-400">/case</span>
        </div>
        <button onClick={onClose} className="w-full rounded-md bg-[var(--yellow)] px-4 py-3 text-sm font-semibold text-black hover:bg-yellow-500 transition-colors">
          Join the Waitlist
        </button>
        <p className="mt-4 text-center text-[11px] text-gray-500">Payments are not live yet. This is a design placeholder.</p>
      </div>
    </div>
  );
}

export function BrainDumpInput({
  value, onChange, onProcess, onSwitchToForm,
}: { value: string; onChange: (v: string) => void; onProcess: () => void; onSwitchToForm: () => void }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-4 life-admin-theme">
      <h2 className="text-2xl font-bold mb-2">What's on your mind?</h2>
      <p className="text-[var(--text-secondary)] mb-6">No need to organise it. Just paste or type everything here.</p>
      <textarea
        className="w-full min-h-[240px] bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--yellow)]"
        placeholder="Council tax overdue, car MOT next month, GP repeat prescription ran out, school trip form due Friday..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div className="flex justify-between items-center mt-5">
        <button onClick={onSwitchToForm} className="text-sm text-[var(--text-secondary)] underline hover:text-[var(--text-primary)] transition-colors">
          Add items one-by-one instead
        </button>
        <button onClick={onProcess} disabled={!value.trim()} className="bg-[var(--yellow)] text-[#0a0a0b] font-semibold rounded-xl px-6 py-3 disabled:opacity-40 hover:bg-yellow-500 transition-colors">
          Sort this for me
        </button>
      </div>
    </section>
  );
}

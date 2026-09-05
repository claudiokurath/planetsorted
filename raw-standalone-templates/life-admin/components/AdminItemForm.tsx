import { useState } from 'react';
import { AdminItem, AdminCategory } from '../types';

export function AdminItemForm({ items, onAdd, onDone }: { items: AdminItem[]; onAdd: (i: AdminItem) => void; onDone: () => void }) {
  const [draft, setDraft] = useState<Partial<AdminItem>>({ stressLevel: 5, category: "other" });

  const submit = () => {
    if (!draft.title) return;
    onAdd({
      id: crypto.randomUUID(),
      title: draft.title!,
      category: draft.category as AdminCategory,
      deadline: draft.deadline,
      involves: draft.involves,
      whatNeedsToHappen: draft.whatNeedsToHappen,
      stressLevel: draft.stressLevel ?? 5,
      hasReplied: !!draft.hasReplied,
      hasDocument: !!draft.hasDocument,
      consequence: draft.consequence,
      urgencyScore: 0,
      bucket: "needs_info",
    });
    setDraft({ stressLevel: 5, category: "other", title: "", involves: "", whatNeedsToHappen: "", consequence: "", deadline: "" });
  };

  return (
    <section className="max-w-2xl mx-auto py-10 px-4 space-y-4 life-admin-theme">
      <h2 className="text-xl font-bold mb-4">Add Item Manually</h2>
      
      <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:border-[var(--yellow)]" placeholder="Item title"
        value={draft.title ?? ""} onChange={e => setDraft({ ...draft, title: e.target.value })} />
        
      <select className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:border-[var(--yellow)]"
        value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as AdminCategory })}>
        {["money","housing","work","health","family","car","tax","legal","benefits","education","utilities","other"]
          .map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      
      <input type="date" className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:border-[var(--yellow)] [color-scheme:dark]"
        value={draft.deadline ?? ""} onChange={e => setDraft({ ...draft, deadline: e.target.value })} />
        
      <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:border-[var(--yellow)]" placeholder="Who does this involve?"
        value={draft.involves ?? ""} onChange={e => setDraft({ ...draft, involves: e.target.value })} />
        
      <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:border-[var(--yellow)]" placeholder="What needs to happen?"
        value={draft.whatNeedsToHappen ?? ""} onChange={e => setDraft({ ...draft, whatNeedsToHappen: e.target.value })} />
        
      <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:border-[var(--yellow)]" placeholder="Consequence if ignored"
        value={draft.consequence ?? ""} onChange={e => setDraft({ ...draft, consequence: e.target.value })} />
        
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Stress level: {draft.stressLevel}/10</label>
        <input type="range" min={1} max={10} value={draft.stressLevel} className="w-full accent-[var(--yellow)]"
          onChange={e => setDraft({ ...draft, stressLevel: Number(e.target.value) })} />
      </div>
      
      <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
        <input type="checkbox" checked={!!draft.hasReplied} onChange={e => setDraft({ ...draft, hasReplied: e.target.checked })} className="accent-[var(--yellow)]" />
        I've already replied
      </label>
      
      <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
        <input type="checkbox" checked={!!draft.hasDocument} onChange={e => setDraft({ ...draft, hasDocument: e.target.checked })} className="accent-[var(--yellow)]" />
        There's a letter/document attached
      </label>
      
      <div className="flex justify-between pt-4">
        <button onClick={submit} className="bg-[var(--yellow)] text-[#0a0a0b] rounded-xl px-6 py-3 font-semibold hover:bg-yellow-500 transition-colors">Add item</button>
        <button onClick={onDone} disabled={!items.length} className="border border-[var(--border)] rounded-xl px-6 py-3 hover:bg-[#1e1e24] transition-colors disabled:opacity-40">
          Generate my plan ({items.length})
        </button>
      </div>
    </section>
  );
}

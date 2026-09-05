import { EvidenceItem } from '../types';

export function EvidenceEntryForm({ value, onChange, onNext, onDone }: {
  value: EvidenceItem; onChange: (e: EvidenceItem) => void; onNext: () => void; onDone: () => void;
}) {
  const set = (patch: Partial<EvidenceItem>) => onChange({ ...value, ...patch });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add Evidence</h2>
        <button onClick={onDone} className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
          I'm done adding for now →
        </button>
      </div>
      
      <div className="border-2 border-dashed border-[#333] rounded-lg p-6 text-center text-gray-400 bg-[var(--bg-surface)]">
        <p>📎 File upload — placeholder only in this MVP.</p>
        <p className="mt-2 text-sm">Describe the document manually below.</p>
        <p className="text-xs mt-4 text-gray-500 max-w-md mx-auto">
          Documents may contain sensitive personal information. Do not upload anything unless you trust
          the service and understand how it is stored.
        </p>
      </div>

      <div className="space-y-4">
        <input className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" placeholder="Title (e.g. 'Letter from landlord')" value={value.title} onChange={e => set({ title: e.target.value })} />
        
        <div className="grid grid-cols-2 gap-4">
          <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" value={value.documentType} onChange={e => set({ documentType: e.target.value as any })}>
            <option value="other">Select Document Type</option>
            <option value="email">Email</option>
            <option value="pdf">PDF / Document</option>
            <option value="screenshot">Screenshot</option>
            <option value="photo">Photo</option>
            <option value="receipt">Receipt</option>
            <option value="bank_statement">Bank Statement</option>
            <option value="medical">Medical Record</option>
            <option value="official_letter">Official Letter</option>
            <option value="witness_statement">Witness Statement</option>
            <option value="note">Note</option>
          </select>
          <input type="date" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)] [color-scheme:dark]" value={value.date ?? ''} onChange={e => set({ date: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" placeholder="Created By / Sender" value={value.createdBy} onChange={e => set({ createdBy: e.target.value })} />
          <input className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" placeholder="Received By / Recipient" value={value.receivedBy} onChange={e => set({ receivedBy: e.target.value })} />
        </div>

        <textarea className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)] min-h-[80px]" placeholder="Brief summary of contents" value={value.summary} onChange={e => set({ summary: e.target.value })} />
        <textarea className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)] min-h-[80px]" placeholder="What does this prove?" value={value.provesWhat} onChange={e => set({ provesWhat: e.target.value })} />
        
        <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" value={value.importance} onChange={e => set({ importance: e.target.value as any })}>
          <option value="not_sure">Importance / Strength</option>
          <option value="core">Core evidence (critical)</option>
          <option value="supporting">Supporting evidence</option>
          <option value="background">Background context</option>
          <option value="risky">Risky (might harm case)</option>
          <option value="duplicate">Duplicate</option>
        </select>
        
        <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" value={value.problem || ''} onChange={e => set({ problem: e.target.value ? (e.target.value as any) : null })}>
          <option value="">Any problems with this document?</option>
          <option value="missing_page">Missing pages</option>
          <option value="unclear_date">Unclear date</option>
          <option value="not_your_name">Not in your name</option>
          <option value="contradiction">Contradicts other evidence</option>
          <option value="low_quality">Low quality / hard to read</option>
        </select>

        <label className="flex items-center space-x-2 text-sm text-[var(--text-muted)] cursor-pointer">
          <input type="checkbox" checked={value.isSensitive} onChange={e => set({ isSensitive: e.target.checked })} className="accent-[var(--yellow)]" />
          <span>This document contains highly sensitive material (e.g. medical data)</span>
        </label>
      </div>

      <div className="pt-4 flex gap-4">
        <button onClick={onNext} className="bg-[var(--yellow)] text-black font-semibold px-6 py-3 rounded-md hover:bg-yellow-500 transition-colors flex-1">
          Save & Add Another
        </button>
        <button onClick={onDone} className="bg-[var(--bg-elevated)] text-white border border-[var(--border)] font-semibold px-6 py-3 rounded-md hover:bg-[#2a2a2a] transition-colors flex-1">
          Done Adding
        </button>
      </div>
    </div>
  );
}

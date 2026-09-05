import { CaseSetup, CaseType } from '../types';

export function CaseSetupForm({ value, onChange, onNext }: {
  value: CaseSetup; onChange: (c: CaseSetup) => void; onNext: () => void;
}) {
  const set = (patch: Partial<CaseSetup>) => onChange({ ...value, ...patch });
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Case setup</h2>
      
      <select 
        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" 
        value={value.caseType} 
        onChange={e => set({ caseType: e.target.value as CaseType })}
      >
        <option value="universal_credit">Universal Credit / benefits challenge</option>
        <option value="mandatory_reconsideration">Mandatory reconsideration</option>
        <option value="small_claim">Small claim / consumer dispute</option>
        <option value="housing">Housing / landlord issue</option>
        <option value="police_complaint">Police complaint</option>
        <option value="employment">Employment issue</option>
        <option value="debt_financial">Debt / financial dispute</option>
        <option value="general_complaint">General complaint</option>
        <option value="other">Other</option>
      </select>
      
      <input className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" placeholder="Case name" value={value.caseName} onChange={e => set({ caseName: e.target.value })} />
      <input className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" placeholder="Opponent / organisation" value={value.opponent} onChange={e => set({ opponent: e.target.value })} />
      <textarea className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)] min-h-[100px]" placeholder="What happened?" value={value.whatHappened} onChange={e => set({ whatHappened: e.target.value })} />
      <textarea className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)] min-h-[100px]" placeholder="What outcome do you want?" value={value.desiredOutcome} onChange={e => set({ desiredOutcome: e.target.value })} />
      <input className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" placeholder="Your main argument in one sentence" value={value.mainArgument} onChange={e => set({ mainArgument: e.target.value })} />
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Key Date</label>
          <input type="date" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)] [color-scheme:dark]" value={value.keyDate ?? ''} onChange={e => set({ keyDate: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Deadline</label>
          <input type="date" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)] [color-scheme:dark]" value={value.deadline ?? ''} onChange={e => set({ deadline: e.target.value })} />
        </div>
      </div>
      
      <div>
        <label className="text-sm text-[var(--text-muted)] block mb-2">Stress level: {value.stressLevel}/10</label>
        <input type="range" min={1} max={10} value={value.stressLevel} onChange={e => set({ stressLevel: +e.target.value })} className="w-full accent-[var(--yellow)]" />
      </div>
      
      <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md p-3 text-sm focus:outline-none focus:border-[var(--yellow)]" value={value.purpose ?? ''} onChange={e => set({ purpose: e.target.value as any })}>
        <option value="">Is this for court / tribunal / complaint / adviser?</option>
        <option value="court">Court</option>
        <option value="tribunal">Tribunal</option>
        <option value="complaint">Complaint body</option>
        <option value="adviser">Adviser / solicitor</option>
        <option value="not_sure">Not sure yet</option>
      </select>
      
      <div className="pt-4">
        <button onClick={onNext} className="bg-[var(--yellow)] text-black font-semibold px-6 py-3 rounded-md hover:bg-yellow-500 transition-colors w-full sm:w-auto">
          Save and add evidence
        </button>
      </div>
    </div>
  );
}

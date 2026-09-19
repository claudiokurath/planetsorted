import { CaseSetup, EvidenceItem, ExhibitCategory } from '../types';
import { computeStrengthScore, computeReadinessScore, assignExhibitRefs, generateRisks } from '../logic';
import { MISSING_EVIDENCE } from '../constants';

export function EvidenceDashboard({ caseData, evidence, plan, onUpgrade, onExport }: {
  caseData: CaseSetup; evidence: EvidenceItem[]; plan: 'free'|'paid'; onUpgrade: () => void; onExport: () => void;
}) {
  const scored = evidence.map(e => ({ ...e, strengthScore: computeStrengthScore(e) }));
  const { score, label } = computeReadinessScore(caseData, scored);
  const exhibitItems = assignExhibitRefs(scored);
  const risks = generateRisks(scored, caseData);
  const missing = MISSING_EVIDENCE[caseData.caseType] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 evidence-theme">
      
      {/* Header and Summary */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{caseData.caseName || 'Unnamed Case'}</h1>
          <p className="text-[var(--text-muted)]">Readiness Score: 
            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
              ${score >= 80 ? 'bg-[var(--green)] text-black' : 
                score >= 55 ? 'bg-green-800 text-green-100' : 
                score >= 30 ? 'bg-[var(--orange)] text-black' : 
                'bg-[var(--red)] text-white'}`}
            >
              {score} - {label.replace('_', ' ')}
            </span>
          </p>
        </div>
        <button onClick={onExport} className="bg-[var(--yellow)] text-black px-4 py-2 rounded-md font-semibold text-sm hover:bg-yellow-500">
          Export Bundle
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Strongest Evidence */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex justify-between items-center">
            Strongest Evidence
            {plan === 'free' && <button onClick={onUpgrade} className="text-xs font-normal text-[var(--yellow)] border border-[var(--yellow)] rounded px-2 py-1">Unlock All</button>}
          </h3>
          <ul className="space-y-3">
            {scored.sort((a,b) => (b.strengthScore || 0) - (a.strengthScore || 0)).slice(0, plan === 'free' ? 5 : undefined).map(item => (
              <li key={item.id} className="flex justify-between items-center text-sm border-b border-[var(--border)] pb-2 last:border-0">
                <span className="truncate pr-4">{item.title}</span>
                <span className="text-[var(--green)] font-bold">{item.strengthScore}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Evidence Checklist */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex justify-between items-center">
            Missing Evidence
            {plan === 'free' && <button onClick={onUpgrade} className="text-xs font-normal text-[var(--yellow)] border border-[var(--yellow)] rounded px-2 py-1">Unlock Full List</button>}
          </h3>
          <ul className="space-y-4">
            {missing.slice(0, plan === 'free' ? 3 : undefined).map(m => (
              <li key={m.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-[var(--border)]"></div>
                  <span className="font-medium text-white">{m.item}</span>
                  {m.critical && <span className="text-[10px] uppercase bg-[var(--red)] text-white px-1.5 py-0.5 rounded">Critical</span>}
                </div>
                <p className="text-[var(--text-muted)] text-xs ml-6 mt-1">{m.hint}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Exhibit Index (Gated) */}
      <UpgradeGate plan={plan} feature="Exhibit Index" onUpgrade={onUpgrade}>
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Exhibit Index</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--text-muted)] uppercase border-b border-[var(--border)]">
              <tr>
                <th className="pb-3 w-16">Ref</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {exhibitItems.map(item => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)]">
                  <td className="py-3 font-mono text-[var(--yellow)]">{item.exhibitRef}</td>
                  <td className="py-3">{item.title}</td>
                  <td className="py-3 text-[var(--text-muted)]">{item.date || 'Undated'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UpgradeGate>

      {/* Timeline */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex justify-between items-center">
          Timeline
          {plan === 'free' && <button onClick={onUpgrade} className="text-xs font-normal text-[var(--yellow)] border border-[var(--yellow)] rounded px-2 py-1">Unlock Full Timeline</button>}
        </h3>
        <div className="space-y-4 border-l-2 border-[var(--border)] ml-2">
          {exhibitItems.filter(e => e.date).sort((a,b) => a.date!.localeCompare(b.date!)).slice(0, plan === 'free' ? 8 : undefined).map(item => (
            <div key={item.id} className="pl-4 relative">
              <div className="absolute w-3 h-3 bg-[var(--yellow)] rounded-full -left-[7px] top-1.5"></div>
              <p className="text-sm font-semibold text-white">{item.date}</p>
              <p className="text-sm text-[var(--text-muted)]">{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Review (Gated) */}
      <UpgradeGate plan={plan} feature="Risk & Contradiction Review" onUpgrade={onUpgrade}>
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Review</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            For formal legal/court disclosure, you may need to disclose relevant documents even if they do not help you. This tool helps organise evidence but does not replace legal advice.
          </p>
          <div className="space-y-3">
            {risks.length === 0 ? (
              <p className="text-sm text-[var(--green)]">No critical risks detected in your bundle.</p>
            ) : (
              risks.map(r => (
                <div key={r.id} className="p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md border-l-4" 
                     style={{ borderLeftColor: r.severity === 'critical' || r.severity === 'high' ? 'var(--red)' : 'var(--orange)' }}>
                  <h4 className="text-sm font-bold text-white">{r.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{r.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </UpgradeGate>
    </div>
  );
}

function UpgradeGate({ plan, feature, onUpgrade, children }: { plan: 'free'|'paid', feature: string, onUpgrade: () => void, children: React.ReactNode }) {
  if (plan === 'paid') return <>{children}</>;
  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none blur-sm select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 rounded-lg">
        <p className="text-sm text-gray-300 font-medium">🔒 {feature} is available on the paid plan</p>
        <button onClick={onUpgrade} className="bg-[var(--yellow)] text-black text-sm px-5 py-2 rounded-full font-bold hover:bg-yellow-500">
          Unlock full access
        </button>
      </div>
    </div>
  );
}

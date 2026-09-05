import { CaseSetup, EvidenceItem } from '../types';
import { assignExhibitRefs, computeReadinessScore } from '../logic';

export function ExportPage({ caseData, evidence, onBack }: { caseData: CaseSetup, evidence: EvidenceItem[], onBack: () => void }) {
  const { score, label } = computeReadinessScore(caseData, evidence);
  const exhibitItems = assignExhibitRefs(evidence);

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans print-friendly max-w-4xl mx-auto evidence-theme-export">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button onClick={onBack} className="text-sm font-semibold text-gray-500 hover:text-black">
          ← Back to Dashboard
        </button>
        <button onClick={() => window.print()} className="bg-black text-white px-5 py-2 rounded-md text-sm font-semibold">
          Print / Save as PDF
        </button>
      </div>

      <header className="mb-10 pb-6 border-b-2 border-black">
        <h1 className="text-3xl font-bold uppercase tracking-wide">Evidence Bundle</h1>
        <h2 className="text-xl mt-2">{caseData.caseName || 'Unnamed Case'}</h2>
        <p className="text-sm mt-1 text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
      </header>

      <section className="mb-8">
        <h3 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">Case Summary</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr><td className="w-40 font-semibold py-1">Type</td><td>{caseData.caseType.replace('_', ' ')}</td></tr>
            <tr><td className="font-semibold py-1">Opponent</td><td>{caseData.opponent || 'N/A'}</td></tr>
            <tr><td className="font-semibold py-1">Main Argument</td><td>{caseData.mainArgument || 'N/A'}</td></tr>
            <tr><td className="font-semibold py-1">Desired Outcome</td><td>{caseData.desiredOutcome || 'N/A'}</td></tr>
            <tr><td className="font-semibold py-1">Key Date</td><td>{caseData.keyDate || 'N/A'}</td></tr>
            <tr><td className="font-semibold py-1">Deadline</td><td>{caseData.deadline || 'N/A'}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">Exhibit Index</h3>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 w-16">Ref</th>
              <th className="p-2">Date</th>
              <th className="p-2">Title</th>
              <th className="p-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {exhibitItems.map(item => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-2 font-mono font-bold">{item.exhibitRef}</td>
                <td className="p-2">{item.date || 'Undated'}</td>
                <td className="p-2 font-medium">{item.title}</td>
                <td className="p-2 text-gray-700">{item.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-500">
        <p>Documents may contain sensitive personal information. Do not share unless you understand how it is stored.</p>
        <p className="mt-1">For formal legal/court disclosure, you may need to disclose relevant documents even if they do not help you. This tool helps organise evidence but does not replace legal advice.</p>
      </footer>
    </div>
  );
}

import { AdminRun } from '../types';

export function ExportPage({ run, onBack }: { run: AdminRun; onBack: () => void }) {
  return (
    <div className="bg-white text-gray-900 max-w-3xl mx-auto p-10 print:p-0 min-h-screen">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button onClick={onBack} className="text-sm font-semibold text-gray-500 hover:text-black">
          ← Back to Dashboard
        </button>
        <button onClick={() => window.print()} className="bg-black text-white px-5 py-2 rounded-md text-sm font-semibold">
          Print / Save as PDF
        </button>
      </div>

      <h1 className="text-3xl font-bold border-b-2 border-black pb-4">Life Admin Action Plan</h1>
      
      <p className="text-sm text-gray-600 mb-8 mt-4">
        Generated {new Date(run.createdAt).toLocaleDateString()} · Pressure score {run.pressureScore}/100 ({run.pressureLevel})
      </p>
      
      <h2 className="text-xl font-bold mt-8 mb-4">Sorted actions</h2>
      
      <div className="space-y-4">
        {run.items.map(i => (
          <div key={i.id} className="border-l-4 pl-4 py-1" style={{ borderColor: "#f5c518" }}>
            <p className="font-bold text-lg">{i.title}</p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="capitalize">{i.bucket.replace("_", " ")}</span>
              {i.deadline && <span className="ml-2 font-semibold">· due {i.deadline}</span>}
            </p>
            {i.whatNeedsToHappen && (
              <p className="text-sm mt-2"><b>Next step:</b> {i.whatNeedsToHappen}</p>
            )}
          </div>
        ))}
      </div>
      
      <footer className="text-xs text-gray-500 border-t border-gray-300 pt-6 mt-16 italic">
        Life Admin Inbox by SOR7ED helps organise admin. It does not replace legal, financial, medical or professional advice.
      </footer>
    </div>
  );
}

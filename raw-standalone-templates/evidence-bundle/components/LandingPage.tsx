export function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto px-4 py-16 evidence-theme">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-100 mb-4">
          Upload or list your messy evidence. We'll sort it into a usable bundle.
        </h1>
        <p className="text-gray-400 mb-6">
          For complaints, benefit challenges, housing issues, small claims, police complaints,
          employment disputes and more. This is an organisation tool, not legal advice.
        </p>
        <button onClick={onStart}
          className="bg-[var(--yellow)] text-black font-semibold px-6 py-3 rounded-md hover:bg-yellow-500 transition-colors">
          Start new case
        </button>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5 text-sm text-gray-300 space-y-2">
        <p className="text-xs uppercase text-gray-500 font-bold tracking-wider">What you get</p>
        <p>Timeline · Exhibit index · Strongest evidence · Gaps & risks · Export cover sheet</p>
      </div>
      <div className="md:col-span-2 space-y-3 text-xs text-gray-500 border-t border-[var(--border)] pt-6">
        <p>Documents may contain sensitive personal information. Do not upload anything unless you
          trust the service and understand how it is stored.</p>
        <p>For formal legal/court disclosure, you may need to disclose relevant documents even if
          they do not help you. This tool helps organise evidence but does not replace legal advice.</p>
      </div>
    </div>
  );
}

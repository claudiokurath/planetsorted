'use client'

export function PrintPageButton() {
  return (
    <button type="button" onClick={() => window.print()} className="print:hidden border border-white/30 px-5 py-3 text-sm text-white hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
      Print / save PDF
    </button>
  )
}

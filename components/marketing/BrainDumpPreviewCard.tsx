/**
 * Right-column sample-output card for the Brain Dump Sorter showcase section.
 * Presentational only — the real tool lives elsewhere in the app.
 */
const DUMPS = [
  'Reply to Mum about Sunday',
  'Book blood test',
  'That 47-tab spiral about moving cities',
  'Cancel unused subscription',
  'Finish deck for Tuesday',
  'Send invoice #204',
]

const SORTED: { bucket: 'Now' | 'Later' | 'Delegate' | 'Drop'; text: string }[] = [
  { bucket: 'Now',      text: 'Send invoice #204' },
  { bucket: 'Now',      text: 'Reply to Mum' },
  { bucket: 'Later',    text: 'Finish deck for Tue' },
  { bucket: 'Later',    text: 'Book blood test' },
  { bucket: 'Delegate', text: 'Cancel subscription' },
  { bucket: 'Drop',     text: 'The moving-cities spiral' },
]

const BUCKET_STYLES: Record<string, string> = {
  Now:      'bg-[#F5C518] text-black',
  Later:    'bg-white/10 text-white',
  Delegate: 'bg-white/5 text-neutral-300',
  Drop:     'bg-transparent text-neutral-500 line-through',
}

export function BrainDumpPreviewCard() {
  return (
    <div
      className="theme-ink overflow-hidden rounded-lg border bg-black shadow-[0_30px_60px_-30px_rgba(10,10,10,0.35)]"
      style={{ borderColor: 'rgba(0,0,0,0.25)' }}
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-5 py-3.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F5C518]/70" />
        </div>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          sor7ed / brain-dump-sorter
        </span>
      </div>

      <div className="space-y-8 p-5 text-neutral-100 md:p-8">
        <div>
          <div className="mb-3 font-mono text-[10px] tracking-[0.12em] text-neutral-500">
            01 · YOU DUMPED
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {DUMPS.map((d) => (
              <div
                key={d}
                className="border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[13px] text-neutral-300"
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 font-mono text-[10px] tracking-[0.12em] text-neutral-500">
            02 · WE SORTED
          </div>
          <div className="flex flex-wrap gap-2.5">
            {SORTED.map((s) => (
              <span
                key={s.text}
                className="inline-flex items-center gap-2 border border-white/10 px-3 py-1.5 text-[12px]"
              >
                <span
                  className={`inline-block rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${BUCKET_STYLES[s.bucket]}`}
                >
                  {s.bucket}
                </span>
                {s.text}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-2">
          <div className="mb-2 font-mono text-[10px] tracking-[0.12em] text-neutral-500">
            03 · ONE NEXT STEP
          </div>
          <p className="text-[15px] text-white">
            Open your email and send{' '}
            <span className="text-[#F5C518]">invoice #204</span>. That's it. Everything else is parked.
          </p>
        </div>
      </div>
    </div>
  )
}

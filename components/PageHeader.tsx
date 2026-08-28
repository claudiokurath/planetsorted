import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Small uppercase eyebrow above the title (e.g. PLANET SOR7ED) */
  eyebrow?: string
  title: string
  description?: string | null
  /** Optional right-side slot (e.g. CTA link) */
  action?: ReactNode
  className?: string
}

/**
 * Compact, uniform page header used across Home sections, Toolbox,
 * Guidebook, Account, Sounds, etc. Replaces the old fat rounded banners
 * so every screen opens the same way: spectrum rule + title + short line.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`mb-10 sm:mb-14 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          {eyebrow ? (
            <div className="flex items-center gap-2.5">
              <span className="h-0.5 w-8 rounded-full bg-[#1FD7CF]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1FD7CF]">
                {eyebrow}
              </span>
            </div>
          ) : (
            <div className="h-1 w-12 rounded-full bg-[#1FD7CF]" />
          )}

          <h1
            className="font-bebas bg-gradient-to-r from-[#856CFF] via-[#5095FF] to-[#1FD7CF] bg-clip-text text-7xl font-black uppercase leading-[0.82] tracking-tight text-transparent sm:text-8xl lg:text-9xl"
          >
            {title}
          </h1>

          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  )
}

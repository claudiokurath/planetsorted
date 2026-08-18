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
 * so every screen opens the same way: red rule + title + short line.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`mb-8 sm:mb-10 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          {eyebrow ? (
            <div className="flex items-center gap-2.5">
              <span className="h-0.5 w-8 rounded-full bg-[#C0392B]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                {eyebrow}
              </span>
            </div>
          ) : (
            <div className="h-1 w-12 rounded-full bg-[#C0392B]" />
          )}

          <h1
            className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
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

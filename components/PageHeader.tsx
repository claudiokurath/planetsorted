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
            <span className="sor7ed-pill">{eyebrow}</span>
          ) : null}

          <h1
            className="font-bebas text-6xl uppercase leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-8xl"
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

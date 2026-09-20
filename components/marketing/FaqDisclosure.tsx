'use client'

import { useState, type ReactNode } from 'react'

interface FaqDisclosureProps {
  question: string
  children: ReactNode
  defaultOpen?: boolean
}

/**
 * Progressive-disclosure FAQ row. Uses <details> semantics (a11y-safe)
 * but re-renders the plus/minus icon manually for finer control.
 */
export function FaqDisclosure({ question, children, defaultOpen = false }: FaqDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="border-t themed-rule py-6 md:py-8"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
        <span className="themed-strong font-bebas text-xl uppercase leading-tight tracking-normal md:text-2xl">
          {question}
        </span>
        <span
          aria-hidden
          className="themed-strong themed-rule-strong mt-1 grid h-6 w-6 shrink-0 place-items-center border transition-transform"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
      </summary>
      <div className="mt-4 max-w-2xl text-[14px] leading-relaxed themed-body md:text-[15px]">
        {children}
      </div>
    </details>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

/** Timings from the v9 handoff. */
const IN = 620
const OUT = 420
const HOLD = 2400
const TICK_AT = 0.28

/** ≈ cubic-bezier(0.16, 1, 0.3, 1), the SOR7ED house easing. */
function ease(p: number) {
  return 1 - Math.pow(1 - p, 3.2)
}

const COPY = {
  rest: { lead: 'Save this piece', trail: 'tap the mark' },
  done: { lead: 'Saved to your chat', trail: 'sorted.' },
} as const

interface Props {
  /** Fires on the way into the done state. Errors are swallowed by design —
   *  the mark has already resolved and yanking it back reads as a glitch. */
  onSave?: () => void | Promise<void>
  disabled?: boolean
  /**
   * When set, the mark navigates here instead of resolving. Everyone sees the
   * same control; only what the click does changes. Visitors who cannot receive
   * anything yet still get the mark rather than a consolation text link.
   */
  href?: string
  /** Rest-state words. The done copy is fixed — it describes what happened. */
  copy?: { lead: string; trail: string }
}

/**
 * The SOR7ED save control: the mark *is* the button, and the hand-drawn tangle
 * resolves into a tick.
 *
 * One progress value drives both layers so the tangle's exit and the tick's
 * draw-in stay locked to the same beat — two independent CSS transitions drift
 * apart and the effect falls flat. --td is the same clock delayed to TICK_AT.
 *
 * The tangle is raster on purpose; a vector trace was tried and rejected because
 * the hand-drawn character does not survive it.
 */
export function SortedSaveButton({
  onSave,
  disabled = false,
  href,
  copy: restCopy = COPY.rest,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tRef = useRef(0)

  const [done, setDone] = useState(false)

  const paint = useCallback((v: number) => {
    tRef.current = v
    const td = Math.max(0, Math.min(1, (v - TICK_AT) / (1 - TICK_AT)))
    const root = rootRef.current
    if (!root) return
    root.style.setProperty('--t', v.toFixed(3))
    root.style.setProperty('--td', td.toFixed(3))
  }, [])

  const run = useCallback(
    (to: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Reduced motion still swaps tangle for tick — it just skips the journey.
      if (reduce) {
        paint(to)
        return
      }

      const from = tRef.current
      const dur = to > from ? IN : OUT
      const start = performance.now()

      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        paint(from + (to - from) * ease(p))
        if (p < 1) rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [paint]
  )

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClick() {
    if (disabled) return
    if (timerRef.current) clearTimeout(timerRef.current)

    const next = !done
    setDone(next)
    run(next ? 1 : 0)

    if (next) {
      void Promise.resolve(onSave?.()).catch(() => {})
      timerRef.current = setTimeout(() => {
        setDone(false)
        run(0)
      }, HOLD)
    }
  }

  const copy = done ? COPY.done : restCopy

  const mark = (
    <span className="sb__mark">
      <Image
        className="sb__tangle"
        src="/images/tangle-white.png"
        alt=""
        width={84}
        height={84}
        draggable={false}
      />
      <svg className="sb__tick" viewBox="-24 -24 48 48" aria-hidden="true">
        <path d="M -13 1 L -3 11 L 15 -11" />
      </svg>
    </span>
  )

  return (
    <div ref={rootRef} className="sb">
      <span className="sb__label sb__label--lead">{copy.lead}</span>

      {href ? (
        <Link href={href} className="sb__btn" aria-label={`${copy.lead} — SOR7ED`}>
          {mark}
        </Link>
      ) : (
        <button
          type="button"
          className="sb__btn"
          aria-label="Save — SOR7ED"
          onClick={handleClick}
          disabled={disabled}
        >
          {mark}
        </button>
      )}

      <span className="sb__label">{copy.trail}</span>

      {/* The visual change is quiet, so announce it. */}
      <span className="sr-only" role="status" aria-live="polite">
        {done ? 'Saved to your chat' : ''}
      </span>

      <style>{`
        .sb {
          /* Handoff defaults remapped to the site's tokens. The tangle asset
             carries its own ink, so --sb-ink is not needed here. */
          /* WhatsApp green: the tick is the destination, not the brand
             accent. Scoped to this control — the site stays #F5C518. */
          --sb-accent: #25d366;
          --sb-muted: #737373;
          --sb-line: rgba(255, 255, 255, 0.12);
          --sb-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --sb-mark: 84px;

          --t: 0;
          --td: 0;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 28px 0;
          border-top: 1px solid var(--sb-line);
          border-bottom: 1px solid var(--sb-line);
          font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
        }

        .sb__label {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          min-width: 15ch;
          color: color-mix(
            in oklab,
            var(--sb-muted),
            var(--sb-accent) calc(var(--td) * 100%)
          );
          transition: color 0.32s var(--sb-ease);
        }
        .sb__label--lead {
          text-align: right;
        }

        .sb__btn {
          appearance: none;
          width: calc(var(--sb-mark) + 20px);
          height: calc(var(--sb-mark) + 20px);
          padding: 0;
          border: none;
          background: transparent;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.2s var(--sb-ease);
        }
        .sb__btn:active {
          transform: scale(0.96);
        }
        .sb__btn:focus-visible {
          outline: 1px solid var(--sb-accent);
          outline-offset: 3px;
        }
        .sb__btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .sb__mark {
          position: relative;
          display: block;
          width: var(--sb-mark);
          height: var(--sb-mark);
          transition: transform 0.6s var(--sb-ease);
        }
        .sb__mark:hover {
          transform: rotate(-3deg) scale(1.03);
        }

        /* Rest layer: the tangle, winding down as --t rises. */
        .sb__tangle {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform-origin: 52% 54%;
          opacity: calc(1 - var(--t));
          transform: scale(calc(1 - 0.12 * var(--t)))
            rotate(calc(var(--t) * -8deg));
        }

        /* Confirmed layer: the tick, drawing in on the delayed clock. */
        .sb__tick {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          opacity: var(--td);
        }
        .sb__tick path {
          fill: none;
          stroke: var(--sb-accent);
          stroke-width: 2.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 46;
          stroke-dashoffset: calc(46px * (1 - var(--td)));
        }

        /* The labels are the widest part; stacking keeps it off the edge. */
        @media (max-width: 420px) {
          .sb {
            flex-direction: column;
            gap: 14px;
          }
          .sb__label,
          .sb__label--lead {
            text-align: center;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  )
}

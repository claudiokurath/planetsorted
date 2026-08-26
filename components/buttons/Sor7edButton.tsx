'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import styles from './Sor7edButton.module.css'

interface Sor7edButtonProps {
  slug: string
  context: 'article' | 'tool'
  isLoggedIn: boolean
  whatsappVerified: boolean
  initiallySaved?: boolean
  size?: 'md' | 'lg'
}

type SendState = 'idle' | 'sending' | 'sent' | 'error'

interface MarkShellProps {
  action: ReactNode
  message: string
  progress: number
  size: 'md' | 'lg'
  state: SendState
}

const TICK_AT = 0.28
const IN_DURATION = 620

function MarkShell({ action, message, progress, size, state }: MarkShellProps) {
  const tickProgress = Math.max(0, Math.min(1, (progress - TICK_AT) / (1 - TICK_AT)))

  return (
    <div
      className={styles.root}
      data-size={size}
      data-state={state}
      style={{
        '--sb-t': progress.toFixed(3),
        '--sb-td': tickProgress.toFixed(3),
      } as CSSProperties}
    >
      {action}
      <span className={styles.message}>{message}</span>
    </div>
  )
}

function Mark() {
  return (
    <span className={styles.mark} aria-hidden="true">
      <Image
        className={styles.tangle}
        src="/images/sorted-button/tangle.png"
        alt=""
        width={1024}
        height={1024}
        sizes="84px"
        draggable={false}
      />
      <svg className={styles.tick} viewBox="-24 -24 48 48">
        <path d="M -13 1 L -3 11 L 15 -11" />
      </svg>
    </span>
  )
}

export function Sor7edButton({
  slug,
  context,
  isLoggedIn,
  whatsappVerified,
  initiallySaved = false,
  size = 'md',
}: Sor7edButtonProps) {
  const [state, setState] = useState<SendState>(initiallySaved ? 'sent' : 'idle')
  const [progress, setProgress] = useState(initiallySaved ? 1 : 0)
  const animationFrame = useRef<number | null>(null)
  const progressRef = useRef(initiallySaved ? 1 : 0)
  const sentToWhatsApp = useRef(false)

  const returnPath = context === 'tool' ? `/tools/${slug}` : `/intelligence/${slug}`
  const itemName = context === 'tool' ? 'tool' : 'piece'

  const paint = useCallback((value: number) => {
    progressRef.current = value
    setProgress(value)
  }, [])

  const animateToSaved = useCallback(() => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(1)
      return
    }

    const from = progressRef.current
    const start = performance.now()

    const step = (now: number) => {
      const elapsed = Math.min(1, (now - start) / IN_DURATION)
      const eased = 1 - Math.pow(1 - elapsed, 3.2)
      paint(from + (1 - from) * eased)

      if (elapsed < 1) animationFrame.current = requestAnimationFrame(step)
    }

    animationFrame.current = requestAnimationFrame(step)
  }, [paint])

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current)
  }, [])

  if (!isLoggedIn) {
    return (
      <MarkShell
        action={(
          <Link
            href={`/signup?next=${encodeURIComponent(returnPath)}`}
            className={styles.button}
            aria-label={`Sign in to save this ${itemName} — SOR7ED`}
          >
            <Mark />
          </Link>
        )}
        message="click the button — sign in to add to thread"
        progress={0}
        size={size}
        state="idle"
      />
    )
  }

  if (!whatsappVerified) {
    return (
      <MarkShell
        action={(
          <Link
            href="/dashboard?tab=settings"
            className={styles.button}
            aria-label="Connect WhatsApp to save — SOR7ED"
          >
            <Mark />
          </Link>
        )}
        message="click the button — connect WhatsApp"
        progress={0}
        size={size}
        state="idle"
      />
    )
  }

  async function handleSend() {
    if (state === 'sending' || state === 'sent') return

    setState('sending')

    try {
      if (!sentToWhatsApp.current) {
        const sendResponse = await fetch('/api/save-to-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, context, includeLink: true }),
        })

        if (!sendResponse.ok) {
          setState('error')
          return
        }

        sentToWhatsApp.current = true
      }

      const libraryResponse = await fetch('/api/saved-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, context }),
      })

      if (!libraryResponse.ok) {
        setState('error')
        return
      }

      setState('sent')
      animateToSaved()
    } catch {
      setState('error')
    }
  }

  const copy = {
    idle: 'click the button — add to thread',
    sending: 'adding to your thread…',
    sent: 'added to your thread — sorted.',
    error: 'could not add — try again',
  }[state]

  const accessibleLabel = {
    idle: `Save this ${itemName} — SOR7ED`,
    sending: `Sending this ${itemName} to your WhatsApp`,
    sent: `This ${itemName} is saved in your SOR7ED library`,
    error: `Try saving this ${itemName} again — SOR7ED`,
  }[state]

  return (
    <div className={styles.wrapper}>
      <MarkShell
        action={(
          <button
            type="button"
            className={styles.button}
            onClick={handleSend}
            disabled={state === 'sending' || state === 'sent'}
            aria-label={accessibleLabel}
            aria-pressed={state === 'sent'}
          >
            <Mark />
          </button>
        )}
        message={copy}
        progress={progress}
        size={size}
        state={state}
      />
      <p className="sr-only" role="status" aria-live="polite">
        {state === 'sent'
          ? `Saved to your WhatsApp and member library. This ${itemName} will remain ticked.`
          : state === 'error'
            ? 'We could not finish saving this yet. Please try again.'
            : state === 'sending'
              ? 'Saving to your WhatsApp and member library.'
              : ''}
      </p>
    </div>
  )
}

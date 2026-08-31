'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface ArticleAudioControlsProps {
  /** Plain text of the full article, used for text-to-speech */
  bodyText: string
  /** URL of the Deep Dive audio file, if available */
  deepDiveUrl?: string
  /** True if the current user has an active subscription */
  isSubscriber?: boolean
}

type TTSState = 'idle' | 'playing' | 'paused' | 'unsupported'

export function ArticleAudioControls({ bodyText, deepDiveUrl, isSubscriber = false }: ArticleAudioControlsProps) {
  const [ttsState, setTtsState] = useState<TTSState>('idle')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  const handleTTS = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsState('unsupported')
      return
    }

    if (ttsState === 'unsupported') return

    if (ttsState === 'playing') {
      window.speechSynthesis.pause()
      setTtsState('paused')
      return
    }

    if (ttsState === 'paused') {
      window.speechSynthesis.resume()
      setTtsState('playing')
      return
    }

    // idle — start fresh
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(bodyText)
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.lang = 'en-GB'
    utterance.onstart = () => setTtsState('playing')
    utterance.onpause = () => setTtsState('paused')
    utterance.onresume = () => setTtsState('playing')
    utterance.onend = () => setTtsState('idle')
    utterance.onerror = () => setTtsState('idle')
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [ttsState, bodyText])

  const handleStop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setTtsState('idle')
  }, [])

  const ttsLabel = ttsState === 'playing' ? 'Pause' : ttsState === 'paused' ? 'Resume' : 'Listen'
  const ttsIcon =
    ttsState === 'playing' ? (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    ) : (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5 3l14 9-14 9V3z" />
      </svg>
    )

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-none border border-white/10 bg-black px-5 py-4">

      {/* TTS controls — always available */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">Read aloud</span>
        <button
          onClick={handleTTS}
          disabled={ttsState === 'unsupported'}
          aria-label={ttsLabel}
          className="flex items-center gap-2 rounded-full border border-neutral-700 bg-black px-4 py-1.5 text-xs font-medium text-white transition hover:border-neutral-500 hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {ttsIcon}
          {ttsLabel}
        </button>
        {(ttsState === 'playing' || ttsState === 'paused') && (
          <button
            onClick={handleStop}
            aria-label="Stop reading"
            className="rounded-full border border-neutral-700 bg-black px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-neutral-500 hover:text-white active:scale-95"
          >
            Stop
          </button>
        )}
        {ttsState === 'playing' && (
          <span className="flex items-center gap-1 text-xs text-[#F5C518]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5C518]" />
            Reading
          </span>
        )}
      </div>

      {/* Divider — only when Deep Dive exists */}
      {deepDiveUrl && (
        <div className="hidden sm:block h-5 w-px bg-black shrink-0" aria-hidden="true" />
      )}

      {/* Deep Dive — gated to subscribers */}
      {deepDiveUrl && (
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xs font-medium uppercase tracking-widest text-[#3498DB] shrink-0">
            Deep Dive
          </span>
          {isSubscriber ? (
            <audio
              controls
              src={deepDiveUrl}
              className="h-8 min-w-0 flex-1"
              style={{ colorScheme: 'dark' }}
            >
              Your browser does not support audio.
            </audio>
          ) : (
            <span className="flex items-center gap-2 text-xs text-neutral-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
                <path d="M17 11V7A5 5 0 0 0 7 7v4H5v10h14V11h-2Zm-5 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm3-6H9V7a3 3 0 0 1 6 0v4Z"/>
              </svg>
              Subscribers only —{' '}
              <a href="/signup" className="text-white underline underline-offset-2 hover:text-[#3498DB] transition-colors">
                sign in
              </a>
              {' '}or{' '}
              <a href="/signup" className="text-white underline underline-offset-2 hover:text-[#3498DB] transition-colors">
                upgrade
              </a>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface ArticleAudioControlsProps {
  /** Plain text of the full article, used for text-to-speech */
  bodyText: string
  /** URL of the Deep Dive audio file, if available */
  deepDiveUrl?: string
}

type TTSState = 'idle' | 'playing' | 'paused' | 'unsupported'

export function ArticleAudioControls({ bodyText, deepDiveUrl }: ArticleAudioControlsProps) {
  const [ttsState, setTtsState] = useState<TTSState>('idle')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setTtsState('unsupported')
    }
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  const handleTTS = useCallback(() => {
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
      // Pause icon
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    ) : (
      // Play icon
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5 3l14 9-14 9V3z" />
      </svg>
    )

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-neutral-800 bg-[#0d0d0d] px-5 py-4">

      {/* Text-to-speech controls */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 shrink-0">
          Read aloud
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTTS}
            disabled={ttsState === 'unsupported'}
            aria-label={ttsLabel}
            className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {ttsIcon}
            {ttsLabel}
          </button>
          {(ttsState === 'playing' || ttsState === 'paused') && (
            <button
              onClick={handleStop}
              aria-label="Stop reading"
              className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-400 transition hover:border-neutral-500 hover:text-white active:scale-95"
            >
              Stop
            </button>
          )}
          {ttsState === 'playing' && (
            <span className="flex items-center gap-1 text-xs text-[#C0392B]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C0392B] animate-pulse" />
              Reading
            </span>
          )}
        </div>
      </div>

      {/* Divider — only shown when Deep Dive is available */}
      {deepDiveUrl && (
        <div className="hidden sm:block h-5 w-px bg-neutral-800 shrink-0" aria-hidden="true" />
      )}

      {/* Deep Dive player */}
      {deepDiveUrl && (
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3498DB] shrink-0">
            Deep Dive
          </span>
          <audio
            controls
            src={deepDiveUrl}
            className="h-8 min-w-0 flex-1"
            style={{ colorScheme: 'dark' }}
          >
            Your browser does not support audio.
          </audio>
        </div>
      )}
    </div>
  )
}

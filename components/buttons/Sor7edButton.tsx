'use client'

import { useCallback, useState } from 'react'

interface Sor7edButtonProps {
  href: string
  label?: string
  /** 'page' = inline CTA on a page; 'article' = end-of-article CTA */
  context?: 'page' | 'article'
}

export function Sor7edButton({ href, label = 'SOR7ED', context = 'page' }: Sor7edButtonProps) {
  const [pressed, setPressed] = useState(false)

  const handlePress = useCallback(() => {
    setPressed(true)
    setTimeout(() => setPressed(false), 200)
    window.location.href = href
  }, [href])

  return (
    <div className={`flex flex-col items-start gap-3 ${context === 'article' ? 'mt-12' : ''}`}>
      {/* Ambient glow layer */}
      <div className="relative inline-flex">
        {/* Outer pulse ring */}
        <span
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
          aria-hidden="true"
          style={{
            boxShadow: '0 0 0 0 rgba(192,57,43,0.7)',
            animation: 'sor7ed-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
          }}
        />

        <button
          onClick={handlePress}
          className="sor7ed-btn group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#C0392B] px-8 py-4 font-black text-white shadow-[0_0_32px_rgba(192,57,43,0.35)] transition-all duration-200 select-none"
          style={{
            background: 'linear-gradient(135deg, #C0392B 0%, #96281B 100%)',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.1rem',
            letterSpacing: '0.18em',
            transform: pressed ? 'scale(0.96)' : 'scale(1)',
            boxShadow: pressed
              ? '0 0 12px rgba(192,57,43,0.3), inset 0 2px 4px rgba(0,0,0,0.4)'
              : '0 0 32px rgba(192,57,43,0.35), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
          aria-label={label}
        >
          {/* Shimmer sweep on hover */}
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            aria-hidden="true"
          />

          {/* Icon — bolt / lightning */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="shrink-0 drop-shadow"
            aria-hidden="true"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>

          <span className="relative z-10 tracking-[0.18em]">{label}</span>
        </button>
      </div>

      <style>{`
        @keyframes sor7ed-pulse {
          0% { box-shadow: 0 0 0 0 rgba(192,57,43,0.5); }
          70% { box-shadow: 0 0 0 14px rgba(192,57,43,0); }
          100% { box-shadow: 0 0 0 0 rgba(192,57,43,0); }
        }
        .sor7ed-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 0 48px rgba(192,57,43,0.5), 0 6px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .sor7ed-btn:hover .sor7ed-glow {
          animation: sor7ed-pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite;
        }
      `}</style>
    </div>
  )
}

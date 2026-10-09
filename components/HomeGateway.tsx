'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

const OPTIONS = [
  { href: '/tools', title: 'Explore the tools', description: 'Find a practical next step.', number: '01' },
  { href: '/intelligence', title: 'Read the guidebook', description: 'Make sense of what feels tangled.', number: '02' },
  { href: '/signup?mode=returning&next=%2Fdashboard', title: 'Sign in', description: 'Return to your saved library.', number: '03' },
]

export function HomeGateway() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      const video = videoRef.current
      if (!video) return
      if (preference.matches) video.pause()
      else void video.play().catch(() => { /* The poster remains if autoplay is unavailable. */ })
    }
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  return (
    <section className="sorted-entry" aria-labelledby="entry-heading">
      <h1 id="entry-heading" className="sr-only">Built for brains that work differently. PLANET SOR7ED.</h1>
      <div className="sorted-entry-media">
        <video ref={videoRef} autoPlay muted loop playsInline preload="auto" poster="/images/entry-hero-poster.webp" aria-hidden="true" tabIndex={-1}>
          <source src="/media/entry-hero.mp4" type="video/mp4" />
        </video>
        {/* A native image keeps the full composition visible for reduced motion. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="sorted-entry-still" src="/images/entry-hero-poster.webp" alt="" />
      </div>
      <div className="sorted-entry-choices">
        <p className="sorted-entry-description">Practical tools and plain-language guides for neurodivergent adults. Choose where you want to start.</p>
        <nav className="sorted-entry-options" aria-label="Choose your next step">
          {OPTIONS.map(option => (
            <Link href={option.href} key={option.number} className="sorted-entry-option">
              <span className="sorted-entry-option-number" aria-hidden="true">{option.number}</span>
              <span><strong>{option.title}</strong><span className="sorted-entry-option-description">{option.description}</span></span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </Link>
          ))}
        </nav>
        <Link className="sorted-entry-about" href="/about">Who we are & how it works</Link>
      </div>
    </section>
  )
}

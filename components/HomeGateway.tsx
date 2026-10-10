'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const OPTIONS = [
  { href: '/about', title: 'About us' },
  { href: '/tools', title: 'Toolbox' },
  { href: '/intelligence', title: 'Guidebook' },
]

export function HomeGateway() {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      const video = videoRef.current
      if (!video) return
      if (preference.matches) video.pause()
      else void video.play().catch(() => {})
    }
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  return (
    <section className="sorted-paper-hero" aria-labelledby="entry-heading">
      <div className="sorted-paper-content">
        <div className="sorted-paper-mark" aria-hidden="true">
          <video ref={videoRef} autoPlay muted loop playsInline preload="auto" tabIndex={-1} poster="/images/tangle-white.png">
            <source src="/media/sequence01_1.mp4" type="video/mp4" />
          </video>
          <Image className="sorted-paper-static-mark" src="/images/tangle-white.png" alt="" width={120} height={120} />
        </div>
        <div className="sorted-paper-panel">
          <span className="sorted-paper-eyebrow">Neurodivergent-first. Everyday life.</span>
          <h1 id="entry-heading">Built for brains<br />that work <span>differently.</span></h1>
          <p>SOR7ED is a practical support hub for ADHD, autistic, AuDHD, dyslexic, bipolar and other neurodivergent adults.</p>
          <p>Tools, protocols and plain-language guides that make everyday life less overwhelming. One clear next step.</p>
        </div>
        <nav className="sorted-paper-options" aria-label="Choose where to start">
          {OPTIONS.map(option => (
            <Link href={option.href} key={option.href} className="sorted-paper-option">{option.title}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg></Link>
          ))}
        </nav>
        <p className="mt-7 text-sm">Worry less, live more.</p>
      </div>
      <div className="sorted-paper-portrait">
        <Image src="/images/hero-yellow-cutout.png" alt="A man in a yellow suit looking at his phone" fill sizes="(max-width: 760px) 100vw, 40vw" preload />
      </div>
    </section>
  )
}

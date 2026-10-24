'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'
import './HomeGateway.css'

const OPTIONS = [
  { href: '/brain-type', id: 'start-brain-type', title: 'Find your starting point', description: 'A reflection on how your brain works · tools to try', featured: true },
  { href: '/tools', id: 'start-toolbox', title: 'Sort one thing', description: 'Practical tools for the thing in front of you' },
  { href: '/intelligence', id: 'start-guidebook', title: 'Read a thing', description: 'Plain-language guides for everyday life' },
] as const

export function HomeGateway() {
  const [motion, setMotion] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setMotion(!preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (motion) void videoRef.current?.play().catch(() => {})
  }, [motion])

  return (
    <section className="sorted-home-entry" aria-labelledby="entry-heading">
      <div className="sorted-home-entry__rule"><span>Start here</span><span>One question · three ways in</span></div>
      <div className="sorted-home-entry__hero">
        <header>
          <h1 id="entry-heading"><span>What would</span><span>help <em>right now</em>?</span></h1>
          <p className="sorted-home-entry__intro">Pick the closest match. You can change direction whenever you need to.</p>
        </header>
        <div className="sorted-home-entry__wordmark" aria-hidden="true">
          <BrandLogo />
          {motion ? <span className="sorted-home-entry__live-o"><video ref={videoRef} autoPlay muted loop playsInline preload="metadata" tabIndex={-1}><source src="/media/tangle-loop-256.mp4" type="video/mp4" /></video></span> : null}
        </div>
      </div>
      <nav className="sorted-home-entry__paths" aria-label="Choose where to start">
        {OPTIONS.map((option, i) => (
          <Link href={option.href} id={option.id} key={option.href} className={`sorted-home-entry__path${'featured' in option ? ' sorted-home-entry__path--featured' : ''}`} style={{ '--path-order': i } as CSSProperties}>
            <span className="sorted-home-entry__number" aria-hidden="true">0{i + 1}</span>
            <span className="sorted-home-entry__choice">
              <span className="sorted-home-entry__context">{'featured' in option ? <><strong>Start here</strong><span aria-hidden="true"> · </span></> : null}{option.description}</span>
              <span className="sorted-home-entry__title">{option.title}</span>
            </span>
            <svg className="sorted-home-entry__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </Link>
        ))}
      </nav>
      <p className="sorted-home-entry__note">The brain-type app is a reflection tool, not a diagnosis.</p>
      <div className="sorted-home-entry__bottom"><Link href="/tools">Nothing quite fits? Browse all tools</Link><Link href="/signup">Create your free account →</Link><span>Worry less, live more.</span></div>
    </section>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import './HomeGateway.css'

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
      <div className="sorted-home-entry__hero">
        <div className="sorted-home-entry__scribble" aria-hidden="true">
          {motion ? <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" tabIndex={-1}><source src="/media/tangle-loop-256.mp4" type="video/mp4" /></video> : <Image src="/images/tangle-white.png" alt="" width="256" height="256" />}
        </div>
        <header>
          <h1 id="entry-heading"><span>Built for brains</span><span>that work</span><span><em>differently.</em></span></h1>
          <p className="sorted-home-entry__intro">SOR7ED offers practical tools and plain-language guides for neurodivergent adults — helping with everyday overwhelm, decisions, money and life admin.</p>
        </header>
      </div>
      <div className="sorted-home-entry__start">
        <Link href="/brain-type" id="start-brain-type" className="sorted-home-entry__qr-link" aria-label="Start the free Brain Type reflection">
          <Image src="/images/brain-type-qr.svg" alt="Scan to open planetsorted.com/brain-type" width={180} height={180} unoptimized className="sorted-home-entry__qr" />
          <span className="sorted-home-entry__qr-copy">
            <span className="sorted-home-entry__qr-title">What’s your brain type?</span>
            <span className="sorted-home-entry__qr-instruction">Scan or tap to start →</span>
            <span className="sorted-home-entry__qr-detail">2 minutes. Free. Nothing saved.</span>
          </span>
        </Link>
      </div>
      <p className="sorted-home-entry__note">A short reflection that suggests tools to try. Not a diagnosis.</p>
      <div className="sorted-home-entry__bottom"><span>Worry less, live more.</span></div>
    </section>
  )
}

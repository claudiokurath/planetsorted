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
    <>
    <section className="sorted-home-entry" aria-labelledby="entry-heading">
      <div className="sorted-home-entry__rule"><span>Start here</span><span>One clear starting point</span></div>
      <div className="sorted-home-entry__hero">
        <header>
          <h1 id="entry-heading"><span>What would</span><span>help <em>right now</em>?</span></h1>
          <p className="sorted-home-entry__intro">Start with a short reflection on how your brain works. Find a practical tool to try next.</p>
        </header>
        <div className="sorted-home-entry__scribble" aria-hidden="true">
          {motion ? <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" tabIndex={-1}><source src="/media/tangle-loop-256.mp4" type="video/mp4" /></video> : <Image src="/images/tangle-white.png" alt="" width="256" height="256" />}
        </div>
      </div>
      <div className="sorted-home-entry__paths">
        <Link href="/brain-type" id="start-brain-type" className="sorted-home-entry__path sorted-home-entry__path--featured sorted-home-entry__path--single">
          <span className="sorted-home-entry__choice">
            <span className="sorted-home-entry__title">Find your starting point</span>
          </span>
          <svg className="sorted-home-entry__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
        </Link>
      </div>
      <p className="sorted-home-entry__note">The brain-type app is a reflection tool, not a diagnosis.</p>
      <div className="sorted-home-entry__bottom"><span>Worry less, live more.</span></div>
    </section>
    <section className="sorted-home-explanation" aria-labelledby="home-explanation-heading">
      <div className="sorted-home-explanation__inner">
        <div><p className="sorted-home-explanation__eyebrow">Practical support. Everyday life.</p><h2 id="home-explanation-heading">One clear<br />next step.</h2></div>
        <div><p>SOR7ED is a practical support hub for neurodivergent adults. Tools, protocols and plain-language guides that make everyday life less overwhelming.</p><div className="sorted-home-explanation__rule" /><p>Start with a reflection on how your brain works, then find tools to try. Support you can use at your own pace.</p></div>
      </div>
    </section>
    </>
  )
}

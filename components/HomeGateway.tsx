'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowIcon } from '@/components/ArrowIcon'
import './HomeGateway.css'

export function HomeGateway() {
  const [motion, setMotion] = useState(false)
  const [playbackFailed, setPlaybackFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setMotion(!preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (motion && !playbackFailed) void videoRef.current?.play().catch(() => setPlaybackFailed(true))
  }, [motion, playbackFailed])

  return (
    <section className="sorted-home-entry" aria-labelledby="entry-heading">
      <div className="sorted-home-entry__hero">
        <div className="sorted-home-entry__scribble" aria-hidden="true">
          {motion && !playbackFailed ? <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" poster="/media/scribble-yellow-loop-poster.jpg" tabIndex={-1} onError={() => setPlaybackFailed(true)}><source src="/media/scribble-yellow-loop.mp4" type="video/mp4" /></video> : <Image src="/media/scribble-yellow-loop-poster.jpg" alt="" width="192" height="192" />}
        </div>
        <header>
          <h1 id="entry-heading"><span>Built for brains</span><span>that work <em>differently.</em></span></h1>
          <p className="sorted-home-entry__intro">SOR7ED offers practical tools and plain-language guides for neurodivergent adults — helping with everyday overwhelm, decisions, money and life admin.</p>
        </header>
      </div>
      <div className="sorted-home-entry__start">
        <Link href="/brain-type" id="start-brain-type" className="sorted-home-entry__start-button" aria-label="Start the free Brain Sorter reflection">
          <span>Start the Brain Sorter</span><span className="sorted-home-entry__start-arrow" aria-hidden="true"><ArrowIcon /></span>
        </Link>
        <p className="sorted-home-entry__start-detail">2 minutes. Free. Nothing saved.</p>
      </div>
      <p className="sorted-home-entry__note">A short reflection that suggests tools to try. Not a diagnosis.</p>
      <div className="sorted-home-entry__bottom"><span>Worry less, live more.</span></div>
    </section>
  )
}

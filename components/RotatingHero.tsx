'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface RotatingHeroProps {
  images: string[]
  intervalMs?: number
}

export function RotatingHero({ images, intervalMs = 5000 }: RotatingHeroProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [images.length, intervalMs])

  if (images.length === 0) {
    return (
      <div className="relative h-[320px] w-full overflow-hidden rounded-3xl md:h-[420px] bg-gradient-to-br from-emerald-950/40 via-gray-900 to-gray-950 border border-gray-800/80 flex items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Planet Sorted</span>
          <p className="text-xl font-bold text-white">Practical tools & protocols for neurodivergent minds</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-3xl border border-gray-800/80 shadow-2xl md:h-[500px]">
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image src={src} alt="Planet Sorted brand artwork" fill className="object-cover" priority={i === 0} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
    </div>
  )
}

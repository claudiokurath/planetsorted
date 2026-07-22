'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function RotatingHero({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % images.length), 5000)
    return () => clearInterval(timer)
  }, [images.length])

  if (images.length === 0) {
    return (
      <div className="relative h-[300px] lg:h-[500px] w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center bg-[#141414] border border-neutral-800">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3498DB]">Planet Sorted</span>
        <h2 className="text-3xl font-black uppercase mt-2 text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Templates, Not Inspiration.
        </h2>
      </div>
    )
  }

  return (
    <div className="relative h-[300px] lg:h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl">
      {images.map((src, i) => (
        <div key={src} className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}>
          <Image src={src} alt="Planet Sorted brand artwork" fill className="object-cover" priority={i === 0} />
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="h-2 w-2 rounded-full transition-all"
            style={{ backgroundColor: i === index ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

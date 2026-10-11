'use client'

import Link from 'next/link'

export default function PageError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-white" aria-labelledby="page-error-heading">
      <p className="mb-4 text-sm uppercase tracking-widest text-[#FFBA2E]">SOR7ED</p>
      <h1 id="page-error-heading" className="font-bebas text-4xl uppercase sm:text-5xl">We couldn’t load this page.</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-300">Please try again. If it keeps happening, you can return home or contact us for help.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button onClick={reset} className="min-h-12 bg-white px-6 py-3 font-medium text-black hover:bg-[#FFBA2E]">Try again</button>
        <Link href="/" className="inline-flex min-h-12 items-center border border-white/30 px-6 py-3">Home</Link>
        <Link href="/contact" className="inline-flex min-h-12 items-center px-4 py-3 underline">Contact us</Link>
      </div>
    </section>
  )
}

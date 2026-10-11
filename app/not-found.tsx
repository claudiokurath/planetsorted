import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-white" aria-labelledby="not-found-heading">
      <p className="mb-4 text-sm uppercase tracking-widest text-[#FFBA2E]">SOR7ED</p>
      <h1 id="not-found-heading" className="font-bebas text-4xl uppercase sm:text-5xl">Let’s find your next step.</h1>
      <p className="mt-6 text-base leading-relaxed text-neutral-300">This page may have moved, or the link may be incomplete.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/brain-type" className="inline-flex min-h-12 items-center bg-white px-6 py-3 font-medium text-black hover:bg-[#FFBA2E]">Find your starting point</Link>
        <Link href="/" className="inline-flex min-h-12 items-center border border-white/30 px-6 py-3">Home</Link>
      </div>
    </section>
  )
}

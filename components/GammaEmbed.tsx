interface GammaEmbedProps {
  src: string
  title: string
}

/** Open the original presentation as a full page, without nested scrolling. */
export function GammaEmbed({ src, title }: GammaEmbedProps) {
  const destination = src.replace('https://gamma.app/embed/', 'https://gamma.app/docs/')
  return (
    <section className="sorted-presentation-link mx-auto max-w-6xl border border-white/15 p-6 sm:p-10" aria-label={title}>
      <p className="mb-3 text-sm text-neutral-300">Read the full presentation</p>
      <h2 className="mb-6 font-bebas text-3xl uppercase sm:text-4xl">{title}</h2>
      <a href={destination} className="inline-flex min-h-12 items-center gap-4 bg-white px-6 py-3 font-medium text-black hover:bg-[#FFBA2E]">Open presentation <span aria-hidden="true">↗</span></a>
    </section>
  )
}

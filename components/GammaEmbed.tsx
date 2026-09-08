interface GammaEmbedProps {
  /** Already-resolved gamma.app/embed/… URL (see lib/content/gammaEmbed). */
  src: string
  title: string
}

/**
 * Full-width embed of a Gamma deck — used as the primary content on article
 * and tool pages so visitors read the real presentation, not a reconstruction.
 */
export function GammaEmbed({ src, title }: GammaEmbedProps) {
  return (
    <div className="mx-auto max-w-6xl overflow-hidden border border-white/[0.12] bg-black">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="fullscreen"
        className="block h-[68vh] min-h-[460px] w-full"
      />
    </div>
  )
}

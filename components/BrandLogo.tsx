interface BrandLogoProps {
  className?: string
}

/** The wordmark's luminance supplies its alpha, leaving no opaque backdrop. */
export function BrandLogo({ className = '' }: BrandLogoProps) {
  return <span role="img" aria-label="SOR7ED" className={`sorted-brand-logo ${className}`} />
}

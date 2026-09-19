/**
 * Section-index row used at the top of every landing section.
 * Left: "01 / WHAT THIS IS". Right: optional context tag.
 * Uses .themed-idx from globals.css (adds in the 2026 refresh patch).
 */
interface SectionHeaderProps {
  index: string
  label: string
  right?: string
  className?: string
}

export function SectionHeader({ index, label, right, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-8 md:mb-14 ${className}`}>
      <span className="themed-idx">
        {index} / {label}
      </span>
      {right ? <span className="themed-idx hidden md:inline">{right}</span> : null}
    </div>
  )
}

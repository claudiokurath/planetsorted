import Link from 'next/link'

interface BlogRowProps {
  href: string
  date: string
  kicker: string
  title: string
  body: string
  meta: string
}

/**
 * A single row in the "From the blog" strip. Ground-agnostic:
 * borders and copy read the section's --local-* tokens.
 * When wiring to real data (Notion → Supabase), map protocol rows into this shape.
 */
export function BlogRow({ href, date, kicker, title, body, meta }: BlogRowProps) {
  return (
    <Link
      href={href}
      className="group grid gap-4 border-t themed-rule py-6 md:grid-cols-[auto_1fr_auto] md:items-baseline md:gap-10 md:py-8"
    >
      <span className="themed-idx md:pt-1">{date}</span>
      <div>
        <span className="themed-idx block">{kicker}</span>
        <h3 className="mt-2 font-bebas text-3xl uppercase leading-tight tracking-normal themed-strong md:text-4xl">
          {title}
        </h3>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed themed-body md:text-[15px]">
          {body}
        </p>
      </div>
      <span className="themed-idx md:pt-1">{meta}</span>
    </Link>
  )
}

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { CATEGORY_LIST } from '@/lib/categoryStyles'
import './SortedSections.css'

/** The seven entrances share the same canonical category and colour definitions. */
export function SortedSections() {
  return (
    <section id="sections" className="sorted-worlds" aria-labelledby="sorted-worlds-heading">
      <div className="sorted-worlds__intro">
        <p className="sorted-worlds__eyebrow">One Sorted. Seven areas of life.</p>
        <h2 id="sorted-worlds-heading">Where do you want to start?</h2>
        <p>Choose what matters today. Each area has its own tools and guidebooks, ready to explore at your pace.</p>
      </div>
      <div className="sorted-worlds__grid">
        {CATEGORY_LIST.map((category, index) => (
          <Link key={category.slug} href={`/category/${category.slug}`} className="sorted-worlds__entrance"
            style={{ '--section-accent': category.accent } as CSSProperties}>
            <span className="sorted-worlds__number">0{index + 1}</span>
            <h3>{category.label}</h3>
            <p>{category.tagline}</p>
            <span className="sorted-worlds__enter">Explore {category.label} <span aria-hidden="true">↗</span></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

import { ArrowIcon } from '@/components/ArrowIcon'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ABOUT_COPY } from '@/lib/content/aboutCopy'
import styles from './about.module.css'

export const metadata: Metadata = {
  title: 'About us — PLANET SOR7ED',
  description: 'Practical, shame-free support for neurodivergent adults. Discover why SOR7ED exists and the seven areas of everyday life it covers.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  const { story, differences, branches } = ABOUT_COPY
  return (
    <div className={styles.page}>
      <section className={styles.panel} aria-labelledby="about-story">
        <p className={styles.eyebrow}>About · Planet SOR7ED</p>
        <h1 id="about-story">{story.title}</h1>
        {story.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </section>

      <section className={`${styles.panel} ${styles.yellow}`} aria-labelledby="about-differences">
        <p className={styles.eyebrow}>Our approach</p>
        <h2 id="about-differences">{differences.title}</h2>
        <div className={styles.differences}>
          {differences.items.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}
        </div>
      </section>
      <section className={styles.panel} aria-labelledby="about-branches">
        <p className={styles.eyebrow}>Everyday life, all of it</p>
        <h2 id="about-branches">{branches.title}</h2>
        <div className={styles.branches}>
          {branches.items.map((item, index) => <Link href={`/category/${item.slug}`} key={item.slug}>
            <span className={styles.index} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <h3>{item.title}</h3><p>{item.body}</p><ArrowIcon />
          </Link>)}
        </div>
      </section>
    </div>
  )
}

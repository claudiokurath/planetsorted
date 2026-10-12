import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Roboto_Condensed } from 'next/font/google'
import { ABOUT_COPY } from '@/lib/content/aboutCopy'
import styles from './about.module.css'

const bodyFont = Roboto_Condensed({ subsets: ['latin'], weight: ['300', '400', '700'], display: 'swap' })

export const metadata: Metadata = {
  title: 'About us — PLANET SOR7ED',
  description: 'SOR7ED exists for the people who were told they just needed to try harder. Practical, shame-free support for neurodivergent adults.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  const { story, differences, branches, philosophy, ending } = ABOUT_COPY
  return (
    <div className={`${styles.page} ${bodyFont.className}`}>
      <div className={styles.cover}>
        <Image src="/images/about-gamma-brain.png" alt="A brain inside a transparent machine against a yellow background" width={1456} height={816} sizes="(min-width: 1200px) 1160px, 100vw" preload />
      </div>

      <section className={styles.panel} aria-labelledby="about-story">
        <h1 id="about-story">{story.title}</h1>
        {story.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </section>

      <section className={styles.panel} aria-labelledby="about-differences">
        <h2 id="about-differences">{differences.title}</h2>
        <div className={styles.differences}>
          {differences.items.map((item, index) => (
            <article key={item.title}>
              <span className={styles.number} aria-hidden="true">{index + 1}</span>
              <h3>{item.title}</h3><p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="about-branches">
        <h2 id="about-branches">{branches.title}</h2>
        <div className={styles.branches}>
          {branches.items.map(item => (
            <Link href={`/category/${item.slug}`} key={item.slug}>
              <h3>{item.title}</h3><p>{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="about-philosophy">
        <h2 id="about-philosophy">{philosophy.title}</h2>
        <p>{philosophy.intro}</p>
        <ul className={styles.philosophy}>
          {philosophy.items.map(item => <li key={item.lead}><strong>{item.lead}</strong> {item.body}</li>)}
        </ul>
        <p className={styles.callout}>{philosophy.callout}</p>
      </section>

      <section className={styles.panel} aria-labelledby="about-promise">
        <h2 id="about-promise">{ending.title}</h2>
        <p>{ending.intro}</p>
        <div className={styles.promise}>
          {ending.items.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}
        </div>
        {ending.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <p className={styles.callout}>{ending.callout}</p>
      </section>
    </div>
  )
}

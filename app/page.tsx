import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getCategoryStyle } from '@/lib/categoryStyles'
import { getToolRoute } from '@/lib/standaloneRoutes'
import type { Protocol } from '@/lib/types/database'
import styles from './home.module.css'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const OG_CARD = '/api/og?card=welcome'

const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Choose',
    description: 'Find the tool or Guidebook protocol that matches the thing in front of you.',
  },
  {
    number: '02',
    title: 'Thread it',
    description: 'Tap the SOR7ED mark to keep it in your personal WhatsApp thread.',
  },
  {
    number: '03',
    title: 'Use it',
    description: 'Come back when you need it and take one clear, manageable next step.',
  },
] as const

export const metadata: Metadata = {
  title: 'PLANET SOR7ED — Templates, Not Inspiration',
  description: 'Practical protocols, tools, and templates for neurodivergent adults. No app. No spam. Just what works.',
  openGraph: {
    title: 'PLANET SOR7ED',
    description: 'Templates, not inspiration. Practical protocols and tools for neurodivergent adults.',
    images: [
      {
        url: `${SITE}${OG_CARD}`,
        type: 'image/png',
        alt: 'PLANET SOR7ED — Templates, not inspiration.',
      },
    ],
    url: SITE,
    siteName: 'PLANET SOR7ED',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PLANET SOR7ED — Templates, Not Inspiration',
    description: 'Practical protocols, tools, and templates for neurodivergent adults. No app. No spam. Just what works.',
    images: [`${SITE}${OG_CARD}`],
  },
}

export const revalidate = 60

function HomeContentCard({
  item,
  href,
  kind,
}: {
  item: Protocol
  href: string
  kind: 'Tool' | 'Guidebook'
}) {
  const category = getCategoryStyle(item.category)

  return (
    <Link href={href} className={`${styles.contentCard} ${styles.contentCardNoVisual}`}>
      <div className={styles.cardBody}>
        <div className={styles.cardMetaRow}>
          <div className={styles.cardLabelGroup}>
            <span className={styles.kindBadge}>{kind}</span>
            {category ? <span className={styles.categoryBadge}>{category.label}</span> : null}
          </div>
          {item.read_time ? <span className={styles.readTime}>{item.read_time}</span> : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.summary || 'A practical way to turn this into one clear next step.'}</p>
        <span className={styles.cardAction}>
          Open {kind.toLowerCase()} <span aria-hidden="true">↗</span>
        </span>
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const supabase = createServerClient()

  const [{ data: rawProtocols }, { data: rawTools }] = await Promise.all([
    supabase
      .from('protocols')
      .select('slug, title, summary, cover_image, category, read_time')
      .or('type.eq.Article,type.is.null')
      .eq('status', 'Published')
      .order('updated_at', { ascending: false })
      .limit(6),
    supabase
      .from('protocols')
      .select('slug, title, summary, cover_image, category, read_time')
      .eq('type', 'Tool')
      .eq('status', 'Published')
      .order('updated_at', { ascending: false })
      .limit(6),
  ])

  const articles = (rawProtocols as Protocol[]) || []
  const tools = (rawTools as Protocol[]) || []

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>worry less, live more.</span>
            <h1>
              clarity
              <br />
              <span>from clutter.</span>
            </h1>
            <p>
              PLANET SOR7ED turns overwhelm into one clear, manageable next step — templates, protocols, and plain-English tools built for brains that already have enough going on.
            </p>
            <div className={styles.heroActions}>
              <Link href="/tools" className={styles.primaryAction}>
                Find a tool <span aria-hidden="true">→</span>
              </Link>
              <Link href="/intelligence" className={styles.secondaryAction}>
                Browse Guidebook
              </Link>
            </div>
          </div>

          <div className={styles.heroMark} aria-hidden="true">
            <svg viewBox="0 0 340 300" fill="none" stroke="#5A5A5A" strokeWidth="1" strokeLinecap="round">
              <path d="M14,150 C56,40 78,250 118,120 C150,20 116,270 168,150 C214,60 182,262 232,140 C270,60 292,220 320,140 C304,84 330,204 296,214 C250,232 268,110 224,168 C176,230 202,74 152,160 C104,240 96,86 56,180 C26,240 40,86 14,150 Z" />
            </svg>
            <Image src="/images/tangle-gold.png" alt="" width={200} height={200} className={styles.heroTangle} />
          </div>
        </div>
      </section>

      <section className={styles.workflowSection}>
        <div className={styles.centeredHeading}>
          <span>How it works</span>
          <h2>From chaos to a next step.</h2>
          <p>One small system. Three simple moves.</p>
        </div>
        <ol className={styles.workflowGrid}>
          {HOW_IT_WORKS.map((step) => (
            <li key={step.number}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {tools.length > 0 ? (
        <section className={styles.contentSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span>Sorted Lab · Toolbox</span>
              <h2>Tools that do something.</h2>
              <p>Run the numbers, make the decision, or build the plan.</p>
            </div>
            <Link href="/tools">View all tools <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.contentGrid}>
            {tools.map((tool) => (
              <HomeContentCard
                key={tool.slug}
                item={tool}
                href={getToolRoute(tool.slug)}
                kind="Tool"
              />
            ))}
          </div>
        </section>
      ) : null}

      {articles.length > 0 ? (
        <section className={`${styles.contentSection} ${styles.guidebookSection}`}>
          <div className={styles.sectionHeading}>
            <div>
              <span>Sorted Lab · Guidebook</span>
              <h2>Protocols for real life.</h2>
              <p>Plain English. No judgement. One useful next step.</p>
            </div>
            <Link href="/intelligence">View all guidebooks <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.contentGrid}>
            {articles.map((article) => (
              <HomeContentCard
                key={article.slug}
                item={article}
                href={`/intelligence/${article.slug}`}
                kind="Guidebook"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.closingSection}>
        <div>
          <Image
            src="/images/sorted-button/tangle.png"
            alt=""
            width={1024}
            height={1024}
            className={styles.closingTangle}
          />
          <p>Templates, not inspiration.</p>
          <h2>Ready when your brain is.</h2>
        </div>
        <Link href="/tools" className={styles.primaryAction}>Find a tool <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  )
}

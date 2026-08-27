import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getCategoryStyle } from '@/lib/categoryStyles'
import { getToolRoute } from '@/lib/standaloneRoutes'
import type { Protocol } from '@/lib/types/database'
import styles from './home.module.css'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const LOGO_IMAGE = '/images/sor7ed-logo.png'

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
        url: `${SITE}${LOGO_IMAGE}`,
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
    images: [`${SITE}${LOGO_IMAGE}`],
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
    <Link href={href} className={styles.contentCard}>
      <div className={styles.cardVisual}>
        {item.cover_image ? (
          <Image
            src={item.cover_image}
            alt=""
            fill
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className={styles.cardImage}
          />
        ) : (
          <div className={styles.cardPlaceholder} />
        )}
        <div className={styles.cardShade} />
        <span className={styles.kindBadge}>{kind}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMetaRow}>
          {category ? <span className={styles.categoryBadge}>{category.label}</span> : <span />}
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
            <span className={styles.eyebrow}>✦ Practical systems for neurodivergent life</span>
            <h1>
              Life admin.
              <br />
              One clear
              <br />
              <span>next step.</span>
            </h1>
            <p>
              Templates, protocols, and plain-English tools built for brains that already have enough going on.
            </p>
            <div className={styles.heroActions}>
              <Link href="/tools" className={styles.primaryAction}>
                Open Toolbox <span aria-hidden="true">→</span>
              </Link>
              <Link href="/intelligence" className={styles.secondaryAction}>
                Browse Guidebook
              </Link>
            </div>
          </div>

          <div className={styles.systemPanel}>
            <div className={styles.panelHeader}>
              <span>SOR7ED system</span>
              <span className={styles.liveStatus}><i /> Live</span>
            </div>
            <div className={styles.markStage}>
              <div className={styles.markHalo} aria-hidden="true" />
              <Image
                src="/images/sorted-button/tangle.png"
                alt=""
                width={1024}
                height={1024}
                priority
                className={styles.tangle}
              />
              <p>Thread it. Sorted.</p>
            </div>
            <div className={styles.signalList}>
              <div><span>01</span><p><strong>Find it</strong><small>Tools and protocols for the thing in front of you.</small></p></div>
              <div><span>02</span><p><strong>Thread it</strong><small>Keep what matters in your WhatsApp thread.</small></p></div>
              <div><span>03</span><p><strong>Use it</strong><small>Return without remembering another app.</small></p></div>
            </div>
          </div>
        </div>

        <div className={styles.promiseBar}>
          <div><strong>No new app</strong><span>WhatsApp is the remote</span></div>
          <div><strong>No inspiration theatre</strong><span>Practical outputs only</span></div>
          <div><strong>No productivity shame</strong><span>Built for real brains</span></div>
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

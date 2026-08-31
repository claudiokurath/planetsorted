import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getCategoryStyle } from '@/lib/categoryStyles'
import { getToolRoute } from '@/lib/standaloneRoutes'
import type { Protocol } from '@/lib/types/database'
import { AboutIntro } from '@/components/AboutIntro'
import styles from './home.module.css'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const OG_CARD = '/api/og?card=welcome'

const DESC =
  'SOR7ED is a practical support platform for ADHD, autistic, AuDHD, dyslexic, bipolar and other neurodivergent adults — honest editorial content paired with interactive tools that end in a real next step.'

export const metadata: Metadata = {
  title: 'PLANET SOR7ED — Tools built for brains that work differently',
  description: DESC,
  openGraph: {
    title: 'PLANET SOR7ED',
    description: DESC,
    images: [{ url: `${SITE}${OG_CARD}`, type: 'image/png', alt: 'PLANET SOR7ED' }],
    url: SITE,
    siteName: 'PLANET SOR7ED',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PLANET SOR7ED — Tools built for brains that work differently',
    description: DESC,
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
      <AboutIntro />

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

import Image from 'next/image'
import Link from 'next/link'
import { Roboto_Condensed } from 'next/font/google'
import { CollectionCatalog } from '@/components/CollectionCatalog'
import { COLLECTION_COPY } from '@/lib/content/collectionCopy'
import styles from './GammaCollectionPage.module.css'

const bodyFont = Roboto_Condensed({ subsets: ['latin'], weight: ['300', '400'], display: 'swap' })

export function GammaCollectionPage({ collection }: { collection: keyof typeof COLLECTION_COPY }) {
  const copy = COLLECTION_COPY[collection]
  const guidebook = collection === 'guidebook'

  return (
    <div className={`${styles.page} ${bodyFont.className}`}>
      <div className={styles.opening}>
        <div className={styles.cover}>
          <Image
            src={`/images/collections/${collection}-cover.png`}
            alt={guidebook ? 'A red guidebook surrounded by stacks of books on a yellow background' : 'A red toolbox filled with tools on a yellow background'}
            width={1344}
            height={896}
            preload
            sizes="100vw"
          />
        </div>
        <header className={`${styles.panel} ${styles.introduction}`}>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </header>
      </div>

      <div className={styles.sections}>
        <section className={styles.panel} aria-labelledby="collection-features-heading">
          <h2 id="collection-features-heading">{copy.featureHeading}</h2>
          <div className={styles.features}>
            {copy.features.map((feature, index) => (
              <article key={feature.title}>
                {copy.numbered ? <span className={styles.number} aria-hidden="true">{index + 1}</span> : null}
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {guidebook ? (
          <section className={`${styles.panel} ${styles.journey}`} aria-labelledby="collection-journey-heading">
            <div className={styles.journeyArt}>
              <Image
                src="/images/collections/guidebook-ending.png"
                alt="A person in a yellow jacket with papers and books piled around their head"
                width={928}
                height={1232}
                sizes="(max-width: 700px) 100vw, 38vw"
              />
            </div>
            <div className={styles.journeyCopy}>
              <h2 id="collection-journey-heading">YOUR INTELLIGENCE. FINALLY SORTED.</h2>
              <p>Start with a free article — no setup, no friction. Use the SOR7ED button to get its practical protocol via WhatsApp. Finally, support that actually fits your brain.</p>
              <ol className={styles.steps}>
                <li><span aria-hidden="true">1</span><div><h3>READ IT</h3><p>Shame-free, specific long-form articles — choose the guide you need today.</p></div></li>
                <li><span aria-hidden="true">2</span><div><h3>GET IT</h3><p>Tap the SOR7ED mark below your chosen guide. Sign in and connect WhatsApp once.</p></div></li>
                <li><span aria-hidden="true">3</span><div><h3>USE IT</h3><p>Receive your framework, protocol, or script on WhatsApp.</p></div></li>
              </ol>
            </div>
          </section>
        ) : null}

        <div className={`${styles.panel} ${styles.catalog}`}>
          <CollectionCatalog type={guidebook ? 'Article' : 'Tool'} />
        </div>

        {guidebook ? (
          <div className={styles.panel}>
            <Link href="/" className={styles.back}>Back to home <span aria-hidden="true">↗</span></Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { CollectionCatalog } from '@/components/CollectionCatalog'
import { COLLECTION_COPY } from '@/lib/content/collectionCopy'
import styles from './GammaCollectionPage.module.css'

export function GammaCollectionPage({ collection }: { collection: keyof typeof COLLECTION_COPY }) {
  const copy = COLLECTION_COPY[collection]
  const guidebook = collection === 'guidebook'

  return (
    <div className={styles.page}>
      <header className={`${styles.panel} ${styles.introduction}`}>
        <p className={styles.eyebrow}>{guidebook ? 'Guidebook · Read at your pace' : 'Toolbox · One clear next step'}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <a href="#collection-content" className={styles.explore}>Explore {guidebook ? 'the guides' : 'the tools'} <span aria-hidden="true">↓</span></a>
      </header>

      <div className={`${styles.panel} ${styles.catalog}`}>
        <CollectionCatalog type={guidebook ? 'Article' : 'Tool'} />
      </div>

      {guidebook ? (
        <section className={`${styles.panel} ${styles.yellow}`} aria-labelledby="collection-journey-heading">
          <p className={styles.eyebrow}>From reading to doing</p>
          <h2 id="collection-journey-heading">Read it here. Keep it handy.</h2>
          <p>Read every guide for free. If you want its practical protocol in your WhatsApp thread, the SOR7ED button is there when you need it.</p>
          <ol className={styles.steps}>
            <li><span aria-hidden="true">01</span><h3>Choose a guide</h3><p>Pick the topic that fits today. No account is needed to read.</p></li>
            <li><span aria-hidden="true">02</span><h3>Take a next step</h3><p>Read the guide and use what helps, at your own pace.</p></li>
            <li><span aria-hidden="true">03</span><h3>Keep the protocol</h3><p>Optionally sign in, connect WhatsApp and tap the SOR7ED mark below the guide.</p></li>
          </ol>
        </section>
      ) : null}

      <section className={`${styles.panel} ${!guidebook ? styles.yellow : ''}`} aria-labelledby="collection-features-heading">
        <p className={styles.eyebrow}>{guidebook ? 'Understand your brain' : 'How it works'}</p>
        <h2 id="collection-features-heading">{copy.featureHeading}</h2>
        <div className={styles.features}>
          {copy.features.map(feature => (
            <article key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
        <Link href="/brain-type" className={styles.next}>Not sure where to start? Try the Brain Sorter <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  )
}

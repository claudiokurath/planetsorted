import { ArrowIcon } from '@/components/ArrowIcon'
import Link from 'next/link'
import { loadCollectionCatalog } from '@/components/CollectionCatalog'
import { ContentCard } from '@/components/ContentCard'
import { CATEGORY_LIST } from '@/lib/categoryStyles'
import './CatalogBrowser.css'
import './HomeExplore.css'

/** Live published rows only; the design handoff's catalogue is not a CMS. */
export async function HomeExplore() {
  const [tools, guides] = await Promise.all([loadCollectionCatalog('Tool'), loadCollectionCatalog('Article')])
  const all = tools.status === 'ready' && guides.status === 'ready' ? [...tools.items, ...guides.items] : null
  return <>
    <section className="sorted-explore-section" aria-labelledby="explore-topics-heading">
      <div className="sorted-explore-inner">
        <header className="sorted-explore-heading"><div><p className="sorted-explore-label">The seven areas</p><h2 id="explore-topics-heading">Seven parts of one life.</h2></div><p>Pick the area that feels loudest today. You don’t need to sort everything at once.</p></header>
        <div className="sorted-topic-ledger">
          {CATEGORY_LIST.map((area, index) => <Link href={`/category/${area.slug}`} key={area.slug}>
            <span className="sorted-topic-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{area.label}</h3><p>{area.tagline}</p>
            {all ? <span className="sorted-topic-count">{all.filter(item => item.category === area.label).length} <span className="sr-only">published resources</span></span> : <span />}
            <ArrowIcon />
          </Link>)}
        </div>
      </div>
    </section>
    {tools.status === 'ready' && tools.items.length ? <section className="sorted-explore-section" aria-labelledby="explore-tools-heading"><div className="sorted-explore-inner">
      <header className="sorted-explore-heading"><div><p className="sorted-explore-label">Toolbox</p><h2 id="explore-tools-heading">Tools, not lectures.</h2></div><Link href="/tools" className="sorted-explore-all">Explore the toolbox <ArrowIcon /></Link></header>
      <div className="sorted-catalog-grid">{tools.items.slice(0, 3).map(item => <ContentCard key={item.slug} href={`/tools/${item.slug}`} title={item.title} summary={item.summary || item.excerpt || undefined} coverImage={item.cover_image} category={item.category} />)}</div>
    </div></section> : null}
    {guides.status === 'ready' && guides.items.length ? <section className="sorted-explore-section" aria-labelledby="explore-guides-heading"><div className="sorted-explore-inner">
      <header className="sorted-explore-heading"><div><p className="sorted-explore-label">Guidebook</p><h2 id="explore-guides-heading">Pick the one that matches today.</h2></div><Link href="/intelligence" className="sorted-explore-all">Read all guides <ArrowIcon /></Link></header>
      <div className="sorted-guide-index">{guides.items.slice(0, 3).map(item => <ContentCard key={item.slug} href={`/intelligence/${item.slug}`} title={item.title} summary={item.excerpt || item.summary || undefined} coverImage={item.cover_image} category={item.category} layout="row" />)}</div>
    </div></section> : null}
  </>
}

'use client'

import { useState } from 'react'
import { CATEGORY_LIST } from '@/lib/categoryStyles'
import type { CatalogItem, CollectionType } from '@/components/CollectionCatalog'
import { ContentCard } from '@/components/ContentCard'
import './CatalogBrowser.css'

export function CatalogBrowser({ items, type }: { items: CatalogItem[]; type: CollectionType }) {
  const [category, setCategory] = useState('All')
  const shown = category === 'All' ? items : items.filter(item => item.category === category)
  const route = type === 'Tool' ? '/tools' : '/intelligence'
  const label = type === 'Tool' ? 'tools' : 'guides'
  return <div className="sorted-catalog-browser">
    <div role="group" aria-label={`Filter ${label} by topic`} className="sorted-catalog-filters">
      {['All', ...CATEGORY_LIST.map(item => item.label)].map(name => <button type="button" key={name} aria-pressed={name === category} onClick={() => setCategory(name)}>{name}</button>)}
    </div>
    <p className="sorted-catalog-count" role="status" aria-live="polite">{shown.length} {shown.length === 1 ? type === 'Tool' ? 'tool' : 'guide' : label}{category !== 'All' ? ` in ${category}` : ''}</p>
    {shown.length ? <div className={type === 'Tool' ? 'sorted-catalog-grid' : 'sorted-guide-index'}>
      {shown.map(item => <ContentCard key={item.slug} href={`${route}/${item.slug}`} title={item.title}
        summary={(type === 'Article' ? item.excerpt || item.summary : item.summary || item.excerpt) || undefined}
        coverImage={item.cover_image} category={item.category} layout={type === 'Article' ? 'row' : 'card'} />)}
    </div> : <div className="sorted-catalog-empty"><p>Nothing published in {category} yet.</p><button type="button" onClick={() => setCategory('All')}>Show all {label} →</button></div>}
  </div>
}

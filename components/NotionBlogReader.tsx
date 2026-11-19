import type { CSSProperties } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { getCategoryStyle } from '@/lib/categoryStyles'
import './NotionBlogReader.css'

/** Only the public Blog Post property is supplied here, never Protocol text. */
export function NotionBlogReader({ title, body, category }: { title: string; body: string; category: string | null }) {
  const area = getCategoryStyle(category)
  const sections = body.split(/(?=^#{1,2} )/m).map(section => section.trim()).filter(Boolean)
  return <article className="sorted-blog" data-source-field="Blog Post" style={{ '--section-accent': area?.accent || '#FFD400' } as CSSProperties}>
    <header className="sorted-blog__hero">
      <Link href={area ? `/category/${area.slug}` : '/guidebooks'}>← {area?.label || 'Guidebooks'}</Link>
      <p>{area?.label || 'Sorted'} · Guidebook</p>
      <h1>{title}</h1>
      <a href="#blog-reading">Read the guide <span aria-hidden="true">↓</span></a>
    </header>
    <div id="blog-reading">
      {sections.map((section, index) => <section key={index} className={`sorted-blog__section${index % 2 === 1 ? ' sorted-blog__section--colour' : ''}`}>
        <div><ReactMarkdown components={{ img: () => null }}>{section}</ReactMarkdown></div>
      </section>)}
    </div>
  </article>
}

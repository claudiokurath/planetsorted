import Link from 'next/link'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import './GammaReader.css'

/** Render the live presentation from the current Notion property, never a copy. */
export function GammaReader({ source, title, collection, launch }: {
  source: string | null | undefined; title: string; collection: 'tool' | 'article'; launch?: string;
}) {
  const src = gammaEmbedUrl(source)
  const back = collection === 'tool' ? '/tools' : '/intelligence'
  return <section className="sorted-gamma-reader" data-source-field={collection === 'article' ? 'Blog Post Gamma' : 'Gamma'} aria-label={title}>
    <header className="sorted-gamma-reader-toolbar">
      <Link href={back}>← {collection === 'tool' ? 'Toolbox' : 'Guidebook'}</Link>
      <h1>{title}</h1>
      {launch ? <Link href={launch} className="sorted-gamma-reader-launch">Use tool →</Link> : null}
      {src ? <a href={src.replace('/embed/', '/docs/')} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title} in Gamma`} className="sorted-gamma-reader-original"><span>Open original </span>↗</a> : null}
    </header>
    {src ? <iframe src={src} title={title} allow="fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="sorted-gamma-reader-frame" /> : <div className="sorted-gamma-reader-empty"><p>This presentation is not available yet.</p><Link href={back}>Browse {collection === 'tool' ? 'tools' : 'guidebooks'} →</Link></div>}
  </section>
}

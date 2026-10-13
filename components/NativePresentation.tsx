import Image from 'next/image'
import source from '@/lib/content/nativeGammaCopy.json'
import sources from '@/lib/content/presentationSources.json'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import styles from './NativePresentation.module.css'

type Block = { kind: string; text: string }
export type Presentation = { cards: { blocks: Block[]; images: { src: string; width: number; height: number }[] }[] }
export function hasNativePresentation(slug: string, currentSource?: string | null): boolean {
  if (!Object.hasOwn(source, slug)) return false
  if (currentSource === undefined) return true
  return gammaEmbedUrl(currentSource) === gammaEmbedUrl(sources[slug as keyof typeof sources])
}

function TextBlocks({ blocks }: { blocks: Block[] }) {
  const output = []
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (block.kind === 'li') {
      const items = [block.text]
      while (blocks[i + 1]?.kind === 'li') items.push(blocks[++i].text)
      output.push(<ul key={i}>{items.map((text, n) => <li key={n}>{text}</li>)}</ul>)
    } else if (/^h/.test(block.kind)) {
      output.push(<h3 key={i}>{block.text}</h3>)
    } else output.push(<p key={i}>{block.text}</p>)
  }
  return output
}

function Blocks({ blocks }: { blocks: Block[] }) {
  const firstGroup = blocks.findIndex(block => /^h/.test(block.kind))
  if (firstGroup < 0) return <TextBlocks blocks={blocks} />
  const groups: Block[][] = []
  for (const block of blocks.slice(firstGroup)) {
    if (/^h/.test(block.kind)) groups.push([block])
    else groups[groups.length - 1].push(block)
  }
  return <>
    <TextBlocks blocks={blocks.slice(0, firstGroup)} />
    <div className={styles.groups}>{groups.map((group, index) => <div className={styles.group} key={index}><TextBlocks blocks={group} /></div>)}</div>
  </>
}

/** Source text is rendered as React nodes, never unsanitized Gamma HTML. */
export function NativePresentation({ slug, presentation }: { slug: string; presentation?: Presentation }) {
  const data = presentation ?? source[slug as keyof typeof source]
  if (!data) return null
  const titleCardIndex = data.cards.findIndex(card => /^h/.test(card.blocks[0]?.kind ?? ''))
  return <article className={styles.presentation}>
    {data.cards.map((card, index) => {
      const [first, ...rest] = card.blocks
      const hasHeading = first && /^h/.test(first.kind)
      const heading = hasHeading ? first.text : undefined
      const isTitle = Boolean(heading && index === titleCardIndex)
      const blocks = hasHeading ? rest : card.blocks
      return <section key={index} className={`${styles.card} ${card.images.length > 0 && blocks.length > 0 ? styles.withArt : ''}`}>
        {card.images.map((img, n) => <div className={styles.art} key={img.src}>
          <Image src={img.src} width={img.width} height={img.height} alt={`${heading ?? 'SOR7ED presentation'} — illustration ${n + 1}`} sizes="(max-width: 760px) calc(100vw - 32px), 1160px" preload={index === 0} />
        </div>)}
        {card.blocks.length ? <div className={styles.copy}>
          {heading ? isTitle ? <h1>{heading}</h1> : <h2>{heading}</h2> : null}
          <Blocks blocks={blocks} />
        </div> : null}
      </section>
    })}
  </article>
}

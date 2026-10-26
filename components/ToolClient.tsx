import { PrintPageButton } from '@/components/PrintPageButton'
import { ContentHero } from '@/components/ContentHero'
import { NativePresentation } from '@/components/NativePresentation'
import { getLiveGammaPresentation } from '@/lib/content/liveGamma'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import { GammaEmbed } from '@/components/GammaEmbed'
import type { Protocol } from '@/lib/types/database'

interface ToolClientProps {
  toolData: Protocol
}

export async function ToolClient({ toolData }: ToolClientProps) {
  const description = toolData.meta_description || toolData.summary?.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/^OVERVIEW\s*/i, '').trim().split(/\n\s*\n/)[0]
  // Tools sync their single Notion "Gamma" property into gamma_url;
  // blog_gamma_url stays as a fallback for anything set the old way.
  const currentSource = toolData.gamma_url ?? toolData.blog_gamma_url
  const gamma = await getLiveGammaPresentation(currentSource)
  const native = Boolean(gamma)

  return (
    <div className="min-h-screen bg-black text-white">
      {!native ? <ContentHero
        title={toolData.title}
        description={description}
        category={toolData.category}
        coverImage={toolData.cover_image}
      /> : null}

      <main className="w-full pb-0 pt-1">
        <div className="mx-auto max-w-6xl px-5 py-4 print:hidden"><PrintPageButton /></div>
        {native ? (
          <NativePresentation slug={toolData.slug} presentation={gamma!.presentation} sourceId={gamma!.sourceId} updatedAt={gamma!.updatedAt} />
        ) : (
          <>{gammaEmbedUrl(currentSource) ? <GammaEmbed src={gammaEmbedUrl(currentSource)!} title={toolData.title} /> : <p className="border border-white/15 p-6 text-base text-neutral-300">{description || 'More information about this tool is coming soon.'}</p>}</>
        )}

      </main>
    </div>
  )
}

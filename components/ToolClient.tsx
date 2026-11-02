import Link from 'next/link'
import { INTERACTIVE_TOOL_ROUTES } from '@/lib/standaloneRoutes'
import { PrintPageButton } from '@/components/PrintPageButton'
import { ContentHero } from '@/components/ContentHero'
import { NativePresentation } from '@/components/NativePresentation'
import { getCurrentPresentation } from '@/lib/content/presentationCache'
import { GammaEmbed } from '@/components/GammaEmbed'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import type { Protocol } from '@/lib/types/database'

interface ToolClientProps {
  toolData: Protocol
}

export async function ToolClient({ toolData }: ToolClientProps) {
  const description = toolData.meta_description || toolData.summary?.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/^OVERVIEW\s*/i, '').trim().split(/\n\s*\n/)[0]
  // Tools sync their single Notion "Gamma" property into gamma_url;
  // blog_gamma_url stays as a fallback for anything set the old way.
  const currentSource = toolData.gamma_url ?? toolData.blog_gamma_url
  const current = await getCurrentPresentation(toolData.slug, currentSource)
  const native = Boolean(current)
  const launch = INTERACTIVE_TOOL_ROUTES[toolData.slug]

  return (
    <div className="min-h-screen bg-black text-white">
      {!native ? <ContentHero
        title={toolData.title}
        description={description}
        category={toolData.category}
        coverImage={toolData.cover_image}
      /> : null}

      <main className="w-full pb-0 pt-1">
        {launch ? <section className="mx-auto max-w-6xl px-5 py-8 text-center print:hidden" aria-label="Use this tool">
          <Link href={launch} className="inline-flex min-h-14 items-center justify-center gap-4 bg-[#FFD400] px-8 py-4 font-bebas text-2xl uppercase text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            Use {toolData.title} <span aria-hidden="true">→</span>
          </Link>
          <p className="mt-3 text-sm text-neutral-300">Free to try here. No sign-up needed. WhatsApp delivery is optional.</p>
        </section> : null}
        <div className="mx-auto max-w-6xl px-5 py-4 print:hidden"><PrintPageButton /></div>
        {native ? (
          <NativePresentation slug={toolData.slug} presentation={current!.presentation} sourceId={current!.sourceId} updatedAt={current!.updatedAt} />
        ) : (
          <>{gammaEmbedUrl(currentSource) ? <GammaEmbed src={gammaEmbedUrl(currentSource)!} title={toolData.title} /> : <p className="border border-white/15 p-6 text-base text-neutral-300">This preview is temporarily unavailable. Please try again shortly.</p>}</>
        )}

      </main>
    </div>
  )
}

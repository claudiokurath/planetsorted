import { PrintPageButton } from '@/components/PrintPageButton'
import { ContentHero } from '@/components/ContentHero'
import { NativePresentation, hasNativePresentation } from '@/components/NativePresentation'
import type { Protocol } from '@/lib/types/database'

interface ToolClientProps {
  toolData: Protocol
}

export function ToolClient({ toolData }: ToolClientProps) {
  const description = toolData.meta_description || toolData.summary?.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/^OVERVIEW\s*/i, '').trim().split(/\n\s*\n/)[0]
  // Tools sync their single Notion "Gamma" property into gamma_url;
  // blog_gamma_url stays as a fallback for anything set the old way.
  const native = hasNativePresentation(toolData.slug, toolData.gamma_url ?? toolData.blog_gamma_url)

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
          <NativePresentation slug={toolData.slug} />
        ) : (
          <p className="border border-white/15 p-6 text-base text-neutral-300">This tool’s content is not available yet. Please check back soon.</p>
        )}

      </main>
    </div>
  )
}

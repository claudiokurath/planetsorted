import { ToolWhatsAppCta, WhatsAppConnectionCta } from '@/components/ToolWhatsAppCta'

export const metadata = { title: 'SOR7ED button', robots: { index: false, follow: false } }

export default async function ButtonEmbed({ searchParams }: { searchParams: Promise<{ slug?: string; context?: string }> }) {
  const params = await searchParams
  const slug = typeof params.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.slug) ? params.slug : null
  const context = params.context === 'article' ? 'article' : 'tool'
  return (
    <div className="sorted-button-embed bg-black px-4 py-6 text-white">
      {slug ? <ToolWhatsAppCta slug={slug} context={context} returnPath={`/${context === 'article' ? 'intelligence' : 'tools'}/${slug}`} /> : <WhatsAppConnectionCta />}
      <style>{`body:has(.sorted-button-embed) > main { padding-bottom: 0; } body:has(.sorted-button-embed) .sorted-skip-link { display: none; }`}</style>
    </div>
  )
}

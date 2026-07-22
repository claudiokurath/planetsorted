import fs from 'fs'
import path from 'path'
import { RotatingHero } from '@/components/RotatingHero'
import { ContentCard } from '@/components/ContentCard'
import { GetSortedButton } from '@/components/buttons/GetSortedButton'
import { PRIORITY_TOOLS } from '@/lib/toolsData'

function getHeroImages(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'heroes')
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => `/images/heroes/${f}`)
  } catch {
    return []
  }
}

export default function HomePage() {
  const heroImages = getHeroImages()

  return (
    <div style={{ backgroundColor: '#FAF7F2' }} className="min-h-screen">
      <section className="bg-gradient-to-br from-[#FAF7F2] to-[#F0E5D8]">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <p className="mb-3 font-bold text-sm tracking-[0.25em] uppercase" style={{ color: '#2980B9' }}>Planet Sorted</p>
              <h1 className="text-6xl font-black uppercase leading-none tracking-tight sm:text-7xl" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#1A1A1A' }}>
                Templates,<br /><span style={{ color: '#C0392B' }}>not inspiration.</span>
              </h1>
              <p className="max-w-md text-xl leading-relaxed" style={{ color: '#444' }}>
                Practical protocols and tools for neurodivergent adults. No app. No spam. Just what works.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <GetSortedButton slug="home" context="article" />
                <a href="/intelligence" className="text-sm font-semibold uppercase tracking-widest underline underline-offset-4" style={{ color: '#C0392B' }}>
                  Browse the protocols →
                </a>
              </div>
            </div>
            <RotatingHero images={heroImages} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="h-px w-full" style={{ backgroundColor: '#E8E0D5' }} /></div>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="h-1 w-16 rounded-full bg-[#C0392B] mb-4" />
          <p className="mb-2 font-bold text-sm tracking-[0.25em] uppercase" style={{ color: '#2980B9' }}>Sorted Lab</p>
          <h2 className="text-5xl font-black uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#1A1A1A' }}>Toolbox</h2>
          <p className="mt-4 max-w-xl text-lg" style={{ color: '#555' }}>Text one word. Get your result. Come back any time.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRIORITY_TOOLS.map((tool) => (
            <ContentCard key={tool.slug} href={`/tools/${tool.slug}`} title={tool.title} summary={tool.summary} coverImage={tool.image} category={tool.category} />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="h-px w-full" style={{ backgroundColor: '#E8E0D5' }} /></div>

      <section className="py-20 text-center" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-5xl font-black uppercase text-white sm:text-6xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            One text. <span style={{ color: '#C0392B' }}>Sorted.</span>
          </h2>
          <p className="mt-6 text-xl" style={{ color: '#aaa' }}>
            Text <strong className="text-white">TAX</strong>, <strong className="text-white">CLARITY</strong>, or <strong className="text-white">BURNOUT</strong> to +44 7591 922247.
            No app. No login. Just your result — straight to WhatsApp.
          </p>
          <p className="mt-8 text-sm" style={{ color: '#666' }}>
            Planet Sorted provides educational tools and protocols. Not medical, clinical, legal, or financial advice.
            Not a crisis service. In immediate danger: call 999. To talk: text SHOUT to 85258.
          </p>
        </div>
      </section>
    </div>
  )
}

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
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map((f) => `/images/heroes/${f}`)
  } catch {
    return []
  }
}

export default function HomePage() {
  const heroImages = getHeroImages()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            Templates, not <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">inspiration.</span>
          </h1>
          <p className="text-xl leading-relaxed text-gray-400">
            Practical protocols and tools for neurodivergent adults. No app. No spam. Just what works.
          </p>
          <div className="pt-4">
            <GetSortedButton slug="home" context="article" />
          </div>
        </div>
        <RotatingHero images={heroImages} />
      </div>

      <div className="mt-32 space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Start sorting it out right now.</h2>
          <p className="mt-4 text-lg text-gray-400">Text one word. Get your result. Come back any time.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PRIORITY_TOOLS.map((tool) => (
            <ContentCard
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              title={tool.title}
              summary={tool.summary}
              coverImage={tool.image}
              category={tool.category}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

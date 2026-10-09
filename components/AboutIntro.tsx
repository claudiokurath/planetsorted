import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_LIST } from '@/lib/categoryStyles'

const STEPS = [
  { title: 'Find a tool', body: 'Start with the part of life that feels tangled. Pick a practical tool or a plain-language guide.' },
  { title: 'Push the button', body: 'Get a useful next step. Sign in and connect WhatsApp when you want to keep it on your phone.' },
  { title: 'Get the message', body: 'Tap SOR7ED to send it to your verified WhatsApp. Come back to it when you need it.' },
]

export function AboutIntro() {
  return (
    <div className="sorted-intro">
      <section className="sorted-hero" aria-labelledby="home-heading">
        <div className="sorted-hero-top">
          <span className="sorted-eyebrow">Neurodivergent-first platform</span>
          <span className="sorted-hero-motto">Worry less, live more.</span>
        </div>
        <div className="sorted-hero-video">
          <video autoPlay loop muted playsInline preload="metadata" aria-label="SOR7ED brand animation">
            <source src="/media/sequence01_1.mp4" type="video/mp4" />
            Your browser does not support this video.
          </video>
        </div>
        <h1 id="home-heading">Tools built for brains that work <span>differently.</span></h1>
        <div className="sorted-hero-bottom">
          <div className="sorted-hero-copy">
            <p>SOR7ED is a practical support hub for ADHD, autistic, AuDHD, dyslexic, bipolar and other neurodivergent adults. Tools, protocols and plain-language guides that make everyday life less overwhelming.</p>
            <div className="sorted-actions">
              <Link href="/tools" className="sorted-action sorted-action-primary">Explore the tools</Link>
              <Link href="/intelligence" className="sorted-action sorted-action-secondary">Read the guidebook</Link>
            </div>
          </div>
          <div className="sorted-brand-stamp">
            <Image src="/images/tangle-yellow.png" alt="" width={104} height={104} sizes="104px" />
            <span>Clarity<br />from clutter.</span>
          </div>
        </div>
        <div className="sorted-hero-footnote"><span>Built for the messy moment.</span><span>One clear next step.</span></div>
      </section>

      <section className="sorted-section" aria-labelledby="how-heading">
        <div className="sorted-section-heading">
          <div><span className="sorted-eyebrow">01 / How it works</span><h2 id="how-heading">Less friction.<br /><span>More living.</span></h2></div>
          <p>Most systems were engineered for neurotypical brains. SOR7ED starts with how yours actually works: short steps, useful tools, and support you can keep.</p>
        </div>
        <div className="sorted-steps">
          {STEPS.map((step, index) => (
            <article className="sorted-step" key={step.title}>
              <span className="sorted-step-number">0{index + 1}</span>
              <h3>{step.title}</h3><p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sorted-section sorted-pillars-section" aria-labelledby="pillars-heading">
        <div className="sorted-section-heading">
          <div><span className="sorted-eyebrow">02 / Content pillars</span><h2 id="pillars-heading">Real life.<br /><span>All of it.</span></h2></div>
          <p>Seven starting points for neurodivergent adult life. Pick the area you need help with today.</p>
        </div>
        <div className="sorted-pillars">
          {CATEGORY_LIST.map((category, index) => (
            <Link className="sorted-pillar" href={`/category/${category.slug}`} key={category.slug}>
              <span className="sorted-pillar-index">0{index + 1} /</span>
              <h3>{category.label}</h3><p>{category.tagline}</p>
              <span className="sorted-pillar-link">Explore {category.label.toLowerCase()}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

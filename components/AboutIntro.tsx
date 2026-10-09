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
      <section className="sorted-photo-hero" aria-labelledby="home-heading">
        <div className="sorted-photo-hero-copy">
          <div className="sorted-photo-hero-mark" aria-hidden="true">
            <video autoPlay loop muted playsInline preload="metadata" tabIndex={-1}>
              <source src="/media/sequence01_1.mp4" type="video/mp4" />
            </video>
            <Image className="sorted-photo-hero-static-mark" src="/images/tangle-yellow.png" alt="" width={112} height={112} />
          </div>
          <span className="sorted-photo-hero-eyebrow">Neurodivergent-first. Everyday life.</span>
          <h1 id="home-heading">Built for brains<br />that work <span>differently.</span></h1>
          <div className="sorted-photo-hero-description">
            <p>SOR7ED is a practical support hub for ADHD, autistic, AuDHD, dyslexic, bipolar and other neurodivergent adults.</p>
            <p>Tools, protocols and plain-language guides that make everyday life less overwhelming. One clear next step.</p>
          </div>
          <div className="sorted-actions">
            <Link href="/tools" className="sorted-action sorted-action-primary">Explore the tools</Link>
            <Link href="/intelligence" className="sorted-action sorted-action-secondary">Read the guidebook</Link>
          </div>
          <span className="sorted-photo-hero-motto">Worry less, live more.</span>
        </div>
        <div className="sorted-photo-hero-image">
          <Image src="/images/hero-yellow-portrait.webp" alt="A man in a yellow suit looking at his phone" fill sizes="(max-width: 800px) 100vw, 40vw" preload className="sorted-photo-hero-portrait" />
        </div>
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

      <section className="sorted-section sorted-about" aria-labelledby="about-heading">
        <div className="sorted-about-copy">
          <span className="sorted-eyebrow">02 / About SOR7ED</span>
          <h2 id="about-heading">Life is tangled.<br /><span>Start anywhere.</span></h2>
          <p>SOR7ED makes everyday life easier to navigate for neurodivergent adults. We pair honest, plain-language guides with practical tools, so you can understand what is getting in the way and find one useful next step.</p>
          <p>From an unopened bill to a difficult conversation, the small things can take a lot. These seven areas help you find support for the part of life that needs it today.</p>
          <span className="sorted-about-signoff">Worry less, live more.</span>
        </div>
        <nav className="sorted-life-areas" aria-label="Explore the seven areas of life">
          <div className="sorted-life-areas-heading">Everyday life, in seven areas</div>
          {CATEGORY_LIST.map((category, index) => (
            <Link className="sorted-life-area" href={`/category/${category.slug}`} key={category.slug}>
              <span className="sorted-life-area-index" aria-hidden="true">0{index + 1}</span>
              <span className="sorted-life-area-copy"><span className="sorted-life-area-title">{category.label}</span><span className="sorted-life-area-description">{category.tagline}</span></span>
              <svg className="sorted-life-area-arrow" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12" /></svg>
            </Link>
          ))}
        </nav>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_LIST } from '@/lib/categoryStyles'

export const metadata: Metadata = {
  title: 'About us — PLANET SOR7ED',
  description: 'Mainstream mental health wasn’t built for every brain. SOR7ED pairs shame-free guides with specific, actionable tools for neurodivergent adults.',
}

const PRINCIPLES = [
  { title: 'Shame-free', body: 'Written without judgement, for people who have heard enough of it. No moralising, no platitudes.' },
  { title: 'Specific', body: 'Built for neurodivergent adults. Every guide speaks directly to the neurodivergent experience.' },
  { title: 'Actionable', body: 'Paired with practical tools, frameworks, protocols and scripts. Understanding becomes a useful next step.' },
]
const STEPS = [
  { title: 'Read it', body: 'Start with a plain-language guide or find a tool for the part of life that feels tangled.' },
  { title: 'Use it', body: 'Open the tool or protocol on the website. Find a framework, script or practical next step.' },
  { title: 'Keep it', body: 'Sign in and connect your WhatsApp when you want to send supported content to your phone.' },
]

export default function AboutPage() {
  return (
    <div className="sorted-about-page">
      <section className="sorted-about-cover" aria-labelledby="about-heading">
        <div className="sorted-about-art"><Image src="/images/about-brain.jpeg" alt="A tangled golden brain resting on a suitcase" fill preload sizes="(max-width: 760px) 100vw, 40vw" /></div>
        <div className="sorted-about-cover-copy">
          <span className="sorted-eyebrow">About SOR7ED</span>
          <h1 id="about-heading">Mainstream mental health wasn’t built for them.</h1>
          <p>Neurodivergent adults — ADHD, autism, AuDHD, bipolar, dyslexia, RSD — are left to piece together their own understanding from Reddit threads and late-night spirals. That’s the gap SOR7ED exists to fill.</p>
        </div>
      </section>

      <section className="sorted-about-block" aria-labelledby="principles-heading">
        <span className="sorted-eyebrow">Our approach</span>
        <h2 id="principles-heading">Three principles that change everything.</h2>
        <div className="sorted-about-principles">
          {PRINCIPLES.map((principle, index) => <article key={principle.title}><span className="sorted-about-number">0{index + 1}</span><h3>{principle.title}</h3><p>{principle.body}</p></article>)}
        </div>
        <p className="sorted-about-statement">No moralising. No platitudes. No “have you tried exercise?” Just practical help.</p>
      </section>

      <section className="sorted-about-block" aria-labelledby="support-heading">
        <span className="sorted-eyebrow">The gap we fill</span>
        <h2 id="support-heading">Built for the brains mainstream mental health ignores.</h2>
        <ul className="sorted-about-promises">
          <li>Long-form guides across seven areas of life, grounded in the neurodivergent experience.</li>
          <li>Practical tools on the website, with WhatsApp delivery for supported content.</li>
          <li>Separating what needs doing from what needs understanding.</li>
        </ul>
        <p>Getting support can mean long waits and systems that do not fit. SOR7ED offers practical help for the everyday moments in between.</p>
      </section>

      <section className="sorted-about-block" aria-labelledby="domains-heading">
        <span className="sorted-eyebrow">Everyday life</span>
        <h2 id="domains-heading">Seven areas. Every part of your life.</h2>
        <div className="sorted-about-domains">
          {CATEGORY_LIST.map(category => <Link href={`/category/${category.slug}`} key={category.slug}><h3>{category.label}</h3><p>{category.tagline}</p><span>Explore {category.label.toLowerCase()} →</span></Link>)}
        </div>
      </section>

      <section className="sorted-about-block sorted-about-whatsapp" aria-labelledby="whatsapp-heading">
        <div><span className="sorted-eyebrow">The WhatsApp layer</span><h2 id="whatsapp-heading">Useful support.<br />On your phone.</h2></div>
        <div><p>The website is where you read, explore and use the tools. WhatsApp lets you keep supported content close, ready for the moment you need it.</p><p>Sign in, connect and verify your WhatsApp number, then use the SOR7ED button where available. No extra app to download.</p><Link href="/signup?next=%2Fdashboard" className="sorted-about-text-link">Connect your WhatsApp →</Link></div>
      </section>

      <section className="sorted-about-cover sorted-about-ending" aria-labelledby="start-heading">
        <div className="sorted-about-art"><Image src="/images/about-life.jpeg" alt="Golden brains and tangled wires stacked above a suitcase" fill sizes="(max-width: 760px) 100vw, 40vw" /></div>
        <div className="sorted-about-cover-copy">
          <h2 id="start-heading">Life doesn’t come sorted. We help.</h2>
          <p>Start with a guide or a tool. Finally, support that actually fits your brain.</p>
          <ol className="sorted-about-steps">{STEPS.map((step, index) => <li key={step.title}><span className="sorted-about-number">{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>
          <div className="sorted-actions"><Link href="/intelligence" className="sorted-action sorted-action-primary">Read the guidebook</Link><Link href="/tools" className="sorted-action sorted-action-secondary">Explore the tools</Link></div>
        </div>
      </section>
    </div>
  )
}

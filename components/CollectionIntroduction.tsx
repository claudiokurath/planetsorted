import Image from 'next/image'
import Link from 'next/link'

const CONTENT = {
  guidebook: {
    label: 'Guidebook', title: 'Your intelligence was never the problem.',
    description: 'Neurodivergent adults — ADHD, autism, AuDHD, bipolar, dyslexia, RSD — are told they are too much or not enough. This is the SOR7ED guide to your cognitive strengths.',
    heading: 'What the guidebooks cover',
    features: [
      ['Pattern recognition', 'Understanding why ND brains spot connections neurotypical minds miss — and how to use that as a deliberate cognitive tool.'],
      ['Hyperfocus as strength', 'Protocols for channelling hyperfocus productively, protecting it from interruption, and recovering when it collapses.'],
      ['Cognitive load & fatigue', 'Strategies for managing a brain that processes more, tires faster, and needs different recovery rhythms than neurotypical expectations allow.'],
      ['Masking & unmasking', 'The cognitive cost of performing neurotypicality — and practical tools for reducing it without burning every bridge in the process.'],
    ],
    ending: 'Your intelligence. Finally sorted.',
  },
  toolbox: {
    label: 'Toolbox', title: 'The tools your brain actually needs.',
    description: 'Neurodivergent adults — ADHD, autism, AuDHD, bipolar, dyslexia, RSD — deserve support that fits. The SOR7ED tools are free, practical, and built for the brains mainstream mental health ignores.',
    heading: 'What the tools do',
    features: [
      ['Executive function support', 'Triage what your brain can actually handle right now — without guilt, pressure, or a 47-step productivity system.'],
      ['Hyperfocus management', 'A timer and transition alert machine built to channel hyperfocus productively and guide you back out when it ends.'],
      ['Energy tracking', 'The Spoon Theory Tracker lets you monitor your daily energy so you stop crashing — and start planning around your actual capacity.'],
      ['Money & task tools', 'The ADHD Tax Tracker and Task Breakdown Wizard reduce the overwhelm of finances and big tasks — one manageable step at a time.'],
    ],
    ending: 'Your brain. Finally supported.',
  },
}

type Collection = keyof typeof CONTENT

export function CollectionIntroduction({ collection }: { collection: Collection }) {
  const content = CONTENT[collection]
  return (
    <>
      <section className="sorted-about-cover" aria-labelledby="collection-heading">
        <div className="sorted-about-art"><Image src="/images/introductions/collection-cover.png" alt="A golden brain with tangled wires resting on a suitcase" fill preload sizes="(max-width: 760px) 100vw, 40vw" /></div>
        <div className="sorted-about-cover-copy">
          <span className="sorted-eyebrow">{content.label} / SOR7ED</span>
          <h1 id="collection-heading">{content.title}</h1>
          <p>{content.description}</p>
          <Link className="sorted-about-text-link" href="#collection-content">Explore {content.label.toLowerCase()} ↓</Link>
        </div>
      </section>
      <section className="sorted-about-block" aria-labelledby="features-heading">
        <h2 id="features-heading">{content.heading}</h2>
        <div className="sorted-collection-features">
          {content.features.map(([title, body], index) => <article key={title}><span className="sorted-about-number">0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
    </>
  )
}

export function CollectionEnding({ collection }: { collection: Collection }) {
  return (
    <section className="sorted-about-cover sorted-about-ending" aria-labelledby="collection-ending">
      <div className="sorted-about-art"><Image src="/images/introductions/collection-ending.png" alt="Golden brains and tangled wires stacked above a suitcase" fill sizes="(max-width: 760px) 100vw, 40vw" /></div>
      <div className="sorted-about-cover-copy">
        <h2 id="collection-ending">{CONTENT[collection].ending}</h2>
        <p>Start with the {collection === 'guidebook' ? 'guide' : 'tool'} that fits where you are right now. Find a framework, protocol or practical next step that actually fits your brain.</p>
        <ol className="sorted-about-steps">
          <li><span className="sorted-about-number">1</span><div><h3>Pick one</h3><p>Choose what you need today — energy, tasks, focus, money or connection.</p></div></li>
          <li><span className="sorted-about-number">2</span><div><h3>Use it</h3><p>Read the guide or open the tool directly on the website.</p></div></li>
          <li><span className="sorted-about-number">3</span><div><h3>Keep it</h3><p>Sign in and connect WhatsApp to send supported content to your phone.</p></div></li>
        </ol>
        <Link className="sorted-about-text-link" href="#collection-content">Find your next step ↑</Link>
      </div>
    </section>
  )
}

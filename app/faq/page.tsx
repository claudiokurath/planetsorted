import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'FAQ — PLANET SOR7ED',
  description: 'Frequently asked questions about PLANET SOR7ED and Sorted Lab.',
}

export default function FAQPage() {
  const faqs = [
    {
      q: 'What is PLANET SOR7ED?',
      a: 'PLANET SOR7ED is practical templates and tools for neurodivergent adults, delivered on our website and remote-controlled via WhatsApp.'
    },
    {
      q: 'Do I need to install an app?',
      a: 'No app required. Everything runs on your browser and inside WhatsApp.'
    },
    {
      q: 'How does WhatsApp work with SOR7ED?',
      a: 'Connect your number once in your dashboard settings, then send any tool result or protocol to your own WhatsApp from the site with one tap. Texting the number will not run tools — everything starts on planetsorted.com. Reply STOP at any time to opt out.'
    },
    {
      q: 'Is PLANET SOR7ED free?',
      a: 'Yes! All basic tools and protocols are free forever. Plus tier (£5.99/mo) unlocks full action plans, history, and exports.'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <PageHeader eyebrow="SOR7ED" title="Frequently asked questions" description="The useful answers, without the small print." />
        <div className="mt-8 space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-2 rounded-none border border-white/[0.12] bg-black p-6">
              <h2 className="text-2xl font-normal uppercase text-white" style={{ fontFamily: "var(--font-anton), Oswald, sans-serif" }}>
                {faq.q}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-neutral-300">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

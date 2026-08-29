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
      q: 'How does WhatsApp remote control work?',
      a: 'Text one keyword (like TAX or CLARITY) to +44 7591 922247 on WhatsApp and get your result delivered straight to your chat. Sign up first at planetsorted.com — no app, no spam.'
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
              <h2 className="text-2xl font-extralight uppercase text-white" style={{ fontFamily: "var(--font-jost), system-ui, sans-serif" }}>
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

import type { Metadata } from 'next'

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
        <h1 className="font-bebas text-5xl sm:text-6xl md:text-7xl font-black uppercase text-white tracking-tight leading-[0.95]">
          Frequently Asked Questions
        </h1>
        <div className="mt-8 space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-neutral-800 bg-[#141414] p-6 space-y-2">
              <h2 className="font-bebas text-2xl font-black uppercase text-white">
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

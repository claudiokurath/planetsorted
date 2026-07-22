import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ — Planet Sorted',
  description: 'Frequently asked questions about Planet Sorted and Sorted Lab.',
}

export default function FAQPage() {
  const faqs = [
    {
      q: 'What is Planet Sorted?',
      a: 'Planet Sorted is practical templates and tools for neurodivergent adults, delivered on our website and remote-controlled via WhatsApp.'
    },
    {
      q: 'Do I need to install an app?',
      a: 'No app required. Everything runs on your browser and inside WhatsApp.'
    },
    {
      q: 'How does WhatsApp remote control work?',
      a: 'You text one keyword (like TAX or CLARITY) to +44 7591 922247, and get your result delivered straight to your chat.'
    },
    {
      q: 'Is Planet Sorted free?',
      a: 'Yes! All basic tools and protocols are free forever. Plus tier (£5.99/mo) unlocks full action plans, history, and exports.'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Frequently Asked Questions
        </h1>
        <div className="mt-8 space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-neutral-800 bg-[#141414] p-6 space-y-2">
              <h2 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
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

import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'FAQ — PLANET SOR7ED',
  description: 'Frequently asked questions about PLANET SOR7ED and Sorted Lab.',
}

export default function FAQPage() {
  const faqs = [
    {
      q: 'What is PLANET SOR7ED?',
      a: 'PLANET SOR7ED provides practical tools, templates and plain-language protocols for neurodivergent adults. Explore the guidebook, try a tool, or use the brain-type reflection to find a starting point.'
    },
    {
      q: 'Do I need to install an app?',
      a: 'No new app is needed. Tools run in your browser. WhatsApp is optional: connect your number if you want to receive a tool or protocol on your phone.'
    },
    {
      q: 'How does WhatsApp work with SOR7ED?',
      a: 'Sign in and verify your number in account settings, then use the SOR7ED button on an item to send it to your own WhatsApp. Everything starts on planetsorted.com; texting the business number does not run tools. Reply STOP at any time to opt out.'
    },
    {
      q: 'Is PLANET SOR7ED free?',
      a: 'Core tools and guidebook content are available without a paid membership. A free account lets you keep saved items together. Review membership details before choosing any paid option.'
    },
    {
      q: 'Is the brain-type reflection a diagnosis?',
      a: 'No. It is a short reflection on how you approach everyday life, followed by tools you might find useful. It does not diagnose ADHD, autism or any other condition.'
    },
    {
      q: 'Where are my saved items?',
      a: 'Sign in and open Account, then Saved library. Only items you have saved appear there. An empty library means you have not saved anything yet.'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <PageHeader eyebrow="SOR7ED" title="Frequently asked questions" description="The useful answers, without the small print." />
        <div className="mt-8 space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-2 rounded-none border border-white/[0.12] bg-black p-6">
              <h2 className="text-2xl sm:text-3xl font-normal uppercase text-white" style={{ fontFamily: "var(--font-anton), Oswald, sans-serif" }}>
                {faq.q}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-neutral-300">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-base leading-relaxed text-neutral-300">Still need help? <Link href="/contact" className="inline-flex min-h-11 items-center text-[#FFBA2E] underline">Contact SOR7ED</Link>.</p>
      </div>
    </div>
  )
}

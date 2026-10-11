import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Membership — PLANET SOR7ED',
  description: 'Explore SOR7ED without a paid membership, and review Plus subscription details.',
}

const QUESTIONS = [
  {
    question: 'What can I use without a membership?',
    answer: 'Explore the toolbox, read guidebook protocols and try the core tools in your browser. A free account lets you keep saved items together.',
  },
  {
    question: 'Do I need WhatsApp?',
    answer: 'WhatsApp is optional. Tools run on the website. If you want an item on your phone, sign in, verify your number and use its SOR7ED button.',
  },
  {
    question: 'How do I get help with a subscription?',
    answer: 'For questions about an existing subscription, billing or cancellation, email hello@planetsorted.com.',
  },
  {
    question: 'How is my information used?',
    answer: 'Your answers are used to generate your result. Read the privacy policy for details about what is stored, how it is used and how to request deletion.',
  },
]

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <PageHeader eyebrow="SOR7ED" title="Start with what helps" description="Core help is available without a paid membership." />

        <section aria-label="Membership options" className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col border border-white/20 bg-[#0b0b0b] p-6 sm:p-8">
            <h2 className="font-bebas text-3xl uppercase">Start free</h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-300">Read protocols, try tools and find one useful next step. Sign in when you want to save an item or connect WhatsApp.</p>
            <Link id="membership-explore-free" href="/tools" className="mt-6 inline-flex min-h-12 items-center justify-center bg-white px-6 py-3 text-base font-medium text-black transition-colors hover:bg-[#FFBA2E]">Explore the toolbox</Link>
          </div>
          <div className="flex flex-col border border-white/20 bg-[#0b0b0b] p-6 sm:p-8">
            <h2 className="font-bebas text-3xl uppercase">Plus membership</h2>
            <p className="mt-4 text-2xl text-[#FFBA2E]">£5.99 per month</p>
            <p className="mt-3 text-base leading-relaxed text-neutral-300">Membership is optional. Review the subscription details and the price shown in checkout before you decide.</p>
            <Link href="/r/upgrade" className="mt-6 inline-flex min-h-12 items-center justify-center border border-white/60 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white hover:text-black">Review Plus</Link>
          </div>
        </section>

        <section aria-labelledby="membership-questions" className="mt-14">
          <h2 id="membership-questions" className="font-bebas text-3xl uppercase sm:text-4xl">Questions</h2>
          <div className="mt-6 divide-y divide-white/15">
            {QUESTIONS.map((item) => (
              <div key={item.question} className="py-6">
                <h3 className="font-bebas text-2xl uppercase">{item.question}</h3>
                <p className="mt-3 text-base leading-relaxed text-neutral-300">{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6">
            <Link href="/contact" className="inline-flex min-h-11 items-center text-base text-[#FFBA2E] underline">Contact SOR7ED</Link>
            <Link href="/privacy" className="inline-flex min-h-11 items-center text-base text-[#FFBA2E] underline">Privacy policy</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

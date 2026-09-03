import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Membership — Planet Sorted',
  description:
    'Save your results, revisit previous work and keep useful steps together. Compare free and membership.',
}

const FAQ = [
  {
    q: 'What can I use for free?',
    a: 'You can use all core tools — including the Task Breakdown Wizard and ADHD Tax Calculator — without a membership. Results are delivered to your WhatsApp and shown on screen.',
  },
  {
    q: 'Do I need WhatsApp?',
    a: 'Yes. Planet Sorted delivers your results via WhatsApp so you can find them again without logging in. You connect your WhatsApp number once, on first use. A standard UK or international number works — no special app is needed.',
  },
  {
    q: 'What happens at my usage limit?',
    a: '[TBD — to be filled before launch. Free tier limits will be stated here concretely.]',
  },
  {
    q: 'How do I cancel?',
    a: '[TBD — cancellation method and notice period to be stated here before launch.]',
  },
  {
    q: 'What happens to saved results after cancellation?',
    a: '[TBD — data retention policy for membership results to be confirmed before launch.]',
  },
  {
    q: 'How is my information used?',
    a: 'Your answers are used to generate your result. We store the minimum needed to deliver it and improve the tools. We do not sell your data. Full details in our privacy policy.',
  },
  {
    q: 'What kind of support does Planet Sorted provide?',
    a: 'Planet Sorted is a self-guided toolset. It is not a medical, psychiatric, clinical, legal or financial service, and it is not a crisis service. If you need urgent help, call 999 or text SHOUT to 85258.',
  },
]

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-5 pt-20 pb-28 sm:pt-28">

        {/* Header */}
        <div className="mb-16 text-center">
          <span className="sor7ed-pill">Membership</span>
          <h1 className="mt-5 font-bebas text-4xl uppercase leading-[1.15] tracking-normal text-white sm:text-5xl lg:text-6xl">
            Keep track of what helps.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-400">
            Save your results, revisit previous work and keep useful steps together.
          </p>
        </div>

        {/* Comparison table */}
        <section className="mb-20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 pr-6 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Question
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-medium uppercase tracking-widest text-neutral-300">
                    Free
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-medium uppercase tracking-widest text-[#F5C518]">
                    Membership
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {[
                  {
                    q: 'Which tools can I use?',
                    free: 'Core tools (Task Breakdown Wizard, ADHD Tax Calculator)',
                    member: '[TBD — full tool list to be confirmed before launch]',
                  },
                  {
                    q: 'How often can I use them?',
                    free: '[TBD — free tier usage limit to be stated here]',
                    member: '[TBD — membership usage limit to be stated here]',
                  },
                  {
                    q: 'Can I save and revisit results?',
                    free: 'No',
                    member: 'Yes — results saved to your account',
                  },
                  {
                    q: 'Can I compare or export results?',
                    free: 'No',
                    member: '[TBD — export/compare feature to be confirmed]',
                  },
                  {
                    q: 'What does support include?',
                    free: 'Self-service (tools + WhatsApp delivery)',
                    member: '[TBD — membership support description to be confirmed]',
                  },
                ].map((row) => (
                  <tr key={row.q}>
                    <td className="py-4 pr-6 text-neutral-300">{row.q}</td>
                    <td className="px-4 py-4 text-center text-neutral-400">{row.free}</td>
                    <td className="px-4 py-4 text-center text-white">{row.member}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Use-case examples */}
        <section className="mb-20">
          <h2 className="mb-6 font-bebas text-2xl uppercase tracking-normal text-white sm:text-3xl">
            What membership makes possible
          </h2>
          <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
            Labelled examples — not a guarantee of specific features
          </p>
          <ul className="space-y-4">
            {[
              'Return to a previous plan when you\'re ready to pick the task up again.',
              'Find previous outputs without scrolling back through your WhatsApp thread.',
            ].map((example) => (
              <li key={example} className="flex gap-3 text-sm leading-relaxed text-neutral-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5C518]" />
                {example}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <h2 className="mb-8 font-bebas text-2xl uppercase tracking-normal text-white sm:text-3xl">
            Questions
          </h2>
          <div className="space-y-8">
            {FAQ.map((item) => (
              <div key={item.q} className="border-t border-white/8 pt-6">
                <h3 className="mb-3 text-sm font-semibold text-white">{item.q}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <div className="text-center">
          <p className="mb-6 text-sm leading-relaxed text-neutral-400">
            Start with a free tool and see whether it helps.
          </p>
          <Link
            id="membership-explore-free"
            href="/start"
            className="inline-block rounded-lg bg-[#F5C518] px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-black transition-opacity hover:opacity-90"
          >
            Explore free tools
          </Link>
        </div>

      </div>
    </div>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Planet Sorted',
  description: 'Clean and practical terms of service for Planet Sorted and Sorted Lab.',
}

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-12 text-neutral-300">
      <h1 className="mb-6 font-bebas text-5xl uppercase tracking-tight text-white sm:text-6xl">Terms of Service</h1>
      <p className="mb-8 text-sm text-neutral-500">Last updated: August 2026</p>

      <p className="mb-6 text-lg leading-relaxed text-neutral-300">
        Welcome to SOR7ED. These terms define how you may use our educational tools, templates, and protocols at planetsorted.com.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">Educational Tools, Not Professional Advice</h2>
      <p>
        SOR7ED provides educational templates, tools, checklists, and practical protocols. <strong>None of our content is medical, clinical, legal, or financial advice.</strong> It is not a substitute for professional diagnosis, therapy, or treatment.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">Emergency & Crisis Services Disclaimer</h2>
      <p>
        <strong>SOR7ED is not a crisis service.</strong> We cannot provide clinical assessment or human support if you are in distress.
      </p>
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm my-4">
        <p className="font-medium mb-1">If you are in immediate danger or need to talk to someone right now:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>In the UK: Call <strong>999</strong> for emergency services.</li>
          <li>For immediate mental health support: Text <strong>SHOUT to 85258</strong> (free, 24/7).</li>
          <li>To talk to someone at Samaritans: Call <strong>116 123</strong> (free, 24/7).</li>
        </ul>
      </div>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">Acceptable Use</h2>
      <p>
        Our tools are designed to help neurodivergent brains manage day-to-day chaos. You may use them for personal, non-commercial purposes. You agree not to use our WhatsApp webhook to send spam, scripts, automated bot messages, or abusive content.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">Warranties & Liability</h2>
      <p>
        We build our protocols to be practical and helpful, but we provide them &quot;as is&quot; without any warranty of accuracy or completeness. We are not liable for decisions, outcomes, or financial calculations resulting from your use of Sorted Lab.
      </p>

      <p className="mt-10 text-sm text-neutral-500">
        If you have questions about these terms, contact us at <a href="mailto:hello@planetsorted.com" className="text-[#C6A052] underline">hello@planetsorted.com</a>.
      </p>
    </article>
  )
}

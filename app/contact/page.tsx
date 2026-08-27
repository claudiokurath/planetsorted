import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Contact — Planet Sorted',
  description: 'Get in touch with Planet Sorted.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <PageHeader eyebrow="SOR7ED" title="Contact us" description="Real help from real people. No chatbot, no bureaucracy." />
        <div className="mt-8 space-y-6 text-base sm:text-lg leading-relaxed text-neutral-300">
          <p>
            Have a question, feedback, or need help with your account? Reach out to us directly — no chatbot, no bureaucracy.
          </p>
          <div className="space-y-3 rounded-2xl border border-white/[0.09] bg-[#090B0F] p-6">
            <h2 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Get in Touch
            </h2>
            <p className="text-base text-neutral-300">
              Email: <a href="mailto:hello@planetsorted.com" className="font-semibold text-[#1FD7CF] underline">hello@planetsorted.com</a>
            </p>
            <p className="text-base text-neutral-300">
              WhatsApp: <a href="https://wa.me/447591922247" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1FD7CF] underline">+44 7591 922247</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

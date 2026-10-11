import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Contact — PLANET SOR7ED',
  description: 'Contact SOR7ED with questions, feedback or help with your account.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <PageHeader eyebrow="SOR7ED" title="Contact us" description="Questions, feedback or help with your account." />
        <div className="mt-8 space-y-6 text-base sm:text-lg leading-relaxed text-neutral-300">
          <p>
            Have a question or something to share? Use the contact details below.
          </p>
          <div className="space-y-3 rounded-none border border-white/[0.12] bg-black p-6">
            <h2 className="text-3xl font-normal uppercase text-white" style={{ fontFamily: "var(--font-anton), Oswald, sans-serif" }}>
              Get in Touch
            </h2>
            <p className="text-base text-neutral-300">
              Email: <a href="mailto:hello@planetsorted.com" className="inline-flex min-h-11 items-center break-all font-medium text-[#FFBA2E] underline">hello@planetsorted.com</a>
            </p>
            <p className="text-base text-neutral-300">
              WhatsApp: <a href="https://wa.me/447591922247" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-medium text-[#FFBA2E] underline">+44 7591 922247<span className="sr-only"> (opens WhatsApp)</span></a>
            </p>
            <p className="text-base text-neutral-400">Tools run on the website. Use the SOR7ED button on an item to receive it on your own WhatsApp.</p>
          </div>
          <p className="text-base text-neutral-300">
            For quick answers, visit our <Link href="/faq" className="inline-flex min-h-11 items-center text-[#FFBA2E] underline">FAQ</Link>. You can connect your WhatsApp number in <Link href="/dashboard?tab=settings" className="inline-flex min-h-11 items-center text-[#FFBA2E] underline">account settings</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

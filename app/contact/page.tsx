import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Planet Sorted',
  description: 'Get in touch with Planet Sorted.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase text-white tracking-tight leading-[0.95]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Contact Us
        </h1>
        <div className="mt-8 space-y-6 text-base sm:text-lg leading-relaxed text-neutral-300">
          <p>
            Have a question, feedback, or need help with your account? Reach out to us directly — no chatbot, no bureaucracy.
          </p>
          <div className="rounded-2xl border border-neutral-800 bg-black p-6 space-y-3">
            <h2 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Get in Touch
            </h2>
            <p className="text-base text-neutral-300">
              Email: <a href="mailto:hello@planetsorted.com" className="text-[#C0392B] underline font-semibold">hello@planetsorted.com</a>
            </p>
            <p className="text-base text-neutral-300">
              WhatsApp: <a href="https://wa.me/447591922247" target="_blank" rel="noopener noreferrer" className="text-[#C0392B] underline font-semibold">+44 7591 922247</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Planet Sorted',
  description: 'How we collect, store, and protect your personal data in plain English.',
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-12 text-neutral-300">
      <h1 className="mb-6 font-bebas text-5xl uppercase tracking-tight text-white sm:text-6xl">Privacy Policy</h1>
      <p className="mb-8 text-sm text-neutral-500">Last updated: August 2026</p>

      <p className="mb-6 text-lg leading-relaxed text-neutral-300">
        We believe privacy policies should be written in plain English, not legalese. Here is exactly how we handle your data, what we collect, and why.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">Who we are</h2>
      <p>
        planetsorted.com is operated by <strong>SOR7ED LIMITED</strong> (trading as SOR7ED), a company registered in England and Wales (Company Number: 16398701).
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">What we collect & why</h2>
      <p>We only collect data that is strictly necessary to run your account and deliver your protocols:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li><strong>Email address:</strong> Used exclusively to send you secure passwordless sign-in links (magic links) and system updates.</li>
        <li><strong>First name:</strong> Used to personalize your dashboard and WhatsApp notifications.</li>
        <li><strong>WhatsApp number:</strong> Used only if you opt in to verify your phone. This enables you to send commands to save articles, run templates, or receive Tuesday broadcasts.</li>
      </ul>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">Consent & WhatsApp</h2>
      <p>
        We only message you on WhatsApp if you explicitly initiate a request (like texting a save trigger or request code) or if you opt in to our Tuesday morning broadcasts. You can unsubscribe from everything at any time by texting <strong>STOP</strong>, or unsubscribe from just the weekly broadcasts by texting <strong>STOPWEEKLY</strong>.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">How we store data</h2>
      <p>
        Your personal data and saved library items are stored securely on Supabase servers located within the UK/EU.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">We never sell or share your data</h2>
      <p>
        We do not sell, rent, or share your data with advertisers or third parties. We keep things clean, simple, and private.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">Your rights & GDPR Deletion</h2>
      <p>
        You have the right to access your data or delete it at any time. We support instant, complete deletion. You can click <strong>Permanently Delete My Account</strong> directly inside your dashboard settings. This instantly purges all of your settings, library cards, credits, and linked contact profiles from our database.
      </p>

      <p className="mt-10 text-sm text-neutral-500">
        If you have any questions about this policy, drop us an email at <a href="mailto:hello@planetsorted.com" className="text-[#C6A052] underline">hello@planetsorted.com</a>.
      </p>
    </article>
  )
}

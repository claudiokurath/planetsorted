import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Planet Sorted',
  description: 'Simple and transparent details on cookie usage on Planet Sorted.',
}

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-12 text-neutral-300">
      <h1 className="mb-6 font-bebas text-5xl font-extralight uppercase tracking-normal text-white sm:text-6xl">Cookie Policy</h1>
      <p className="mb-8 text-sm text-neutral-500">Last updated: August 2026</p>

      <p className="mb-6 text-lg leading-relaxed text-neutral-300">
        We believe in keeping things simple, fast, and secure. That applies to how we use cookies, too.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">Only Strictly Necessary Cookies</h2>
      <p>
        SOR7ED only uses <strong>strictly necessary session cookies</strong>. These are required to keep you securely signed in to your dashboard using your magic link. Without these cookies, the site would not be able to remember your login session as you navigate between pages.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">No Third-Party Tracking or Ads</h2>
      <p>
        We do not use analytics cookies, advertising cookies, retargeting pixels, or third-party tracking services. Your browsing activity on this site is not tracked or shared.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-medium text-white">Why there is no Cookie Banner</h2>
      <p>
        Because we only use cookies that are strictly necessary for the operation of the service (under GDPR and PECR rules), we are not legally required to show a cookie consent banner. We prefer to keep your screen clean and clutter-free.
      </p>

      <p className="mt-10 text-sm text-neutral-500">
        If you have any questions, feel free to email us at <a href="mailto:hello@planetsorted.com" className="text-[#C6A052] underline">hello@planetsorted.com</a>.
      </p>
    </article>
  )
}

import Link from 'next/link'

export const metadata = {
  title: 'Upgrade Cancelled — Planet Sorted',
  description: 'You remain on the free tier.',
}

export default function UpgradeCancelledPage() {
  const disclaimer = `Planet Sorted provides educational information, templates, and practical tools. It is not medical, clinical, legal, or financial advice, and not a substitute for professional support. It is not a crisis service. If you are in immediate danger in the UK, call 999. If you are at risk of harming yourself, text SHOUT to 85258.`

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center space-y-8 font-sans">
      <div className="space-y-3">
        <div className="text-4xl">🕊️</div>
        <h1 className="text-3xl font-extrabold text-white font-sans">No problem.</h1>
        <p className="text-sm text-neutral-300 leading-relaxed">
          You&apos;re still on the free tier. You can upgrade any time from your dashboard — no pressure.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-block w-full rounded-full border border-neutral-700 py-3 font-semibold text-neutral-200 hover:bg-neutral-900 transition-colors"
      >
        Return to My Dashboard
      </Link>

      <p className="text-xs text-neutral-500 leading-normal text-left border-t border-neutral-800 pt-6">
        {disclaimer}
      </p>
    </div>
  )
}

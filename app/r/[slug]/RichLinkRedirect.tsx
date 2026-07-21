'use client'

import { useEffect } from 'react'

export function RichLinkRedirect({ targetUrl }: { targetUrl: string }) {
  useEffect(() => {
    window.location.replace(targetUrl)
  }, [targetUrl])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-gray-600">Taking you there…</p>
      <a href={targetUrl} className="text-sm text-green-600 underline">
        Click here if you aren&apos;t redirected automatically
      </a>
    </div>
  )
}

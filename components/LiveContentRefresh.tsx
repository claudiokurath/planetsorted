'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** An open catalogue also notices publication changes without a manual reload. */
export function LiveContentRefresh() {
  const router = useRouter()
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') router.refresh() }
    const timer = window.setInterval(refresh, 30_000)
    window.addEventListener('focus', refresh)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [router])
  return null
}

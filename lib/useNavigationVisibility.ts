'use client'

import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true })
  return () => window.removeEventListener('scroll', onChange)
}

function getSnapshot() {
  return window.scrollY > 80
}

function getServerSnapshot() {
  return false
}

/** Keep the homepage entrance clear; other pages retain their navigation. */
export function useNavigationVisibility(pathname: string | null) {
  const hasScrolled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return pathname !== '/' || hasScrolled
}

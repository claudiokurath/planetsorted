'use client'

import { useEffect, useState } from 'react'

type InstallEvent = Event & {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function AppInstall() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  useEffect(() => {
    const display = window.matchMedia('(display-mode: standalone)')
    const update = () => setInstalled(display.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    const available = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent) }
    const complete = () => { setInstalled(true); setPrompt(null) }
    update()
    window.addEventListener('beforeinstallprompt', available)
    window.addEventListener('appinstalled', complete)
    display.addEventListener('change', update)
    return () => {
      window.removeEventListener('beforeinstallprompt', available)
      window.removeEventListener('appinstalled', complete)
      display.removeEventListener('change', update)
    }
  }, [])
  async function install() {
    if (!prompt) return
    const current = prompt
    setPrompt(null)
    try { await current.prompt(); if ((await current.userChoice).outcome === 'accepted') setInstalled(true) }
    catch { /* Manual installation instructions remain available below. */ }
  }
  return <>
    {installed ? <p role="status" className="mt-6 text-[#FFD400]">SOR7ED is ready to open as an app.</p> : prompt ? <button type="button" onClick={() => void install()} className="mt-6 min-h-12 bg-[#FFD400] px-6 py-3 text-black">Add SOR7ED to your phone</button> : null}
    <div className="mt-8 grid gap-8 text-left sm:grid-cols-2">
      <section><h2 className="text-xl text-[#FFD400]">iPhone</h2><p className="mt-3 leading-7">Open planetsorted.com in Safari. Tap Share, choose Add to Home Screen, then tap Add. Open SOR7ED using the new scribble icon.</p></section>
      <section><h2 className="text-xl text-[#FFD400]">Android</h2><p className="mt-3 leading-7">Open planetsorted.com in Chrome. Open the browser menu and choose Install app or Add to Home screen. Open SOR7ED using the new scribble icon.</p></section>
    </div>
  </>
}

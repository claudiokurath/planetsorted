'use client'

import { useState } from 'react'
import { reserveWhatsAppWindow } from '@/lib/whatsapp/window'

export function WhatsAppWindowLink({ url, className }: { url: string; className?: string }) {
  const [error, setError] = useState('')
  function open() {
    setError('')
    const handoff = reserveWhatsAppWindow(window)
    try {
      if (!handoff.open(url)) setError('Your browser blocked the WhatsApp window. Allow pop-ups for planetsorted.com, then try again. Your place here is saved.')
    } catch { setError('Could not open WhatsApp. Please try again.') }
    finally { handoff.close() }
  }
  return <>
    <button type="button" className={className} onClick={open}>Open WhatsApp in another window →</button>
    {error ? <p role="alert">{error}</p> : null}
  </>
}

type WindowHost = {
  open: (url: string, target: string, features: string) => {
    opener: unknown
    location: { replace: (url: string) => void }
    close: () => void
  } | null
}

export function whatsappWindowUrl(raw: string): string {
  const url = new URL(raw)
  const allowed = url.hostname === 'wa.me' && /^\/\d{7,15}\/?$/.test(url.pathname)
    || url.hostname === 'web.whatsapp.com' && url.pathname === '/' && !url.search
  if (url.protocol !== 'https:' || url.port || url.username || url.password || !allowed) {
    throw new Error('This WhatsApp link is invalid. Please try again.')
  }
  return url.href
}

/** Reserve during the click, before awaiting the delivery request. */
export function reserveWhatsAppWindow(host: WindowHost) {
  const child = host.open('about:blank', '_blank', 'popup=yes,width=760,height=800,resizable=yes,scrollbars=yes')
  let navigated = false
  if (child) child.opener = null
  return {
    open(raw: string): boolean {
      const url = whatsappWindowUrl(raw)
      if (!child) return false
      child.location.replace(url)
      navigated = true
      return true
    },
    close() { if (child && !navigated) child.close() },
  }
}

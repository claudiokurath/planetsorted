import type { WhatsAppDeliveryResult } from '@/lib/whatsapp/deliveryClient'

export const BUTTON_ORIGIN = 'https://www.sor7ed.com'
export function buttonSaveUrl(slug: string, context: 'article' | 'tool', actionId: string, origin: string): string {
  const url = new URL('/save', BUTTON_ORIGIN)
  url.search = new URLSearchParams({ source: 'planet-sorted', slug, context, flowId: actionId, openerOrigin: origin }).toString()
  return url.href
}

/** The popup owns authentication, saving, sending and status checks. The public
 * website receives feedback only; no account cookie or member data crosses over. */
export function requestButtonResource(slug: string, context: 'article' | 'tool', actionId: string): Promise<WhatsAppDeliveryResult> {
  const url = buttonSaveUrl(slug, context, actionId, location.origin)
  const popup = window.open(url, `sorted-resource-${actionId}`, 'popup,width=460,height=720')
  if (!popup) {
    // A direct navigation works in restrictive mobile/in-app browsers. It never
    // claims success or animates the mark before a confirmed send.
    location.assign(url)
    return new Promise(() => {})
  }
  return new Promise((resolve, reject) => {
    let finished = false
    const cleanup = () => { finished = true; window.removeEventListener('message', receive); clearInterval(closed); clearTimeout(timeout) }
    const receive = (event: MessageEvent) => {
      const value = event.data
      if (event.origin !== BUTTON_ORIGIN || event.source !== popup || !value || value.source !== 'sor7ed-widget' || value.flowId !== actionId || !['saved', 'save-status'].includes(value.type)) return
      if (!['accepted', 'failed', 'skipped', 'unknown'].includes(value.deliveryStatus)) return
      cleanup()
      resolve({ success: value.deliveryStatus === 'accepted', actionId, saveStatus: 'saved', deliveryStatus: value.deliveryStatus, deliveryReason: null })
    }
    const closed = setInterval(() => {
      if (!finished && popup.closed) { cleanup(); reject(new Error('The Button window closed. Tap again to check the same request.')) }
    }, 500)
    const timeout = setTimeout(() => { cleanup(); reject(new Error('Your Button window is still available. Finish there, or tap again to check the same request.')) }, 10 * 60 * 1000)
    window.addEventListener('message', receive)
  })
}

/** The user must press Send in WhatsApp; opening this link never sends a message. */
export function websiteReplyLink(actionId) {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER?.replace(/\D/g, '')
  const phone = configured && /^\d{10,15}$/.test(configured) ? configured : '447591922247'
  return `https://wa.me/${phone}?${new URLSearchParams({text:`GET IT SORTED ${actionId}`})}`
}
export function isWebsiteReplyLink(value) {
  if (typeof value !== 'string') return false
  try { const url=new URL(value); return url.protocol==='https:' && url.hostname==='wa.me' && /^\/\d{10,15}$/.test(url.pathname) && !url.username && !url.password } catch { return false }
}

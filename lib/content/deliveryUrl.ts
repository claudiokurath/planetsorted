type DeliveryContent = {
  slug: string
  type?: string | null
  gammaUrl?: string | null
}

export function getContentDeliveryUrl(
  site: string,
  content: DeliveryContent
): string {
  return `${site.replace(/\/$/, '')}/r/${content.slug}`
}

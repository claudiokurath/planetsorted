type DeliveryContent = {
  slug: string
  type?: string | null
  gammaUrl?: string | null
}

export function getContentDeliveryUrl(
  site: string,
  content: DeliveryContent
): string {
  const gammaUrl = content.gammaUrl?.trim()

  if (content.type === 'Article' && gammaUrl && /^https:\/\//i.test(gammaUrl)) {
    return gammaUrl
  }

  return `${site.replace(/\/$/, '')}/r/${content.slug}`
}

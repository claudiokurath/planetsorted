/** One canonical, direct-send intent across preview, signup and connection. */
export function contentDeliveryRequest(slug: string, context: 'article' | 'tool') {
  return { slug, context, includeLink: true, includeProtocol: false }
}

/** One canonical intent across preview, signup, connection and retry. */
export function contentDeliveryRequest(slug: string, context: 'article' | 'tool') {
  return { slug, context, includeLink: true, includeProtocol: context === 'article' && slug !== 'financial-avoidance-trauma-response', viaWhatsAppReply: true }
}

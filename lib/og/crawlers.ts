/**
 * Detect social / chat crawlers that only need OG metadata.
 * Used by /r/[slug] so WhatsApp scrapes this page's sharp image-proxy OG tags
 * instead of following the 307 to a destination with a low-res cover.
 */
const CRAWLER_UA =
  /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|Applebot|bingbot|Googlebot|preview|Embedly|Quora Link Preview|Showyoubot|outbrain|vkShare|W3C_Validator|redditbot|Pinterest|BitlyBot/i

export function isOgCrawler(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return CRAWLER_UA.test(userAgent)
}

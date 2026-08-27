function stripLinksAndFormatting(text: string): string {
  return text
    .replace(/\[([^\]]+)]\(https?:\/\/[^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function extractArticlePreview(body: string, fallback = ''): string {
  const tldrHeading = /(?:^|\n)#{1,6}\s*TL\s*;?\s*DR\s*:?\s*(?:\n|$)/i
  const headingMatch = tldrHeading.exec(body)

  if (!headingMatch) return stripLinksAndFormatting(fallback)

  const remainder = body.slice(headingMatch.index + headingMatch[0].length)
  const nextHeadingIndex = remainder.search(/\n#{1,6}\s+/)
  const preview = nextHeadingIndex >= 0 ? remainder.slice(0, nextHeadingIndex) : remainder

  return stripLinksAndFormatting(preview) || stripLinksAndFormatting(fallback)
}

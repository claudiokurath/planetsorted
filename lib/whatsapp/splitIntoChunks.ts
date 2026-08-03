export function splitIntoChunks(text: string, limit: number = 3500): string[] {
  if (text.length <= limit) return [text]
  const lines = text.split('\n')
  const chunks: string[] = []
  let currentChunk = ''

  for (const line of lines) {
    if ((currentChunk ? currentChunk.length + 1 + line.length : line.length) > limit) {
      if (currentChunk) {
        chunks.push(currentChunk)
        currentChunk = ''
      }
      if (line.length > limit) {
        let remaining = line
        while (remaining.length > limit) {
          chunks.push(remaining.slice(0, limit))
          remaining = remaining.slice(limit)
        }
        currentChunk = remaining
      } else {
        currentChunk = line
      }
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n${line}` : line
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks
}

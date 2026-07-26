let cachedFont: ArrayBuffer | null = null
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,'\"-—?!&:/"

export async function loadGoogleFont(weight = 900): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(CHARSET)}`
  const css = await (await fetch(url)).text()
  const match = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)
  if (!match) throw new Error('Font CSS parse failed')
  const res = await fetch(match[1])
  if (!res.ok) throw new Error('Font fetch failed')
  cachedFont = await res.arrayBuffer()
  return cachedFont
}

import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

/** Public brand artwork only: no recipient, token or content data. */
export async function GET() {
  const mark = await readFile(join(process.cwd(), 'public/images/tangle-white.png'))
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#000000' }}>
      {/* The source includes transparent padding around the original mark. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/png;base64,${mark.toString('base64')}`} alt="" width={480} height={480} />
    </div>,
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400' } },
  )
}

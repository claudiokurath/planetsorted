import { ImageResponse } from 'next/og'
import { loadGoogleFont } from '@/lib/loadFont'

export const runtime = 'edge'

const CARDS: Record<string, { heading: string; sub: string }> = {
  welcome: {
    heading: 'TEXT A WORD.\nGET A PROTOCOL.',
    sub: 'No app. No spam. Just what works.',
  },
  goodbye: {
    heading: "YOU'RE PAUSED.",
    sub: 'Text START any time to come back.',
  },
}

function isTrustedImageHost(rawUrl: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return false
  }
  if (parsed.protocol !== 'https:') return false

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null
  return parsed.hostname === supabaseHost
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawImageUrl = searchParams.get('image')
  const imageUrl = rawImageUrl && isTrustedImageHost(rawImageUrl) ? rawImageUrl : null
  const title = searchParams.get('title')
  const description = searchParams.get('description')

  // Named tool card — generated from title + description params
  if (title && !imageUrl) {
    let fontData: ArrayBuffer | undefined
    try { fontData = await loadGoogleFont() } catch {}

    return new ImageResponse(
      (
        <div
          style={{
            background: '#000000',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '72px',
            boxSizing: 'border-box',
            fontFamily: fontData ? 'Jost' : 'sans-serif',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          <div style={{ color: '#C6A052', fontSize: 22, fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 24 }}>SOR7ED</div>
          <div style={{ color: '#FFFFFF', fontSize: 72, fontWeight: 300, textTransform: 'uppercase', lineHeight: 1.05, marginBottom: 28 }}>{title}</div>
          {description && (
            <div style={{ color: '#8A8A8A', fontSize: 30, fontWeight: 400, lineHeight: 1.4, maxWidth: 900 }}>{description}</div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        ...(fontData ? { fonts: [{ name: 'Jost', data: fontData, style: 'normal', weight: 300 }] } : {}),
      }
    )
  }

  if (imageUrl) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#000000' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  const card = CARDS[searchParams.get('card') ?? 'welcome'] ?? CARDS.welcome

  let fontData: ArrayBuffer | undefined
  try {
    fontData = await loadGoogleFont()
  } catch (err) {
    console.error('Failed to load font:', err)
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          border: '1px solid rgba(255,255,255,0.14)',
          boxSizing: 'border-box',
          fontFamily: fontData ? 'Jost' : 'sans-serif',
        }}
      >
        <div
          style={{
            color: '#C6A052',
            fontSize: 28,
            fontWeight: 300,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}
        >
          PLANET SOR7ED
        </div>
        <div
          style={{
            color: '#FFFFFF',
            fontSize: 80,
            fontWeight: 300,
            textTransform: 'uppercase',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            lineHeight: 1.15,
          }}
        >
          {card.heading}
        </div>
        <div
          style={{
            color: '#8A8A8A',
            fontSize: 32,
            marginTop: 32,
            textAlign: 'center',
            fontWeight: 400,
          }}
        >
          {card.sub}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fontData
        ? {
            fonts: [
              {
                name: 'Jost',
                data: fontData,
                style: 'normal',
                weight: 300,
              },
            ],
          }
        : {}),
    }
  )
}

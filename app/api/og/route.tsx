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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const imageUrl = searchParams.get('image')

  if (imageUrl) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#0D0D0D' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
          background: '#FAF7F2',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          border: '18px solid #1A1A1A',
          boxSizing: 'border-box',
          fontFamily: fontData ? 'Inter' : 'sans-serif',
        }}
      >
        <div
          style={{
            color: '#C0392B',
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}
        >
          PLANET SORTED
        </div>
        <div
          style={{
            color: '#1A1A1A',
            fontSize: 80,
            fontWeight: 900,
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
            color: '#4A4A4A',
            fontSize: 32,
            marginTop: 32,
            textAlign: 'center',
            fontWeight: 600,
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
                name: 'Inter',
                data: fontData,
                style: 'normal',
                weight: 900,
              },
            ],
          }
        : {}),
    }
  )
}

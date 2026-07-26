import { ImageResponse } from 'next/og'

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
  const card = CARDS[searchParams.get('card') ?? 'welcome'] ?? CARDS.welcome

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
          padding: '80px',
          border: '24px solid #1A1A1A',
        }}
      >
        <div
          style={{
            color: '#C0392B',
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 40,
          }}
        >
          PLANET SORTED
        </div>
        <div
          style={{
            color: '#1A1A1A',
            fontSize: 96,
            fontWeight: 900,
            textTransform: 'uppercase',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            lineHeight: 1.1,
          }}
        >
          {card.heading}
        </div>
        <div
          style={{
            color: '#555555',
            fontSize: 36,
            marginTop: 40,
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {card.sub}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

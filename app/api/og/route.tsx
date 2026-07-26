import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const CARDS: Record<string, { heading: string; sub: string }> = {
  welcome: {
    heading: 'Text a word.\nGet a protocol.',
    sub: 'No app. No spam. Just what works.',
  },
  goodbye: {
    heading: "You're paused.",
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
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            color: '#C0392B',
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          PLANET SORTED
        </div>
        <div
          style={{
            color: '#fff',
            fontSize: 64,
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
            color: '#999',
            fontSize: 26,
            marginTop: 24,
            textAlign: 'center',
          }}
        >
          {card.sub}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

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
            fontFamily: fontData ? 'Inter' : 'sans-serif',
            borderLeft: '14px solid #F5C518',
          }}
        >
          <div style={{ color: '#F5C518', fontSize: 22, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 24 }}>PLANET SOR7ED</div>
          <div style={{ color: '#FFFFFF', fontSize: 72, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.05, marginBottom: 28 }}>{title}</div>
          {description && (
            <div style={{ color: '#94A3B8', fontSize: 30, fontWeight: 500, lineHeight: 1.4, maxWidth: 900 }}>{description}</div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        ...(fontData ? { fonts: [{ name: 'Inter', data: fontData, style: 'normal', weight: 900 }] } : {}),
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
          border: '18px solid #C0392B',
          boxSizing: 'border-box',
          fontFamily: fontData ? 'Inter' : 'sans-serif',
        }}
      >
        <div
          style={{
            color: '#F5C518',
            fontSize: 28,
            fontWeight: 900,
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
            color: '#94A3B8',
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

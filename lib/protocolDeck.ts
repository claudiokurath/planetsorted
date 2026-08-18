/**
 * Parse guidebook body + protocol text into presentation "slides"
 * matching the SOR7ED info-sheet visual language (black + accent cards).
 */

export type DeckBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'cards'; items: { title: string; body: string }[] }
  | { kind: 'list'; items: string[] }
  | { kind: 'callout'; text: string }
  | { kind: 'stats'; items: { value: string; label: string; detail?: string }[] }

export interface DeckSlide {
  /** e.g. "STEP 0", "01", "PROTOCOL" */
  badge?: string
  title: string
  /** Optional muted half of a split title like "PICK THE EXIT (NOT VILLAIN…)" */
  titleMuted?: string
  blocks: DeckBlock[]
}

export interface ProtocolDeckData {
  title: string
  lede?: string
  category?: string | null
  readTime?: string | null
  coverImage?: string | null
  slides: DeckSlide[]
  protocolSlide?: DeckSlide | null
}

const STEP_HEADING =
  /^(STEP\s*\d+|0\d|\d{1,2})\s*[:.\-–—)]?\s*(.+)$/i
const BOTTOM_LINE = /^(THE\s+)?BOTTOM\s+LINE$/i
const PROTOCOL_HEADING = /^(THE\s+)?(STEP[- ]BY[- ]STEP\s+)?PROTOCOL/i

function cleanMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '• ')
    .replace(/\r\n/g, '\n')
    .trim()
}

function isAllCapsHeading(line: string): boolean {
  const t = line.trim()
  if (t.length < 4 || t.length > 90) return false
  if (!/[A-Z]/.test(t)) return false
  // Mostly uppercase letters (allow digits, punctuation, spaces)
  const letters = t.replace(/[^A-Za-z]/g, '')
  if (letters.length < 3) return false
  const upper = letters.replace(/[^A-Z]/g, '').length
  return upper / letters.length >= 0.85 && !t.endsWith('.')
}

function splitTitle(raw: string): { title: string; titleMuted?: string } {
  const m = raw.match(/^(.+?)\s*[\(（]\s*(.+?)\s*[\)）]\s*$/)
  if (m) {
    return { title: m[1].trim(), titleMuted: `(${m[2].trim()})` }
  }
  return { title: raw.trim() }
}

/** Split a section body into cards when it has short ALL-CAPS subheads. */
function bodyToBlocks(body: string): DeckBlock[] {
  const text = cleanMarkdown(body)
  if (!text) return []

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return []

  // Bullet-heavy list
  const bulletLines = lines.filter((l) => /^[•\-\*]\s+/.test(l) || /^\d+[.)]\s+/.test(l))
  if (bulletLines.length >= 3 && bulletLines.length >= lines.length * 0.6) {
    return [
      {
        kind: 'list',
        items: lines.map((l) => l.replace(/^[•\-\*]\s+/, '').replace(/^\d+[.)]\s+/, '').trim()),
      },
    ]
  }

  // Detect ALL-CAPS mini-headings → cards
  const cards: { title: string; body: string }[] = []
  let currentTitle = ''
  let currentBody: string[] = []
  const looseParas: string[] = []
  let sawCard = false

  const flushCard = () => {
    if (currentTitle) {
      cards.push({ title: currentTitle, body: currentBody.join(' ').trim() })
      currentTitle = ''
      currentBody = []
    }
  }

  for (const line of lines) {
    if (isAllCapsHeading(line) && line.length < 70) {
      sawCard = true
      flushCard()
      currentTitle = line
      continue
    }
    if (currentTitle) {
      currentBody.push(line)
    } else {
      looseParas.push(line)
    }
  }
  flushCard()

  const blocks: DeckBlock[] = []

  if (looseParas.length) {
    // Last loose para often reads as a callout if short after cards
    const joined = looseParas.join('\n\n')
    if (sawCard && cards.length > 0 && joined.length < 280) {
      blocks.push({ kind: 'callout', text: joined })
    } else {
      blocks.push({ kind: 'paragraph', text: joined })
    }
  }

  if (cards.length >= 2) {
    blocks.push({ kind: 'cards', items: cards })
  } else if (cards.length === 1) {
    // Single "card" — treat as callout with title
    const c = cards[0]
    blocks.push({
      kind: 'callout',
      text: c.body ? `**${c.title}** — ${c.body}` : c.title,
    })
  }

  // Stats pattern: lines like "2 TRAP EXITS — detail"
  if (!sawCard && lines.length >= 3 && lines.length <= 6) {
    const statish = lines.every((l) => /^\d+\s+[A-Z]/.test(l) || /^[A-Z][A-Z\s]{3,}/.test(l))
    if (statish && lines.some((l) => /^\d+/.test(l))) {
      const items = lines.map((l) => {
        const m = l.match(/^(\d+)\s+([A-Z][A-Z\s\/\-]+?)(?:\s*[—–\-:]\s*(.+))?$/)
        if (m) return { value: m[1], label: m[2].trim(), detail: m[3]?.trim() }
        return { value: '', label: l, detail: undefined }
      })
      if (items.some((i) => i.value)) {
        return [{ kind: 'stats', items }]
      }
    }
  }

  if (blocks.length === 0) {
    return [{ kind: 'paragraph', text }]
  }
  return blocks
}

interface RawSection {
  heading?: string
  text: string
}

/** Section splitter — same spirit as the article page parser, exported for reuse. */
export function parseArticleSections(rawText: string, title?: string): RawSection[] {
  if (!rawText) return []

  let s = rawText
  if (title && s.toUpperCase().startsWith(title.toUpperCase())) {
    s = s.slice(title.length).trim()
  }

  // Only auto-promote sentence-trailing ALL-CAPS that look like real section
  // titles (STEP / PROTOCOL / BOTTOM LINE). Short labels like "VILLAIN DOOR"
  // must stay in the body so bodyToBlocks can render them as yellow kit cards.
  s = s.replace(/([\.!\?])\s*((?:STEP\s*\d+|THE\s+BOTTOM\s+LINE|BOTTOM\s+LINE|(?:THE\s+)?(?:STEP[- ]BY[- ]STEP\s+)?PROTOCOL)[^\n]{0,60})(?=\n|$)/gi, '$1\n\n===HEADING===$2\n\n')

  const rawBlocks = s.split('\n')
  const sections: RawSection[] = []
  let currentHeading = ''
  let currentParagraphs: string[] = []

  for (let line of rawBlocks) {
    line = line.trim()
    if (!line) continue

    const markdownHeading = line.match(/^#{1,6}\s+(.+)$/)

    if (markdownHeading) {
      // Flush previous section even if body is empty so STEP headings are kept
      if (currentHeading || currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
        currentParagraphs = []
      }
      currentHeading = markdownHeading[1].trim()
    } else if (line.startsWith('===HEADING===')) {
      if (currentHeading || currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
        currentParagraphs = []
      }
      currentHeading = line.replace('===HEADING===', '').trim()
    } else if (
      // Only promote ALL-CAPS lines that look like STEP / PROTOCOL / BOTTOM LINE
      // section titles — short labels like "VILLAIN DOOR" stay in the body so
      // bodyToBlocks can turn them into yellow kit cards inside the slide.
      line.length > 4 &&
      line.length < 80 &&
      isAllCapsHeading(line) &&
      !line.startsWith('---') &&
      (STEP_HEADING.test(line) || BOTTOM_LINE.test(line) || PROTOCOL_HEADING.test(line))
    ) {
      if (currentHeading || currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
        currentParagraphs = []
      }
      currentHeading = line
    } else {
      currentParagraphs.push(line)
    }
  }

  if (currentParagraphs.length > 0) {
    sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
  }

  return sections
}

function sectionToSlide(sec: RawSection, index: number): DeckSlide {
  const heading = (sec.heading || '').trim()
  const stepMatch = heading.match(STEP_HEADING)

  let badge: string | undefined
  let titleRaw = heading

  if (stepMatch) {
    const num = stepMatch[1].replace(/step\s*/i, '').trim()
    badge = num.match(/^\d+$/) ? `STEP ${num}` : stepMatch[1].toUpperCase()
    titleRaw = stepMatch[2].trim()
  } else if (BOTTOM_LINE.test(heading)) {
    badge = 'CLOSE'
    titleRaw = heading
  } else if (PROTOCOL_HEADING.test(heading)) {
    badge = 'PROTOCOL'
    titleRaw = heading
  } else if (heading) {
    badge = String(index + 1).padStart(2, '0')
  } else {
    badge = String(index + 1).padStart(2, '0')
    titleRaw = 'Overview'
  }

  const { title, titleMuted } = splitTitle(titleRaw || 'Overview')
  return {
    badge,
    title: title.toUpperCase(),
    titleMuted: titleMuted?.toUpperCase(),
    blocks: bodyToBlocks(sec.text),
  }
}

function protocolToSlide(protocolText: string): DeckSlide | null {
  const text = cleanMarkdown(protocolText)
  if (!text) return null

  const sections = parseArticleSections(text)
  // If protocol has its own steps, fold into one slide with list/cards from whole body
  if (sections.length > 1) {
    const items = sections.map((s, i) => {
      const h = s.heading || `Step ${i + 1}`
      const body = cleanMarkdown(s.text)
      return { title: h.toUpperCase(), body }
    })
    return {
      badge: 'PROTOCOL',
      title: 'THE STEP-BY-STEP PROTOCOL',
      blocks: [{ kind: 'cards', items }],
    }
  }

  // Numbered / bulleted steps
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const stepLines = lines.filter((l) => /^\d+[.)]\s+/.test(l) || /^[•\-\*]\s+/.test(l) || /^step\s*\d+/i.test(l))
  if (stepLines.length >= 2) {
    return {
      badge: 'PROTOCOL',
      title: 'THE STEP-BY-STEP PROTOCOL',
      blocks: [
        {
          kind: 'list',
          items: lines.map((l) =>
            l.replace(/^[•\-\*]\s+/, '').replace(/^\d+[.)]\s+/, '').replace(/^step\s*\d+\s*[:.\-–—)]?\s*/i, '').trim()
          ),
        },
      ],
    }
  }

  return {
    badge: 'PROTOCOL',
    title: 'THE STEP-BY-STEP PROTOCOL',
    blocks: [{ kind: 'paragraph', text }],
  }
}

export function buildProtocolDeck(input: {
  title: string
  lede?: string | null
  category?: string | null
  readTime?: string | null
  coverImage?: string | null
  body: string
  protocol?: string | null
}): ProtocolDeckData {
  const sections = parseArticleSections(input.body, input.title)
  const slides =
    sections.length > 0
      ? sections.map((sec, i) => sectionToSlide(sec, i))
      : input.body.trim()
        ? [
            {
              badge: '01',
              title: 'OVERVIEW',
              blocks: bodyToBlocks(input.body) as DeckBlock[],
            },
          ]
        : []

  return {
    title: input.title,
    lede: input.lede?.trim() || undefined,
    category: input.category,
    readTime: input.readTime,
    coverImage: input.coverImage,
    slides,
    protocolSlide: input.protocol ? protocolToSlide(input.protocol) : null,
  }
}

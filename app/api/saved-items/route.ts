import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export async function GET(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user: authUser, admin: supabase } = auth

  try {
    const { data: items, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', authUser.id)
      .order('saved_at', { ascending: false })

    if (error) {
      console.error('[Saved items fetch error]', error)
      return NextResponse.json({ error: 'Failed to fetch saved items' }, { status: 500 })
    }

    return NextResponse.json(items || [])
  } catch (err) {
    console.error('[Saved items API error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user: authUser, admin: supabase } = auth

  try {
    const body = await req.json()
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
    const context = body?.context === 'tool' || body?.context === 'article' ? body.context : null

    if (!slug || !/^[a-z0-9-]+$/.test(slug) || !context) {
      return NextResponse.json(
        { error: 'We could not identify the item to save.' },
        { status: 400 }
      )
    }

    const { data: content, error: contentError } = await supabase
      .from('protocols')
      .select('slug, title, category, type')
      .eq('slug', slug)
      .eq('status', 'Published')
      .single()

    const expectedType = context === 'tool' ? 'Tool' : 'Article'
    const typeMatches = context === 'article'
      ? !content?.type || content.type === expectedType
      : content?.type === expectedType

    if (contentError || !content || !typeMatches) {
      return NextResponse.json(
        { error: 'This item is not available to save.' },
        { status: 404 }
      )
    }

    const url = `${SITE}/r/${content.slug}`
    const { data: existing } = await supabase
      .from('saved_items')
      .select('id')
      .eq('user_id', authUser.id)
      .like('url', `%/r/${content.slug}`)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ saved: true, id: existing.id })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('whatsapp_number')
      .eq('user_id', authUser.id)
      .maybeSingle()

    const { data: savedItem, error: saveError } = await supabase
      .from('saved_items')
      .insert({
        user_id: authUser.id,
        phone: profile?.whatsapp_number || null,
        url,
        title: content.title,
        category: content.category || 'General',
      })
      .select('id')
      .single()

    if (saveError || !savedItem) {
      console.error('[Saved item create error]', saveError)
      return NextResponse.json(
        { error: 'We could not update your saved library yet.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ saved: true, id: savedItem.id }, { status: 201 })
  } catch (err) {
    console.error('[Saved item create API error]', err)
    return NextResponse.json(
      { error: 'We could not finish saving this item. Please try again.' },
      { status: 500 }
    )
  }
}

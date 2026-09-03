/**
 * Admin Access Verification
 * Verifies that the incoming request is authorized for Administrative operations.
 * Supports both Session-based admin email whitelisting and operational secret keys.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth/requireUser'

export interface RequireAdminResult {
  authorized: boolean
  userId?: string | null
  email?: string | null
  error?: NextResponse
}

export async function requireAdmin(req: NextRequest): Promise<RequireAdminResult> {
  const adminSecret = process.env.ADMIN_SECRET
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  // 1. Check Secret Header or Query Key
  const secretHeader = req.headers.get('x-admin-secret')
  const authHeader = req.headers.get('authorization')
  const bearer = authHeader?.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : ''
  const url = new URL(req.url)
  const querySecret = url.searchParams.get('admin_key')

  if (adminSecret && (secretHeader === adminSecret || bearer === adminSecret || querySecret === adminSecret)) {
    return { authorized: true, email: 'system-admin' }
  }

  // 2. Check Authenticated Session
  const { user } = await getRequestUser(req)
  const userEmail = user?.email?.toLowerCase()

  if (userEmail && adminEmails.length > 0 && adminEmails.includes(userEmail)) {
    return { authorized: true, userId: user?.id, email: userEmail }
  }

  // 3. Development Fallback
  // If neither ADMIN_SECRET nor ADMIN_EMAILS is configured, allow in non-production
  if (process.env.NODE_ENV !== 'production' && !adminSecret && adminEmails.length === 0) {
    return { authorized: true, userId: user?.id, email: userEmail || 'dev-admin' }
  }

  return {
    authorized: false,
    error: NextResponse.json(
      { error: 'You do not have administrative access to PLANET SOR7ED.' },
      { status: 403 }
    ),
  }
}

/**
 * Server Component variant: checks admin session and optional query secret.
 */
export async function checkAdminServerSession(queryKey?: string): Promise<{ authorized: boolean; email?: string | null }> {
  const adminSecret = process.env.ADMIN_SECRET
  if (adminSecret && queryKey && queryKey === adminSecret) {
    return { authorized: true, email: 'system-admin' }
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  try {
    const { createSessionClient } = await import('@/lib/supabase/server')
    const sessionClient = await createSessionClient()
    const { data } = await sessionClient.auth.getUser()
    const userEmail = data.user?.email?.toLowerCase()

    if (userEmail && adminEmails.length > 0 && adminEmails.includes(userEmail)) {
      return { authorized: true, email: userEmail }
    }
  } catch {
    // Ignore session fetch error
  }

  // Development Fallback
  if (process.env.NODE_ENV !== 'production' && !adminSecret && adminEmails.length === 0) {
    return { authorized: true, email: 'dev-admin' }
  }

  return { authorized: false }
}

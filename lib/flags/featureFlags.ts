/**
 * Feature Flags Engine
 * Evaluates feature flags for staged rollouts, beta access, and experimentation.
 * Includes deterministic hashing for percentage rollouts and short-TTL in-memory caching.
 */

import { createServiceClient } from '@/lib/supabase/server'
import type { FeatureFlag } from '@/lib/types/database'

export interface FlagEvaluationContext {
  userId?: string | null
  userEmail?: string | null
}

// In-memory cache with 30-second TTL to avoid frequent DB queries
interface CacheEntry {
  flags: Record<string, FeatureFlag>
  timestamp: number
}

let flagCache: CacheEntry | null = null
const CACHE_TTL_MS = 30 * 1000

// Hardcoded safe defaults if database is unreachable or table is uninitialized
const DEFAULT_FLAGS: Record<string, Partial<FeatureFlag>> = {
  config_tools_v2: { enabled: true, rollout_percentage: 100 },
  beta_pricing_table: { enabled: false, rollout_percentage: 0 },
  realtime_sync_notion: { enabled: true, rollout_percentage: 100 },
}

/**
 * Simple deterministic string hashing algorithm (djb2) to map identifier to 0-99.
 * Ensures the same user consistently gets the same variation without storing state.
 */
function hashToBucket(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash) % 100
}

/**
 * Fetch all feature flags from DB or memory cache.
 */
export async function getAllFeatureFlags(forceRefresh = false): Promise<FeatureFlag[]> {
  const now = Date.now()
  if (!forceRefresh && flagCache && now - flagCache.timestamp < CACHE_TTL_MS) {
    return Object.values(flagCache.flags)
  }

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('flag_key', { ascending: true })

    if (error || !data) {
      console.warn('[FeatureFlags] Using cached/default flags due to DB error:', error?.message)
      if (flagCache) return Object.values(flagCache.flags)
      return Object.entries(DEFAULT_FLAGS).map(([key, val]) => ({
        id: 'default-' + key,
        flag_key: key,
        description: 'Default fallback',
        enabled: val.enabled ?? false,
        rollout_percentage: val.rollout_percentage ?? 0,
        allowed_user_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    }

    const flagMap: Record<string, FeatureFlag> = {}
    for (const flag of data as FeatureFlag[]) {
      flagMap[flag.flag_key] = flag
    }

    flagCache = {
      flags: flagMap,
      timestamp: now,
    }

    return data as FeatureFlag[]
  } catch (err) {
    console.error('[FeatureFlags] Unexpected error fetching flags:', err)
    return Object.values(flagCache?.flags || {})
  }
}

/**
 * Check whether a feature flag is enabled for the given context.
 */
export async function isFeatureEnabled(
  flagKey: string,
  context?: FlagEvaluationContext
): Promise<boolean> {
  const flags = await getAllFeatureFlags()
  const flag = flags.find((f) => f.flag_key === flagKey)

  // If flag is not found, check safe static defaults or return false
  if (!flag) {
    return DEFAULT_FLAGS[flagKey]?.enabled ?? false
  }

  // If globally disabled, immediately return false
  if (!flag.enabled) {
    return false
  }

  // If 100% rollout, immediately return true
  if (flag.rollout_percentage >= 100) {
    return true
  }

  // If specific user ID or email is whitelisted
  const userIdentifier = context?.userId || context?.userEmail
  if (userIdentifier && Array.isArray(flag.allowed_user_ids)) {
    if (flag.allowed_user_ids.includes(userIdentifier)) {
      return true
    }
  }

  // If 0% rollout and not whitelisted, return false
  if (flag.rollout_percentage <= 0) {
    return false
  }

  // Percentage rollout deterministic evaluation
  if (userIdentifier) {
    const bucket = hashToBucket(`${flagKey}:${userIdentifier}`)
    return bucket < flag.rollout_percentage
  }

  // Without a user identifier, we cannot bucket deterministically; default to false for partial rollouts
  return false
}

/**
 * Update or toggle a feature flag (Admin operation).
 */
export async function updateFeatureFlag(
  flagKey: string,
  updates: Partial<Omit<FeatureFlag, 'id' | 'flag_key' | 'created_at'>>
): Promise<{ success: boolean; flag?: FeatureFlag; error?: string }> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('feature_flags')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('flag_key', flagKey)
      .select()
      .single()

    if (error) {
      console.error('[FeatureFlags] Error updating flag:', error)
      return { success: false, error: error.message }
    }

    // Invalidate cache immediately
    flagCache = null

    return { success: true, flag: data as FeatureFlag }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

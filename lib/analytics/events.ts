/**
 * Analytics and Telemetry Service
 * Source of truth for logging tool runs, tracking user journey events,
 * and aggregating operational health metrics.
 */

import { createServiceClient } from '@/lib/supabase/server'
import type { ToolRun } from '@/lib/types/database'

export interface LogToolRunParams {
  toolSlug: string
  success: boolean
  latencyMs?: number | null
  model?: string
  outputText?: string
  toolRequestId?: string | null
  userId?: string | null
  error?: string
}

export interface MetricSummary {
  totalRuns: number
  successCount: number
  failureCount: number
  successRatePercent: number
  avgLatencyMs: number
  totalUsers: number
  activeSubscriptions: number
  toolBreakdown: {
    toolSlug: string
    runs: number
    successRatePercent: number
    avgLatencyMs: number
  }[]
  recentRuns: {
    id: string
    createdAt: string
    toolSlug: string
    success: boolean
    latencyMs: number | null
    outputPreview: string
  }[]
}

/**
 * Log a tool execution event to the tool_runs table.
 * Designed for non-blocking server-side or API route execution.
 */
export async function logToolRun(params: LogToolRunParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = createServiceClient()

    const payload = {
      tool_slug: params.toolSlug,
      success: params.success,
      latency_ms: params.latencyMs !== undefined && params.latencyMs !== null ? Math.round(params.latencyMs) : null,
      model: params.model || 'client/rules-engine',
      output_text: params.error
        ? `Error: ${params.error.slice(0, 500)}`
        : (params.outputText ? params.outputText.slice(0, 500) : 'Success'),
      tool_request_id: params.toolRequestId || null,
    }

    const { data, error } = await supabase
      .from('tool_runs')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error('[Analytics] Failed to insert tool_run:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Analytics] Unexpected error logging tool run:', message)
    return { success: false, error: message }
  }
}

/**
 * Log a generic analytics event (e.g. CTA clicked, protocol saved, page viewed).
 */
export async function logAnalyticsEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  userId: string | null = null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: eventName,
        user_id: userId,
        properties,
      })

    if (error) {
      console.error('[Analytics] Failed to record event:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Analytics] Unexpected error recording analytics event:', message)
    return { success: false, error: message }
  }
}

/**
 * Fetch aggregated KPI metrics for the Admin Dashboard.
 */
export async function getAggregatedMetrics(timeRangeHours = 24): Promise<MetricSummary> {
  const supabase = createServiceClient()
  const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString()

  try {
    // 1. Fetch tool runs within the timeframe
    const { data: runsData, error: runsError } = await supabase
      .from('tool_runs')
      .select('id, created_at, tool_slug, success, latency_ms, output_text')
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })

    if (runsError) {
      console.error('[Analytics] Error fetching tool_runs:', runsError)
    }

    const runs = (runsData || []) as ToolRun[]
    const totalRuns = runs.length
    const successCount = runs.filter((r) => r.success).length
    const failureCount = totalRuns - successCount
    const successRatePercent = totalRuns > 0 ? Math.round((successCount / totalRuns) * 100) : 100

    const validLatencies = runs
      .map((r) => r.latency_ms)
      .filter((lat): lat is number => typeof lat === 'number' && lat > 0)
    const avgLatencyMs = validLatencies.length > 0
      ? Math.round(validLatencies.reduce((sum, val) => sum + val, 0) / validLatencies.length)
      : 0

    // Group runs by tool_slug
    const toolGroups: Record<string, { total: number; successes: number; latencies: number[] }> = {}
    for (const r of runs) {
      const slug = r.tool_slug || 'unknown'
      if (!toolGroups[slug]) {
        toolGroups[slug] = { total: 0, successes: 0, latencies: [] }
      }
      toolGroups[slug].total += 1
      if (r.success) toolGroups[slug].successes += 1
      if (typeof r.latency_ms === 'number' && r.latency_ms > 0) {
        toolGroups[slug].latencies.push(r.latency_ms)
      }
    }

    const toolBreakdown = Object.entries(toolGroups).map(([toolSlug, stats]) => ({
      toolSlug,
      runs: stats.total,
      successRatePercent: Math.round((stats.successes / stats.total) * 100),
      avgLatencyMs: stats.latencies.length > 0
        ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
        : 0,
    })).sort((a, b) => b.runs - a.runs)

    // 2. Fetch total registered users count
    const { count: totalUsersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // 3. Fetch active entitlements count
    const { count: activeSubsCount } = await supabase
      .from('entitlements')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // 4. Format the 20 most recent runs
    const recentRuns = runs.slice(0, 20).map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      toolSlug: r.tool_slug,
      success: r.success,
      latencyMs: r.latency_ms,
      outputPreview: r.output_text ? r.output_text.slice(0, 100) : '',
    }))

    return {
      totalRuns,
      successCount,
      failureCount,
      successRatePercent,
      avgLatencyMs,
      totalUsers: totalUsersCount || 0,
      activeSubscriptions: activeSubsCount || 0,
      toolBreakdown,
      recentRuns,
    }
  } catch (err) {
    console.error('[Analytics] Failed to aggregate metrics:', err)
    return {
      totalRuns: 0,
      successCount: 0,
      failureCount: 0,
      successRatePercent: 100,
      avgLatencyMs: 0,
      totalUsers: 0,
      activeSubscriptions: 0,
      toolBreakdown: [],
      recentRuns: [],
    }
  }
}

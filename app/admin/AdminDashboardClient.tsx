'use client'

import { useState, useCallback } from 'react'
import type { MetricSummary } from '@/lib/analytics/events'
import type { FeatureFlag } from '@/lib/types/database'

interface AdminDashboardClientProps {
  initialMetrics: MetricSummary
  initialFlags: FeatureFlag[]
}

export function AdminDashboardClient({
  initialMetrics,
  initialFlags,
}: AdminDashboardClientProps) {
  const [metrics, setMetrics] = useState<MetricSummary>(initialMetrics)
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags)
  const [timeRange, setTimeRange] = useState<number>(24)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'analytics' | 'flags'>('analytics')
  const [updatingFlag, setUpdatingFlag] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const showNotice = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3500)
  }

  // Refresh data
  const handleRefresh = useCallback(async (hours = timeRange) => {
    setIsRefreshing(true)
    try {
      const [metricsRes, flagsRes] = await Promise.all([
        fetch(`/api/admin/metrics?hours=${hours}`),
        fetch('/api/admin/flags'),
      ])

      if (metricsRes.ok) {
        const newMetrics = await metricsRes.json()
        setMetrics(newMetrics)
      }
      if (flagsRes.ok) {
        const { flags: newFlags } = await flagsRes.json()
        setFlags(newFlags)
      }
      showNotice('Dashboard refreshed successfully')
    } catch {
      showNotice('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }, [timeRange])

  // Toggle flag status
  const handleToggleFlag = async (flagKey: string, currentEnabled: boolean) => {
    setUpdatingFlag(flagKey)
    try {
      const res = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flagKey,
          enabled: !currentEnabled,
        }),
      })

      if (res.ok) {
        const { flag } = await res.json()
        setFlags((prev) => prev.map((f) => (f.flag_key === flagKey ? flag : f)))
        showNotice(`Flag "${flagKey}" ${!currentEnabled ? 'enabled' : 'disabled'}`)
      } else {
        showNotice(`Failed to update ${flagKey}`)
      }
    } catch {
      showNotice(`Error updating ${flagKey}`)
    } finally {
      setUpdatingFlag(null)
    }
  }

  // Update rollout percentage
  const handleRolloutChange = async (flagKey: string, newPercentage: number) => {
    setUpdatingFlag(flagKey)
    try {
      const res = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flagKey,
          rolloutPercentage: newPercentage,
        }),
      })

      if (res.ok) {
        const { flag } = await res.json()
        setFlags((prev) => prev.map((f) => (f.flag_key === flagKey ? flag : f)))
        showNotice(`Rollout for "${flagKey}" set to ${newPercentage}%`)
      }
    } catch {
      showNotice(`Error updating rollout for ${flagKey}`)
    } finally {
      setUpdatingFlag(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 md:px-12 font-sans selection:bg-[#F5C518] selection:text-black">
      {/* Toast Notification */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111] border border-[#F5C518]/60 text-[#F5C518] px-5 py-3 rounded shadow-2xl text-xs uppercase tracking-widest animate-fade-in flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#F5C518] animate-ping" />
          {notice}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="sor7ed-pill">OPERATIONS & CONTROL</span>
            <span className="text-xs text-white/40 tracking-wider">v1.0.0</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-[#F2F2F2]">
            PLANET <span className="text-[#F5C518]">SOR7ED</span>
          </h1>
          <p className="text-xs text-white/50 tracking-wider uppercase mt-1">
            Telemetry, Tool Performance & Feature Rollout Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Select */}
          <div className="inline-flex rounded border border-white/10 p-1 bg-[#0A0A0A]">
            {[
              { label: '24H', hours: 24 },
              { label: '7D', hours: 168 },
              { label: '30D', hours: 720 },
            ].map(({ label, hours }) => (
              <button
                key={label}
                onClick={() => {
                  setTimeRange(hours)
                  handleRefresh(hours)
                }}
                className={`px-3 py-1 text-xs tracking-wider uppercase transition-colors rounded-sm ${
                  timeRange === hours
                    ? 'bg-[#F5C518] text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => handleRefresh(timeRange)}
            disabled={isRefreshing}
            className="px-4 py-2 border border-white/20 hover:border-[#F5C518] text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-white/5 disabled:opacity-50 flex items-center gap-2"
          >
            <span className={`inline-block ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* KPI Overview Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Tool Executions */}
        <div className="border border-white/10 bg-[#080808] p-6 hover:border-[#F5C518]/40 transition-colors">
          <div className="text-xs tracking-widest text-white/50 uppercase">Total Tool Runs ({timeRange}h)</div>
          <div className="text-4xl font-extrabold text-white mt-2 font-mono">
            {metrics.totalRuns.toLocaleString()}
          </div>
          <div className="text-xs text-white/40 mt-2 flex items-center justify-between">
            <span>Success: {metrics.successCount}</span>
            <span className="text-red-400">Failed: {metrics.failureCount}</span>
          </div>
        </div>

        {/* Card 2: Success Rate */}
        <div className="border border-white/10 bg-[#080808] p-6 hover:border-[#F5C518]/40 transition-colors">
          <div className="text-xs tracking-widest text-white/50 uppercase">Success Rate</div>
          <div className="text-4xl font-extrabold text-[#F5C518] mt-2 font-mono flex items-center gap-2">
            {metrics.successRatePercent}%
          </div>
          <div className="text-xs text-white/40 mt-2">
            {metrics.successRatePercent >= 95 ? '● Production Healthy' : '▲ Elevated error frequency'}
          </div>
        </div>

        {/* Card 3: Average Latency */}
        <div className="border border-white/10 bg-[#080808] p-6 hover:border-[#F5C518]/40 transition-colors">
          <div className="text-xs tracking-widest text-white/50 uppercase">Avg Run Latency</div>
          <div className="text-4xl font-extrabold text-white mt-2 font-mono">
            {metrics.avgLatencyMs} <span className="text-sm font-normal text-white/40">ms</span>
          </div>
          <div className="text-xs text-white/40 mt-2">
            Target threshold: &lt; 500 ms
          </div>
        </div>

        {/* Card 4: Registered Users & Subscriptions */}
        <div className="border border-white/10 bg-[#080808] p-6 hover:border-[#F5C518]/40 transition-colors">
          <div className="text-xs tracking-widest text-white/50 uppercase">Platform Accounts</div>
          <div className="text-4xl font-extrabold text-white mt-2 font-mono">
            {metrics.totalUsers.toLocaleString()}
          </div>
          <div className="text-xs text-white/40 mt-2 flex items-center justify-between">
            <span>Active Subscriptions:</span>
            <span className="text-[#F5C518] font-bold">{metrics.activeSubscriptions}</span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs tracking-widest uppercase transition-all font-semibold relative ${
            activeTab === 'analytics'
              ? 'text-[#F5C518] border-b-2 border-[#F5C518]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Tool Health & Activity ({metrics.toolBreakdown.length} Tools)
        </button>
        <button
          onClick={() => setActiveTab('flags')}
          className={`pb-3 text-xs tracking-widest uppercase transition-all font-semibold relative ${
            activeTab === 'flags'
              ? 'text-[#F5C518] border-b-2 border-[#F5C518]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Feature Flags ({flags.length} Configured)
        </button>
      </div>

      {/* Tab 1: Analytics & Tool Health */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Tool Breakdown Table */}
          <div className="border border-white/10 bg-[#080808] overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Tool Performance Breakdown</h2>
              <span className="text-xs text-white/40 font-mono">Sorted by volume</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111] text-white/40 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="p-4">Tool Slug</th>
                    <th className="p-4 text-right">Executions</th>
                    <th className="p-4 text-right">Success Rate</th>
                    <th className="p-4 text-right">Avg Latency</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {metrics.toolBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/40 italic font-sans">
                        No tool runs recorded in the selected {timeRange}h window.
                      </td>
                    </tr>
                  ) : (
                    metrics.toolBreakdown.map((item) => (
                      <tr key={item.toolSlug} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-white font-sans flex items-center gap-2">
                          <span className="text-[#F5C518] font-mono">/</span>
                          {item.toolSlug}
                        </td>
                        <td className="p-4 text-right text-white/80">{item.runs.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={item.successRatePercent >= 95 ? 'text-emerald-400' : 'text-amber-400'}>
                            {item.successRatePercent}%
                          </span>
                        </td>
                        <td className="p-4 text-right text-white/60">{item.avgLatencyMs} ms</td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-sans rounded-full ${
                              item.successRatePercent >= 95
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {item.successRatePercent >= 95 ? 'Optimal' : 'Degraded'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Recent Runs Stream */}
          <div className="border border-white/10 bg-[#080808] p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center justify-between">
              <span>Recent Execution Stream</span>
              <span className="text-[10px] text-white/40 font-mono">Latest 20 events</span>
            </h2>

            <div className="space-y-2">
              {metrics.recentRuns.length === 0 ? (
                <div className="p-8 text-center text-white/40 italic text-xs">
                  No recent execution logs.
                </div>
              ) : (
                metrics.recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-3 border border-white/5 bg-[#0D0D0D] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          run.success ? 'bg-emerald-400' : 'bg-red-500'
                        }`}
                      />
                      <span className="text-white font-bold font-sans">{run.toolSlug}</span>
                      <span className="text-white/40 text-[11px] truncate max-w-xs">
                        {run.outputPreview || (run.success ? 'Executed cleanly' : 'Failed')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-white/50 text-[11px]">
                      <span>{run.latencyMs ? `${run.latencyMs}ms` : '—'}</span>
                      <span>{new Date(run.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Feature Flags & Experimentation */}
      {activeTab === 'flags' && (
        <div className="border border-white/10 bg-[#080808] overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Active Feature Flags</h2>
              <p className="text-xs text-white/40 mt-1">
                Manage live features, staged % rollouts, and testing groups without code redeploys.
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {flags.length === 0 ? (
              <div className="p-8 text-center text-white/40 italic text-xs">
                No feature flags defined in database.
              </div>
            ) : (
              flags.map((flag) => {
                const isUpdating = updatingFlag === flag.flag_key
                return (
                  <div
                    key={flag.flag_key}
                    className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-white/[0.01] transition-colors"
                  >
                    {/* Flag Details */}
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3">
                        <code className="text-sm font-bold text-[#F5C518] bg-[#F5C518]/10 px-2 py-0.5 rounded border border-[#F5C518]/20">
                          {flag.flag_key}
                        </code>
                        <span
                          className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${
                            flag.enabled
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/10 text-white/50 border border-white/10'
                          }`}
                        >
                          {flag.enabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 mt-2 font-sans">
                        {flag.description || 'No description provided.'}
                      </p>
                      <div className="text-[10px] text-white/40 font-mono mt-1">
                        Updated: {new Date(flag.updated_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      {/* Rollout percentage control */}
                      <div className="flex flex-col gap-1 w-44">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/40">Rollout:</span>
                          <span className="text-[#F5C518] font-bold">{flag.rollout_percentage}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={flag.rollout_percentage}
                          disabled={!flag.enabled || isUpdating}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10)
                            handleRolloutChange(flag.flag_key, val)
                          }}
                          className="accent-[#F5C518] cursor-pointer disabled:opacity-30 h-1 bg-white/20 rounded"
                        />
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        onClick={() => handleToggleFlag(flag.flag_key, flag.enabled)}
                        disabled={isUpdating}
                        className={`px-5 py-2 text-xs uppercase tracking-widest font-bold transition-all border ${
                          flag.enabled
                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            : 'bg-[#F5C518] border-[#F5C518] text-black hover:bg-[#F5C518]/90'
                        } disabled:opacity-50 min-w-[120px]`}
                      >
                        {isUpdating ? 'Saving...' : flag.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Footer info */}
      <footer className="mt-12 pt-6 border-t border-white/10 text-xs text-white/40 flex flex-col sm:flex-row justify-between gap-4">
        <span>SOR7ED LIMITED — Internal Admin Tools & Analytics</span>
        <span>planetsorted.com</span>
      </footer>
    </div>
  )
}

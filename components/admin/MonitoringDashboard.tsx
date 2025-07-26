'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePerformanceMonitoring } from '@/lib/monitoring/performance'
import { trackCustomMetric } from '@/lib/monitoring/performance'
import { trackBusinessMetric } from '@/lib/monitoring/sentry'

interface MetricsSummary {
  avgPageLoadTime: number
  p95PageLoadTime: number
  avgApiDuration: number
  p95ApiDuration: number
  cacheHitRate: number
  slowResourcesCount: number
  largeResourcesCount: number
}

interface WebVitalsData {
  cls: number[]
  lcp: number[]
  fid: number[]
  fcp: number[]
  ttfb: number[]
}

interface MonitoringData {
  summary: MetricsSummary
  webVitals: WebVitalsData
  apiCalls: {
    durations: number[]
    statusCodes: Record<string, number>
  }
  memory: {
    usedHeap: number[]
    totalHeap: number[]
  }
  userInteractions: {
    clicks: number[]
    scrolls: number[]
    formSubmits: number[]
  }
  totalMetrics: number
  timeRange: string
}

interface Alert {
  id: string
  metric_name: string
  metric_value: number
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  page_path: string
  recorded_at: string
}

export default function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedMetricType, setSelectedMetricType] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const { trackRender } = usePerformanceMonitoring('MonitoringDashboard')

  useEffect(() => {
    trackRender('initial_load')
    fetchMonitoringData()
  }, [timeRange, selectedMetricType, trackRender])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchMonitoringData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, timeRange, selectedMetricType, fetchMonitoringData])

  const fetchMonitoringData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        range: timeRange
      })

      if (selectedMetricType) {
        params.append('type', selectedMetricType)
      }

      const [metricsResponse, alertsResponse] = await Promise.all([
        fetch(`/api/monitoring/metrics?${params}`),
        fetch(`/api/monitoring/alerts?${params}`)
      ])

      if (!metricsResponse.ok) {
        throw new Error(`Failed to fetch metrics: ${metricsResponse.status}`)
      }

      const metricsData = await metricsResponse.json()
      setData(metricsData.data)

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData.alerts || [])
      }

      trackCustomMetric('admin.monitoring_dashboard.data_fetch', 1, 'count', {
        timeRange,
        metricType: selectedMetricType || 'all'
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch monitoring data'
      setError(errorMessage)
      trackBusinessMetric('admin.monitoring_dashboard.fetch_error', 1, 'count', {
        error: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }, [timeRange, selectedMetricType])

  const webVitalsRatings = useMemo(() => {
    if (!data?.webVitals) return { good: 0, needs_improvement: 0, poor: 0 }

    const ratings = { good: 0, needs_improvement: 0, poor: 0 }
    
    // Rate CLS values
    data.webVitals.cls.forEach(value => {
      if (value <= 0.1) ratings.good++
      else if (value <= 0.25) ratings.needs_improvement++
      else ratings.poor++
    })

    // Rate LCP values
    data.webVitals.lcp.forEach(value => {
      if (value <= 2500) ratings.good++
      else if (value <= 4000) ratings.needs_improvement++
      else ratings.poor++
    })

    // Rate FID values
    data.webVitals.fid.forEach(value => {
      if (value <= 100) ratings.good++
      else if (value <= 300) ratings.needs_improvement++
      else ratings.poor++
    })

    return ratings
  }, [data?.webVitals])

  const criticalAlerts = useMemo(() => {
    return alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high')
  }, [alerts])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-800 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-rose-400">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Monitoring Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchMonitoringData}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Performance Monitoring
            </h1>
            <p className="text-slate-400 mt-1">
              Real-time system performance and user experience metrics
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto Refresh Toggle */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-slate-300">Auto refresh</span>
            </label>

            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            {/* Metric Type Filter */}
            <select
              value={selectedMetricType || ''}
              onChange={(e) => setSelectedMetricType(e.target.value || null)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Metrics</option>
              <option value="web_vitals">Web Vitals</option>
              <option value="navigation">Navigation</option>
              <option value="api">API Calls</option>
              <option value="resource">Resources</option>
              <option value="memory">Memory</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchMonitoringData}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-900/20 border border-rose-500/50 rounded-lg p-4"
          >
            <h2 className="text-rose-300 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
              Critical Alerts ({criticalAlerts.length})
            </h2>
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <span className="font-medium text-white">{alert.metric_name}</span>
                    <span className="ml-2 text-rose-300">
                      {alert.metric_value.toFixed(0)} (threshold: {alert.threshold})
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    {alert.page_path} • {new Date(alert.recorded_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Avg Page Load"
            value={`${data?.summary.avgPageLoadTime || 0}ms`}
            change="+5.2%"
            trend="up"
            status={data?.summary.avgPageLoadTime && data.summary.avgPageLoadTime < 3000 ? 'good' : 'poor'}
          />
          <MetricCard
            title="P95 Page Load"
            value={`${data?.summary.p95PageLoadTime || 0}ms`}
            change="-2.1%"
            trend="down"
            status={data?.summary.p95PageLoadTime && data.summary.p95PageLoadTime < 5000 ? 'good' : 'poor'}
          />
          <MetricCard
            title="Cache Hit Rate"
            value={`${data?.summary.cacheHitRate || 0}%`}
            change="+8.3%"
            trend="up"
            status={data?.summary.cacheHitRate && data.summary.cacheHitRate > 80 ? 'good' : 'warning'}
          />
          <MetricCard
            title="API Response"
            value={`${data?.summary.avgApiDuration || 0}ms`}
            change="-12.4%"
            trend="down"
            status={data?.summary.avgApiDuration && data.summary.avgApiDuration < 1000 ? 'good' : 'warning'}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Web Vitals Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Web Vitals Distribution</h3>
            <WebVitalsChart ratings={webVitalsRatings} />
          </motion.div>

          {/* API Status Codes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">API Response Status</h3>
            <StatusCodesChart statusCodes={data?.apiCalls.statusCodes || {}} />
          </motion.div>

          {/* Memory Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Memory Usage Trend</h3>
            <MemoryChart memory={data?.memory} />
          </motion.div>

          {/* User Interactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">User Interactions</h3>
            <InteractionsChart interactions={data?.userInteractions} />
          </motion.div>
        </div>

        {/* Recent Alerts Table */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Recent Performance Alerts</h3>
            <AlertsTable alerts={alerts.slice(0, 10)} />
          </motion.div>
        )}

        {/* Footer Stats */}
        <div className="text-center text-sm text-slate-400 py-4">
          <p>
            Displaying {data?.totalMetrics || 0} metrics from the last {timeRange} • 
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  status: 'good' | 'warning' | 'poor'
}

function MetricCard({ title, value, change, trend, status }: MetricCardProps) {
  const statusColors = {
    good: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/50',
    warning: 'from-amber-500/20 to-amber-600/20 border-amber-500/50',
    poor: 'from-rose-500/20 to-rose-600/20 border-rose-500/50'
  }

  const statusDots = {
    good: 'bg-emerald-400',
    warning: 'bg-amber-400',
    poor: 'bg-rose-400'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${statusColors[status]} backdrop-blur-sm rounded-xl p-6 border`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        <div className={`w-2 h-2 rounded-full ${statusDots[status]} animate-pulse`}></div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-white">{value}</p>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend === 'up' ? '↗' : '↙'} {change}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Web Vitals Chart Component
interface WebVitalsChartProps {
  ratings: { good: number; needs_improvement: number; poor: number }
}

function WebVitalsChart({ ratings }: WebVitalsChartProps) {
  const total = ratings.good + ratings.needs_improvement + ratings.poor
  
  if (total === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        No Web Vitals data available
      </div>
    )
  }

  const goodPercent = (ratings.good / total) * 100
  const needsImprovementPercent = (ratings.needs_improvement / total) * 100
  const poorPercent = (ratings.poor / total) * 100

  return (
    <div className="space-y-4">
      <div className="flex h-4 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="bg-emerald-500 transition-all duration-1000" 
          style={{ width: `${goodPercent}%` }}
        ></div>
        <div 
          className="bg-amber-500 transition-all duration-1000" 
          style={{ width: `${needsImprovementPercent}%` }}
        ></div>
        <div 
          className="bg-rose-500 transition-all duration-1000" 
          style={{ width: `${poorPercent}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-emerald-400 font-semibold">{goodPercent.toFixed(1)}%</div>
          <div className="text-slate-400">Good</div>
        </div>
        <div className="text-center">
          <div className="text-amber-400 font-semibold">{needsImprovementPercent.toFixed(1)}%</div>
          <div className="text-slate-400">Needs Work</div>
        </div>
        <div className="text-center">
          <div className="text-rose-400 font-semibold">{poorPercent.toFixed(1)}%</div>
          <div className="text-slate-400">Poor</div>
        </div>
      </div>
    </div>
  )
}

// Status Codes Chart Component
interface StatusCodesChartProps {
  statusCodes: Record<string, number>
}

function StatusCodesChart({ statusCodes }: StatusCodesChartProps) {
  const entries = Object.entries(statusCodes)
  const total = Object.values(statusCodes).reduce((sum, count) => sum + count, 0)

  if (total === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        No API status data available
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    success: 'bg-emerald-500',
    redirect: 'bg-blue-500',
    client_error: 'bg-amber-500',
    server_error: 'bg-rose-500'
  }

  return (
    <div className="space-y-3">
      {entries.map(([status, count]) => {
        const percentage = (count / total) * 100
        return (
          <div key={status} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 capitalize">{status.replace('_', ' ')}</span>
              <span className="text-white font-medium">{count} ({percentage.toFixed(1)}%)</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${statusColors[status] || 'bg-slate-500'} transition-all duration-1000`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Memory Chart Component
interface MemoryChartProps {
  memory?: { usedHeap: number[]; totalHeap: number[] }
}

function MemoryChart({ memory }: MemoryChartProps) {
  if (!memory || memory.usedHeap.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        No memory data available
      </div>
    )
  }

  const avgUsed = memory.usedHeap.reduce((sum, val) => sum + val, 0) / memory.usedHeap.length
  const avgTotal = memory.totalHeap.reduce((sum, val) => sum + val, 0) / memory.totalHeap.length
  const usagePercent = avgTotal > 0 ? (avgUsed / avgTotal) * 100 : 0

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-white">{usagePercent.toFixed(1)}%</div>
        <div className="text-sm text-slate-400">Memory Usage</div>
      </div>
      
      <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
          style={{ width: `${usagePercent}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm text-slate-400">
        <span>Used: {formatBytes(avgUsed)}</span>
        <span>Total: {formatBytes(avgTotal)}</span>
      </div>
    </div>
  )
}

// Interactions Chart Component
interface InteractionsChartProps {
  interactions?: { clicks: number[]; scrolls: number[]; formSubmits: number[] }
}

function InteractionsChart({ interactions }: InteractionsChartProps) {
  if (!interactions) {
    return (
      <div className="text-center text-slate-400 py-8">
        No interaction data available
      </div>
    )
  }

  const totalClicks = interactions.clicks.length
  const totalScrolls = interactions.scrolls.length
  const totalForms = interactions.formSubmits.length

  const interactionTypes = [
    { name: 'Clicks', count: totalClicks, color: 'bg-cyan-500' },
    { name: 'Scrolls', count: totalScrolls, color: 'bg-blue-500' },
    { name: 'Form Submits', count: totalForms, color: 'bg-emerald-500' }
  ]

  const maxCount = Math.max(totalClicks, totalScrolls, totalForms)

  return (
    <div className="space-y-4">
      {interactionTypes.map((interaction) => {
        const percentage = maxCount > 0 ? (interaction.count / maxCount) * 100 : 0
        return (
          <div key={interaction.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">{interaction.name}</span>
              <span className="text-sm font-medium text-white">{interaction.count}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${interaction.color} transition-all duration-1000`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Alerts Table Component
interface AlertsTableProps {
  alerts: Alert[]
}

function AlertsTable({ alerts }: AlertsTableProps) {
  const severityColors = {
    low: 'text-blue-400',
    medium: 'text-amber-400',
    high: 'text-orange-400',
    critical: 'text-rose-400'
  }

  const severityBg = {
    low: 'bg-blue-500/20',
    medium: 'bg-amber-500/20',
    high: 'bg-orange-500/20',
    critical: 'bg-rose-500/20'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-300 font-medium">Metric</th>
            <th className="text-left py-3 px-4 text-slate-300 font-medium">Value</th>
            <th className="text-left py-3 px-4 text-slate-300 font-medium">Threshold</th>
            <th className="text-left py-3 px-4 text-slate-300 font-medium">Severity</th>
            <th className="text-left py-3 px-4 text-slate-300 font-medium">Page</th>
            <th className="text-left py-3 px-4 text-slate-300 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="border-b border-slate-800 hover:bg-slate-800/30">
              <td className="py-3 px-4 text-white font-medium">{alert.metric_name}</td>
              <td className="py-3 px-4 text-slate-300">{alert.metric_value.toFixed(0)}</td>
              <td className="py-3 px-4 text-slate-400">{alert.threshold}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityBg[alert.severity]} ${severityColors[alert.severity]}`}>
                  {alert.severity}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-400 font-mono text-xs">{alert.page_path}</td>
              <td className="py-3 px-4 text-slate-400">
                {new Date(alert.recorded_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
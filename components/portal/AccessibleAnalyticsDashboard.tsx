'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AccessibleChart, { useChartAccessibility } from '@/components/charts/AccessibleChart'
import HealthTrendChart from '@/components/charts/HealthTrendChart'

interface AnalyticsData {
  purchaseHistory: {
    monthlySpending: Array<{
      month: string
      amount: number
      orderCount: number
    }>
    testCategories: Array<{
      category: string
      count: number
      totalSpent: number
    }>
    statusDistribution: Array<{
      status: string
      count: number
      percentage: number
    }>
  }
  healthMetrics: {
    biomarkerTrends: Array<{
      name: string
      data: Array<{
        date: string
        value: number
        status: 'normal' | 'elevated' | 'high' | 'low' | 'critical'
        referenceRange?: { min: number; max: number; optimal?: number }
        testName: string
        unit: string
      }>
    }>
    overallHealthScore: {
      current: number
      previous: number
      trend: 'improving' | 'stable' | 'declining'
    }
  }
  appointments: {
    upcomingCount: number
    completedCount: number
    monthlyBookings: Array<{
      month: string
      appointments: number
      completionRate: number
    }>
  }
}

interface AccessibleAnalyticsDashboardProps {
  userId: string
  className?: string
  refreshInterval?: number
  showExportOptions?: boolean
}

export default function AccessibleAnalyticsDashboard({
  userId,
  className = '',
  refreshInterval = 300000, // 5 minutes
  showExportOptions = true
}: AccessibleAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m')
  const [activeView, setActiveView] = useState<'overview' | 'health' | 'financial' | 'appointments'>('overview')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const { preferences, updatePreference } = useChartAccessibility()

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        timeRange: selectedTimeRange,
        refresh: forceRefresh.toString()
      })

      const response = await fetch(`/api/portal/analytics?${queryParams}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analytics data')
      }

      setData(result.data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedTimeRange])

  // Initial data load and refresh interval
  useEffect(() => {
    fetchAnalyticsData()

    const interval = setInterval(() => {
      fetchAnalyticsData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchAnalyticsData, refreshInterval])

  // Processed chart data
  const chartData = useMemo(() => {
    if (!data) return null

    return {
      monthlySpending: data.purchaseHistory.monthlySpending.map(item => ({
        label: item.month,
        value: item.amount,
        description: `${item.orderCount} orders totaling $${item.amount.toFixed(2)}`
      })),
      testCategories: data.purchaseHistory.testCategories.map(item => ({
        label: item.category,
        value: item.count,
        description: `${item.count} tests, $${item.totalSpent.toFixed(2)} spent`
      })),
      statusDistribution: data.purchaseHistory.statusDistribution.map(item => ({
        label: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: item.percentage,
        description: `${item.count} orders (${item.percentage.toFixed(1)}%)`
      })),
      monthlyAppointments: data.appointments.monthlyBookings.map(item => ({
        label: item.month,
        value: item.appointments,
        description: `${item.appointments} appointments, ${item.completionRate.toFixed(1)}% completion rate`
      }))
    }
  }, [data])

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    await fetchAnalyticsData(true)
  }, [fetchAnalyticsData])

  // Export functionality
  const handleExport = useCallback(async (format: 'pdf' | 'csv' | 'json') => {
    if (!data) return

    try {
      const response = await fetch('/api/portal/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          timeRange: selectedTimeRange,
          data
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `health-analytics-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export error:', err)
    }
  }, [data, selectedTimeRange])

  if (loading && !data) {
    return (
      <div className={`analytics-dashboard ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your health analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`analytics-dashboard ${className}`}>
        <div className="bg-rose-900/20 border border-rose-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center">
              <span className="text-rose-900 text-sm">!</span>
            </div>
            <h3 className="text-lg font-semibold text-rose-300">Analytics Error</h3>
          </div>
          <p className="text-rose-200 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`analytics-dashboard space-y-8 ${className}`}>
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Health Analytics Dashboard</h2>
          <p className="text-slate-400">
            Comprehensive view of your health journey and test results
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Time Range:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Select time range for analytics"
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* View Selector */}
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {(['overview', 'health', 'financial', 'appointments'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activeView === view
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-pressed={activeView === view}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:border-slate-600/50 transition-colors disabled:opacity-50"
            aria-label="Refresh analytics data"
          >
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
            >
              🔄
            </motion.div>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Accessibility Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={preferences.highContrastMode}
              onChange={(e) => updatePreference('highContrastMode', e.target.checked)}
              className="rounded"
            />
            <span className="text-slate-400">High Contrast</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={preferences.reducedMotion}
              onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
              className="rounded"
            />
            <span className="text-slate-400">Reduced Motion</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={preferences.enableVoiceAnnouncements}
              onChange={(e) => updatePreference('enableVoiceAnnouncements', e.target.checked)}
              className="rounded"
            />
            <span className="text-slate-400">Voice Announcements</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={preferences.preferTableView}
              onChange={(e) => updatePreference('preferTableView', e.target.checked)}
              className="rounded"
            />
            <span className="text-slate-400">Prefer Tables</span>
          </label>
        </div>
      </div>

      {/* Main Analytics Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: preferences.reducedMotion ? 0 : 0.3 }}
        >
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics Overview */}
              {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                      <span className="text-sm font-medium text-slate-400">HEALTH SCORE</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {data.healthMetrics.overallHealthScore.current}
                      <span className="text-sm text-slate-400">/100</span>
                    </div>
                    <div className={`text-sm ${
                      data.healthMetrics.overallHealthScore.trend === 'improving' ? 'text-emerald-400' :
                      data.healthMetrics.overallHealthScore.trend === 'declining' ? 'text-rose-400' :
                      'text-slate-400'
                    }`}>
                      {data.healthMetrics.overallHealthScore.trend === 'improving' ? '↗ Improving' :
                       data.healthMetrics.overallHealthScore.trend === 'declining' ? '↙ Needs attention' :
                       '→ Stable'}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                      <span className="text-sm font-medium text-slate-400">TOTAL SPENT</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      ${data.purchaseHistory.monthlySpending.reduce((sum, item) => sum + item.amount, 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-slate-400">
                      {selectedTimeRange === '3m' ? 'Last 3 months' :
                       selectedTimeRange === '6m' ? 'Last 6 months' :
                       selectedTimeRange === '1y' ? 'Last year' : 'All time'}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-amber-400 rounded-full" />
                      <span className="text-sm font-medium text-slate-400">APPOINTMENTS</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {data.appointments.upcomingCount}
                    </div>
                    <div className="text-sm text-slate-400">
                      Upcoming appointments
                    </div>
                  </div>

                  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full" />
                      <span className="text-sm font-medium text-slate-400">BIOMARKERS</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {data.healthMetrics.biomarkerTrends.length}
                    </div>
                    <div className="text-sm text-slate-400">
                      Tracked biomarkers
                    </div>
                  </div>
                </div>
              )}

              {/* Overview Charts */}
              {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <AccessibleChart
                    data={chartData.monthlySpending}
                    type="bar"
                    title="Monthly Healthcare Spending"
                    description={`Your healthcare spending over the ${selectedTimeRange === '3m' ? 'last 3 months' : selectedTimeRange === '6m' ? 'last 6 months' : selectedTimeRange === '1y' ? 'last year' : 'selected time period'}`}
                    width={500}
                    height={300}
                    showGrid={true}
                    showLegend={false}
                    showValues={true}
                    {...preferences}
                    className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
                  />

                  <AccessibleChart
                    data={chartData.testCategories}
                    type="pie"
                    title="Test Categories Distribution"
                    description="Breakdown of your diagnostic tests by category"
                    width={500}
                    height={300}
                    showLegend={true}
                    {...preferences}
                    className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
                  />
                </div>
              )}
            </div>
          )}

          {activeView === 'health' && data && (
            <div className="space-y-8">
              {/* Health Trends */}
              {data.healthMetrics.biomarkerTrends.map((biomarker, index) => (
                <HealthTrendChart
                  key={biomarker.name}
                  data={biomarker.data}
                  title={biomarker.name}
                  description={`Track your ${biomarker.name} levels over time with reference ranges and health recommendations`}
                  showReferenceRange={true}
                  showTrendLine={true}
                  width={800}
                  height={400}
                  className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
                />
              ))}
            </div>
          )}

          {activeView === 'financial' && chartData && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AccessibleChart
                  data={chartData.monthlySpending}
                  type="line"
                  title="Spending Trend Analysis"
                  description="Track your healthcare spending patterns over time"
                  width={600}
                  height={400}
                  {...preferences}
                  className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
                />

                <AccessibleChart
                  data={chartData.statusDistribution}
                  type="pie"
                  title="Order Status Distribution"
                  description="Breakdown of your orders by completion status"
                  width={600}
                  height={400}
                  {...preferences}
                  className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
                />
              </div>
            </div>
          )}

          {activeView === 'appointments' && chartData && (
            <div className="space-y-8">
              <AccessibleChart
                data={chartData.monthlyAppointments}
                type="bar"
                title="Appointment History"
                description="Your appointment booking and completion patterns"
                width={800}
                height={400}
                {...preferences}
                className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Export Options */}
      {showExportOptions && (
        <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Export Your Data</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
            >
              Export as PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Export as JSON
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-3">
            Export your health analytics for personal records or sharing with healthcare providers.
            All exports are HIPAA-compliant and encrypted.
          </p>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-slate-500">
        Last updated: {lastRefresh.toLocaleString()}
      </div>
    </div>
  )
}
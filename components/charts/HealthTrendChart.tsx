'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import AccessibleChart, { useChartAccessibility } from './AccessibleChart'

interface HealthDataPoint {
  date: string
  value: number
  referenceRange?: {
    min: number
    max: number
    optimal?: number
  }
  status: 'normal' | 'elevated' | 'high' | 'low' | 'critical'
  testName: string
  unit: string
  notes?: string
}

interface HealthTrendChartProps {
  data: HealthDataPoint[]
  title: string
  description?: string
  showReferenceRange?: boolean
  showTrendLine?: boolean
  width?: number
  height?: number
  className?: string
}

const HEALTH_STATUS_COLORS = {
  normal: '#10b981', // Emerald - healthy green
  elevated: '#f59e0b', // Amber - attention needed
  high: '#f97316', // Orange - concerning
  low: '#3b82f6', // Blue - below normal
  critical: '#f43f5e' // Rose - immediate attention
} as const

const HEALTH_STATUS_DESCRIPTIONS = {
  normal: 'within normal range',
  elevated: 'slightly elevated, monitor closely',
  high: 'above normal range, consult healthcare provider',
  low: 'below normal range, may need attention',
  critical: 'critical level, seek immediate medical attention'
} as const

export default function HealthTrendChart({
  data,
  title,
  description,
  showReferenceRange = true,
  // showTrendLine removed - not used
  width = 600,
  height = 400,
  className = ''
}: HealthTrendChartProps) {
  const { preferences } = useChartAccessibility()

  // Process health data for chart consumption
  const chartData = useMemo(() => {
    return data.map((point) => ({
      label: new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      value: point.value,
      color: HEALTH_STATUS_COLORS[point.status],
      description: `${point.testName}: ${point.value} ${point.unit} - ${HEALTH_STATUS_DESCRIPTIONS[point.status]}${point.notes ? `. Note: ${point.notes}` : ''}`,
      metadata: {
        fullDate: point.date,
        status: point.status,
        testName: point.testName,
        unit: point.unit,
        referenceRange: point.referenceRange,
        notes: point.notes
      }
    }))
  }, [data])

  // Calculate trend analysis
  const trendAnalysis = useMemo(() => {
    if (data.length < 2) return null

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstValue = sortedData[0].value
    const lastValue = sortedData[sortedData.length - 1].value
    const percentChange = ((lastValue - firstValue) / firstValue) * 100

    const trend = percentChange > 5 ? 'increasing' : 
                  percentChange < -5 ? 'decreasing' : 'stable'

    const criticalCount = data.filter(d => d.status === 'critical').length
    const abnormalCount = data.filter(d => ['high', 'low', 'critical'].includes(d.status)).length

    return {
      trend,
      percentChange,
      criticalCount,
      abnormalCount,
      totalReadings: data.length,
      latestStatus: sortedData[sortedData.length - 1].status,
      latestValue: lastValue,
      unit: sortedData[sortedData.length - 1].unit
    }
  }, [data])

  // Render reference range overlay - function removed as unused

  const enhancedDescription = useMemo(() => {
    let desc = description || ''
    
    if (trendAnalysis) {
      desc += ` Latest reading: ${trendAnalysis.latestValue} ${trendAnalysis.unit} (${HEALTH_STATUS_DESCRIPTIONS[trendAnalysis.latestStatus]}). `
      desc += `Trend over ${trendAnalysis.totalReadings} readings: ${trendAnalysis.trend}`
      
      if (trendAnalysis.percentChange !== 0) {
        desc += ` (${Math.abs(trendAnalysis.percentChange).toFixed(1)}% ${trendAnalysis.percentChange > 0 ? 'increase' : 'decrease'})`
      }
      
      if (trendAnalysis.criticalCount > 0) {
        desc += `. ${trendAnalysis.criticalCount} critical reading${trendAnalysis.criticalCount > 1 ? 's' : ''} detected.`
      }
    }

    return desc
  }, [description, trendAnalysis])

  return (
    <div className={`health-trend-chart ${className}`}>
      {/* Health status summary */}
      {trendAnalysis && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Latest Reading */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: HEALTH_STATUS_COLORS[trendAnalysis.latestStatus] }}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-slate-400">LATEST READING</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {trendAnalysis.latestValue} <span className="text-sm text-slate-400">{trendAnalysis.unit}</span>
            </div>
            <div className="text-sm text-slate-300 mt-1">
              {HEALTH_STATUS_DESCRIPTIONS[trendAnalysis.latestStatus]}
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-400">TREND</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {trendAnalysis.trend === 'increasing' ? '↗' : 
               trendAnalysis.trend === 'decreasing' ? '↙' : '→'} {' '}
              {trendAnalysis.trend.charAt(0).toUpperCase() + trendAnalysis.trend.slice(1)}
            </div>
            {Math.abs(trendAnalysis.percentChange) > 1 && (
              <div className="text-sm text-slate-300 mt-1">
                {Math.abs(trendAnalysis.percentChange).toFixed(1)}% change
              </div>
            )}
          </div>

          {/* Alert Status */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  trendAnalysis.criticalCount > 0 ? 'bg-rose-400 animate-pulse' :
                  trendAnalysis.abnormalCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-slate-400">STATUS</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {trendAnalysis.criticalCount > 0 ? 'Critical' :
               trendAnalysis.abnormalCount > 0 ? 'Attention Needed' : 'Normal'}
            </div>
            <div className="text-sm text-slate-300 mt-1">
              {trendAnalysis.abnormalCount} of {trendAnalysis.totalReadings} abnormal
            </div>
          </div>
        </div>
      )}

      {/* Medical Chart with enhanced accessibility */}
      <AccessibleChart
        data={chartData}
        type="line"
        title={title}
        description={enhancedDescription}
        width={width}
        height={height}
        showGrid={true}
        showLegend={false} // We show our own health-specific legend
        showValues={true}
        enableKeyboardNavigation={preferences.enableKeyboardNavigation}
        enableVoiceAnnouncements={preferences.enableVoiceAnnouncements}
        highContrastMode={preferences.highContrastMode}
        reducedMotion={preferences.reducedMotion}
        showDataTable={true}
        tableCaption={`Health trend data for ${title} over ${data.length} readings`}
        ariaLabel={`Health trend chart for ${title}. ${enhancedDescription}`}
        className="medical-chart"
      />

      {/* Reference Range Legend */}
      {showReferenceRange && data[0]?.referenceRange && (
        <div className="mt-6 bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Reference Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-sm opacity-30" aria-hidden="true" />
              <span className="text-slate-400">Normal Range:</span>
              <span className="text-emerald-300 font-mono">
                {data[0].referenceRange.min} - {data[0].referenceRange.max} {data[0].unit}
              </span>
            </div>
            {data[0].referenceRange.optimal && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-emerald-400 opacity-60" aria-hidden="true" />
                <span className="text-slate-400">Optimal:</span>
                <span className="text-emerald-300 font-mono font-semibold">
                  {data[0].referenceRange.optimal} {data[0].unit}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-rose-400 rounded-full" aria-hidden="true" />
                <div className="w-2 h-2 bg-amber-400 rounded-full" aria-hidden="true" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full" aria-hidden="true" />
              </div>
              <span className="text-slate-400">Color indicates health status</span>
            </div>
          </div>
        </div>
      )}

      {/* Health Recommendations */}
      {trendAnalysis && (trendAnalysis.criticalCount > 0 || trendAnalysis.abnormalCount > 2) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-amber-900/20 border border-amber-700/50 rounded-xl p-4"
          role="alert"
          aria-labelledby="health-recommendation"
        >
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-amber-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 id="health-recommendation" className="text-amber-300 font-semibold mb-2">
                Health Recommendation
              </h4>
              <p className="text-amber-200 text-sm leading-relaxed">
                {trendAnalysis.criticalCount > 0 
                  ? "Critical values detected in your recent test results. Please consult with your healthcare provider immediately to discuss these results and appropriate next steps."
                  : "Multiple abnormal readings detected in your recent results. Consider scheduling a follow-up appointment with your healthcare provider to review your health trends and discuss any necessary adjustments to your care plan."
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Specialized component for multiple biomarker comparison
export function MultiBiomarkerChart({
  datasets,
  title,
  width = 800,
  height = 500,
  className = ''
}: {
  datasets: { name: string; data: HealthDataPoint[]; color?: string }[]
  title: string
  width?: number
  height?: number
  className?: string
}) {
  // preferences removed - not used

  const combinedData = useMemo(() => {
    // Combine all datasets into a single chart-friendly format
    const allDates = [...new Set(
      datasets.flatMap(dataset => dataset.data.map(d => d.date))
    )].sort()

    return allDates.map(date => {
      const dataPoint: Record<string, unknown> = {
        label: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        date
      }

      datasets.forEach((dataset) => {
        const point = dataset.data.find(d => d.date === date)
        dataPoint[`${dataset.name}_value`] = point?.value || null
        dataPoint[`${dataset.name}_status`] = point?.status || 'normal'
        dataPoint[`${dataset.name}_unit`] = point?.unit || ''
      })

      return dataPoint
    })
  }, [datasets])

  return (
    <div className={`multi-biomarker-chart ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400">
          Comparing {datasets.length} biomarkers over {combinedData.length} time points
        </p>
      </div>

      {/* Individual trend charts for each biomarker */}
      <div className="space-y-8">
        {datasets.map((dataset, index) => (
          <HealthTrendChart
            key={dataset.name}
            data={dataset.data}
            title={dataset.name}
            description={`Biomarker ${index + 1} of ${datasets.length}`}
            width={width}
            height={Math.max(height / datasets.length, 200)}
            showReferenceRange={true}
            showTrendLine={true}
            className="border-l-4 border-l-cyan-400 pl-4"
          />
        ))}
      </div>

      {/* Combined summary */}
      <div className="mt-8 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h4 className="text-md font-semibold text-white mb-4">Multi-Biomarker Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {datasets.map((dataset) => {
            const latestData = dataset.data[dataset.data.length - 1]
            return (
              <div key={dataset.name} className="text-center">
                <div className="text-sm text-slate-400 mb-1">{dataset.name}</div>
                <div className="text-xl font-bold text-white font-mono">
                  {latestData?.value || '—'}
                  <span className="text-xs text-slate-400 ml-1">
                    {latestData?.unit}
                  </span>
                </div>
                <div 
                  className="text-xs mt-1"
                  style={{ color: latestData ? HEALTH_STATUS_COLORS[latestData.status] : '#64748b' }}
                >
                  {latestData ? HEALTH_STATUS_DESCRIPTIONS[latestData.status] : 'No data'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface TestResult {
  id: string
  test_name?: string
  result_date?: string
  value?: number
  unit?: string
  status?: string
  reference_range?: string
  diagnostic_tests?: {
    name: string
    category?: string
    unit?: string
    reference_range_min?: number
    reference_range_max?: number
  }
}

interface HealthTrendsViewProps {
  groupedResults: Record<string, TestResult[]>
}

export default function HealthTrendsView({ groupedResults }: HealthTrendsViewProps) {
  const [selectedTest, setSelectedTest] = useState<string>('')
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line')
  const [timeRange, setTimeRange] = useState<'all' | '1y' | '6m' | '3m'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Get unique categories
  const categories = Array.from(new Set(
    Object.values(groupedResults)
      .flat()
      .map(r => r.diagnostic_tests?.category)
      .filter(Boolean)
  ))

  // Filter tests by category
  const filteredTests = Object.entries(groupedResults).filter(([, results]) => {
    if (selectedCategory === 'all') return true
    return results[0]?.diagnostic_tests?.category === selectedCategory
  })

  // Get tests with trends (more than 1 result)
  const testsWithTrends = filteredTests.filter(([, results]) => results.length > 1)

  // Prepare chart data for selected test
  const getChartData = () => {
    if (!selectedTest || !groupedResults[selectedTest]) return []
    
    let results = [...groupedResults[selectedTest]]
    
    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (timeRange) {
        case '1y':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
        case '6m':
          cutoffDate.setMonth(now.getMonth() - 6)
          break
        case '3m':
          cutoffDate.setMonth(now.getMonth() - 3)
          break
      }
      
      results = results.filter(r => {
        const resultDate = new Date(r.result_date || r.created_at)
        return resultDate >= cutoffDate
      })
    }
    
    return results.map(result => ({
      date: new Date(result.result_date || result.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      }),
      value: result.value || 0,
      status: result.status,
      unit: result.unit || result.diagnostic_tests?.unit || '',
      refMin: result.diagnostic_tests?.reference_range_min,
      refMax: result.diagnostic_tests?.reference_range_max
    }))
  }

  const chartData = getChartData()

  // Get reference ranges for the selected test
  const getReferenceRange = () => {
    if (!selectedTest || !groupedResults[selectedTest] || groupedResults[selectedTest].length === 0) {
      return { min: null, max: null }
    }
    const firstResult = groupedResults[selectedTest][0]
    return {
      min: firstResult.diagnostic_tests?.reference_range_min || null,
      max: firstResult.diagnostic_tests?.reference_range_max || null
    }
  }

  const refRange = getReferenceRange()

  // Custom tooltip for charts
  interface TooltipProps {
    active?: boolean
    payload?: Array<{
      payload: {
        date: string
        value: number
        status: string
        normal_range?: { min: number; max: number }
      }
      value: number
    }>
    label?: string
  }
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="backdrop-blur-sm bg-slate-800/95 border border-slate-700/50 rounded-xl p-3 shadow-xl">
          <p className="text-white font-medium">{label}</p>
          <p className="text-cyan-400">
            Value: {payload[0].value} {data.unit}
          </p>
          <p className={`text-sm ${
            data.status === 'normal' ? 'text-emerald-400' :
            data.status === 'elevated' || data.status === 'high' ? 'text-amber-400' :
            data.status === 'low' ? 'text-amber-400' :
            data.status === 'critical' ? 'text-rose-400' :
            'text-slate-400'
          }`}>
            Status: {data.status || 'N/A'}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom dot for line chart
  interface DotProps {
    cx?: number
    cy?: number
    payload?: {
      status: string
      date: string
      value: number
    }
  }
  
  const CustomDot = (props: DotProps) => {
    const { cx, cy, payload } = props
    const color = 
      payload.status === 'normal' ? '#10b981' :
      payload.status === 'elevated' || payload.status === 'high' ? '#f59e0b' :
      payload.status === 'low' ? '#f59e0b' :
      payload.status === 'critical' ? '#f43f5e' :
      '#64748b'
    
    return (
      <circle cx={cx} cy={cy} r={6} fill={color} stroke="#1e293b" strokeWidth={2} />
    )
  }

  // Render chart based on type
  const renderChart = () => {
    if (chartData.length === 0) return null

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    }

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              {refRange.min && (
                <ReferenceLine y={refRange.min} stroke="#f59e0b" strokeDasharray="5 5" label="Min" />
              )}
              {refRange.max && (
                <ReferenceLine y={refRange.max} stroke="#f59e0b" strokeDasharray="5 5" label="Max" />
              )}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#06b6d4" 
                fillOpacity={1} 
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              {refRange.min && (
                <ReferenceLine y={refRange.min} stroke="#f59e0b" strokeDasharray="5 5" label="Min" />
              )}
              {refRange.max && (
                <ReferenceLine y={refRange.max} stroke="#f59e0b" strokeDasharray="5 5" label="Max" />
              )}
              <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      default: // line
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              {refRange.min && (
                <ReferenceLine y={refRange.min} stroke="#f59e0b" strokeDasharray="5 5" label="Min Normal" />
              )}
              {refRange.max && (
                <ReferenceLine y={refRange.max} stroke="#f59e0b" strokeDasharray="5 5" label="Max Normal" />
              )}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Test Selection and Controls */}
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-300">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Test Selection */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-300">Select Test:</label>
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50"
            >
              <option value="">Choose a test to view trends</option>
              {testsWithTrends.map(([testName, results]) => (
                <option key={testName} value={testName}>
                  {testName} ({results.length} results)
                </option>
              ))}
            </select>
          </div>

          {/* Chart Controls */}
          {selectedTest && (
            <div className="flex flex-wrap items-center gap-4">
              {/* Chart Type */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Chart Type:</span>
                <div className="flex gap-2">
                  {(['line', 'area', 'bar'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        chartType === type
                          ? 'bg-purple-500/20 border border-purple-400/50 text-purple-300'
                          : 'bg-slate-900/30 border border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Time Range:</span>
                <div className="flex gap-2">
                  {(['all', '1y', '6m', '3m'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        timeRange === range
                          ? 'bg-purple-500/20 border border-purple-400/50 text-purple-300'
                          : 'bg-slate-900/30 border border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      {range === 'all' ? 'All Time' : range.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Display */}
      {selectedTest && chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              {selectedTest} Trend Analysis
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Showing {chartData.length} results {timeRange !== 'all' && `from last ${timeRange}`}
            </p>
          </div>

          {renderChart()}

          {/* Trend Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/30 rounded-xl">
              <p className="text-slate-400 text-sm mb-1">Latest Value</p>
              <p className="text-xl font-bold text-white">
                {chartData[chartData.length - 1]?.value} {chartData[chartData.length - 1]?.unit}
              </p>
            </div>
            <div className="p-4 bg-slate-900/30 rounded-xl">
              <p className="text-slate-400 text-sm mb-1">Average</p>
              <p className="text-xl font-bold text-white">
                {(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(2)} {chartData[0]?.unit}
              </p>
            </div>
            <div className="p-4 bg-slate-900/30 rounded-xl">
              <p className="text-slate-400 text-sm mb-1">Trend</p>
              <p className={`text-xl font-bold ${
                chartData[chartData.length - 1]?.value > chartData[0]?.value 
                  ? 'text-amber-400' 
                  : chartData[chartData.length - 1]?.value < chartData[0]?.value
                    ? 'text-cyan-400'
                    : 'text-slate-400'
              }`}>
                {chartData[chartData.length - 1]?.value > chartData[0]?.value ? '↑' : 
                 chartData[chartData.length - 1]?.value < chartData[0]?.value ? '↓' : '→'} 
                {' '}
                {Math.abs(((chartData[chartData.length - 1]?.value - chartData[0]?.value) / chartData[0]?.value * 100)).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!selectedTest && (
        <div className="backdrop-blur-sm bg-slate-800/20 border border-slate-700/30 rounded-xl p-12 text-center">
          <div className="w-24 h-24 bg-purple-500/20 border border-purple-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-purple-400/30 rounded-xl flex items-center justify-center">
              <div className="flex items-end space-x-1">
                <div className="w-1 h-2 bg-purple-400 rounded-full"></div>
                <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
                <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                <div className="w-1 h-5 bg-purple-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Select a Test to View Trends
          </h3>
          <p className="text-slate-400 mb-4">
            Choose from your available tests above to see how your biomarkers change over time
          </p>
        </div>
      )}

      {/* Tests Without Trends */}
      {Object.entries(groupedResults).filter(([, results]) => results.length === 1).length > 0 && (
        <div className="backdrop-blur-sm bg-slate-800/20 border border-slate-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            Single Test Results
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            These tests have only one result. Get retested to start tracking trends.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedResults)
              .filter(([, results]) => results.length === 1)
              .map(([testName, results]) => (
                <div key={testName} className="p-4 bg-slate-900/30 rounded-xl">
                  <p className="text-white font-medium mb-1">{testName}</p>
                  <p className="text-slate-400 text-sm">
                    {results[0].value} {results[0].unit || results[0].diagnostic_tests?.unit}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {new Date(results[0].result_date || results[0].created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
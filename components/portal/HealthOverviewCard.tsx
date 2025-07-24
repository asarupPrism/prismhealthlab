'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TestResult } from '@/types/shared'

interface HealthOverviewCardProps {
  results: TestResult[] | null
}

export default function HealthOverviewCard({ results }: HealthOverviewCardProps) {
  // Calculate health metrics from results
  const calculateHealthMetrics = () => {
    if (!results || results.length === 0) {
      return {
        overall: 'No Data',
        normal: 0,
        elevated: 0,
        critical: 0,
        totalTests: 0
      }
    }

    const statusCounts = results.reduce((acc, result) => {
      const status = result.status?.toLowerCase() || 'normal'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalTests = results.length
    const normal = statusCounts.normal || 0
    const elevated = (statusCounts.elevated || 0) + (statusCounts.high || 0) + (statusCounts.low || 0)
    const critical = statusCounts.critical || 0

    let overall = 'Good'
    if (critical > 0) overall = 'Needs Attention'
    else if (elevated > totalTests * 0.3) overall = 'Monitor'
    else if (normal > totalTests * 0.8) overall = 'Excellent'

    return { overall, normal, elevated, critical, totalTests }
  }

  const metrics = calculateHealthMetrics()

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return { bg: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-400/30', text: 'text-emerald-300', dot: 'bg-emerald-400' }
      case 'Good':
        return { bg: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-400/30', text: 'text-cyan-300', dot: 'bg-cyan-400' }
      case 'Monitor':
        return { bg: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-400/30', text: 'text-amber-300', dot: 'bg-amber-400' }
      case 'Needs Attention':
        return { bg: 'from-rose-500/20 to-red-500/20', border: 'border-rose-400/30', text: 'text-rose-300', dot: 'bg-rose-400' }
      default:
        return { bg: 'from-slate-500/20 to-slate-600/20', border: 'border-slate-400/30', text: 'text-slate-300', dot: 'bg-slate-400' }
    }
  }

  const statusColors = getOverallStatusColor(metrics.overall)

  return (
    <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
        Health Overview
      </h3>

      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`mb-6 p-4 bg-gradient-to-br ${statusColors.bg} border ${statusColors.border} rounded-xl`}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-3 h-3 ${statusColors.dot} rounded-full animate-pulse`}></div>
            <h4 className="text-lg font-semibold text-white">Overall Health Status</h4>
          </div>
          <p className={`text-2xl font-bold ${statusColors.text} mb-1`}>
            {metrics.overall}
          </p>
          <p className="text-slate-400 text-sm">
            Based on {metrics.totalTests} recent test{metrics.totalTests !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* Metrics Breakdown */}
      {metrics.totalTests > 0 && (
        <div className="space-y-4">
          <h4 className="text-white font-semibold mb-4">Test Results Breakdown</h4>
          
          {/* Normal Results */}
          <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              <span className="text-slate-300">Normal Range</span>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">{metrics.normal}</p>
              <p className="text-emerald-400 text-xs">
                {metrics.totalTests > 0 ? Math.round((metrics.normal / metrics.totalTests) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Elevated Results */}
          {metrics.elevated > 0 && (
            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/20 border border-amber-400/30 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                </div>
                <span className="text-slate-300">Elevated/Low</span>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{metrics.elevated}</p>
                <p className="text-amber-400 text-xs">
                  {Math.round((metrics.elevated / metrics.totalTests) * 100)}%
                </p>
              </div>
            </div>
          )}

          {/* Critical Results */}
          {metrics.critical > 0 && (
            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-500/20 border border-rose-400/30 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-slate-300">Critical</span>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{metrics.critical}</p>
                <p className="text-rose-400 text-xs">
                  {Math.round((metrics.critical / metrics.totalTests) * 100)}%
                </p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Health Score</span>
              <span>
                {metrics.totalTests > 0 
                  ? Math.round(((metrics.normal + (metrics.elevated * 0.5)) / metrics.totalTests) * 100)
                  : 0
                }%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${metrics.totalTests > 0 
                    ? ((metrics.normal + (metrics.elevated * 0.5)) / metrics.totalTests) * 100
                    : 0
                  }%` 
                }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {metrics.totalTests === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <div className="flex items-end space-x-0.5">
                <div className="w-0.5 h-1 bg-slate-400 rounded-full"></div>
                <div className="w-0.5 h-2 bg-slate-400 rounded-full"></div>
                <div className="w-0.5 h-3 bg-slate-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <p className="text-slate-400 mb-2">No health data available</p>
          <p className="text-slate-500 text-sm">
            Complete your first test to see your health overview
          </p>
        </div>
      )}

      {/* Health Tips */}
      <div className="mt-6 pt-6 border-t border-slate-700/30">
        <h4 className="text-white font-semibold mb-3">Health Tip</h4>
        <div className="flex items-start gap-3 p-3 bg-slate-900/20 rounded-lg">
          <div className="w-6 h-6 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Regular health monitoring helps detect changes early. Consider scheduling follow-up tests every 3-6 months to track your health trends.
          </p>
        </div>
      </div>
    </div>
  )
}
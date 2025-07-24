'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TestResult } from '@/types/shared'

interface RecentResultsCardProps {
  results: TestResult[] | null
}

export default function RecentResultsCard({ results }: RecentResultsCardProps) {
  const getStatusColor = (status: string, value?: number, normalRange?: { min: number; max: number }) => {
    if (status === 'critical') return 'text-rose-400'
    if (status === 'elevated' || status === 'high') return 'text-amber-400'
    if (status === 'low') return 'text-amber-400'
    if (status === 'normal') return 'text-emerald-400'
    
    // If we have value and normal range, calculate status
    if (value !== undefined && normalRange) {
      if (value < normalRange.min || value > normalRange.max) {
        return 'text-amber-400'
      }
      return 'text-emerald-400'
    }
    
    return 'text-slate-400'
  }

  const getStatusIndicator = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'critical':
        return { color: 'bg-rose-400', label: 'Critical' }
      case 'elevated':
      case 'high':
        return { color: 'bg-amber-400', label: 'Elevated' }
      case 'low':
        return { color: 'bg-amber-400', label: 'Low' }
      case 'normal':
        return { color: 'bg-emerald-400', label: 'Normal' }
      default:
        return { color: 'bg-slate-400', label: 'Pending' }
    }
  }

  if (!results || results.length === 0) {
    return (
      <div className="backdrop-blur-sm bg-slate-800/20 border border-slate-700/30 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
            <div className="space-y-0.5">
              <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
              <div className="w-3 h-0.5 bg-slate-400 rounded-full"></div>
              <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-slate-400 mb-4">No test results available yet</p>
        <p className="text-slate-500 text-sm">
          Results will appear here once your tests are completed
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => {
        const indicator = getStatusIndicator(result.status)
        const resultDate = new Date(result.result_date || result.created_at)
        
        return (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 bg-cyan-300/50 rounded-lg flex items-center justify-center">
                    <div className="space-y-0.5">
                      <div className="w-1 h-0.5 bg-white rounded-full"></div>
                      <div className="w-2 h-0.5 bg-white rounded-full"></div>
                      <div className="w-1 h-0.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {result.diagnostic_tests?.name || 'Lab Test'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {result.diagnostic_tests?.category || 'Blood Work'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 ${indicator.color} rounded-full animate-pulse`}></div>
                  <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                    {indicator.label}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  {resultDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Test Values */}
            {result.test_values && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {Object.entries(result.test_values).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-slate-900/30 p-3 rounded-lg">
                    <span className="text-slate-300 text-sm capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className={`font-mono font-semibold ${getStatusColor(
                      typeof value === 'object' && value !== null ? value.status || 'normal' : 'normal',
                      typeof value === 'object' && value !== null && typeof value.value === 'number' ? value.value : undefined
                    )}`}>
                      {typeof value === 'object' && value !== null ? value.value : value} {typeof value === 'object' && value !== null ? value.unit || '' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {result.summary && (
              <div className="mb-4 p-3 bg-slate-900/20 rounded-lg">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {result.summary}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Result Date: {resultDate.toLocaleDateString()}</span>
                {result.reviewed_by && (
                  <span>Reviewed by Dr. {result.reviewed_by}</span>
                )}
              </div>
              
              <Link
                href={`/portal/results/${result.id}`}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 text-sm"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        )
      })}

      {/* View All Link */}
      <div className="text-center pt-4">
        <Link
          href="/portal/results"
          className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 hover:text-white transition-all duration-300"
        >
          View All Test Results
          <div className="w-4 h-4 bg-slate-400/50 rounded flex items-center justify-center">
            <span className="text-xs">→</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
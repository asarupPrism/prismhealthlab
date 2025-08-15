'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import RecentResultsCard from './RecentResultsCard'
import ResultsExportModal from './ResultsExportModal'
import { TestResult, Profile } from '@/types/shared'

interface ResultsViewProps {
  results: TestResult[]
  profile?: Profile
}

export default function ResultsView({ results, profile }: ResultsViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Get unique categories
  const categories = Array.from(new Set(
    results.map(result => result.diagnostic_tests?.category).filter(Boolean)
  ))

  // Filter results
  const filteredResults = results.filter(result => {
    const statusMatch = filterStatus === 'all' || result.status?.toLowerCase() === filterStatus
    const categoryMatch = filterCategory === 'all' || result.diagnostic_tests?.category === filterCategory
    return statusMatch && categoryMatch
  })

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.result_date || b.created_at).getTime() - new Date(a.result_date || a.created_at).getTime()
    }
    if (sortBy === 'status') {
      return (a.status || '').localeCompare(b.status || '')
    }
    if (sortBy === 'test') {
      return (a.diagnostic_tests?.name || '').localeCompare(b.diagnostic_tests?.name || '')
    }
    return 0
  })

  // Calculate statistics
  const stats = results.reduce((acc, result) => {
    const status = result.status?.toLowerCase() || 'pending'
    acc[status] = (acc[status] || 0) + 1
    acc.total = (acc.total || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const recentResults = results.filter(result => {
    const resultDate = new Date(result.result_date || result.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return resultDate > thirtyDaysAgo
  }).length

  return (
    <div className="space-y-8">
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-sm bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-cyan-400/20 border border-cyan-400/30 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            </div>
            <span className="text-slate-300 font-medium">Total Results</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
          <p className="text-cyan-300 text-sm">All time</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-400/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            </div>
            <span className="text-slate-300 font-medium">Normal</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.normal || 0}</p>
          <p className="text-emerald-300 text-sm">Within range</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="backdrop-blur-sm bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-400/20 border border-amber-400/30 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            </div>
            <span className="text-slate-300 font-medium">Flagged</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {(stats.elevated || 0) + (stats.high || 0) + (stats.low || 0) + (stats.critical || 0)}
          </p>
          <p className="text-amber-300 text-sm">Need attention</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-400/20 border border-purple-400/30 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            </div>
            <span className="text-slate-300 font-medium">Recent</span>
          </div>
          <p className="text-2xl font-bold text-white">{recentResults}</p>
          <p className="text-purple-300 text-sm">Last 30 days</p>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900/50 border border-slate-600/50 text-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none"
              >
                <option value="all">All Status</option>
                <option value="normal">Normal</option>
                <option value="elevated">Elevated</option>
                <option value="high">High</option>
                <option value="low">Low</option>
                <option value="critical">Critical</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm font-medium">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-900/50 border border-slate-600/50 text-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900/50 border border-slate-600/50 text-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none"
              >
                <option value="date">By Date</option>
                <option value="status">By Status</option>
                <option value="test">By Test Name</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25"
          >
            Export Results
          </button>
        </div>
      </div>

      {/* Results List */}
      {sortedResults.length > 0 ? (
        <div className="backdrop-blur-sm bg-slate-800/20 border border-slate-700/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            Test Results ({sortedResults.length})
          </h2>
          <RecentResultsCard results={sortedResults} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center">
              <div className="space-y-0.5">
                <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
                <div className="w-3 h-0.5 bg-slate-400 rounded-full"></div>
                <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {filterStatus !== 'all' || filterCategory !== 'all' 
              ? 'No results match your filters' 
              : 'No test results yet'
            }
          </h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            {filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your filters to see more results, or view all results.'
              : 'Your test results will appear here after your blood draw appointments are completed.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {filterStatus !== 'all' || filterCategory !== 'all' ? (
              <>
                <button
                  onClick={() => {
                    setFilterStatus('all')
                    setFilterCategory('all')
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
                >
                  Clear Filters
                </button>
                <Link
                  href="/products"
                  className="px-8 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:text-white transition-all duration-300 text-center"
                >
                  Order New Tests
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/products"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
                >
                  Order Diagnostic Tests
                </Link>
                <Link
                  href="/portal/appointments"
                  className="px-8 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:text-white transition-all duration-300 text-center"
                >
                  View Appointments
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Health Trends Section */}
      {results.length > 1 && (
        <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            Health Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-900/30 rounded-lg">
              <h4 className="text-white font-medium mb-2">Improvement Trend</h4>
              <p className="text-emerald-400 text-2xl font-bold mb-1">
                {Math.round(((stats.normal || 0) / (stats.total || 1)) * 100)}%
              </p>
              <p className="text-slate-400 text-sm">of results in normal range</p>
            </div>
            <div className="p-4 bg-slate-900/30 rounded-lg">
              <h4 className="text-white font-medium mb-2">Recent Activity</h4>
              <p className="text-cyan-400 text-2xl font-bold mb-1">{recentResults}</p>
              <p className="text-slate-400 text-sm">results in the last 30 days</p>
            </div>
          </div>
        </div>
      )}

      {/* Educational Content */}
      <div className="backdrop-blur-sm bg-slate-800/20 border border-slate-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          Understanding Your Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-emerald-300">Normal:</span> Values within the standard reference range for your age and gender.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-amber-400/20 border border-amber-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-amber-300">Elevated/Low:</span> Values outside normal range that may need monitoring or follow-up.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-rose-300">Critical:</span> Values requiring immediate attention from your healthcare provider.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-cyan-300">Trends:</span> Track changes over time to monitor your health progress and patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {profile && (
        <ResultsExportModal 
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          results={sortedResults}
          profile={profile}
        />
      )}
    </div>
  )
}
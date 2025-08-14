'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface TrendsStatisticsProps {
  stats: {
    totalTests: number
    uniqueTestTypes: number
    improvementRate: number
    mostRecentDate: Date | null
    normalResults: number
    testsWithTrends: number
  }
}

export default function TrendsStatistics({ stats }: TrendsStatisticsProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDaysSinceLastTest = () => {
    if (!stats.mostRecentDate) return null
    const diff = Date.now() - stats.mostRecentDate.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const daysSince = getDaysSinceLastTest()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-400/20 border border-purple-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-purple-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">Total Tests</p>
        <p className="text-2xl font-bold text-white">{stats.totalTests}</p>
        <p className="text-purple-300 text-sm mt-1">Completed</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="backdrop-blur-sm bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-indigo-400/20 border border-indigo-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-indigo-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">Test Types</p>
        <p className="text-2xl font-bold text-white">{stats.uniqueTestTypes}</p>
        <p className="text-indigo-300 text-sm mt-1">Tracked</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-emerald-400/20 border border-emerald-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-emerald-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">Normal Rate</p>
        <p className="text-2xl font-bold text-white">{stats.improvementRate}%</p>
        <p className="text-emerald-300 text-sm mt-1">In range</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="backdrop-blur-sm bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-cyan-400/20 border border-cyan-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-cyan-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">With Trends</p>
        <p className="text-2xl font-bold text-white">{stats.testsWithTrends}</p>
        <p className="text-cyan-300 text-sm mt-1">Multi-point</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="backdrop-blur-sm bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-400/20 border border-amber-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-amber-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">Last Test</p>
        <p className="text-lg font-bold text-white">{formatDate(stats.mostRecentDate)}</p>
        {daysSince !== null && (
          <p className="text-amber-300 text-sm mt-1">{daysSince} days ago</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="backdrop-blur-sm bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-rose-400/20 border border-rose-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-rose-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">Health Score</p>
        <p className="text-2xl font-bold text-white">{stats.improvementRate > 80 ? 'A+' : stats.improvementRate > 60 ? 'B+' : 'C+'}</p>
        <p className="text-rose-300 text-sm mt-1">Overall</p>
      </motion.div>
    </div>
  )
}
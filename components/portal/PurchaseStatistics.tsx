'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PurchaseSummary {
  totalOrders: number
  totalSpent: number
  totalTests: number
  avgOrderValue: number
  statusCounts: Record<string, number>
  recentActivity: {
    lastOrderDate?: string
    upcomingAppointments: number
    pendingResults: number
  }
}

interface PurchaseStatisticsProps {
  summary: PurchaseSummary
  className?: string
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  color: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue'
  icon: string
  delay?: number
}

function StatCard({ title, value, subtitle, trend, color, icon, delay = 0 }: StatCardProps) {
  const colorClasses = {
    cyan: 'from-cyan-400 to-cyan-600 border-cyan-700/50',
    emerald: 'from-emerald-400 to-emerald-600 border-emerald-700/50',
    amber: 'from-amber-400 to-amber-600 border-amber-700/50',
    rose: 'from-rose-400 to-rose-600 border-rose-700/50',
    blue: 'from-blue-400 to-blue-600 border-blue-700/50'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative group"
    >
      {/* Gradient Border */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} rounded-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
      
      <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
        {/* Status Indicator */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} rounded-t-xl`} />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 bg-${color}-400 rounded-full animate-pulse`} />
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <div className="text-2xl opacity-60">{icon}</div>
        </div>
        
        {/* Value */}
        <div className="mb-2">
          <div className="text-2xl font-bold text-white mb-1">
            {typeof value === 'number' && title.includes('Total Spent') 
              ? `$${value.toFixed(2)}` 
              : typeof value === 'number' && title.includes('Average')
              ? `$${value.toFixed(2)}`
              : value
            }
          </div>
          
          {subtitle && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {trend && (
                <span className={`text-${
                  trend === 'up' ? 'emerald-400' : 
                  trend === 'down' ? 'rose-400' : 
                  'slate-400'
                }`}>
                  {trendIcons[trend]}
                </span>
              )}
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function PurchaseStatistics({ 
  summary, 
  className = '' 
}: PurchaseStatisticsProps) {
  const {
    totalOrders,
    totalSpent,
    totalTests,
    avgOrderValue,
    statusCounts,
    recentActivity
  } = summary

  // Calculate some derived metrics
  const completedOrders = statusCounts.completed || 0
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
  const pendingOrders = statusCounts.pending || 0
  const hasRecentActivity = recentActivity.lastOrderDate && 
    new Date(recentActivity.lastOrderDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Format last order date
  const lastOrderText = recentActivity.lastOrderDate 
    ? new Date(recentActivity.lastOrderDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : 'None'

  return (
    <div className={`${className}`}>
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          subtitle={`${completedOrders} completed`}
          trend={hasRecentActivity ? 'up' : 'neutral'}
          color="cyan"
          icon="📋"
          delay={0}
        />
        
        <StatCard
          title="Total Spent"
          value={totalSpent}
          subtitle={`Avg: $${avgOrderValue.toFixed(2)}`}
          trend={totalSpent > avgOrderValue ? 'up' : 'neutral'}
          color="emerald"
          icon="💰"
          delay={0.1}
        />
        
        <StatCard
          title="Tests Ordered"
          value={totalTests}
          subtitle={`${(totalTests / Math.max(totalOrders, 1)).toFixed(1)} per order`}
          trend="neutral"
          color="blue"
          icon="🧪"
          delay={0.2}
        />
        
        <StatCard
          title="Completion Rate"
          value={`${completionRate.toFixed(0)}%`}
          subtitle={`${pendingOrders} pending`}
          trend={completionRate > 80 ? 'up' : completionRate > 50 ? 'neutral' : 'down'}
          color={completionRate > 80 ? 'emerald' : completionRate > 50 ? 'amber' : 'rose'}
          icon="✅"
          delay={0.3}
        />
      </div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Last Order */}
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📅</span>
            </div>
            <div className="text-sm text-slate-400 mb-1">Last Order</div>
            <div className="text-lg font-semibold text-white">{lastOrderText}</div>
          </div>
          
          {/* Upcoming Appointments */}
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-700/20 rounded-full flex items-center justify-center mx-auto mb-3 relative">
              <span className="text-xl">🩸</span>
              {recentActivity.upcomingAppointments > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {recentActivity.upcomingAppointments}
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-400 mb-1">Upcoming Appointments</div>
            <div className={`text-lg font-semibold ${
              recentActivity.upcomingAppointments > 0 ? 'text-amber-400' : 'text-white'
            }`}>
              {recentActivity.upcomingAppointments}
            </div>
          </div>
          
          {/* Pending Results */}
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-700/20 rounded-full flex items-center justify-center mx-auto mb-3 relative">
              <span className="text-xl">📊</span>
              {recentActivity.pendingResults > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {recentActivity.pendingResults}
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-400 mb-1">Results Available</div>
            <div className={`text-lg font-semibold ${
              recentActivity.pendingResults > 0 ? 'text-emerald-400' : 'text-white'
            }`}>
              {recentActivity.pendingResults}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        {(recentActivity.upcomingAppointments > 0 || recentActivity.pendingResults > 0) && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex flex-wrap gap-3 justify-center">
              {recentActivity.upcomingAppointments > 0 && (
                <button className="px-4 py-2 bg-amber-600/20 border border-amber-700/50 text-amber-300 rounded-lg hover:bg-amber-600/30 transition-colors text-sm">
                  View Appointments
                </button>
              )}
              {recentActivity.pendingResults > 0 && (
                <button className="px-4 py-2 bg-emerald-600/20 border border-emerald-700/50 text-emerald-300 rounded-lg hover:bg-emerald-600/30 transition-colors text-sm">
                  View Results
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
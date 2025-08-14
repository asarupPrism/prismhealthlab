'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface AppointmentsStats {
  total: number
  today: number
  upcoming: number
  completed: number
  pending: number
}

interface AdminAppointmentsStatsProps {
  stats: AppointmentsStats
}

export default function AdminAppointmentsStats({ stats }: AdminAppointmentsStatsProps) {
  const statCards = [
    {
      label: "Today's Appointments",
      value: stats.today,
      change: 'vs yesterday',
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-400/20',
      icon: '📅'
    },
    {
      label: 'Upcoming (7 Days)',
      value: stats.upcoming,
      change: 'scheduled',
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/20',
      icon: '⏰'
    },
    {
      label: 'Pending Confirmation',
      value: stats.pending,
      change: 'need confirmation',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-400/20',
      icon: '⏳'
    },
    {
      label: 'Completed',
      value: stats.completed,
      change: 'all time',
      color: 'from-emerald-400 to-green-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-400/20',
      icon: '✅'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30 hover:scale-105 transition-all duration-300 ${stat.bgColor} ${stat.borderColor}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="text-2xl opacity-50">{stat.icon}</div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">
              {stat.value.toLocaleString()}
            </h3>
            <p className="text-slate-300 text-sm font-medium">{stat.label}</p>
            <p className="text-slate-400 text-xs">{stat.change}</p>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stat.value / stats.total) * 100, 100)}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
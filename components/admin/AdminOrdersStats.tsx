'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface AdminOrdersStatsProps {
  stats: {
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalRevenue: number
    averageOrderValue: number
  }
}

export default function AdminOrdersStats({ stats }: AdminOrdersStatsProps) {
  const statCards = [
    {
      id: 'total',
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: '+15%',
      changeType: 'positive' as const,
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 'pending',
      title: 'Pending Orders',
      value: stats.pendingOrders.toLocaleString(),
      change: '-5%',
      changeType: 'positive' as const,
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 'completed',
      title: 'Completed Orders',
      value: stats.completedOrders.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+22%',
      changeType: 'positive' as const,
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 'aov',
      title: 'Avg Order Value',
      value: `$${Math.round(stats.averageOrderValue)}`,
      change: '+8%',
      changeType: 'positive' as const,
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-lg shadow-slate-900/30"
        >
          <div className="flex items-start justify-between mb-4">
            {card.icon}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              card.changeType === 'positive' 
                ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
                : 'bg-rose-500/20 border border-rose-400/30 text-rose-300'
            }`}>
              {card.change}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-100 transition-colors">
              {card.title}
            </h3>
            <p className="text-3xl font-bold text-white">
              {card.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
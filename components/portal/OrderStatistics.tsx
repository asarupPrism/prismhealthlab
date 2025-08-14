'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface OrderStatisticsProps {
  stats: {
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    completedOrders: number
    pendingOrders: number
  }
}

export default function OrderStatistics({ stats }: OrderStatisticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="backdrop-blur-sm bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-cyan-400/20 border border-cyan-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-cyan-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">Total Orders</p>
        <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
        <p className="text-cyan-300 text-sm mt-1">All time</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-emerald-400/20 border border-emerald-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-emerald-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">Total Spent</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalSpent)}</p>
        <p className="text-emerald-300 text-sm mt-1">Lifetime value</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="backdrop-blur-sm bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-400/20 border border-amber-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-amber-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">Average Order</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(stats.averageOrderValue)}</p>
        <p className="text-amber-300 text-sm mt-1">Per order</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-400/20 border border-purple-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-purple-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">Completed</p>
        <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
        <p className="text-purple-300 text-sm mt-1">Fulfilled orders</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="backdrop-blur-sm bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-400/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-rose-400/20 border border-rose-400/30 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-rose-300/50 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">In Progress</p>
        <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
        <p className="text-rose-300 text-sm mt-1">Active orders</p>
      </motion.div>
    </div>
  )
}
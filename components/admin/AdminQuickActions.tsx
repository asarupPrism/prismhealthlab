'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AdminQuickActions() {
  const quickActions = [
    {
      id: 'upload-results',
      title: 'Upload Test Results',
      description: 'Upload and process new patient test results',
      href: '/admin/results/upload',
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      color: 'emerald'
    },
    {
      id: 'new-appointment',
      title: 'Schedule Appointment',
      description: 'Create new patient appointment',
      href: '/admin/appointments/new',
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      color: 'blue'
    },
    {
      id: 'add-user',
      title: 'Add New User',
      description: 'Register new patient or staff member',
      href: '/admin/users/new',
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      color: 'cyan'
    },
    {
      id: 'manage-products',
      title: 'Manage Products',
      description: 'Update test catalog and pricing',
      href: '/admin/orders/products',
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      color: 'purple'
    },
    {
      id: 'system-alerts',
      title: 'Review Alerts',
      description: 'Check system notifications and warnings',
      href: '/admin/system/alerts',
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      color: 'amber'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Access business intelligence dashboard',
      href: '/admin/analytics',
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      color: 'teal'
    }
  ]

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
      </div>

      <div className="space-y-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              href={action.href}
              className="group flex items-center gap-4 p-4 bg-slate-900/30 rounded-xl hover:bg-slate-900/50 transition-all duration-300 hover:scale-105"
            >
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm group-hover:text-cyan-100 transition-colors">
                  {action.title}
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-slate-600/60 transition-colors">
                  <div className="w-3 h-3 flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-slate-400 group-hover:bg-slate-300"></div>
                    <div className="w-0.5 h-2 bg-slate-400 group-hover:bg-slate-300 absolute rotate-90"></div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="text-center">
          <Link
            href="/admin/help"
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            Need Help? View Admin Guide →
          </Link>
        </div>
      </div>
    </div>
  )
}
'use client'

import React, { Suspense } from 'react'
import { useAuth } from '@/context'
import { redirect } from 'next/navigation'
import MonitoringDashboard from '@/components/admin/MonitoringDashboard'
import { motion } from 'framer-motion'

// Loading component for the monitoring dashboard
function MonitoringDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 bg-slate-800 rounded-lg w-80"></div>
              <div className="h-4 bg-slate-800 rounded-lg w-64"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 bg-slate-800 rounded-lg w-32"></div>
              <div className="h-10 bg-slate-800 rounded-lg w-32"></div>
              <div className="h-10 bg-slate-800 rounded-lg w-24"></div>
            </div>
          </div>

          {/* Metrics cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
            ))}
          </div>

          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-800 rounded-xl"></div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className="h-80 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

export default function MonitoringPage() {
  const { user, profile, bootstrapLoading } = useAuth()

  // Show loading state while checking authentication
  if (bootstrapLoading) {
    return <MonitoringDashboardLoading />
  }

  // Redirect if not authenticated
  if (!user) {
    redirect('/auth/login?redirect=/admin/monitoring')
  }

  // Note: Admin check is handled by middleware, this is just fallback UI

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Admin Navigation Bar */}
      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div>
                  <h1 className="text-white font-semibold">Prism Health Lab</h1>
                  <p className="text-xs text-slate-400">Admin Panel</p>
                </div>
              </motion.div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-6">
                <a
                  href="/admin/dashboard"
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  Dashboard
                </a>
                <a
                  href="/admin/users"
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  Users
                </a>
                <a
                  href="/admin/monitoring"
                  className="text-cyan-400 font-medium text-sm"
                >
                  Monitoring
                </a>
                <a
                  href="/admin/analytics"
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  Analytics
                </a>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-white text-sm font-medium">
                  {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Admin User' : 'Admin User'}
                </p>
                <p className="text-slate-400 text-xs">Admin</p>
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {profile?.first_name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Suspense fallback={<MonitoringDashboardLoading />}>
          <MonitoringDashboard />
        </Suspense>
      </main>
    </div>
  )
}
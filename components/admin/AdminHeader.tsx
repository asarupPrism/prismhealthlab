'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User } from '@supabase/supabase-js'
import { AdminProfile } from '@/lib/admin-types'

interface AdminHeaderProps {
  user: User
  profile: { first_name?: string; last_name?: string; email?: string } | null
  adminProfile: AdminProfile | null
}

export default function AdminHeader({ user, profile, adminProfile }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSignOut = async () => {
    // TODO: Implement sign out functionality
    window.location.href = '/logout'
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* Page Title and Breadcrumb */}
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
            <p className="text-sm text-slate-400">Healthcare Operations Management</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          
          {/* System Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-300 text-sm font-medium">Online</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white/20 rounded flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              
              {/* Notification Badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-12 w-80 backdrop-blur-sm bg-slate-800/90 border border-slate-700/50 rounded-xl shadow-xl shadow-slate-900/50 z-50"
              >
                <div className="p-4 border-b border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    <div className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                        <span className="text-rose-300 text-sm font-medium">Critical Alert</span>
                      </div>
                      <p className="text-slate-300 text-sm">Test results pending review for 3 patients</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <span className="text-amber-300 text-sm font-medium">Low Inventory</span>
                      </div>
                      <p className="text-slate-300 text-sm">Blood collection tubes running low</p>
                    </div>
                    <div className="p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        <span className="text-cyan-300 text-sm font-medium">New Order</span>
                      </div>
                      <p className="text-slate-300 text-sm">5 new orders received today</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-700/50">
                  <Link
                    href="/admin/notifications"
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/admin/results/upload"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25"
            >
              Upload Results
            </Link>
            <Link
              href="/admin/appointments/new"
              className="px-4 py-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-600/60 transition-all duration-300"
            >
              New Appointment
            </Link>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {profile?.first_name?.[0] || user.email?.[0].toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-slate-400">{adminProfile?.role}</p>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-12 w-64 backdrop-blur-sm bg-slate-800/90 border border-slate-700/50 rounded-xl shadow-xl shadow-slate-900/50 z-50"
              >
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {profile?.first_name?.[0] || user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                      {adminProfile && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="text-emerald-300 text-xs font-medium uppercase">
                            {adminProfile.role}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="w-4 h-4 bg-slate-500 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    Admin Profile
                  </Link>
                  <Link
                    href="/portal"
                    className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="w-4 h-4 bg-cyan-500 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    Patient Portal
                  </Link>
                  <div className="my-2 h-px bg-slate-700/50"></div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="w-4 h-4 bg-rose-500 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
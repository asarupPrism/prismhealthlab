'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Profile } from '@/types/shared'

interface DashboardHeaderProps {
  profile: Profile | null
}

export default function DashboardHeader({ profile }: DashboardHeaderProps) {
  const currentTime = new Date()
  const hour = currentTime.getHours()
  
  const getGreeting = () => {
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getUserName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (profile?.first_name) {
      return profile.first_name
    }
    return 'Patient'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Welcome Message */}
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
            {getGreeting()}, {getUserName()}
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Welcome to your health dashboard. Here&apos;s an overview of your recent activity and upcoming appointments.
          </p>
        </div>

        {/* Status Card */}
        <div className="backdrop-blur-sm bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Account Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Member Since:</span>
              <span className="text-white">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })
                  : 'Recently'
                }
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Last Login:</span>
              <span className="text-white">Today</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Data Security:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                </div>
                <span className="text-emerald-300 text-xs">HIPAA Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-12 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
    </motion.div>
  )
}
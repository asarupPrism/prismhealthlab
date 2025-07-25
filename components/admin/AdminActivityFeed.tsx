'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface Activity {
  id: string
  action: string
  user_id: string
  metadata?: Record<string, unknown>
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
  }
}

interface AdminActivityFeedProps {
  activities: Activity[]
}

export default function AdminActivityFeed({ activities }: AdminActivityFeedProps) {
  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'user_login':
      case 'user_logout':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'appointment_created':
      case 'appointment_updated':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'order_created':
      case 'order_updated':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'result_uploaded':
      case 'result_approved':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'system_error':
      case 'security_alert':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-red-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )
    }
  }

  const formatActivityMessage = (activity: Activity) => {
    const userName = activity.profiles 
      ? `${activity.profiles.first_name} ${activity.profiles.last_name}`
      : 'System'

    switch (activity.action.toLowerCase()) {
      case 'user_login':
        return `${userName} logged into the system`
      case 'user_logout':
        return `${userName} logged out of the system`
      case 'appointment_created':
        return `${userName} created a new appointment`
      case 'appointment_updated':
        return `${userName} updated an appointment`
      case 'order_created':
        return `New order placed by ${userName}`
      case 'order_updated':
        return `Order updated for ${userName}`
      case 'result_uploaded':
        return `Test results uploaded for ${userName}`
      case 'result_approved':
        return `Test results approved for ${userName}`
      case 'system_error':
        return `System error occurred: ${activity.metadata?.error || 'Unknown error'}`
      case 'security_alert':
        return `Security alert: ${activity.metadata?.message || 'Security event detected'}`
      default:
        return `${activity.action} - ${userName}`
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start gap-4 p-3 bg-slate-900/30 rounded-lg hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm leading-relaxed">
                  {formatActivityMessage(activity)}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-slate-400 text-xs">
                    {getTimeAgo(activity.created_at)}
                  </span>
                  {activity.metadata && (
                    <span className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 text-slate-300 text-xs rounded">
                      {String(activity.metadata.type) || 'Info'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 border border-slate-400 rounded-sm"></div>
              </div>
            </div>
            <p className="text-slate-400 text-sm">No recent activity</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">
            Showing {activities.length} recent activities
          </span>
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
            View All →
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SystemHealthProps {
  health: {
    database: boolean
    swell: boolean
    email: boolean
    sms: boolean
  }
}

export default function AdminSystemHealth({ health }: SystemHealthProps) {
  const services = [
    {
      id: 'database',
      name: 'Supabase Database',
      status: health.database,
      description: 'PostgreSQL database connection and queries',
      icon: (
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 'swell',
      name: 'Swell E-commerce',
      status: health.swell,
      description: 'Product catalog and order processing',
      icon: (
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 'email',
      name: 'Email Service',
      status: health.email,
      description: 'Patient notifications and communications',
      icon: (
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 'sms',
      name: 'SMS Service',
      status: health.sms,
      description: 'Appointment reminders and alerts',
      icon: (
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      )
    }
  ]

  const overallHealth = Object.values(health).every(status => status)
  const healthyCount = Object.values(health).filter(status => status).length
  const totalCount = Object.values(health).length

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">System Health Monitor</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            overallHealth ? 'bg-emerald-400' : 'bg-rose-400'
          }`}></div>
          <span className={`text-sm font-medium ${
            overallHealth ? 'text-emerald-300' : 'text-rose-300'
          }`}>
            {overallHealth ? 'All Systems Operational' : 'Issues Detected'}
          </span>
        </div>
      </div>

      {/* Overall Health Summary */}
      <div className="mb-6 p-4 bg-slate-900/30 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-300 text-sm">System Status</span>
          <span className="text-white font-semibold">
            {healthyCount}/{totalCount} Services Online
          </span>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(healthyCount / totalCount) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-2 rounded-full ${
              healthyCount === totalCount
                ? 'bg-gradient-to-r from-emerald-400 to-green-400'
                : healthyCount > totalCount / 2
                ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                : 'bg-gradient-to-r from-rose-400 to-red-400'
            }`}
          />
        </div>
      </div>

      {/* Individual Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
              service.status
                ? 'bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 border-rose-400/30 hover:bg-rose-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              {service.icon}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm">
                    {service.name}
                  </h3>
                  <div className={`w-2 h-2 rounded-full ${
                    service.status ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}></div>
                </div>
                
                <p className="text-slate-300 text-xs mb-2 leading-relaxed">
                  {service.description}
                </p>
                
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  service.status
                    ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
                    : 'bg-rose-500/20 border border-rose-400/30 text-rose-300'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    service.status ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}></div>
                  {service.status ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            Last checked: {new Date().toLocaleTimeString()}
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-600/60 transition-all duration-300">
              Refresh Status
            </button>
            
            {!overallHealth && (
              <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-rose-400 hover:to-red-500 transition-all duration-300 shadow-lg shadow-rose-500/25">
                View Issues
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
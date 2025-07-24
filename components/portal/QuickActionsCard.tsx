'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function QuickActionsCard() {
  const actions = [
    {
      title: 'Order New Tests',
      description: 'Browse our diagnostic test catalog',
      href: '/products',
      icon: 'plus',
      color: 'from-cyan-500 to-blue-600',
      hoverColor: 'hover:from-cyan-400 hover:to-blue-500',
      shadowColor: 'shadow-cyan-500/25'
    },
    {
      title: 'Schedule Appointment',
      description: 'Book your blood draw visit',
      href: '/portal/appointments',
      icon: 'calendar',
      color: 'from-emerald-500 to-green-600',
      hoverColor: 'hover:from-emerald-400 hover:to-green-500',
      shadowColor: 'shadow-emerald-500/25'
    },
    {
      title: 'Download Results',
      description: 'Get PDF copies of your reports',
      href: '/portal/results',
      icon: 'download',
      color: 'from-amber-500 to-yellow-600',
      hoverColor: 'hover:from-amber-400 hover:to-yellow-500',
      shadowColor: 'shadow-amber-500/25'
    },
    {
      title: 'Update Profile',
      description: 'Manage your account settings',
      href: '/portal/profile',
      icon: 'profile',
      color: 'from-purple-500 to-pink-600',
      hoverColor: 'hover:from-purple-400 hover:to-pink-500',
      shadowColor: 'shadow-purple-500/25'
    }
  ]

  const getIcon = (iconName: string) => {
    const baseClasses = "w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center"
    
    switch (iconName) {
      case 'plus':
        return (
          <div className={baseClasses}>
            <div className="relative">
              <div className="w-3 h-0.5 bg-white rounded-full"></div>
              <div className="w-0.5 h-3 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        )
      case 'calendar':
        return (
          <div className={baseClasses}>
            <div className="w-4 h-4 border border-white rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'download':
        return (
          <div className={baseClasses}>
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 border-b-2 border-l-2 border-white transform rotate-45 mb-0.5"></div>
              <div className="w-0.5 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className={baseClasses}>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )
      default:
        return (
          <div className={baseClasses}>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )
    }
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
        Quick Actions
      </h3>
      
      <div className="space-y-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              href={action.href}
              className={`group block p-4 bg-gradient-to-r ${action.color} ${action.hoverColor} rounded-xl transition-all duration-300 shadow-lg ${action.shadowColor} hover:scale-105`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  {getIcon(action.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">
                    {action.title}
                  </h4>
                  <p className="text-white/80 text-sm">
                    {action.description}
                  </p>
                </div>
                <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <span className="text-white text-sm">→</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Emergency Contact */}
      <div className="mt-8 pt-6 border-t border-slate-700/30">
        <div className="flex items-start gap-3 p-4 bg-rose-900/20 border border-rose-700/50 rounded-xl">
          <div className="w-8 h-8 bg-rose-500/20 border border-rose-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">Critical Results?</h4>
            <p className="text-rose-300 text-sm mb-2">
              If you have urgent health concerns, contact your healthcare provider immediately.
            </p>
            <a 
              href="tel:911" 
              className="text-rose-400 hover:text-rose-300 text-sm font-medium"
            >
              Emergency: 911
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
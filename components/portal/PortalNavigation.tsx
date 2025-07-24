'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { User, Profile } from '@/types/shared'

interface PortalNavigationProps {
  user: User
  profile: Profile | null
}

export default function PortalNavigation({ user, profile }: PortalNavigationProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/portal',
      icon: 'dashboard',
      description: 'Overview of your health data'
    },
    {
      name: 'Appointments',
      href: '/portal/appointments',
      icon: 'calendar',
      description: 'Schedule and manage visits'
    },
    {
      name: 'Test Results',
      href: '/portal/results',
      icon: 'results',
      description: 'View your lab results'
    },
    {
      name: 'Health Trends',
      href: '/portal/trends',
      icon: 'trends',
      description: 'Track your health over time'
    },
    {
      name: 'Profile',
      href: '/portal/profile',
      icon: 'profile',
      description: 'Manage account settings'
    }
  ]

  const getIcon = (iconName: string) => {
    const baseClasses = "w-5 h-5 bg-white/80 rounded-lg flex items-center justify-center"
    const dotClasses = "w-2 h-2 bg-slate-800 rounded-full"
    
    switch (iconName) {
      case 'dashboard':
        return (
          <div className={baseClasses}>
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            </div>
          </div>
        )
      case 'calendar':
        return (
          <div className={baseClasses}>
            <div className="w-3 h-3 border border-slate-800 rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            </div>
          </div>
        )
      case 'results':
        return (
          <div className={baseClasses}>
            <div className="space-y-0.5">
              <div className="w-2 h-0.5 bg-slate-800 rounded-full"></div>
              <div className="w-3 h-0.5 bg-slate-800 rounded-full"></div>
              <div className="w-2 h-0.5 bg-slate-800 rounded-full"></div>
            </div>
          </div>
        )
      case 'trends':
        return (
          <div className={baseClasses}>
            <div className="flex items-end space-x-0.5">
              <div className="w-0.5 h-1 bg-slate-800 rounded-full"></div>
              <div className="w-0.5 h-2 bg-slate-800 rounded-full"></div>
              <div className="w-0.5 h-3 bg-slate-800 rounded-full"></div>
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className={baseClasses}>
            <div className={dotClasses}></div>
          </div>
        )
      default:
        return <div className={baseClasses}><div className={dotClasses}></div></div>
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 text-white rounded-xl hover:bg-slate-800/70 transition-all duration-300"
      >
        <div className="w-5 h-5 flex flex-col justify-center space-y-1">
          <div className="w-full h-0.5 bg-current rounded-full"></div>
          <div className="w-full h-0.5 bg-current rounded-full"></div>
          <div className="w-full h-0.5 bg-current rounded-full"></div>
        </div>
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.nav
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : '-100%'
        }}
        className="lg:animate-none lg:translate-x-0 fixed inset-y-0 left-0 z-50 w-64 lg:w-64 backdrop-blur-sm bg-slate-900/95 border-r border-slate-700/50 lg:bg-slate-900/80"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              Patient Portal
            </h1>
            
            {/* User Info */}
            <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : 'Patient'
                    }
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                      : 'hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-700/50 group-hover:bg-slate-600/60'
                  }`}>
                    {getIcon(item.icon)}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 leading-tight">
                      {item.description}
                    </p>
                  </div>

                  {isActive && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-700/50 space-y-3">
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 text-slate-300 rounded-xl hover:bg-slate-800/50 hover:border-slate-600/50 hover:text-white transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-emerald-300/50 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="text-sm font-medium">Order More Tests</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 text-slate-300 rounded-xl hover:bg-rose-900/20 hover:border-rose-700/50 hover:text-rose-300 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-400 rounded flex items-center justify-center">
                  <span className="text-xs text-slate-800">→</span>
                </div>
              </div>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </motion.nav>
    </>
  )
}
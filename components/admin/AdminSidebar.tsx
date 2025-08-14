'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { AdminProfile } from '@/lib/admin-types'

interface AdminSidebarProps {
  adminProfile: AdminProfile | null
}

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  permission?: string
  children?: NavItem[]
}

export default function AdminSidebar({ adminProfile }: AdminSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin',
      icon: (
        <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
          <div className="w-3 h-3 bg-white/20 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 'users',
      label: 'User Management',
      href: '/admin/users',
      icon: (
        <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      children: [
        {
          id: 'users-patients',
          label: 'Patients',
          href: '/admin/users/patients',
          icon: <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
        },
        {
          id: 'users-staff',
          label: 'Staff',
          href: '/admin/users/staff',
          icon: <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        }
      ]
    },
    {
      id: 'appointments',
      label: 'Appointments',
      href: '/admin/appointments',
      icon: (
        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      children: [
        {
          id: 'appointments-calendar',
          label: 'Calendar View',
          href: '/admin/appointments/calendar',
          icon: <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        },
        {
          id: 'appointments-scheduling',
          label: 'Staff Scheduling',
          href: '/admin/appointments/scheduling',
          icon: <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
        }
      ]
    },
    {
      id: 'locations',
      label: 'Locations',
      href: '/admin/locations',
      icon: (
        <div className="w-6 h-6 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 'results',
      label: 'Test Results',
      href: '/admin/results',
      icon: (
        <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      children: [
        {
          id: 'results-upload',
          label: 'Upload Results',
          href: '/admin/results/upload',
          icon: <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
        },
        {
          id: 'results-pending',
          label: 'Pending Review',
          href: '/admin/results/pending',
          icon: <div className="w-2 h-2 bg-orange-400 rounded-full"></div>,
          badge: '3'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Orders & Commerce',
      href: '/admin/orders',
      icon: (
        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      children: [
        {
          id: 'orders-list',
          label: 'All Orders',
          href: '/admin/orders',
          icon: <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
        },
        {
          id: 'orders-products',
          label: 'Product Catalog',
          href: '/admin/orders/products',
          icon: <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
        },
        {
          id: 'orders-inventory',
          label: 'Inventory',
          href: '/admin/orders/inventory',
          icon: <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/admin/analytics',
      icon: (
        <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      children: [
        {
          id: 'analytics-revenue',
          label: 'Revenue Reports',
          href: '/admin/analytics/revenue',
          icon: <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
        },
        {
          id: 'analytics-operations',
          label: 'Operations',
          href: '/admin/analytics/operations',
          icon: <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
        }
      ]
    },
    {
      id: 'system',
      label: 'System Admin',
      href: '/admin/system',
      icon: (
        <div className="w-6 h-6 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      permission: 'superadmin',
      children: [
        {
          id: 'system-settings',
          label: 'Settings',
          href: '/admin/system/settings',
          icon: <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
        },
        {
          id: 'system-audit',
          label: 'Audit Logs',
          href: '/admin/system/audit',
          icon: <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
        }
      ]
    }
  ]

  const filteredItems = navigationItems.filter(item => {
    if (!item.permission) return true
    return adminProfile?.role === 'superadmin' || adminProfile?.permissions.includes(item.permission)
  })

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const active = isActive(item.href)

    return (
      <div key={item.id}>
        <div className={`relative group ${level > 0 ? 'ml-6' : ''}`}>
          <Link
            href={hasChildren ? '#' : item.href}
            onClick={hasChildren ? (e) => {
              e.preventDefault()
              toggleExpanded(item.id)
            } : undefined}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
              active
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
            
            {item.badge && (
              <span className="ml-auto px-2 py-1 bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-medium rounded-full">
                {item.badge}
              </span>
            )}
            
            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <div className="w-4 h-4 bg-slate-600/50 rounded flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-slate-400"></div>
                  <div className="w-0.5 h-2 bg-slate-400 absolute"></div>
                </div>
              </motion.div>
            )}
          </Link>
        </div>

        {hasChildren && (
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1">
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl shadow-slate-900/50 z-40">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
          Prism Admin
        </h1>
        <p className="text-slate-400 text-sm mt-1">Healthcare Management System</p>
        
        {adminProfile && (
          <div className="mt-4 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-xs font-medium uppercase tracking-wide">
                {adminProfile.role}
              </span>
            </div>
            {adminProfile.department && (
              <p className="text-slate-400 text-xs mt-1">{adminProfile.department}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        {filteredItems.map(item => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-900/90">
        <div className="text-center">
          <p className="text-slate-400 text-xs">
            Admin Dashboard v2.0
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-xs">System Healthy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
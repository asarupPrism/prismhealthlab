'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context'
import { redirect } from 'next/navigation'
import PurchaseHistoryDashboard from '@/components/portal/PurchaseHistoryDashboard'
import AppointmentIntegrationCard from '@/components/portal/AppointmentIntegrationCard'
import TwoFactorManagement from '@/components/auth/TwoFactorManagement'

interface PortalTab {
  id: string
  title: string
  subtitle: string
  icon: string
  count?: number
}

interface DashboardData {
  recentOrders: Record<string, unknown>[]
  upcomingAppointments: Record<string, unknown>[]
  pendingResults: Record<string, unknown>[]
  securityStatus: {
    twoFactorEnabled: boolean
    lastLogin: string
    accountStrength: 'weak' | 'medium' | 'strong'
  }
}

export default function PatientPortalDashboard() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      redirect('/auth/signin')
    }
  }, [user, loading])

  // Fetch dashboard overview data
  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch recent purchase history
        const purchaseResponse = await fetch('/api/portal/purchase-history?limit=3')
        const purchaseData = await purchaseResponse.json()
        
        // Fetch upcoming appointments
        const appointmentResponse = await fetch('/api/portal/appointments?upcoming=true&limit=3')
        const appointmentData = await appointmentResponse.json()
        
        // Simulate security status check (would be real API calls)
        const securityStatus = {
          twoFactorEnabled: false, // Would check actual 2FA status
          lastLogin: new Date().toISOString(),
          accountStrength: 'medium' as const
        }

        setDashboardData({
          recentOrders: purchaseData.success ? purchaseData.data.orders : [],
          upcomingAppointments: appointmentData.success ? appointmentData.data.appointments : [],
          pendingResults: [], // Would fetch from results API
          securityStatus
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const tabs: PortalTab[] = [
    {
      id: 'overview',
      title: 'Overview',
      subtitle: 'Dashboard summary',
      icon: '📊',
      count: dashboardData?.upcomingAppointments.length || 0
    },
    {
      id: 'orders',
      title: 'Order History',
      subtitle: 'Purchase history & tracking',
      icon: '📋',
      count: dashboardData?.recentOrders.length || 0
    },
    {
      id: 'appointments',
      title: 'Appointments',
      subtitle: 'Schedule & manage',
      icon: '🩸',
      count: dashboardData?.upcomingAppointments.length || 0
    },
    {
      id: 'results',
      title: 'Results',
      subtitle: 'Test results & insights',
      icon: '📊',
      count: dashboardData?.pendingResults.length || 0
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Account protection',
      icon: '🔐'
    }
  ]

  const handleAppointmentCancel = async (appointmentId: string, reason: string) => {
    try {
      const response = await fetch('/api/portal/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          action: 'cancel',
          reason
        })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel appointment')
      }

      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      throw error
    }
  }

  const handleAppointmentReschedule = async (appointmentId: string, data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/portal/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          action: 'reschedule_request',
          ...data
        })
      })

      if (!response.ok) {
        throw new Error('Failed to request reschedule')
      }

      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error('Error requesting reschedule:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                Patient Portal
              </h1>
              <p className="text-slate-400 mt-1">
                Welcome back, {user.user_metadata?.first_name || user.email?.split('@')[0]}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="text-slate-400">Last login</div>
                <div className="text-white">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {(user.user_metadata?.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/30 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-cyan-300 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <div className="text-left">
                  <div>{tab.title}</div>
                  <div className="text-xs opacity-75">{tab.subtitle}</div>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{tab.count}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              {!loadingData && dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                    </div>
                    <div className="text-3xl font-bold text-cyan-400 mb-2">
                      {dashboardData.recentOrders.length}
                    </div>
                    <div className="text-sm text-slate-400">
                      In the last 30 days
                    </div>
                  </div>

                  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <h3 className="text-lg font-semibold text-white">Upcoming</h3>
                    </div>
                    <div className="text-3xl font-bold text-amber-400 mb-2">
                      {dashboardData.upcomingAppointments.length}
                    </div>
                    <div className="text-sm text-slate-400">
                      Appointments scheduled
                    </div>
                  </div>

                  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <h3 className="text-lg font-semibold text-white">Results</h3>
                    </div>
                    <div className="text-3xl font-bold text-emerald-400 mb-2">
                      {dashboardData.pendingResults.length}
                    </div>
                    <div className="text-sm text-slate-400">
                      Available to review
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Appointments */}
              {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    Upcoming Appointments
                  </h2>
                  <div className="space-y-4">
                    {dashboardData.upcomingAppointments.map((appointment) => (
                      <AppointmentIntegrationCard
                        key={appointment.id}
                        appointment={appointment}
                        onCancel={handleAppointmentCancel}
                        onRescheduleRequest={handleAppointmentReschedule}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:border-slate-500/50 transition-colors text-left">
                    <div className="text-2xl mb-2">🛒</div>
                    <div className="text-sm font-medium text-white">Order Tests</div>
                    <div className="text-xs text-slate-400">Browse test catalog</div>
                  </button>
                  
                  <button className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:border-slate-500/50 transition-colors text-left">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-sm font-medium text-white">Schedule</div>
                    <div className="text-xs text-slate-400">Book appointment</div>
                  </button>
                  
                  <button className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:border-slate-500/50 transition-colors text-left">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm font-medium text-white">Results</div>
                    <div className="text-xs text-slate-400">View test results</div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('security')}
                    className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:border-slate-500/50 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">🔐</div>
                    <div className="text-sm font-medium text-white">Security</div>
                    <div className="text-xs text-slate-400">Account settings</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <PurchaseHistoryDashboard />
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Appointments</h2>
                  <p className="text-slate-400">
                    Manage your blood draw appointments and scheduling
                  </p>
                </div>
                
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                  Schedule New Appointment
                </button>
              </div>

              {dashboardData?.upcomingAppointments && (
                <div className="space-y-4">
                  {dashboardData.upcomingAppointments.map((appointment) => (
                    <AppointmentIntegrationCard
                      key={appointment.id}
                      appointment={appointment}
                      onCancel={handleAppointmentCancel}
                      onRescheduleRequest={handleAppointmentReschedule}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Test Results</h2>
                <p className="text-slate-400">
                  View and download your diagnostic test results
                </p>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Results Coming Soon</h3>
                <p className="text-slate-400 mb-6">
                  Test results will appear here once your samples have been processed
                </p>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                  Order Tests
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Account Security</h2>
                <p className="text-slate-400">
                  Manage your account security settings and two-factor authentication
                </p>
              </div>

              <TwoFactorManagement />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
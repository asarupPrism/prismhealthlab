import React from 'react'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { createAdminServerAPI } from '@/lib/admin-server-api'
import { getSwellAnalytics } from '@/lib/server-only-swell'
import AdminDashboardStats from '@/components/admin/AdminDashboardStats'
import AdminActivityFeed from '@/components/admin/AdminActivityFeed'
import AdminSystemHealth from '@/components/admin/AdminSystemHealth'
import AdminQuickActions from '@/components/admin/AdminQuickActions'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const adminAPI = createAdminServerAPI(supabase)

  // Get dashboard statistics from both Supabase and Swell (server-side)
  const [
    supabaseStats,
    swellAnalytics,
    recentActivity,
    systemHealth
  ] = await Promise.all([
    adminAPI.getDashboardStats(),
    getSwellAnalytics(),
    adminAPI.getRecentActivity(10),
    adminAPI.getSystemHealth()
  ])

  // Combine stats from both sources
  const combinedStats = {
    ...supabaseStats,
    swellRevenue: swellAnalytics.revenue,
    swellOrders: swellAnalytics.orders,
    swellProducts: swellAnalytics.products,
    swellCustomers: swellAnalytics.customers
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-lg mt-2">
            Healthcare Operations Management Overview
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <AdminDashboardStats stats={combinedStats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Activity and Health */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Recent Activity Feed */}
          <AdminActivityFeed activities={recentActivity} />
          
          {/* System Health Monitor */}
          <AdminSystemHealth health={systemHealth} />
          
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <AdminQuickActions />
          
          {/* System Status Summary */}
          <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white">System Status</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm">Database</span>
                </div>
                <span className="text-emerald-300 text-sm font-medium">Healthy</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm">Swell Commerce</span>
                </div>
                <span className="text-emerald-300 text-sm font-medium">Connected</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm">Email Service</span>
                </div>
                <span className="text-emerald-300 text-sm font-medium">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm">SMS Service</span>
                </div>
                <span className="text-amber-300 text-sm font-medium">Limited</span>
              </div>
            </div>
          </div>
          
          {/* Recent Orders Summary */}
          <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white">Orders Overview</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Today&apos;s Orders</span>
                <span className="text-white font-semibold">{swellAnalytics.orders.today}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">This Month</span>
                <span className="text-white font-semibold">{swellAnalytics.orders.month}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Pending</span>
                <span className="text-amber-300 font-semibold">{swellAnalytics.orders.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Completed</span>
                <span className="text-emerald-300 font-semibold">{swellAnalytics.orders.completed}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ${swellAnalytics.revenue.today.toLocaleString()}
                </div>
                <div className="text-slate-400 text-sm">Today&apos;s Revenue</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

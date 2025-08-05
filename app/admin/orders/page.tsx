import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getSwellAnalytics, getSwellOrders } from '@/lib/server-only-swell'
import AdminOrdersList from '@/components/admin/AdminOrdersList'
import AdminOrdersStats from '@/components/admin/AdminOrdersStats'

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // Get orders from both Supabase and Swell API routes
  const [
    supabaseOrders,
    swellOrders,
    swellAnalytics
  ] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          email
        ),
        appointments (
          id,
          scheduled_date,
          location_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50),
    getSwellOrders(),
    getSwellAnalytics()
  ])

  // Combine and enrich order data
  const combinedOrders = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...swellOrders.map((order: any) => ({
      ...order,
      source: 'swell' as const,
      supabase_data: supabaseOrders.data?.find((so: { swell_order_id: string }) => so.swell_order_id === order.id)
    })),
    ...(supabaseOrders.data || [])
      .filter((order: { swell_order_id?: string }) => !order.swell_order_id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((order: any) => ({
        ...order,
        source: 'supabase' as const,
        id: order.id,
        number: `PHL-${order.id.slice(0, 8)}`,
        status: order.status || 'pending',
        customer_name: `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.trim(),
        customer_email: order.profiles?.email || '',
        total: order.total || 0,
        date_created: order.created_at
      }))
  ]

  const orderStats = {
    totalOrders: swellAnalytics.orders.today + swellAnalytics.orders.week + swellAnalytics.orders.month,
    pendingOrders: swellAnalytics.orders.pending,
    completedOrders: swellAnalytics.orders.completed,
    totalRevenue: swellAnalytics.revenue.month,
    averageOrderValue: swellAnalytics.orders.month > 0 ? swellAnalytics.revenue.month / swellAnalytics.orders.month : 0
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Order Management
          </h1>
          <p className="text-slate-400 text-lg mt-2">
            Monitor and manage all customer orders and e-commerce operations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      {/* Order Statistics */}
      <AdminOrdersStats stats={orderStats} />

      {/* Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Swell E-commerce</h2>
            <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Today&apos;s Orders</span>
              <span className="text-white font-semibold">{swellAnalytics.orders.today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Revenue Today</span>
              <span className="text-white font-semibold">${swellAnalytics.revenue.today.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Active Products</span>
              <span className="text-white font-semibold">{swellAnalytics.products.active}</span>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Supabase Orders</h2>
            <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Total Orders</span>
              <span className="text-white font-semibold">{supabaseOrders.data?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">With Appointments</span>
              <span className="text-white font-semibold">
                {supabaseOrders.data?.filter((o: { appointments?: unknown[] }) => o.appointments?.length && o.appointments.length > 0).length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Sync Status</span>
              <span className="text-emerald-300 font-semibold">Healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <AdminOrdersList orders={combinedOrders} />
    </div>
  )
}
import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrderHistoryView from '@/components/portal/OrderHistoryView'
import OrderStatistics from '@/components/portal/OrderStatistics'

export default async function OrderHistoryPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      appointments(
        id,
        scheduled_date,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate statistics
  const totalOrders = orders?.length || 0
  const totalSpent = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0
  const pendingOrders = orders?.filter(o => ['pending', 'processing'].includes(o.status)).length || 0

  const stats = {
    totalOrders,
    totalSpent,
    averageOrderValue,
    completedOrders,
    pendingOrders
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-4">
            Order History
          </h1>
          <p className="text-xl text-slate-300">
            View your past orders, receipts, and payment history
          </p>
        </div>

        {/* Order Statistics */}
        <OrderStatistics stats={stats} />

        {/* Orders List */}
        <OrderHistoryView orders={orders || []} />
      </div>
    </div>
  )
}
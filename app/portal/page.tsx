import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DashboardHeader from '@/components/portal/DashboardHeader'
import AppointmentCard from '@/components/portal/AppointmentCard'
import RecentResultsCard from '@/components/portal/RecentResultsCard'
import QuickActionsCard from '@/components/portal/QuickActionsCard'
import HealthOverviewCard from '@/components/portal/HealthOverviewCard'

export default async function PortalDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      orders (
        swell_order_id,
        items,
        total
      )
    `)
    .eq('user_id', user.id)
    .gte('scheduled_date', new Date().toISOString())
    .order('scheduled_date', { ascending: true })
    .limit(3)

  // Get recent test results
  const { data: recentResults } = await supabase
    .from('test_results')
    .select(`
      *,
      diagnostic_tests (
        name,
        category
      )
    `)
    .eq('user_id', user.id)
    .order('result_date', { ascending: false })
    .limit(5)

  // Get orders for stats
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-950 lg:pl-8 lg:pr-8 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-0">
        
        {/* Header */}
        <DashboardHeader profile={profile} />
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {upcomingAppointments?.length || 0}
                </p>
                <p className="text-sm text-slate-400">Upcoming Appointments</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {recentResults?.length || 0}
                </p>
                <p className="text-sm text-slate-400">Test Results</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {orders?.length || 0}
                </p>
                <p className="text-sm text-slate-400">Total Orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Upcoming Appointments */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Upcoming Appointments
                </h2>
                <Link 
                  href="/portal/appointments" 
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
              
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                    />
                  ))}
                </div>
              ) : (
                <div className="backdrop-blur-sm bg-slate-800/20 border border-slate-700/30 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 border border-slate-400 rounded-sm"></div>
                    </div>
                  </div>
                  <p className="text-slate-400 mb-4">No upcoming appointments</p>
                  <a 
                    href="/products" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
                  >
                    <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    Order Your First Test
                  </a>
                </div>
              )}
            </div>

            {/* Recent Results */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Recent Results
                </h2>
                <Link 
                  href="/portal/results" 
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
              
              <RecentResultsCard results={recentResults} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Quick Actions */}
            <QuickActionsCard />
            
            {/* Health Overview */}
            <HealthOverviewCard results={recentResults} />
            
          </div>
        </div>
      </div>
    </div>
  )
}
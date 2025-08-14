import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AdminAppointmentsWrapper from '@/components/admin/AdminAppointmentsWrapper'
import AdminAppointmentsStats from '@/components/admin/AdminAppointmentsStats'

export default async function AdminAppointmentsPage() {
  const supabase = await createClient()

  // Get all appointments with related data
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        email,
        phone
      ),
      locations (
        name,
        address_line_1,
        city,
        state,
        phone
      ),
      staff (
        employee_id,
        profiles!staff_user_id_fkey (
          first_name,
          last_name
        ),
        staff_roles (
          name
        )
      ),
      orders (
        id,
        swell_order_number,
        total,
        status,
        items
      )
    `)
    .order('scheduled_date', { ascending: true })
    .limit(100)

  // Get appointment statistics
  const today = new Date().toISOString().split('T')[0]
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })

  const { count: todayAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('scheduled_date', today)

  const { count: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_date', today)
    .lte('scheduled_date', weekFromNow)
    .eq('status', 'scheduled')

  const { count: completedAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  const { count: pendingAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .in('status', ['scheduled', 'confirmed'])

  const appointmentsStats = {
    total: totalAppointments || 0,
    today: todayAppointments || 0,
    upcoming: upcomingAppointments || 0,
    completed: completedAppointments || 0,
    pending: pendingAppointments || 0
  }

  // Get staff and locations for appointment creation
  const [staffResult, locationsResult] = await Promise.all([
    supabase
      .from('staff')
      .select(`
        *,
        profiles (
          first_name,
          last_name
        ),
        staff_roles!inner (
          name
        )
      `)
      .eq('is_active', true),
    supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
  ])

  // Filter staff by role names after fetching
  const allowedRoles = ['Phlebotomist', 'Lab Technician', 'Customer Service Representative']
  const staff = (staffResult.data || []).filter(s => 
    s.staff_roles && allowedRoles.includes(s.staff_roles.name)
  )
  const locations = locationsResult.data || []

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Appointment Management
          </h1>
          <p className="text-slate-400 text-lg mt-2">
            Monitor and manage all patient appointments and scheduling
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/admin/appointments/scheduling"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-500/25"
          >
            Staff Scheduling
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>

      {/* Appointment Statistics */}
      <AdminAppointmentsStats stats={appointmentsStats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/admin/appointments/calendar"
          className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30 hover:bg-slate-800/60 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Calendar View</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            View appointments in a calendar format with scheduling overview
          </p>
          <div className="text-cyan-400 text-sm font-medium">
            View Calendar →
          </div>
        </Link>

        <button className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30 hover:bg-slate-800/60 transition-all duration-300 group text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">New Appointment</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Manually schedule a new appointment for a patient
          </p>
          <div className="text-emerald-400 text-sm font-medium">
            Schedule Appointment →
          </div>
        </button>

        <Link 
          href="/admin/appointments/scheduling"
          className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30 hover:bg-slate-800/60 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Staff Availability</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Manage provider schedules and availability slots
          </p>
          <div className="text-amber-400 text-sm font-medium">
            Manage Availability →
          </div>
        </Link>
      </div>

      {/* Appointments List */}
      <AdminAppointmentsWrapper 
        initialAppointments={appointments || []}
        staff={staff}
        locations={locations}
      />
    </div>
  )
}
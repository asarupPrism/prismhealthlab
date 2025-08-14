import React from 'react'
import { createClient } from '@/lib/supabase/server'
import StaffAvailabilityCalendar from '@/components/admin/StaffAvailabilityCalendar'
import StaffScheduleList from '@/components/admin/StaffScheduleList'

export default async function AdminSchedulingPage() {
  const supabase = await createClient()

  // Get all staff members who can handle appointments
  const { data: staffData } = await supabase
    .from('staff')
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        email
      ),
      staff_roles!inner (
        name,
        description
      ),
      staff_departments (
        name
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Filter staff by role names after fetching
  const allowedRoles = ['Phlebotomist', 'Lab Technician', 'Customer Service Representative']
  const staff = (staffData || []).filter(s => 
    s.staff_roles && allowedRoles.includes(s.staff_roles.name)
  ).sort((a, b) => {
    const aName = a.profiles?.first_name || ''
    const bName = b.profiles?.first_name || ''
    return aName.localeCompare(bName)
  })

  // Get all locations
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Get existing appointments for the next 30 days to show conflicts
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_date,
      scheduled_time,
      estimated_duration_minutes,
      status,
      assigned_staff_id,
      location_id
    `)
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .lte('scheduled_date', thirtyDaysFromNow.toISOString().split('T')[0])
    .in('status', ['scheduled', 'confirmed', 'in_progress'])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Staff Scheduling & Availability
          </h1>
          <p className="text-slate-400 text-lg mt-2">
            Manage provider schedules and set availability for appointments
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Active Staff</h2>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{staff?.length || 0}</div>
          <p className="text-slate-400 text-sm">Available for scheduling</p>
        </div>

        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Locations</h2>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{locations?.length || 0}</div>
          <p className="text-slate-400 text-sm">Available locations</p>
        </div>

        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Scheduled</h2>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{existingAppointments?.length || 0}</div>
          <p className="text-slate-400 text-sm">Next 30 days</p>
        </div>
      </div>

      {/* Staff Availability Calendar */}
      <StaffAvailabilityCalendar 
        staff={staff || []} 
        locations={locations || []}
        existingAppointments={existingAppointments || []}
      />

      {/* Staff Schedule List */}
      <StaffScheduleList 
        staff={staff || []} 
        locations={locations || []}
      />
    </div>
  )
}
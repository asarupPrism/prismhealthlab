import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppointmentsView from '@/components/portal/AppointmentsView'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/checkout')
  }

  // Fetch user's appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select(`
      *,
      locations(name, address),
      orders(
        id,
        total,
        items
      )
    `)
    .eq('user_id', user.id)
    .order('scheduled_date', { ascending: true })

  if (appointmentsError) {
    console.error('Error fetching appointments:', appointmentsError)
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-4">
            Your Appointments
          </h1>
          <p className="text-xl text-slate-300">
            Manage your blood draw appointments and test scheduling
          </p>
        </div>

        {/* Appointments View */}
        <AppointmentsView appointments={appointments || []} />
      </div>
    </div>
  )
}
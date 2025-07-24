import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppointmentDetail from '@/components/portal/AppointmentDetail'

interface AppointmentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/checkout')
  }

  // Fetch specific appointment
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select(`
      *,
      locations(
        id,
        name,
        address,
        phone,
        hours
      ),
      orders(
        id,
        total,
        items,
        created_at
      ),
      test_results(
        id,
        status,
        result_date,
        summary,
        diagnostic_tests(name, category)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (appointmentError || !appointment) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <AppointmentDetail appointment={appointment} />
      </div>
    </div>
  )
}
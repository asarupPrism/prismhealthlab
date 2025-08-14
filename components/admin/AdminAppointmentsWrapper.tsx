'use client'

import React from 'react'
import AdminAppointmentsList from './AdminAppointmentsList'
import type { Appointment, StaffMember, Location } from '@/types/admin'

interface AdminAppointmentsWrapperProps {
  initialAppointments: Appointment[]
  staff: StaffMember[]
  locations: Location[]
}

export default function AdminAppointmentsWrapper({ 
  initialAppointments, 
  staff, 
  locations 
}: AdminAppointmentsWrapperProps) {
  const handleRefresh = () => {
    // In a real implementation, you'd refetch the appointments from the server
    // For now, we'll just trigger a page refresh
    window.location.reload()
  }

  return (
    <AdminAppointmentsList
      appointments={initialAppointments}
      staff={staff}
      locations={locations}
      onRefresh={handleRefresh}
    />
  )
}
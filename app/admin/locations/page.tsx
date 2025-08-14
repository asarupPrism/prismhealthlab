import React from 'react'
import { getAdminClient } from '@/lib/supabase/admin'
import LocationsList from '@/components/admin/LocationsList'
import CreateLocationForm from '@/components/admin/CreateLocationForm'

export default async function AdminLocationsPage() {
  const adminClient = getAdminClient()

  // Get all locations with staff information
  const { data: locations, error: locationsError } = await adminClient
    .from('locations')
    .select(`
      *,
      staff:location_manager_id (
        id,
        first_name,
        last_name,
        profiles (
          first_name,
          last_name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false })

  // Log simplified locations loading status
  if (locationsError) {
    console.error('Locations loading error:', locationsError)
  }

  // Get active staff for manager assignment
  const { data: staff, error: staffError } = await adminClient
    .from('staff')
    .select(`
      id,
      first_name,
      last_name,
      profiles (
        first_name,
        last_name,
        email
      )
    `)
    .eq('is_active', true)
    .order('first_name', { ascending: true })

  if (staffError) {
    console.error('Staff loading error:', staffError)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Location Management
          </h1>
          <p className="text-slate-400 text-lg mt-2">
            Manage testing centers, hours, and appointment availability
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      {/* Create Location Section */}
      <CreateLocationForm staff={staff || []} />

      {/* Current Locations List */}
      <LocationsList locations={locations || []} />
    </div>
  )
}
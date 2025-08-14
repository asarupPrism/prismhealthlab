'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schemas
const LocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  location_code: z.string().optional(),
  address_line_1: z.string().min(1, 'Street address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'ZIP code is required'),
  country: z.string().default('US'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  timezone: z.string().default('America/New_York'),
  capacity: z.number().min(1).max(50),
  location_manager_id: z.string().optional(),
  accepts_walk_ins: z.boolean().default(false),
  requires_appointment: z.boolean().default(true),
  is_active: z.boolean().default(true),
  operating_hours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean()
  })),
  services_offered: z.array(z.string()).default([])
})

export type LocationFormData = z.infer<typeof LocationSchema>

export async function createLocation(formData: LocationFormData) {
  try {
    // Validate form data
    const validatedData = LocationSchema.parse(formData)
    
    const adminClient = getAdminClient()
    
    // Clean up empty optional fields
    const cleanData = {
      ...validatedData,
      location_code: validatedData.location_code || null,
      address_line_2: validatedData.address_line_2 || null,
      phone: validatedData.phone || null,
      email: validatedData.email || null,
      website: validatedData.website || null,
      location_manager_id: validatedData.location_manager_id || null
    }
    
    // Insert location
    const { data: location, error } = await adminClient
      .from('locations')
      .insert([cleanData])
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
      .single()
    
    if (error) {
      console.error('Location creation error:', error)
      throw new Error(error.message)
    }
    
    // Revalidate the admin locations page
    revalidatePath('/admin/locations')
    
    return {
      success: true,
      data: location,
      message: 'Location created successfully'
    }
    
  } catch (error) {
    console.error('Location creation failed:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
        fieldErrors: error.issues.reduce((acc: Record<string, string>, err) => {
          if (err.path[0]) {
            acc[err.path[0] as string] = err.message
          }
          return acc
        }, {})
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create location'
    }
  }
}

export async function updateLocation(id: string, formData: Partial<LocationFormData>) {
  try {
    // Validate form data
    const validatedData = LocationSchema.partial().parse(formData)
    
    const adminClient = getAdminClient()
    
    // Clean up empty optional fields
    const cleanData = {
      ...validatedData,
      location_code: validatedData.location_code || null,
      address_line_2: validatedData.address_line_2 || null,
      phone: validatedData.phone || null,
      email: validatedData.email || null,
      website: validatedData.website || null,
      location_manager_id: validatedData.location_manager_id || null,
      updated_at: new Date().toISOString()
    }
    
    // Update location
    const { data: location, error } = await adminClient
      .from('locations')
      .update(cleanData)
      .eq('id', id)
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
      .single()
    
    if (error) {
      console.error('Location update error:', error)
      throw new Error(error.message)
    }
    
    // Revalidate the admin locations page
    revalidatePath('/admin/locations')
    
    return {
      success: true,
      data: location,
      message: 'Location updated successfully'
    }
    
  } catch (error) {
    console.error('Location update failed:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
        fieldErrors: error.issues.reduce((acc: Record<string, string>, err) => {
          if (err.path[0]) {
            acc[err.path[0] as string] = err.message
          }
          return acc
        }, {})
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update location'
    }
  }
}

export async function deleteLocation(id: string) {
  try {
    const adminClient = getAdminClient()
    
    // Check if location has active appointments
    const { data: appointments, error: appointmentsError } = await adminClient
      .from('appointments')
      .select('id')
      .eq('location_id', id)
      .eq('status', 'scheduled')
      .limit(1)
    
    if (appointmentsError) {
      throw new Error('Failed to check for active appointments')
    }
    
    if (appointments && appointments.length > 0) {
      return {
        success: false,
        error: 'Cannot delete location with active appointments'
      }
    }
    
    // Soft delete by marking as inactive instead of hard delete
    const { error } = await adminClient
      .from('locations')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) {
      console.error('Location deletion error:', error)
      throw new Error(error.message)
    }
    
    // Revalidate the admin locations page
    revalidatePath('/admin/locations')
    
    return {
      success: true,
      message: 'Location deactivated successfully'
    }
    
  } catch (error) {
    console.error('Location deletion failed:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete location'
    }
  }
}

export async function toggleLocationStatus(id: string, isActive: boolean) {
  try {
    const adminClient = getAdminClient()
    
    const { data: location, error } = await adminClient
      .from('locations')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name, is_active')
      .single()
    
    if (error) {
      console.error('Location status toggle error:', error)
      throw new Error(error.message)
    }
    
    // Revalidate the admin locations page
    revalidatePath('/admin/locations')
    
    return {
      success: true,
      data: location,
      message: `Location ${isActive ? 'activated' : 'deactivated'} successfully`
    }
    
  } catch (error) {
    console.error('Location status toggle failed:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update location status'
    }
  }
}

export async function getActiveLocations() {
  try {
    const adminClient = getAdminClient()
    
    const { data: locations, error } = await adminClient
      .from('locations')
      .select(`
        id,
        name,
        address_line_1,
        address_line_2,
        city,
        state,
        zip_code,
        phone,
        operating_hours,
        services_offered,
        accepts_walk_ins,
        capacity
      `)
      .eq('is_active', true)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Active locations fetch error:', error)
      throw new Error(error.message)
    }
    
    return {
      success: true,
      data: locations || []
    }
    
  } catch (error) {
    console.error('Active locations fetch failed:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch active locations',
      data: []
    }
  }
}

export async function getLocationById(id: string) {
  try {
    const adminClient = getAdminClient()
    
    const { data: location, error } = await adminClient
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
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Location fetch error:', error)
      throw new Error(error.message)
    }
    
    return {
      success: true,
      data: location
    }
    
  } catch (error) {
    console.error('Location fetch failed:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch location'
    }
  }
}
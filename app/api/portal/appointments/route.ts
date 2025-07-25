import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface AppointmentWithOrder {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  appointment_type: string
  location_id?: string
  metadata: any
  created_at: string
  updated_at: string
  order: {
    id: string
    total_amount: number
    status: string
    order_tests: Array<{
      test_name: string
      quantity: number
    }>
  } | null
  location_info?: {
    name: string
    address: string
    phone: string
    hours: any
  }
}

interface AppointmentSummary {
  totalAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  nextAppointment?: {
    date: string
    time: string
    location: string
    testsCount: number
  }
  recentlyCompleted: AppointmentWithOrder[]
}

// GET /api/portal/appointments - Fetch user appointments with purchase context
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const upcoming = searchParams.get('upcoming') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build appointments query with order information
    let appointmentsQuery = supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        appointment_type,
        location_id,
        metadata,
        created_at,
        updated_at,
        order_id,
        orders (
          id,
          total_amount,
          status,
          order_tests (
            test_name,
            quantity
          )
        )
      `)
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .limit(limit)

    // Apply filters
    if (status) {
      appointmentsQuery = appointmentsQuery.eq('status', status)
    }

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0]
      appointmentsQuery = appointmentsQuery.gte('appointment_date', today)
    }

    const { data: appointments, error: appointmentsError } = await appointmentsQuery

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    // Get location information for appointments
    const locationIds = [...new Set(
      appointments
        ?.filter(apt => apt.location_id)
        .map(apt => apt.location_id)
    )] as string[]

    let locations: any[] = []
    if (locationIds.length > 0) {
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('id, name, address, phone, operating_hours')
        .in('id', locationIds)

      if (!locationError) {
        locations = locationData || []
      }
    }

    // Process appointments with enhanced data
    const processedAppointments: AppointmentWithOrder[] = (appointments || []).map(apt => {
      const location = locations.find(loc => loc.id === apt.location_id)
      
      return {
        id: apt.id,
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        status: apt.status,
        appointment_type: apt.appointment_type || 'blood_draw',
        location_id: apt.location_id,
        metadata: {
          ...apt.metadata,
          location_name: apt.metadata?.location_name || location?.name,
          staff_name: apt.metadata?.staff_name
        },
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        order: apt.orders ? {
          id: apt.orders.id,
          total_amount: apt.orders.total_amount,
          status: apt.orders.status,
          order_tests: apt.orders.order_tests || []
        } : null,
        location_info: location ? {
          name: location.name,
          address: location.address,
          phone: location.phone,
          hours: location.operating_hours
        } : undefined
      }
    })

    // Calculate summary statistics
    const summary = calculateAppointmentSummary(processedAppointments)

    // Log access for audit
    await supabase
      .from('patient_audit_logs')
      .insert({
        user_id: user.id,
        action: 'appointments_accessed',
        resource: 'appointments',
        metadata: {
          filter_status: status,
          upcoming_only: upcoming,
          total_records: appointments?.length || 0,
          access_timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      data: {
        appointments: processedAppointments,
        summary
      }
    })

  } catch (error) {
    console.error('Appointments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Calculate appointment summary statistics
function calculateAppointmentSummary(appointments: AppointmentWithOrder[]): AppointmentSummary {
  const now = new Date()
  
  const totalAppointments = appointments.length
  
  const upcomingAppointments = appointments.filter(apt => {
    const aptDateTime = new Date(`${apt.appointment_date} ${apt.appointment_time}`)
    return aptDateTime > now && apt.status === 'scheduled'
  }).length
  
  const completedAppointments = appointments.filter(apt => 
    apt.status === 'completed'
  ).length
  
  const cancelledAppointments = appointments.filter(apt => 
    apt.status === 'cancelled'
  ).length

  // Find next upcoming appointment
  const nextUpcoming = appointments
    .filter(apt => {
      const aptDateTime = new Date(`${apt.appointment_date} ${apt.appointment_time}`)
      return aptDateTime > now && apt.status === 'scheduled'
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`)
      const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`)
      return dateA.getTime() - dateB.getTime()
    })[0]

  const nextAppointment = nextUpcoming ? {
    date: nextUpcoming.appointment_date,
    time: nextUpcoming.appointment_time,
    location: nextUpcoming.metadata?.location_name || 'Location TBD',
    testsCount: nextUpcoming.order?.order_tests?.reduce((sum, test) => sum + test.quantity, 0) || 0
  } : undefined

  // Get recently completed appointments (within last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentlyCompleted = appointments
    .filter(apt => {
      const aptDate = new Date(apt.appointment_date)
      return apt.status === 'completed' && aptDate >= thirtyDaysAgo
    })
    .sort((a, b) => {
      const dateA = new Date(a.appointment_date)
      const dateB = new Date(b.appointment_date)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 3)

  return {
    totalAppointments,
    upcomingAppointments,
    completedAppointments,
    cancelledAppointments,
    nextAppointment,
    recentlyCompleted
  }
}

// PUT /api/portal/appointments - Update appointment (limited patient actions)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { appointmentId, action, ...updateData } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Verify appointment ownership
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, status, user_id, appointment_date, appointment_time')
      .eq('id', appointmentId)
      .eq('user_id', user.id)
      .single()

    if (appointmentError) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if appointment can be modified
    const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    let result
    
    switch (action) {
      case 'cancel':
        if (appointment.status === 'completed') {
          return NextResponse.json(
            { error: 'Cannot cancel completed appointment' },
            { status: 400 }
          )
        }
        
        if (hoursUntilAppointment < 24) {
          return NextResponse.json(
            { error: 'Cannot cancel appointment less than 24 hours in advance' },
            { status: 400 }
          )
        }
        
        result = await supabase
          .from('appointments')
          .update({
            status: 'cancelled',
            metadata: {
              ...appointment.metadata,
              cancelled_at: new Date().toISOString(),
              cancelled_by: 'patient',
              cancellation_reason: updateData.reason || 'Patient request'
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', appointmentId)
        break

      case 'reschedule_request':
        if (appointment.status !== 'scheduled') {
          return NextResponse.json(
            { error: 'Can only request reschedule for scheduled appointments' },
            { status: 400 }
          )
        }
        
        result = await supabase
          .from('appointments')
          .update({
            metadata: {
              ...appointment.metadata,
              reschedule_requested: true,
              reschedule_requested_at: new Date().toISOString(),
              requested_date: updateData.requestedDate,
              requested_time: updateData.requestedTime,
              reschedule_reason: updateData.reason
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', appointmentId)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (result?.error) {
      console.error('Error updating appointment:', result.error)
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('patient_audit_logs')
      .insert({
        user_id: user.id,
        action: `appointment_${action}`,
        resource: 'appointments',
        resource_id: appointmentId,
        metadata: {
          action_timestamp: new Date().toISOString(),
          update_data: updateData,
          hours_before_appointment: hoursUntilAppointment
        }
      })

    // Invalidate cache
    await supabase
      .from('cache_invalidation_queue')
      .insert({
        cache_key: `user:${user.id}:appointments`,
        cache_type: 'appointments',
        user_id: user.id,
        invalidated_at: new Date().toISOString(),
        processed: false
      })

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully'
    })

  } catch (error) {
    console.error('Appointment update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
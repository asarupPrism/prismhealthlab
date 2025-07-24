import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/appointments/[id] - Get specific appointment
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
          swell_order_id
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
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ appointment })

  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/[id] - Update specific appointment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First, verify the appointment belongs to the user
    const { data: existingAppointment, error: existingError } = await supabase
      .from('appointments')
      .select('id, status, scheduled_date')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existingError || !existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if appointment can be modified
    if (existingAppointment.status === 'completed' || existingAppointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot modify completed or cancelled appointments' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      scheduled_date,
      location_id,
      notes,
      status
    } = body

    // Validate new appointment date if provided
    if (scheduled_date) {
      const appointmentDate = new Date(scheduled_date)
      const now = new Date()
      
      if (appointmentDate <= now) {
        return NextResponse.json(
          { error: 'Appointment date must be in the future' },
          { status: 400 }
        )
      }
    }

    // Validate location if provided
    if (location_id) {
      const { data: location, error: locationError } = await supabase
        .from('locations')
        .select('id')
        .eq('id', location_id)
        .single()

      if (locationError || !location) {
        return NextResponse.json(
          { error: 'Invalid location_id' },
          { status: 400 }
        )
      }
    }

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Valid values: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (scheduled_date) updateData.scheduled_date = new Date(scheduled_date).toISOString()
    if (location_id) updateData.location_id = location_id
    if (notes !== undefined) updateData.notes = notes
    if (status) updateData.status = status

    // Update appointment
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        locations(
          id,
          name,
          address,
          phone
        ),
        orders(
          id,
          total,
          items
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating appointment:', updateError)
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      )
    }

    // TODO: Send notification if rescheduled
    // TODO: Update calendar integrations

    return NextResponse.json({
      appointment: updatedAppointment,
      message: 'Appointment updated successfully'
    })

  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/appointments/[id] - Partial update (same as PUT for appointments)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params })
}

// DELETE /api/appointments/[id] - Cancel appointment (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First, verify the appointment belongs to the user
    const { data: existingAppointment, error: existingError } = await supabase
      .from('appointments')
      .select('id, status, scheduled_date')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existingError || !existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if appointment can be cancelled
    if (existingAppointment.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed appointments' },
        { status: 400 }
      )
    }

    if (existingAppointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Appointment is already cancelled' },
        { status: 400 }
      )
    }

    // Check cancellation policy (24 hours notice required)
    const appointmentDate = new Date(existingAppointment.scheduled_date)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilAppointment < 24) {
      return NextResponse.json(
        { 
          error: 'Appointments must be cancelled at least 24 hours in advance',
          hours_until_appointment: Math.round(hoursUntilAppointment)
        },
        { status: 400 }
      )
    }

    // Soft delete by updating status to cancelled
    const { data: cancelledAppointment, error: cancelError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        locations(
          id,
          name,
          address
        )
      `)
      .single()

    if (cancelError) {
      console.error('Error cancelling appointment:', cancelError)
      return NextResponse.json(
        { error: 'Failed to cancel appointment' },
        { status: 500 }
      )
    }

    // TODO: Send cancellation confirmation email
    // TODO: Process any refunds if applicable
    // TODO: Free up the appointment slot

    return NextResponse.json({
      appointment: cancelledAppointment,
      message: 'Appointment cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
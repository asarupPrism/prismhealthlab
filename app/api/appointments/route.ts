import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/appointments - List user's appointments
export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
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
        )
      `)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true })
      .range(offset, offset + limit - 1)

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: appointments, error: appointmentsError } = await query

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      appointments: appointments || [],
      count: appointments?.length || 0
    })

  } catch (error) {
    console.error('Appointments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    // Validate required fields
    const {
      scheduled_date,
      location_id,
      order_id,
      notes,
      appointment_type = 'blood_draw'
    } = body

    if (!scheduled_date || !location_id) {
      return NextResponse.json(
        { error: 'Missing required fields: scheduled_date, location_id' },
        { status: 400 }
      )
    }

    // Validate appointment date is in the future
    const appointmentDate = new Date(scheduled_date)
    const now = new Date()
    
    if (appointmentDate <= now) {
      return NextResponse.json(
        { error: 'Appointment date must be in the future' },
        { status: 400 }
      )
    }

    // Check if location exists
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('id, name')
      .eq('id', location_id)
      .single()

    if (locationError || !location) {
      return NextResponse.json(
        { error: 'Invalid location_id' },
        { status: 400 }
      )
    }

    // Prepare appointment data
    const appointmentData = {
      user_id: user.id,
      scheduled_date: appointmentDate.toISOString(),
      location_id,
      order_id: order_id || null,
      appointment_type,
      status: 'confirmed',
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Create appointment
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert([appointmentData])
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

    if (createError) {
      console.error('Error creating appointment:', createError)
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    // TODO: Send confirmation email
    // TODO: Create notification

    return NextResponse.json({
      appointment,
      message: 'Appointment created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments - Bulk update appointments (admin only)
export async function PUT() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin status (you'll need to implement admin role checking)
    // For now, we'll just return unauthorized for bulk updates
    return NextResponse.json(
      { error: 'Admin access required for bulk operations' },
      { status: 403 }
    )

  } catch (error) {
    console.error('Bulk update appointments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
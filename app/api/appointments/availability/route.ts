import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/appointments/availability - Get available appointment slots
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const location_id = searchParams.get('location_id')
    const date = searchParams.get('date') // YYYY-MM-DD format
    const days_ahead = parseInt(searchParams.get('days_ahead') || '30')

    if (!location_id) {
      return NextResponse.json(
        { error: 'location_id is required' },
        { status: 400 }
      )
    }

    // Validate location exists
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('id, name, hours, timezone')
      .eq('id', location_id)
      .single()

    if (locationError || !location) {
      return NextResponse.json(
        { error: 'Invalid location_id' },
        { status: 400 }
      )
    }

    // Calculate date range
    const startDate = date ? new Date(date) : new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + days_ahead)

    // Get existing appointments for the location and date range
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('scheduled_date, status')
      .eq('location_id', location_id)
      .gte('scheduled_date', startDate.toISOString())
      .lte('scheduled_date', endDate.toISOString())
      .in('status', ['confirmed', 'pending', 'in_progress'])

    if (appointmentsError) {
      console.error('Error fetching existing appointments:', appointmentsError)
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      )
    }

    // Generate available slots
    const availableSlots = generateAvailableSlots(
      startDate,
      endDate,
      location.hours || getDefaultHours(),
      existingAppointments || []
    )

    return NextResponse.json({
      location: {
        id: location.id,
        name: location.name,
        hours: location.hours
      },
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      available_slots: availableSlots,
      total_slots: availableSlots.length
    })

  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate available appointment slots
function generateAvailableSlots(
  startDate: Date,
  endDate: Date,
  locationHours: Record<string, unknown>,
  existingAppointments: Array<{ scheduled_date: string; status: string }>
): Array<{ datetime: string; date: string; time: string; available: boolean }> {
  const slots: Array<{ datetime: string; date: string; time: string; available: boolean }> = []
  const bookedTimes = new Set(
    existingAppointments.map(apt => new Date(apt.scheduled_date).toISOString())
  )

  // Standard business hours if not specified
  const businessHours = locationHours as {
    monday?: { start: string; end: string; closed?: boolean }
    tuesday?: { start: string; end: string; closed?: boolean }
    wednesday?: { start: string; end: string; closed?: boolean }
    thursday?: { start: string; end: string; closed?: boolean }
    friday?: { start: string; end: string; closed?: boolean }
    saturday?: { start: string; end: string; closed?: boolean }
    sunday?: { start: string; end: string; closed?: boolean }
  } || getDefaultHours()

  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    // Skip past dates
    if (currentDate < new Date()) {
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }

    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof businessHours
    const dayHours = businessHours[dayName]

    // Skip if location is closed on this day
    if (!dayHours || dayHours.closed) {
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }

    // Generate time slots for the day (30-minute intervals)
    const startHour = parseInt(dayHours.start?.split(':')[0] || '9')
    const startMinute = parseInt(dayHours.start?.split(':')[1] || '0')
    const endHour = parseInt(dayHours.end?.split(':')[0] || '17')
    const endMinute = parseInt(dayHours.end?.split(':')[1] || '0')

    const currentTime = new Date(currentDate)
    currentTime.setHours(startHour, startMinute, 0, 0)

    const endTime = new Date(currentDate)
    endTime.setHours(endHour, endMinute, 0, 0)

    while (currentTime < endTime) {
      const slotDateTime = new Date(currentTime)
      const isBooked = bookedTimes.has(slotDateTime.toISOString())
      
      // Only show slots that are at least 2 hours in the future
      const twoHoursFromNow = new Date()
      twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2)
      
      if (slotDateTime > twoHoursFromNow) {
        slots.push({
          datetime: slotDateTime.toISOString(),
          date: slotDateTime.toISOString().split('T')[0],
          time: slotDateTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          available: !isBooked
        })
      }

      // Add 30 minutes for next slot
      currentTime.setMinutes(currentTime.getMinutes() + 30)
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return slots.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
}

// Default business hours
function getDefaultHours() {
  return {
    monday: { start: '09:00', end: '17:00', closed: false },
    tuesday: { start: '09:00', end: '17:00', closed: false },
    wednesday: { start: '09:00', end: '17:00', closed: false },
    thursday: { start: '09:00', end: '17:00', closed: false },
    friday: { start: '09:00', end: '17:00', closed: false },
    saturday: { start: '09:00', end: '15:00', closed: false },
    sunday: { start: '10:00', end: '14:00', closed: false }
  }
}
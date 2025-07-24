import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAppointmentConfirmation } from '@/lib/email'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/appointments/[id]/send-confirmation - Send confirmation email
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Fetch appointment with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        locations(
          name,
          address,
          phone
        ),
        orders(
          id,
          swell_order_id,
          total,
          items,
          customer_email,
          customer_name
        ),
        profiles(
          first_name,
          last_name,
          email
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

    // Prepare email data
    const appointmentDate = new Date(appointment.scheduled_date)
    const customerEmail = appointment.profiles?.email || appointment.orders?.customer_email || user.email
    const customerName = appointment.orders?.customer_name || 
      `${appointment.profiles?.first_name || ''} ${appointment.profiles?.last_name || ''}`.trim() ||
      'Valued Customer'

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email not found' },
        { status: 400 }
      )
    }

    // Extract test names from order items
    const testNames = appointment.orders?.items?.map((item: Record<string, unknown>) => 
      String(item.product_name || 'Diagnostic Test')
    ) || ['Diagnostic Test']

    const emailData = {
      customerName,
      customerEmail,
      appointmentDate: appointmentDate.toISOString().split('T')[0],
      appointmentTime: appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      locationName: appointment.locations?.name || 'Prism Health Lab',
      locationAddress: appointment.locations?.address || 'Downtown Medical Center',
      orderNumber: appointment.orders?.swell_order_id || appointment.orders?.id || 'N/A',
      testNames
    }

    // Send confirmation email
    const emailSent = await sendAppointmentConfirmation(emailData)

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      )
    }

    // Update appointment to track email sent
    await supabase
      .from('appointments')
      .update({
        confirmation_email_sent: true,
        confirmation_email_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return NextResponse.json({
      message: 'Confirmation email sent successfully',
      email_sent_to: customerEmail
    })

  } catch (error) {
    console.error('Send confirmation email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
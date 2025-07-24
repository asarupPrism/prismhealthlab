import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendAppointmentReminder } from '@/lib/email'

// POST /api/appointments/reminders - Send appointment reminders (for cron/background jobs)
export async function POST(request: NextRequest) {
  try {
    // Verify request is from authorized source (cron job, background worker, etc.)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.WEBHOOK_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = getAdminClient()
    const body = await request.json()
    const { reminder_type = '24h' } = body

    // Calculate time ranges for reminders
    const now = new Date()
    let startTime: Date
    let endTime: Date

    if (reminder_type === '24h') {
      // Send 24-hour reminders for appointments happening 24-25 hours from now
      startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
      endTime = new Date(now.getTime() + 25 * 60 * 60 * 1000)   // 25 hours from now
    } else if (reminder_type === '1h') {
      // Send 1-hour reminders for appointments happening 1-2 hours from now
      startTime = new Date(now.getTime() + 1 * 60 * 60 * 1000)  // 1 hour from now
      endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)    // 2 hours from now
    } else {
      return NextResponse.json(
        { error: 'Invalid reminder_type. Use "24h" or "1h"' },
        { status: 400 }
      )
    }

    // Fetch appointments that need reminders
    const reminderField = reminder_type === '24h' ? 'reminder_24h_sent' : 'reminder_1h_sent'
    
    const { data: appointments, error: appointmentsError } = await supabase
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
      .gte('scheduled_date', startTime.toISOString())
      .lt('scheduled_date', endTime.toISOString())
      .in('status', ['confirmed', 'pending'])
      .is(reminderField, null) // Only send to those who haven't received this reminder yet

    if (appointmentsError) {
      console.error('Error fetching appointments for reminders:', appointmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        message: `No appointments found requiring ${reminder_type} reminders`,
        reminder_type,
        time_range: {
          start: startTime.toISOString(),
          end: endTime.toISOString()
        },
        reminders_sent: 0
      })
    }

    // Send reminders
    const results = []
    let successCount = 0
    let failureCount = 0

    for (const appointment of appointments) {
      try {
        // Prepare email data
        const appointmentDate = new Date(appointment.scheduled_date)
        const customerEmail = appointment.profiles?.email || appointment.orders?.customer_email
        const customerName = appointment.orders?.customer_name || 
          `${appointment.profiles?.first_name || ''} ${appointment.profiles?.last_name || ''}`.trim() ||
          'Valued Customer'

        if (!customerEmail) {
          console.warn(`No email found for appointment ${appointment.id}`)
          failureCount++
          results.push({
            appointment_id: appointment.id,
            status: 'failed',
            reason: 'No customer email'
          })
          continue
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

        // Send reminder email
        const emailSent = await sendAppointmentReminder(emailData, reminder_type as '24h' | '1h')

        if (emailSent) {
          // Mark reminder as sent
          const updateData = {
            [reminderField]: true,
            [`${reminderField}_at`]: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          await supabase
            .from('appointments')
            .update(updateData)
            .eq('id', appointment.id)

          successCount++
          results.push({
            appointment_id: appointment.id,
            customer_email: customerEmail,
            status: 'sent'
          })

          console.log(`${reminder_type} reminder sent for appointment ${appointment.id} to ${customerEmail}`)
        } else {
          failureCount++
          results.push({
            appointment_id: appointment.id,
            customer_email: customerEmail,
            status: 'failed',
            reason: 'Email service error'
          })
        }

      } catch (error) {
        console.error(`Error sending reminder for appointment ${appointment.id}:`, error)
        failureCount++
        results.push({
          appointment_id: appointment.id,
          status: 'failed',
          reason: 'Processing error'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${appointments.length} appointments for ${reminder_type} reminders`,
      reminder_type,
      time_range: {
        start: startTime.toISOString(),
        end: endTime.toISOString()
      },
      total_appointments: appointments.length,
      reminders_sent: successCount,
      failures: failureCount,
      results
    })

  } catch (error) {
    console.error('Appointment reminders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/appointments/reminders - Get reminder statistics (for monitoring)
export async function GET() {
  try {
    const supabase = getAdminClient()
    
    // Get upcoming appointments in the next 48 hours
    const now = new Date()
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const { data: upcomingAppointments, error } = await supabase
      .from('appointments')
      .select('id, scheduled_date, status, reminder_24h_sent, reminder_1h_sent')
      .gte('scheduled_date', now.toISOString())
      .lte('scheduled_date', next48Hours.toISOString())
      .in('status', ['confirmed', 'pending'])

    if (error) {
      console.error('Error fetching reminder statistics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      total_upcoming: upcomingAppointments?.length || 0,
      needs_24h_reminder: upcomingAppointments?.filter(apt => !apt.reminder_24h_sent).length || 0,
      needs_1h_reminder: upcomingAppointments?.filter(apt => !apt.reminder_1h_sent).length || 0,
      reminders_sent_24h: upcomingAppointments?.filter(apt => apt.reminder_24h_sent).length || 0,
      reminders_sent_1h: upcomingAppointments?.filter(apt => apt.reminder_1h_sent).length || 0
    }

    return NextResponse.json({
      timestamp: now.toISOString(),
      time_range: {
        start: now.toISOString(),
        end: next48Hours.toISOString()
      },
      statistics: stats,
      appointments: upcomingAppointments || []
    })

  } catch (error) {
    console.error('Get reminder statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
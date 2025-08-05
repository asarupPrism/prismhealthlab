import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RawOrderData {
  id: string
  total_amount: number
  discount_amount: number
  currency: string
  status: string
  billing_info: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface DetailedOrderData {
  order: {
    id: string
    total_amount: number
    discount_amount: number
    currency: string
    status: string
    billing_info: Record<string, unknown>
    metadata: Record<string, unknown>
    created_at: string
    updated_at: string
    order_tests: Array<{
      test_id: string
      test_name: string
      quantity: number
      price: number
      total: number
      variant_id?: string
      test_results?: {
        id: string
        result_status: string
        completed_at?: string
        result_data: Record<string, unknown>
        reference_ranges: Record<string, unknown>
        abnormal_flags: string[]
      }[]
    }>
    appointments: Array<{
      id: string
      appointment_date: string
      appointment_time: string
      status: string
      location_name?: string
      staff_name?: string
      confirmation_sent: boolean
      metadata: Record<string, unknown>
    }>
    payment_history: Array<{
      payment_method: string
      amount: number
      status: string
      processed_at: string
      transaction_id?: string
    }>
  }
  timeline: Array<{
    timestamp: string
    event_type: string
    title: string
    description: string
    status: 'completed' | 'pending' | 'cancelled' | 'error'
    metadata?: Record<string, unknown>
  }>
}

// GET /api/portal/orders/[orderId] - Fetch detailed order information
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = await createClient()
    const params = await context.params
    const { orderId } = params
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch comprehensive order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        discount_amount,
        currency,
        status,
        billing_info,
        metadata,
        created_at,
        updated_at,
        order_tests (
          test_id,
          test_name,
          quantity,
          price,
          total,
          variant_id
        ),
        appointments (
          id,
          appointment_date,
          appointment_time,
          status,
          confirmation_sent,
          metadata
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching order:', orderError)
      return NextResponse.json(
        { error: 'Failed to fetch order details' },
        { status: 500 }
      )
    }

    // Fetch test results for order tests if available
    const testIds = order.order_tests?.map((test: { test_id: string }) => test.test_id) || []
    let testResults: Record<string, unknown>[] = []

    if (testIds.length > 0) {
      const { data: results, error: resultsError } = await supabase
        .from('test_results')
        .select(`
          id,
          test_id,
          result_status,
          completed_at,
          result_data,
          reference_ranges,
          abnormal_flags,
          reviewed_by,
          reviewed_at
        `)
        .eq('order_id', orderId)
        .in('test_id', testIds)

      if (resultsError) {
        console.error('Error fetching test results:', resultsError)
      } else {
        testResults = results || []
      }
    }

    // Attach results to tests
    const testsWithResults = order.order_tests?.map((test: { test_id: string } & Record<string, unknown>) => ({
      ...test,
      test_results: testResults.filter(result => result.test_id === test.test_id)
    })) || []

    // Process appointments with location/staff data
    const processedAppointments = order.appointments?.map((apt: { metadata: Record<string, unknown> } & Record<string, unknown>) => ({
      ...apt,
      location_name: apt.metadata?.location_name as string,
      staff_name: apt.metadata?.staff_name as string
    })) || []

    // Fetch payment history from metadata or transaction logs
    const paymentHistory = extractPaymentHistory(order)

    // Build timeline of events
    const timeline = buildOrderTimeline(order, processedAppointments, testResults)

    // Log access for audit
    await supabase
      .from('patient_audit_logs')
      .insert({
        user_id: user.id,
        action: 'order_details_accessed',
        resource: 'orders',
        resource_id: orderId,
        metadata: {
          order_status: order.status,
          access_timestamp: new Date().toISOString()
        }
      })

    const result: DetailedOrderData = {
      order: {
        ...order,
        order_tests: testsWithResults as never[],
        appointments: processedAppointments as never[],
        payment_history: paymentHistory
      },
      timeline
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Order details API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Extract payment history from order metadata
function extractPaymentHistory(order: Record<string, unknown>) {
  const payments = []
  
  // Extract from Swell order data
  const swellOrderData = order.swell_order_data as Record<string, unknown>
  if (swellOrderData?.payments) {
    const payments_data = swellOrderData.payments as Array<Record<string, unknown>>
    payments.push(...payments_data.map((payment: Record<string, unknown>) => ({
      payment_method: (payment.method as string) || 'card',
      amount: (payment.amount as number) || (order.total_amount as number),
      status: (payment.status as string) || 'completed',
      processed_at: (payment.date_created as string) || (order.created_at as string),
      transaction_id: (payment.transaction_id as string) || (payment.id as string)
    })))
  }

  // Add default payment entry if none found
  if (payments.length === 0) {
    const orderMetadata = order.metadata as Record<string, unknown>
    payments.push({
      payment_method: 'card',
      amount: order.total_amount as number,
      status: (orderMetadata?.payment_status as string) || 'completed',
      processed_at: (orderMetadata?.payment_confirmed_at as string) || (order.created_at as string)
    })
  }

  return payments
}

// Build comprehensive timeline of order events
function buildOrderTimeline(order: Record<string, unknown>, appointments: Record<string, unknown>[], testResults: Record<string, unknown>[]) {
  const timeline = []

  // Order created
  timeline.push({
    timestamp: order.created_at as string,
    event_type: 'order_created',
    title: 'Order Placed',
    description: `Diagnostic test order #${(order.id as string).slice(-8)} has been created`,
    status: 'completed' as const
  })

  // Payment processed
  const orderMetadata = order.metadata as Record<string, unknown>
  if (orderMetadata?.payment_confirmed_at) {
    timeline.push({
      timestamp: orderMetadata.payment_confirmed_at as string,
      event_type: 'payment_processed',
      title: 'Payment Processed',
      description: `Payment of $${(order.total_amount as number).toFixed(2)} has been processed successfully`,
      status: 'completed' as const
    })
  }

  // Appointments
  appointments.forEach(apt => {
    const aptDateTime = new Date(`${apt.appointment_date as string} ${apt.appointment_time as string}`)
    const now = new Date()

    if ((apt.status as string) === 'scheduled') {
      timeline.push({
        timestamp: apt.appointment_date as string,
        event_type: 'appointment_scheduled',
        title: 'Blood Draw Scheduled',
        description: `Appointment scheduled for ${aptDateTime.toLocaleDateString()} at ${apt.appointment_time as string}${apt.location_name ? ` - ${apt.location_name as string}` : ''}`,
        status: aptDateTime > now ? 'pending' as const : 'completed' as const,
        metadata: { appointment_id: apt.id as string }
      })
    }

    if ((apt.status as string) === 'completed') {
      const aptMetadata = apt.metadata as Record<string, unknown>
      timeline.push({
        timestamp: (aptMetadata?.completed_at as string) || (apt.appointment_date as string),
        event_type: 'sample_collected',
        title: 'Sample Collected',
        description: `Blood sample collected successfully${apt.staff_name ? ` by ${apt.staff_name as string}` : ''}`,
        status: 'completed' as const,
        metadata: { appointment_id: apt.id as string }
      })
    }
  })

  // Test results
  testResults.forEach(result => {
    if ((result.result_status as string) === 'completed' && result.completed_at) {
      const abnormalFlags = result.abnormal_flags as string[]
      timeline.push({
        timestamp: result.completed_at as string,
        event_type: 'results_available',
        title: 'Results Available',
        description: `Test results are now available for review`,
        status: 'completed' as const,
        metadata: { 
          result_id: result.id as string,
          has_abnormal_flags: abnormalFlags?.length > 0
        }
      })
    }
  })

  // Order completion
  if ((order.status as string) === 'completed') {
    const completedAt = (orderMetadata?.completed_at as string) || (order.updated_at as string)
    timeline.push({
      timestamp: completedAt,
      event_type: 'order_completed',
      title: 'Order Complete',
      description: 'All tests have been completed and results are available',
      status: 'completed' as const
    })
  }

  // Sort timeline by timestamp
  return timeline.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

// PUT /api/portal/orders/[orderId] - Update order (limited patient actions)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = await createClient()
    const params = await context.params
    const { orderId } = params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, ...updateData } = body

    // Verify order ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    let result
    
    switch (action) {
      case 'cancel_order':
        if ((order.status as string) !== 'pending') {
          return NextResponse.json(
            { error: 'Order cannot be cancelled in current status' },
            { status: 400 }
          )
        }
        
        result = await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            metadata: {
              ...((order as unknown as RawOrderData).metadata || {}),
              cancelled_at: new Date().toISOString(),
              cancelled_by: 'patient'
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
        break

      case 'request_results_delivery':
        result = await supabase
          .from('orders')
          .update({
            metadata: {
              ...((order as unknown as RawOrderData).metadata || {}),
              results_delivery_requested: true,
              results_delivery_requested_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (result?.error) {
      console.error('Error updating order:', result.error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('patient_audit_logs')
      .insert({
        user_id: user.id,
        action: `order_${action}`,
        resource: 'orders',
        resource_id: orderId,
        metadata: {
          action_timestamp: new Date().toISOString(),
          update_data: updateData
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    })

  } catch (error) {
    console.error('Order update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
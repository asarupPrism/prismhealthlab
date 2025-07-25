import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/orders - Create a new order record in Supabase
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the request data
    const orderData = await request.json()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract order details from the request
    const {
      swellOrderId,
      billing,
      appointment,
      cartTotal,
      discount,
      couponCode,
      tests
    } = orderData

    // Insert order into Supabase orders table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: swellOrderId,
        user_id: user.id,
        total_amount: cartTotal,
        discount_amount: discount || 0,
        coupon_code: couponCode || null,
        status: 'pending',
        billing_info: {
          firstName: billing?.firstName,
          lastName: billing?.lastName,
          email: billing?.email,
          phone: billing?.phone,
          address1: billing?.address1,
          address2: billing?.address2,
          city: billing?.city,
          state: billing?.state,
          zip: billing?.zip,
          country: billing?.country || 'US'
        },
        metadata: {
          source: 'web_checkout',
          user_agent: request.headers.get('user-agent'),
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        }
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Insert appointment if provided
    if (appointment) {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          order_id: swellOrderId,
          user_id: user.id,
          appointment_date: appointment.selectedDate,
          appointment_time: appointment.selectedTime,
          location_id: appointment.locationId || null,
          status: 'scheduled',
          appointment_type: 'blood_draw',
          metadata: {
            location_name: appointment.locationName,
            staff_name: appointment.staffName
          }
        })

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError)
        // Don't fail the order creation, but log the error
      }
    }

    // Insert test items
    if (tests && tests.length > 0) {
      const testItems = tests.map((test: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
      }) => ({
        order_id: swellOrderId,
        test_id: test.productId,
        test_name: test.name,
        quantity: test.quantity,
        price: test.price,
        total: test.price * test.quantity
      }))

      const { error: testsError } = await supabase
        .from('order_tests')
        .insert(testItems)

      if (testsError) {
        console.error('Error creating test items:', testsError)
        // Don't fail the order creation, but log the error
      }
    }

    return NextResponse.json({ success: true, order })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/orders - Get current user's orders
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    
    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        appointments (
          id,
          appointment_date,
          appointment_time,
          status,
          locations (
            name,
            address_line_1,
            city,
            state
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: orders, error: ordersError } = await query
    
    if (ordersError) {
      console.error('Orders fetch error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }
    
    // Get total count for pagination
    let countQuery = supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    
    const { count, error: countError } = await countQuery
    
    if (countError) {
      console.error('Orders count error:', countError)
    }
    
    return NextResponse.json({
      orders,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
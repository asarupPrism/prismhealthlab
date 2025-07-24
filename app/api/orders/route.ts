import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
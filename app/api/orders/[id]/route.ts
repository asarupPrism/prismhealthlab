import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/orders/[id] - Get specific order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get order with related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        appointments (
          id,
          appointment_date,
          appointment_time,
          duration_minutes,
          status,
          notes,
          locations (
            id,
            name,
            address_line_1,
            address_line_2,
            city,
            state,
            zip_code,
            phone,
            operating_hours
          ),
          staff (
            id,
            first_name,
            last_name,
            role
          )
        ),
        test_results (
          id,
          test_id,
          collection_date,
          result_date,
          status,
          is_abnormal,
          results_data,
          diagnostic_tests (
            id,
            name,
            description,
            sample_type,
            turnaround_time
          ),
          result_files (
            id,
            file_name,
            file_path,
            file_type,
            is_primary
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      
      console.error('Order fetch error:', orderError)
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('Order GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
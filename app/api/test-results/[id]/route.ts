import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/test-results/[id] - Get specific test result details
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
    
    // Get test result with all related data
    const { data: result, error: resultError } = await supabase
      .from('test_results')
      .select(`
        *,
        orders (
          id,
          swell_order_id,
          total,
          currency,
          created_at,
          appointments (
            id,
            appointment_date,
            appointment_time,
            locations (
              name,
              address_line_1,
              city,
              state
            )
          )
        ),
        diagnostic_tests (
          id,
          name,
          description,
          category_id,
          key_tests,
          biomarkers,
          sample_type,
          fasting_required,
          turnaround_time,
          normal_ranges,
          reference_info,
          test_categories (
            id,
            name,
            slug,
            description
          )
        ),
        result_files (
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          is_primary,
          created_at
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (resultError) {
      if (resultError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Test result not found' },
          { status: 404 }
        )
      }
      
      console.error('Test result fetch error:', resultError)
      return NextResponse.json(
        { error: 'Failed to fetch test result' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Test result GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
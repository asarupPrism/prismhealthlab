import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/test-results - Get current user's test results
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
    const testId = searchParams.get('test_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    // Build query
    let query = supabase
      .from('test_results')
      .select(`
        *,
        orders (
          id,
          swell_order_id,
          total,
          currency,
          created_at
        ),
        diagnostic_tests (
          id,
          name,
          description,
          category_id,
          sample_type,
          turnaround_time,
          test_categories (
            id,
            name,
            slug
          )
        ),
        result_files (
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          is_primary
        )
      `)
      .eq('user_id', user.id)
      .order('result_date', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (testId) {
      query = query.eq('test_id', testId)
    }
    
    if (startDate) {
      query = query.gte('result_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('result_date', endDate)
    }
    
    const { data: results, error: resultsError } = await query
    
    if (resultsError) {
      console.error('Test results fetch error:', resultsError)
      return NextResponse.json(
        { error: 'Failed to fetch test results' },
        { status: 500 }
      )
    }
    
    // Get total count for pagination
    let countQuery = supabase
      .from('test_results')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    // Apply the same filters to count query
    if (status) countQuery = countQuery.eq('status', status)
    if (testId) countQuery = countQuery.eq('test_id', testId)
    if (startDate) countQuery = countQuery.gte('result_date', startDate)
    if (endDate) countQuery = countQuery.lte('result_date', endDate)
    
    const { count, error: countError } = await countQuery
    
    if (countError) {
      console.error('Test results count error:', countError)
    }
    
    return NextResponse.json({
      results,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Test results GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
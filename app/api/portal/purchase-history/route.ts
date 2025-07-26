import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cacheUserData, cacheManager } from '@/lib/cache/redis'
import { processInvalidationQueueOnDemand } from '@/lib/cache/invalidation-service'
import { logPatientDataAccess } from '@/lib/audit/hipaa-logger'

interface PurchaseHistoryQuery {
  page?: number
  limit?: number
  status?: string
  dateFrom?: string
  dateTo?: string
  testCategory?: string
}

interface OrderWithTests {
  id: string
  total_amount: number
  discount_amount: number
  currency: string
  status: string
  billing_info: Record<string, unknown>
  swell_order_data: Record<string, unknown>
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
  }>
  appointments: Array<{
    id: string
    appointment_date: string
    appointment_time: string
    status: string
    location_name?: string
    staff_name?: string
  }>
}

interface AggregatedPurchaseData {
  orders: OrderWithTests[]
  summary: {
    totalOrders: number
    totalSpent: number
    totalTests: number
    avgOrderValue: number
    statusCounts: Record<string, number>
    recentActivity: {
      lastOrderDate?: string
      upcomingAppointments: number
      pendingResults: number
    }
  }
  pagination: {
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// GET /api/portal/purchase-history - Fetch comprehensive purchase history with caching
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query: PurchaseHistoryQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 50),
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      testCategory: searchParams.get('testCategory') || undefined
    }

    // Create cache key based on query parameters
    const queryHash = Buffer.from(JSON.stringify(query)).toString('base64').slice(0, 16)
    // Cache key not used directly in this function
    
    // Check for force refresh
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Use caching with data fetcher function
    const result = await cacheUserData<AggregatedPurchaseData>(
      user.id,
      'purchase_history',
      async () => {
        // Get user profile to check for Swell customer ID
        const { error: profileError } = await supabase
          .from('profiles')
          .select('swell_customer_id, first_name, last_name')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          throw new Error('Failed to fetch user profile')
        }

        // Build query for orders with filters
        let ordersQuery = supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            discount_amount,
            currency,
            status,
            billing_info,
            swell_order_data,
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
              metadata
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        // Apply filters
        if (query.status) {
          ordersQuery = ordersQuery.eq('status', query.status)
        }

        if (query.dateFrom) {
          ordersQuery = ordersQuery.gte('created_at', query.dateFrom)
        }

        if (query.dateTo) {
          ordersQuery = ordersQuery.lte('created_at', query.dateTo)
        }

        // Apply pagination
        const offset = ((query.page || 1) - 1) * (query.limit || 10)
        ordersQuery = ordersQuery.range(offset, offset + (query.limit || 10) - 1)

        const { data: orders, error: ordersError } = await ordersQuery

        if (ordersError) {
          throw new Error('Failed to fetch purchase history')
        }

        // Get total count for pagination
        const { count: totalOrders, error: countError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (countError) {
          console.error('Error counting orders:', countError)
        }

        // Process orders and format appointment data
        const processedOrders: OrderWithTests[] = (orders || []).map(order => ({
          ...order,
          appointments: (order.appointments || []).map((apt: Record<string, unknown>) => ({
            ...apt,
            location_name: (apt.metadata as Record<string, unknown>)?.location_name as string,
            staff_name: (apt.metadata as Record<string, unknown>)?.staff_name as string
          }))
        }))

        // Calculate summary statistics
        const summary = calculateOrderSummary(processedOrders, totalOrders || 0)

        // Prepare pagination info
        const totalPages = Math.ceil((totalOrders || 0) / (query.limit || 10))
        const pagination = {
          page: query.page || 1,
          limit: query.limit || 10,
          totalPages,
          hasNext: (query.page || 1) < totalPages,
          hasPrevious: (query.page || 1) > 1
        }

        return {
          orders: processedOrders,
          summary,
          pagination
        }
      },
      queryHash
    )

    // Process any pending cache invalidations
    await processInvalidationQueueOnDemand()

    // HIPAA-compliant audit logging (non-blocking)
    logPatientDataAccess(
      user.id,
      user.id, // Patient viewing their own data
      'purchase_history',
      'view_purchase_history',
      'success',
      {
        query_params: query,
        total_records: result.orders?.length || 0,
        cache_hit: !forceRefresh,
        access_timestamp: new Date().toISOString()
      },
      request
    ).catch(err => console.error('HIPAA audit log error:', err))

    return NextResponse.json({
      success: true,
      data: result,
      cached: !forceRefresh
    })

  } catch (error) {
    console.error('Purchase history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Calculate comprehensive order statistics
function calculateOrderSummary(orders: OrderWithTests[], totalCount: number) {
  const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const totalTests = orders.reduce((sum, order) => 
    sum + (order.order_tests?.length || 0), 0
  )
  const avgOrderValue = totalCount > 0 ? totalSpent / totalCount : 0

  // Count orders by status
  const statusCounts = orders.reduce((counts, order) => {
    counts[order.status] = (counts[order.status] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  // Calculate recent activity metrics
  const lastOrderDate = orders.length > 0 ? orders[0].created_at : undefined
  
  const upcomingAppointments = orders.reduce((count, order) => {
    const upcoming = (order.appointments || []).filter(apt => {
      const aptDate = new Date(`${apt.appointment_date} ${apt.appointment_time}`)
      return aptDate > new Date() && apt.status === 'scheduled'
    })
    return count + upcoming.length
  }, 0)

  const pendingResults = orders.filter(order => 
    order.status === 'completed' && 
    !order.metadata?.results_delivered
  ).length

  return {
    totalOrders: totalCount,
    totalSpent,
    totalTests,
    avgOrderValue,
    statusCounts,
    recentActivity: {
      lastOrderDate,
      upcomingAppointments,
      pendingResults
    }
  }
}

// Process cache invalidation queue for real-time updates
// Removed unused function processInvalidationQueue

// POST /api/portal/purchase-history - Manual cache refresh with immediate invalidation
export async function POST() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Immediately invalidate all purchase history caches for the user
    const pattern = generateCacheKey('purchase_history', user.id) + '*'
    const deletedCount = await cacheManager.deletePattern(pattern)
    
    // Also invalidate related analytics cache
    const analyticsPattern = generateCacheKey('analytics', user.id) + '*'
    const analyticsDeleted = await cacheManager.deletePattern(analyticsPattern)

    // Log manual refresh with cache statistics
    await supabase
      .from('patient_audit_logs')
      .insert({
        user_id: user.id,
        action: 'purchase_history_manual_refresh',
        resource: 'purchase_history',
        metadata: {
          triggered_by: 'user_request',
          cache_keys_deleted: deletedCount + analyticsDeleted,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Purchase history cache refreshed successfully',
      cache_cleared: deletedCount + analyticsDeleted
    })

  } catch (error) {
    console.error('Manual refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh purchase history' },
      { status: 500 }
    )
  }
}
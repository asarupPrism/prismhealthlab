import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cacheUserData, generateCacheKey } from '@/lib/cache/redis'
import { logPatientDataAccess } from '@/lib/audit/hipaa-logger'

interface AnalyticsQuery {
  timeRange: '3m' | '6m' | '1y' | 'all'
  refresh?: boolean
}

interface AnalyticsData {
  purchaseHistory: {
    monthlySpending: Array<{
      month: string
      amount: number
      orderCount: number
    }>
    testCategories: Array<{
      category: string
      count: number
      totalSpent: number
    }>
    statusDistribution: Array<{
      status: string
      count: number
      percentage: number
    }>
  }
  healthMetrics: {
    biomarkerTrends: Array<{
      name: string
      data: Array<{
        date: string
        value: number
        status: 'normal' | 'elevated' | 'high' | 'low' | 'critical'
        referenceRange?: { min: number; max: number; optimal?: number }
        testName: string
        unit: string
        notes?: string
      }>
    }>
    overallHealthScore: {
      current: number
      previous: number
      trend: 'improving' | 'stable' | 'declining'
    }
  }
  appointments: {
    upcomingCount: number
    completedCount: number
    monthlyBookings: Array<{
      month: string
      appointments: number
      completionRate: number
    }>
  }
}

// GET /api/portal/analytics - Comprehensive analytics dashboard data
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
    const query: AnalyticsQuery = {
      timeRange: (searchParams.get('timeRange') as any) || '6m',
      refresh: searchParams.get('refresh') === 'true'
    }

    // Calculate date range
    const getDateRange = (timeRange: string) => {
      const now = new Date()
      const ranges = {
        '3m': new Date(now.getFullYear(), now.getMonth() - 3, 1),
        '6m': new Date(now.getFullYear(), now.getMonth() - 6, 1),
        '1y': new Date(now.getFullYear() - 1, now.getMonth(), 1),
        'all': new Date(2020, 0, 1) // Start from a reasonable date
      }
      return ranges[timeRange as keyof typeof ranges] || ranges['6m']
    }

    const startDate = getDateRange(query.timeRange)

    // Use caching for analytics data
    const result = await cacheUserData<AnalyticsData>(
      user.id,
      'analytics',
      async () => {
        // Fetch purchase history analytics
        const purchaseHistoryData = await fetchPurchaseHistoryAnalytics(supabase, user.id, startDate)
        
        // Fetch health metrics analytics
        const healthMetricsData = await fetchHealthMetricsAnalytics(supabase, user.id, startDate)
        
        // Fetch appointments analytics
        const appointmentsData = await fetchAppointmentsAnalytics(supabase, user.id, startDate)

        return {
          purchaseHistory: purchaseHistoryData,
          healthMetrics: healthMetricsData,
          appointments: appointmentsData
        }
      },
      query.timeRange,
      600 // 10 minute cache
    )

    // HIPAA-compliant audit logging
    logPatientDataAccess(
      user.id,
      user.id,
      'analytics_dashboard',
      'view_analytics_dashboard',
      'success',
      {
        time_range: query.timeRange,
        data_types: ['purchase_history', 'health_metrics', 'appointments'],
        cache_hit: !query.refresh,
        access_timestamp: new Date().toISOString()
      },
      request
    ).catch(err => console.error('HIPAA audit log error:', err))

    return NextResponse.json({
      success: true,
      data: result,
      cached: !query.refresh
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchPurchaseHistoryAnalytics(supabase: any, userId: string, startDate: Date) {
  // Monthly spending data
  const { data: monthlyData, error: monthlyError } = await supabase
    .from('orders')
    .select('created_at, total_amount, status')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at')

  if (monthlyError) {
    throw new Error('Failed to fetch monthly spending data')
  }

  // Process monthly spending
  const monthlySpending = processMonthlySpending(monthlyData || [])

  // Test categories data
  const { data: categoryData, error: categoryError } = await supabase
    .from('orders')
    .select(`
      total_amount,
      order_tests (
        test_name,
        price,
        total
      )
    `)
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (categoryError) {
    throw new Error('Failed to fetch test categories data')
  }

  const testCategories = processTestCategories(categoryData || [])

  // Status distribution
  const statusDistribution = processStatusDistribution(monthlyData || [])

  return {
    monthlySpending,
    testCategories,
    statusDistribution
  }
}

async function fetchHealthMetricsAnalytics(supabase: any, userId: string, startDate: Date) {
  // Fetch test results with biomarker data
  const { data: resultsData, error: resultsError } = await supabase
    .from('test_results')
    .select(`
      id,
      result_date,
      biomarker_data,
      overall_status,
      metadata
    `)
    .eq('user_id', userId)
    .gte('result_date', startDate.toISOString())
    .order('result_date')

  if (resultsError) {
    throw new Error('Failed to fetch health metrics data')
  }

  // Process biomarker trends
  const biomarkerTrends = processBiomarkerTrends(resultsData || [])

  // Calculate overall health score
  const overallHealthScore = calculateOverallHealthScore(resultsData || [])

  return {
    biomarkerTrends,
    overallHealthScore
  }
}

async function fetchAppointmentsAnalytics(supabase: any, userId: string, startDate: Date) {
  // Fetch appointments data
  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from('appointments')
    .select('id, appointment_date, appointment_time, status, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('appointment_date')

  if (appointmentsError) {
    throw new Error('Failed to fetch appointments data')
  }

  const now = new Date()
  const upcomingCount = (appointmentsData || []).filter(apt => 
    new Date(`${apt.appointment_date} ${apt.appointment_time}`) > now &&
    apt.status === 'scheduled'
  ).length

  const completedCount = (appointmentsData || []).filter(apt => 
    apt.status === 'completed'
  ).length

  // Process monthly bookings
  const monthlyBookings = processMonthlyBookings(appointmentsData || [])

  return {
    upcomingCount,
    completedCount,
    monthlyBookings
  }
}

function processMonthlySpending(orders: any[]) {
  const monthlyMap = new Map<string, { amount: number; orderCount: number }>()

  orders.forEach(order => {
    const date = new Date(order.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    const existing = monthlyMap.get(monthKey) || { amount: 0, orderCount: 0 }
    existing.amount += order.total_amount || 0
    existing.orderCount += 1
    monthlyMap.set(monthKey, existing)
  })

  return Array.from(monthlyMap.entries()).map(([key, data]) => {
    const [year, month] = key.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      ...data
    }
  }).sort((a, b) => a.month.localeCompare(b.month))
}

function processTestCategories(orders: any[]) {
  const categoryMap = new Map<string, { count: number; totalSpent: number }>()

  orders.forEach(order => {
    (order.order_tests || []).forEach((test: any) => {
      // Categorize tests based on test name (simplified logic)
      const category = categorizeTest(test.test_name)
      const existing = categoryMap.get(category) || { count: 0, totalSpent: 0 }
      existing.count += 1
      existing.totalSpent += test.total || 0
      categoryMap.set(category, existing)
    })
  })

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data
  }))
}

function processStatusDistribution(orders: any[]) {
  const statusMap = new Map<string, number>()
  
  orders.forEach(order => {
    const status = order.status || 'unknown'
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })

  const total = orders.length
  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }))
}

function processBiomarkerTrends(results: any[]): any[] {
  const biomarkerMap = new Map<string, any[]>()

  results.forEach(result => {
    if (result.biomarker_data) {
      Object.entries(result.biomarker_data).forEach(([biomarkerName, data]: [string, any]) => {
        if (!biomarkerMap.has(biomarkerName)) {
          biomarkerMap.set(biomarkerName, [])
        }
        
        biomarkerMap.get(biomarkerName)!.push({
          date: result.result_date,
          value: data.value,
          status: data.status || 'normal',
          referenceRange: data.reference_range,
          testName: biomarkerName,
          unit: data.unit || '',
          notes: data.notes
        })
      })
    }
  })

  return Array.from(biomarkerMap.entries()).map(([name, data]) => ({
    name,
    data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }))
}

function calculateOverallHealthScore(results: any[]): any {
  if (results.length === 0) {
    return { current: 85, previous: 85, trend: 'stable' as const }
  }

  const sortedResults = results.sort((a, b) => 
    new Date(b.result_date).getTime() - new Date(a.result_date).getTime()
  )

  const latest = sortedResults[0]
  const previous = sortedResults[1]

  // Calculate score based on biomarker status (simplified)
  const calculateScore = (result: any) => {
    if (!result.biomarker_data) return 85

    const biomarkers = Object.values(result.biomarker_data) as any[]
    const normalCount = biomarkers.filter(b => b.status === 'normal').length
    const totalCount = biomarkers.length

    return Math.round((normalCount / totalCount) * 100)
  }

  const currentScore = calculateScore(latest)
  const previousScore = previous ? calculateScore(previous) : currentScore

  const trend = currentScore > previousScore + 2 ? 'improving' :
                currentScore < previousScore - 2 ? 'declining' : 'stable'

  return {
    current: currentScore,
    previous: previousScore,
    trend
  }
}

function processMonthlyBookings(appointments: any[]) {
  const monthlyMap = new Map<string, { appointments: number; completed: number }>()

  appointments.forEach(apt => {
    const date = new Date(apt.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    const existing = monthlyMap.get(monthKey) || { appointments: 0, completed: 0 }
    existing.appointments += 1
    if (apt.status === 'completed') {
      existing.completed += 1
    }
    monthlyMap.set(monthKey, existing)
  })

  return Array.from(monthlyMap.entries()).map(([key, data]) => {
    const [year, month] = key.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      appointments: data.appointments,
      completionRate: data.appointments > 0 ? (data.completed / data.appointments) * 100 : 0
    }
  }).sort((a, b) => a.month.localeCompare(b.month))
}

function categorizeTest(testName: string): string {
  const name = testName.toLowerCase()
  
  if (name.includes('lipid') || name.includes('cholesterol')) return 'Cardiovascular'
  if (name.includes('glucose') || name.includes('diabetes') || name.includes('a1c')) return 'Metabolic'
  if (name.includes('thyroid') || name.includes('tsh') || name.includes('t3') || name.includes('t4')) return 'Hormonal'
  if (name.includes('vitamin') || name.includes('b12') || name.includes('d3')) return 'Nutritional'
  if (name.includes('liver') || name.includes('alt') || name.includes('ast')) return 'Liver Function'
  if (name.includes('kidney') || name.includes('creatinine') || name.includes('bun')) return 'Kidney Function'
  if (name.includes('inflammatory') || name.includes('crp') || name.includes('esr')) return 'Inflammatory'
  
  return 'General Health'
}
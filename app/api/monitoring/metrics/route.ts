import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  tags?: Record<string, string>
  context?: Record<string, unknown>
}

interface MetricsPayload {
  metrics: PerformanceMetric[]
  timestamp: number
  page: string
  userAgent: string
  sessionId: string
}

// POST /api/monitoring/metrics - Collect performance metrics
export async function POST(request: NextRequest) {
  try {
    const payload: MetricsPayload = await request.json()
    
    if (!payload.metrics || !Array.isArray(payload.metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics payload' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get user context (optional - metrics can be anonymous)
    let userId: string | null = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch {
      // Continue without user context for anonymous metrics
    }

    // Process and store metrics
    const processedMetrics = payload.metrics.map(metric => ({
      user_id: userId,
      session_id: payload.sessionId,
      metric_name: metric.name,
      metric_value: metric.value,
      metric_unit: metric.unit,
      metric_tags: metric.tags || {},
      metric_context: sanitizeContext(metric.context),
      page_path: sanitizePath(payload.page),
      user_agent: sanitizeUserAgent(payload.userAgent),
      recorded_at: new Date(metric.timestamp).toISOString(),
      created_at: new Date().toISOString()
    }))

    // Batch insert metrics
    const { error: insertError } = await supabase
      .from('performance_metrics')
      .insert(processedMetrics)

    if (insertError) {
      console.error('Failed to store metrics:', insertError)
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 }
      )
    }

    // Process critical metrics for alerting
    await processCriticalMetrics(processedMetrics, supabase)

    return NextResponse.json({
      success: true,
      processed: processedMetrics.length
    })

  } catch (error) {
    console.error('Metrics collection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/monitoring/metrics - Get performance analytics (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '24h'
    const metricType = searchParams.get('type')
    const page = searchParams.get('page')

    // Calculate time range
    const endTime = new Date()
    const startTime = new Date()
    
    switch (timeRange) {
      case '1h':
        startTime.setHours(startTime.getHours() - 1)
        break
      case '24h':
        startTime.setHours(startTime.getHours() - 24)
        break
      case '7d':
        startTime.setDate(startTime.getDate() - 7)
        break
      case '30d':
        startTime.setDate(startTime.getDate() - 30)
        break
    }

    // Build query
    let query = supabase
      .from('performance_metrics')
      .select(`
        metric_name,
        metric_value,
        metric_unit,
        metric_tags,
        page_path,
        recorded_at
      `)
      .gte('recorded_at', startTime.toISOString())
      .lte('recorded_at', endTime.toISOString())
      .order('recorded_at', { ascending: false })

    if (metricType) {
      query = query.like('metric_name', `${metricType}%`)
    }

    if (page) {
      query = query.eq('page_path', page)
    }

    const { data: metrics, error: metricsError } = await query.limit(1000)

    if (metricsError) {
      throw metricsError
    }

    // Process metrics for analytics
    const analytics = processMetricsForAnalytics(metrics || [])

    return NextResponse.json({
      success: true,
      data: analytics,
      timeRange,
      totalMetrics: metrics?.length || 0
    })

  } catch (error) {
    console.error('Metrics analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics analytics' },
      { status: 500 }
    )
  }
}

// Sanitize context data to remove sensitive information
function sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> {
  if (!context) return {}
  
  const sanitized = { ...context }
  const sensitiveKeys = [
    'password', 'token', 'key', 'secret', 'auth', 'ssn', 'dob',
    'email', 'phone', 'address', 'name', 'userId', 'patientId'
  ]
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]'
    }
  })
  
  return sanitized
}

// Sanitize page paths to remove sensitive parameters
function sanitizePath(path: string): string {
  // Remove UUIDs and sensitive parameters
  return path
    .replace(/[a-f0-9-]{36}/gi, '[ID]')
    .split('?')[0] // Remove query parameters
}

// Sanitize user agent to remove detailed version info
function sanitizeUserAgent(userAgent: string): string {
  // Keep basic browser info but remove detailed versions
  return userAgent
    .replace(/\d+\.\d+\.\d+/g, 'X.X.X')
    .substring(0, 200) // Limit length
}

// Process critical metrics for alerting
async function processCriticalMetrics(metrics: Record<string, unknown>[], supabase: SupabaseClient) {
  const criticalThresholds = {
    'web_vitals.cls': 0.25, // Poor CLS threshold
    'web_vitals.lcp': 4000, // Poor LCP threshold (4s)
    'web_vitals.fid': 300,  // Poor FID threshold (300ms)
    'navigation.total': 10000, // Very slow page load (10s)
    'api.call_duration': 5000, // Very slow API call (5s)
    'memory.used_heap': 50 * 1024 * 1024 // 50MB memory usage
  }

  const alerts = []

  for (const metric of metrics) {
    const threshold = criticalThresholds[metric.metric_name as keyof typeof criticalThresholds]
    
    if (threshold && (metric.metric_value as number) > threshold) {
      alerts.push({
        metric_name: metric.metric_name,
        metric_value: metric.metric_value,
        threshold,
        page_path: metric.page_path,
        session_id: metric.session_id,
        recorded_at: metric.recorded_at,
        alert_type: 'performance_degradation',
        severity: getSeverity(metric.metric_name as string, metric.metric_value as number, threshold)
      })
    }
  }

  // Store alerts if any
  if (alerts.length > 0) {
    await supabase
      .from('performance_alerts')
      .insert(alerts)
  }
}

function getSeverity(metricName: string, value: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
  const ratio = value / threshold
  
  if (ratio > 3) return 'critical'
  if (ratio > 2) return 'high'
  if (ratio > 1.5) return 'medium'
  return 'low'
}

// Process metrics for analytics dashboard
function processMetricsForAnalytics(metrics: Record<string, unknown>[]) {
  const analytics = {
    webVitals: {
      cls: [] as number[],
      lcp: [] as number[],
      fid: [] as number[],
      fcp: [] as number[],
      ttfb: [] as number[]
    },
    pageLoads: {
      totalTime: [] as number[],
      dnsLookup: [] as number[],
      tcpConnect: [] as number[],
      request: [] as number[],
      response: [] as number[]
    },
    apiCalls: {
      durations: [] as number[],
      errorRates: {} as Record<string, number>,
      statusCodes: {} as Record<string, number>
    },
    resources: {
      slowResources: [] as Record<string, unknown>[],
      largeResources: [] as Record<string, unknown>[],
      cacheHitRate: 0
    },
    memory: {
      usedHeap: [] as number[],
      totalHeap: [] as number[],
      pressure: [] as number[]
    },
    userInteractions: {
      clicks: [] as number[],
      scrolls: [] as number[],
      formSubmits: [] as number[]
    }
  }

  let cachedRequests = 0
  let totalRequests = 0

  metrics.forEach(metric => {
    const name = metric.metric_name as string
    const value = metric.metric_value as number
    const tags = (metric.metric_tags as Record<string, unknown>) || {}

    // Web Vitals
    if (name && name.startsWith('web_vitals.')) {
      const vitalType = name.split('.')[1] as keyof typeof analytics.webVitals
      if (analytics.webVitals[vitalType]) {
        analytics.webVitals[vitalType].push(value)
      }
    }

    // Navigation timing
    if (name && name.startsWith('navigation.')) {
      const navType = name.split('.')[1]
      if (navType === 'total') {
        analytics.pageLoads.totalTime.push(value)
      } else if (analytics.pageLoads[navType as keyof typeof analytics.pageLoads]) {
        (analytics.pageLoads[navType as keyof typeof analytics.pageLoads] as number[]).push(value)
      }
    }

    // API calls
    if (name === 'api.call_duration') {
      analytics.apiCalls.durations.push(value)
      totalRequests++
      
      if (tags.cached === 'true') {
        cachedRequests++
      }
      
      const statusClass = (tags.status_class as string) || 'unknown'
      analytics.apiCalls.statusCodes[statusClass] = (analytics.apiCalls.statusCodes[statusClass] || 0) + 1
    }

    // Resources
    if (name === 'resource.slow_resource') {
      analytics.resources.slowResources.push({
        name: tags.resource_name as string,
        duration: value,
        type: tags.type as string
      })
    }

    if (name === 'resource.large_resource') {
      analytics.resources.largeResources.push({
        name: tags.resource_name as string,
        size: value,
        type: tags.type as string
      })
    }

    // Memory
    if (name && name.startsWith('memory.')) {
      const memType = name.split('.')[1]
      if (memType === 'used_heap') {
        analytics.memory.usedHeap.push(value)
      } else if (memType === 'total_heap') {
        analytics.memory.totalHeap.push(value)
      }
    }

    // User interactions
    if (name && name.startsWith('interaction.')) {
      const interactionType = name.split('.')[1]
      if (interactionType === 'click') {
        analytics.userInteractions.clicks.push(value)
      } else if (interactionType === 'scroll') {
        analytics.userInteractions.scrolls.push(value)
      } else if (interactionType === 'form_submit') {
        analytics.userInteractions.formSubmits.push(value)
      }
    }
  })

  // Calculate cache hit rate
  analytics.resources.cacheHitRate = totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0

  // Calculate averages and percentiles
  return {
    ...analytics,
    summary: {
      avgPageLoadTime: calculateAverage(analytics.pageLoads.totalTime),
      p95PageLoadTime: calculatePercentile(analytics.pageLoads.totalTime, 95),
      avgApiDuration: calculateAverage(analytics.apiCalls.durations),
      p95ApiDuration: calculatePercentile(analytics.apiCalls.durations, 95),
      cacheHitRate: Math.round(analytics.resources.cacheHitRate),
      slowResourcesCount: analytics.resources.slowResources.length,
      largeResourcesCount: analytics.resources.largeResources.length
    }
  }
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return Math.round(sorted[index] || 0)
}
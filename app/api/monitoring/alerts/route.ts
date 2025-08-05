import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/monitoring/alerts - Get performance alerts (admin only)
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
    const severity = searchParams.get('severity')
    const metricType = searchParams.get('metric')

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
      .from('performance_alerts')
      .select(`
        id,
        metric_name,
        metric_value,
        threshold,
        severity,
        page_path,
        session_id,
        recorded_at,
        alert_type
      `)
      .gte('recorded_at', startTime.toISOString())
      .lte('recorded_at', endTime.toISOString())
      .order('recorded_at', { ascending: false })

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (metricType) {
      query = query.like('metric_name', `${metricType}%`)
    }

    const { data: alerts, error: alertsError } = await query.limit(100)

    if (alertsError) {
      throw alertsError
    }

    // Calculate alert statistics
    const stats = calculateAlertStats(alerts || [])

    return NextResponse.json({
      success: true,
      alerts: alerts || [],
      stats,
      timeRange,
      totalAlerts: alerts?.length || 0
    })

  } catch (error) {
    console.error('Alerts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/alerts - Create performance alert (system only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify system/service role authentication
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

    if (profile?.role !== 'admin' && profile?.role !== 'system') {
      return NextResponse.json(
        { error: 'System access required' },
        { status: 403 }
      )
    }

    const alertData = await request.json()

    // Validate required fields
    const requiredFields = ['metric_name', 'metric_value', 'threshold', 'severity']
    for (const field of requiredFields) {
      if (!alertData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Insert alert
    const { data: alert, error: insertError } = await supabase
      .from('performance_alerts')
      .insert({
        metric_name: alertData.metric_name,
        metric_value: alertData.metric_value,
        threshold: alertData.threshold,
        severity: alertData.severity,
        page_path: alertData.page_path || '/',
        session_id: alertData.session_id,
        alert_type: alertData.alert_type || 'performance_degradation',
        recorded_at: alertData.recorded_at || new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // If critical alert, could trigger notifications here
    if (alertData.severity === 'critical') {
      // TODO: Implement critical alert notifications
      console.warn('Critical alert created:', alert)
    }

    return NextResponse.json({
      success: true,
      alert
    })

  } catch (error) {
    console.error('Alert creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

// Calculate alert statistics
function calculateAlertStats(alerts: Record<string, unknown>[]) {
  const stats = {
    total: alerts.length,
    bySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    byMetric: {} as Record<string, number>,
    byPage: {} as Record<string, number>,
    recentTrend: 0 // Percentage change in last period
  }

  alerts.forEach(alert => {
    // Count by severity
    const severity = alert.severity as keyof typeof stats.bySeverity
    if (severity && stats.bySeverity[severity] !== undefined) {
      stats.bySeverity[severity]++
    }

    // Count by metric type
    const metricName = alert.metric_name as string
    if (metricName) {
      const metricType = metricName.split('.')[0]
      stats.byMetric[metricType] = (stats.byMetric[metricType] || 0) + 1
    }

    // Count by page
    const page = (alert.page_path as string) || 'unknown'
    stats.byPage[page] = (stats.byPage[page] || 0) + 1
  })

  // Calculate recent trend (simplified - would need historical data for accurate calculation)
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  
  const recentAlerts = alerts.filter(alert => 
    new Date(alert.recorded_at as string) > oneHourAgo
  ).length
  
  const olderAlerts = alerts.length - recentAlerts
  
  if (olderAlerts > 0) {
    stats.recentTrend = ((recentAlerts - olderAlerts) / olderAlerts) * 100
  }

  return stats
}

// DELETE /api/monitoring/alerts - Clean up old alerts (admin only)
export async function DELETE(request: NextRequest) {
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
    const days = parseInt(searchParams.get('days') || '30')

    // Delete alerts older than specified days
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data: deletedAlerts, error: deleteError } = await supabase
      .from('performance_alerts')
      .delete()
      .lt('recorded_at', cutoffDate.toISOString())
      .select('id')

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedAlerts?.length || 0,
      cutoffDate: cutoffDate.toISOString()
    })

  } catch (error) {
    console.error('Alert cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to clean up alerts' },
      { status: 500 }
    )
  }
}
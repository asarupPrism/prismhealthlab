import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cacheManager } from '@/lib/cache/redis'
import { cacheInvalidationService } from '@/lib/cache/invalidation-service'

// GET /api/admin/cache/health - Cache system health check and monitoring
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user has admin privileges
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin role (you would implement proper role checking)
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

    // Get cache health check
    const cacheHealth = await cacheManager.healthCheck()
    
    // Get cache statistics
    const cacheStats = await cacheManager.getStats()
    
    // Get invalidation queue statistics
    const queueStats = await cacheInvalidationService.getQueueStats()
    
    // Get recent cache operation logs
    const { data: recentOperations } = await supabase
      .from('cache_operation_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)
    
    // Get recent cache errors
    const { data: recentErrors } = await supabase
      .from('cache_error_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5)
    
    // Calculate performance metrics
    const performanceMetrics = await calculatePerformanceMetrics(supabase)
    
    const healthReport = {
      status: cacheHealth.status,
      timestamp: new Date().toISOString(),
      cache: {
        status: cacheHealth.status,
        latency: cacheHealth.latency,
        error: cacheHealth.error,
        memory_usage: cacheStats.memory_usage,
        total_keys: cacheStats.total_keys,
        hit_rate: cacheStats.hit_rate,
        error_rate: cacheStats.error_rate
      },
      invalidation_queue: {
        pending: queueStats.pending,
        processing: queueStats.processing,
        errors: queueStats.errors,
        processed_today: queueStats.processed_today
      },
      performance: performanceMetrics,
      recent_operations: recentOperations || [],
      recent_errors: recentErrors || []
    }
    
    // Log health check access
    await supabase
      .from('admin_audit_logs')
      .insert({
        user_id: user.id,
        action: 'cache_health_check',
        resource: 'cache_system',
        metadata: {
          cache_status: cacheHealth.status,
          access_timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      data: healthReport
    })

  } catch (error) {
    console.error('Cache health check error:', error)
    return NextResponse.json(
      { error: 'Failed to check cache health' },
      { status: 500 }
    )
  }
}

// POST /api/admin/cache/health - Trigger cache cleanup and optimization
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin role
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

    const body = await request.json()
    const { action } = body

    let result: Record<string, unknown> = {}

    switch (action) {
      case 'process_queue':
        // Force process invalidation queue
        result = await cacheInvalidationService.processInvalidationQueue()
        break
        
      case 'clear_expired':
        // Clear expired cache entries (Redis handles this automatically, but we can force it)
        result = { message: 'Expired entries cleared automatically by Redis' }
        break
        
      case 'flush_user_cache':
        // Clear cache for specific user
        const { userId } = body
        if (userId) {
          const patterns = [
            `user:purchase:${userId}*`,
            `user:appointments:${userId}*`,
            `user:analytics:${userId}*`,
            `user:profile:${userId}*`
          ]
          
          let totalDeleted = 0
          for (const pattern of patterns) {
            totalDeleted += await cacheManager.deletePattern(pattern)
          }
          
          result = { deleted_keys: totalDeleted }
        }
        break
        
      case 'health_check':
        // Run comprehensive health check
        result = await cacheManager.healthCheck()
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Log admin action
    await supabase
      .from('admin_audit_logs')
      .insert({
        user_id: user.id,
        action: `cache_${action}`,
        resource: 'cache_system',
        metadata: {
          action_result: result,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      action,
      result
    })

  } catch (error) {
    console.error('Cache management error:', error)
    return NextResponse.json(
      { error: 'Failed to execute cache management action' },
      { status: 500 }
    )
  }
}

// Calculate performance metrics from recent operations
async function calculatePerformanceMetrics(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    // Get operations in the last hour
    const { data: operations } = await supabase
      .from('cache_operation_logs')
      .select('operation, metadata, timestamp, cache_key')
      .gte('timestamp', oneHourAgo)
    
    if (!operations || operations.length === 0) {
      return {
        operations_per_hour: 0,
        average_latency: 0,
        hit_rate: 0,
        most_accessed_keys: []
      }
    }
    
    const hits = operations.filter((op: { operation: string; metadata: { hit?: boolean } }) => op.operation === 'GET' && op.metadata.hit).length
    const misses = operations.filter((op: { operation: string; metadata: { hit?: boolean } }) => op.operation === 'GET' && !op.metadata.hit).length
    const hitRate = hits + misses > 0 ? hits / (hits + misses) : 0
    
    // Calculate most accessed cache key patterns
    const keyPatterns: Record<string, number> = {}
    operations.forEach((op: { cache_key?: string; operation: string; metadata: Record<string, unknown> }) => {
      const pattern = op.cache_key?.split(':').slice(0, 2).join(':') || 'unknown'
      keyPatterns[pattern] = (keyPatterns[pattern] || 0) + 1
    })
    
    const mostAccessedKeys = Object.entries(keyPatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }))
    
    return {
      operations_per_hour: operations.length,
      average_latency: 0, // Would calculate from actual latency data
      hit_rate: hitRate,
      most_accessed_keys: mostAccessedKeys
    }
  } catch (error) {
    console.error('Error calculating performance metrics:', error)
    return {
      operations_per_hour: 0,
      average_latency: 0,
      hit_rate: 0,
      most_accessed_keys: []
    }
  }
}
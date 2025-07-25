import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { cacheManager, generateCacheKey, CacheType, CACHE_CONFIG } from './redis'

export interface InvalidationQueueItem {
  id: string
  cache_key: string
  cache_type: string
  user_id?: string
  invalidated_at: string
  processed: boolean
  retry_count: number
  error_message?: string
}

export class CacheInvalidationService {
  private static instance: CacheInvalidationService
  private processingInterval: NodeJS.Timeout | null = null
  private isProcessing = false
  
  private constructor() {}
  
  static getInstance(): CacheInvalidationService {
    if (!CacheInvalidationService.instance) {
      CacheInvalidationService.instance = new CacheInvalidationService()
    }
    return CacheInvalidationService.instance
  }

  // Start the invalidation processor
  startProcessor(intervalMs = 5000): void {
    if (this.processingInterval) {
      console.warn('Cache invalidation processor already running')
      return
    }

    console.log('Starting cache invalidation processor...')
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processInvalidationQueue()
      }
    }, intervalMs)
  }

  // Stop the invalidation processor
  stopProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
      console.log('Cache invalidation processor stopped')
    }
  }

  // Process pending invalidation requests
  async processInvalidationQueue(): Promise<{
    processed: number
    errors: number
    skipped: number
  }> {
    if (this.isProcessing) {
      return { processed: 0, errors: 0, skipped: 0 }
    }

    this.isProcessing = true
    let processed = 0
    let errors = 0
    let skipped = 0

    try {
      const supabase = await createClient()
      
      // Get pending invalidation items (with retry limit)
      const { data: items, error: fetchError } = await supabase
        .from('cache_invalidation_queue')
        .select('*')
        .eq('processed', false)
        .lt('retry_count', 3)
        .order('invalidated_at', { ascending: true })
        .limit(50)

      if (fetchError) {
        console.error('Error fetching invalidation queue:', fetchError)
        return { processed, errors: errors + 1, skipped }
      }

      if (!items || items.length === 0) {
        return { processed, errors, skipped }
      }

      console.log(`Processing ${items.length} cache invalidation items`)

      // Process each invalidation item
      for (const item of items) {
        try {
          const success = await this.processInvalidationItem(item)
          
          if (success) {
            // Mark as processed
            await supabase
              .from('cache_invalidation_queue')
              .update({
                processed: true,
                processed_at: new Date().toISOString(),
                error_message: null
              })
              .eq('id', item.id)
            
            processed++
          } else {
            // Increment retry count
            await supabase
              .from('cache_invalidation_queue')
              .update({
                retry_count: item.retry_count + 1,
                error_message: 'Cache invalidation failed'
              })
              .eq('id', item.id)
            
            errors++
          }
        } catch (error) {
          console.error('Error processing invalidation item:', item.id, error)
          
          // Update retry count and error message
          await supabase
            .from('cache_invalidation_queue')
            .update({
              retry_count: item.retry_count + 1,
              error_message: error instanceof Error ? error.message : 'Unknown error'
            })
            .eq('id', item.id)
          
          errors++
        }
      }

      // Clean up old processed items (older than 24 hours)
      await this.cleanupProcessedItems()

    } catch (error) {
      console.error('Error in processInvalidationQueue:', error)
      errors++
    } finally {
      this.isProcessing = false
    }

    if (processed > 0 || errors > 0) {
      console.log(`Cache invalidation batch complete: ${processed} processed, ${errors} errors, ${skipped} skipped`)
    }

    return { processed, errors, skipped }
  }

  // Process a single invalidation item
  private async processInvalidationItem(item: InvalidationQueueItem): Promise<boolean> {
    try {
      const cacheType = item.cache_type as CacheType
      
      if (!CACHE_CONFIG[cacheType]) {
        console.warn('Unknown cache type:', cacheType)
        return false
      }

      // Handle different invalidation strategies
      switch (cacheType) {
        case 'purchase_history':
          return await this.invalidatePurchaseHistory(item)
        
        case 'appointments':
          return await this.invalidateAppointments(item)
        
        case 'analytics':
          return await this.invalidateAnalytics(item)
        
        case 'order_details':
          return await this.invalidateOrderDetails(item)
        
        case 'user_profile':
          return await this.invalidateUserProfile(item)
        
        case 'swell_customer':
          return await this.invalidateSwellCustomer(item)
        
        default:
          // Generic invalidation by cache key
          return await cacheManager.delete(item.cache_key)
      }
    } catch (error) {
      console.error('Error processing invalidation item:', error)
      return false
    }
  }

  // Specific invalidation handlers for different cache types
  private async invalidatePurchaseHistory(item: InvalidationQueueItem): Promise<boolean> {
    if (!item.user_id) return false
    
    try {
      // Invalidate all purchase history related caches for the user
      const patterns = [
        generateCacheKey('purchase_history', item.user_id) + '*',
        generateCacheKey('analytics', item.user_id) + '*'
      ]
      
      let success = true
      for (const pattern of patterns) {
        const deleted = await cacheManager.deletePattern(pattern)
        if (deleted === 0) {
          console.debug('No cache keys found for pattern:', pattern)
        }
      }
      
      return success
    } catch (error) {
      console.error('Error invalidating purchase history:', error)
      return false
    }
  }

  private async invalidateAppointments(item: InvalidationQueueItem): Promise<boolean> {
    if (!item.user_id) return false
    
    try {
      const pattern = generateCacheKey('appointments', item.user_id) + '*'
      await cacheManager.deletePattern(pattern)
      
      // Also invalidate related purchase history since appointments are linked
      const purchasePattern = generateCacheKey('purchase_history', item.user_id) + '*'
      await cacheManager.deletePattern(purchasePattern)
      
      return true
    } catch (error) {
      console.error('Error invalidating appointments:', error)
      return false
    }
  }

  private async invalidateAnalytics(item: InvalidationQueueItem): Promise<boolean> {
    if (!item.user_id) return false
    
    try {
      const pattern = generateCacheKey('analytics', item.user_id) + '*'
      await cacheManager.deletePattern(pattern)
      return true
    } catch (error) {
      console.error('Error invalidating analytics:', error)
      return false
    }
  }

  private async invalidateOrderDetails(item: InvalidationQueueItem): Promise<boolean> {
    try {
      // Extract order ID from cache key
      const orderIdMatch = item.cache_key.match(/order:details:(.+)/)
      if (!orderIdMatch) return false
      
      const orderId = orderIdMatch[1]
      const pattern = generateCacheKey('order_details', orderId) + '*'
      await cacheManager.deletePattern(pattern)
      
      // Also invalidate user's purchase history if we can determine the user
      if (item.user_id) {
        const userPattern = generateCacheKey('purchase_history', item.user_id) + '*'
        await cacheManager.deletePattern(userPattern)
      }
      
      return true
    } catch (error) {
      console.error('Error invalidating order details:', error)
      return false
    }
  }

  private async invalidateUserProfile(item: InvalidationQueueItem): Promise<boolean> {
    if (!item.user_id) return false
    
    try {
      const pattern = generateCacheKey('user_profile', item.user_id) + '*'
      await cacheManager.deletePattern(pattern)
      return true
    } catch (error) {
      console.error('Error invalidating user profile:', error)
      return false
    }
  }

  private async invalidateSwellCustomer(item: InvalidationQueueItem): Promise<boolean> {
    try {
      // Extract customer ID from cache key
      const customerIdMatch = item.cache_key.match(/swell:customer:(.+)/)
      if (!customerIdMatch) return false
      
      const customerId = customerIdMatch[1]
      const pattern = generateCacheKey('swell_customer', customerId) + '*'
      await cacheManager.deletePattern(pattern)
      return true
    } catch (error) {
      console.error('Error invalidating Swell customer:', error)
      return false
    }
  }

  // Clean up old processed items to prevent table bloat
  private async cleanupProcessedItems(): Promise<void> {
    try {
      const supabase = await createClient()
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { error } = await supabase
        .from('cache_invalidation_queue')
        .delete()
        .eq('processed', true)
        .lt('processed_at', cutoffDate)
      
      if (error) {
        console.error('Error cleaning up processed items:', error)
      }
    } catch (error) {
      console.error('Error in cleanupProcessedItems:', error)
    }
  }

  // Manual invalidation methods for immediate use
  async invalidateUserData(userId: string, cacheTypes?: CacheType[]): Promise<void> {
    const supabase = await createClient()
    const typesToInvalidate = cacheTypes || ['purchase_history', 'appointments', 'analytics', 'user_profile']
    
    for (const cacheType of typesToInvalidate) {
      const cacheKey = generateCacheKey(cacheType, userId)
      
      await supabase
        .from('cache_invalidation_queue')
        .insert({
          cache_key: cacheKey,
          cache_type: cacheType,
          user_id: userId,
          invalidated_at: new Date().toISOString(),
          processed: false,
          retry_count: 0
        })
    }
  }

  async invalidateOrderData(orderId: string, userId?: string): Promise<void> {
    const supabase = await createClient()
    const cacheKey = generateCacheKey('order_details', orderId)
    
    await supabase
      .from('cache_invalidation_queue')
      .insert({
        cache_key: cacheKey,
        cache_type: 'order_details',
        user_id: userId,
        invalidated_at: new Date().toISOString(),
        processed: false,
        retry_count: 0
      })
  }

  // Get invalidation queue statistics
  async getQueueStats(): Promise<{
    pending: number
    processing: number
    errors: number
    processed_today: number
  }> {
    try {
      const supabase = await createClient()
      const today = new Date().toISOString().split('T')[0]
      
      const [pendingResult, errorResult, processedResult] = await Promise.all([
        supabase
          .from('cache_invalidation_queue')
          .select('*', { count: 'exact', head: true })
          .eq('processed', false),
        
        supabase
          .from('cache_invalidation_queue')
          .select('*', { count: 'exact', head: true })
          .eq('processed', false)
          .gte('retry_count', 3),
        
        supabase
          .from('cache_invalidation_queue')
          .select('*', { count: 'exact', head: true })
          .eq('processed', true)
          .gte('processed_at', today)
      ])
      
      return {
        pending: pendingResult.count || 0,
        processing: this.isProcessing ? 1 : 0,
        errors: errorResult.count || 0,
        processed_today: processedResult.count || 0
      }
    } catch (error) {
      console.error('Error getting queue stats:', error)
      return { pending: 0, processing: 0, errors: 0, processed_today: 0 }
    }
  }
}

// Singleton instance
export const cacheInvalidationService = CacheInvalidationService.getInstance()

// Utility functions for easy integration
export async function queueCacheInvalidation(
  cacheType: CacheType,
  identifier: string,
  userId?: string
): Promise<void> {
  const supabase = await createClient()
  const cacheKey = generateCacheKey(cacheType, identifier)
  
  await supabase
    .from('cache_invalidation_queue')
    .insert({
      cache_key: cacheKey,
      cache_type: cacheType,
      user_id: userId,
      invalidated_at: new Date().toISOString(),
      processed: false,
      retry_count: 0
    })
}

export async function processInvalidationQueueOnDemand(): Promise<void> {
  await cacheInvalidationService.processInvalidationQueue()
}
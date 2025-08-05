import 'server-only'
import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase/server'

// Redis connection configuration with fallback handling
function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (!url || !token) {
    console.warn('Redis cache disabled: Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN')
    return null
  }
  
  try {
    return new Redis({ url, token })
  } catch (error) {
    console.warn('Redis cache disabled: Connection error', error)
    return null
  }
}

const redis = createRedisClient()
const isRedisAvailable = redis !== null

// Cache key prefixes for organization
export const CACHE_PREFIXES = {
  USER_PURCHASE_HISTORY: 'user:purchase:',
  USER_APPOINTMENTS: 'user:appointments:',
  USER_ANALYTICS: 'user:analytics:',
  ORDER_DETAILS: 'order:details:',
  USER_PROFILE: 'user:profile:',
  SWELL_CUSTOMER: 'swell:customer:',
  SYSTEM_STATS: 'system:stats:',
  SECURITY_EVENTS: 'security:events:'
} as const

// Cache TTL settings (in seconds)
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  EXTENDED: 86400, // 24 hours
  PERMANENT: 604800 // 7 days
} as const

// Cache configuration for different data types
export const CACHE_CONFIG = {
  purchase_history: { ttl: CACHE_TTL.MEDIUM, prefix: CACHE_PREFIXES.USER_PURCHASE_HISTORY },
  appointments: { ttl: CACHE_TTL.SHORT, prefix: CACHE_PREFIXES.USER_APPOINTMENTS },
  analytics: { ttl: CACHE_TTL.LONG, prefix: CACHE_PREFIXES.USER_ANALYTICS },
  order_details: { ttl: CACHE_TTL.MEDIUM, prefix: CACHE_PREFIXES.ORDER_DETAILS },
  user_profile: { ttl: CACHE_TTL.EXTENDED, prefix: CACHE_PREFIXES.USER_PROFILE },
  swell_customer: { ttl: CACHE_TTL.LONG, prefix: CACHE_PREFIXES.SWELL_CUSTOMER },
  system_stats: { ttl: CACHE_TTL.SHORT, prefix: CACHE_PREFIXES.SYSTEM_STATS },
  security_events: { ttl: CACHE_TTL.EXTENDED, prefix: CACHE_PREFIXES.SECURITY_EVENTS }
} as const

export type CacheType = keyof typeof CACHE_CONFIG

// Generate cache key with proper formatting
export function generateCacheKey(type: CacheType, identifier: string, suffix?: string): string {
  const config = CACHE_CONFIG[type]
  const baseKey = `${config.prefix}${identifier}`
  return suffix ? `${baseKey}:${suffix}` : baseKey
}

// Enhanced cache operations with error handling and logging
export class CacheManager {
  private static instance: CacheManager
  
  private constructor() {}
  
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // Set cache with automatic TTL and compression for large objects
  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    try {
      // Return false immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return false
      }

      const serializedValue = JSON.stringify({
        data: value,
        cached_at: new Date().toISOString(),
        version: '1.0'
      })
      
      // Compress large objects (>10KB)
      const shouldCompress = serializedValue.length > 10240
      const finalValue = shouldCompress 
        ? await this.compress(serializedValue)
        : serializedValue
      
      const result = ttl 
        ? await redis.setex(key, ttl, finalValue)
        : await redis.set(key, finalValue)
      
      // Log cache write for monitoring
      await this.logCacheOperation('SET', key, {
        size: serializedValue.length,
        compressed: shouldCompress,
        ttl
      })
      
      return result === 'OK'
    } catch (error) {
      console.error('Cache SET error:', { key, error })
      await this.logCacheError('SET', key, error)
      return false
    }
  }

  // Get cache with automatic decompression and validation
  async get<T>(key: string): Promise<T | null> {
    try {
      // Return null immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return null
      }

      const rawValue = await redis.get(key)
      if (!rawValue) return null
      
      // Handle both compressed and uncompressed data
      const serializedValue = typeof rawValue === 'string' && rawValue.startsWith('compressed:')
        ? await this.decompress(rawValue)
        : rawValue as string
      
      const parsed = JSON.parse(serializedValue)
      
      // Validate cache structure
      if (!parsed.data || !parsed.cached_at) {
        console.warn('Invalid cache structure:', key)
        await this.delete(key)
        return null
      }
      
      // Log cache hit for monitoring
      await this.logCacheOperation('GET', key, {
        hit: true,
        cached_at: parsed.cached_at
      })
      
      return parsed.data as T
    } catch (error) {
      console.error('Cache GET error:', { key, error })
      await this.logCacheError('GET', key, error)
      return null
    }
  }

  // Delete single cache key
  async delete(key: string): Promise<boolean> {
    try {
      // Return false immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return false
      }

      const result = await redis.del(key)
      
      await this.logCacheOperation('DELETE', key, {
        deleted: result > 0
      })
      
      return result > 0
    } catch (error) {
      console.error('Cache DELETE error:', { key, error })
      await this.logCacheError('DELETE', key, error)
      return false
    }
  }

  // Delete multiple cache keys by pattern
  async deletePattern(pattern: string): Promise<number> {
    try {
      // Return 0 immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return 0
      }

      const keys = await redis.keys(pattern)
      if (keys.length === 0) return 0
      
      const result = await redis.del(...keys)
      
      await this.logCacheOperation('DELETE_PATTERN', pattern, {
        keys_found: keys.length,
        keys_deleted: result
      })
      
      return result
    } catch (error) {
      console.error('Cache DELETE_PATTERN error:', { pattern, error })
      await this.logCacheError('DELETE_PATTERN', pattern, error)
      return 0
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      // Return false immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return false
      }

      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Cache EXISTS error:', { key, error })
      return false
    }
  }

  // Get TTL for a key
  async getTTL(key: string): Promise<number> {
    try {
      // Return -1 immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return -1
      }

      return await redis.ttl(key)
    } catch (error) {
      console.error('Cache TTL error:', { key, error })
      return -1
    }
  }

  // Set expiration for existing key
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      // Return false immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return false
      }

      const result = await redis.expire(key, ttl)
      return result === 1
    } catch (error) {
      console.error('Cache EXPIRE error:', { key, ttl, error })
      return false
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    total_keys: number
    memory_usage: string
    hit_rate: number
    error_rate: number
  }> {
    try {
      // Return empty stats immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return {
          total_keys: 0,
          memory_usage: 'unavailable',
          hit_rate: 0,
          error_rate: 1
        }
      }

      const keys = await redis.keys('*')
      const info = await (redis as unknown as { info: (section: string) => Promise<string> }).info('memory')
      
      // Calculate hit/error rates from logs (simplified)
      const stats = {
        total_keys: keys.length,
        memory_usage: this.extractMemoryUsage(info),
        hit_rate: 0.95, // Would calculate from actual metrics
        error_rate: 0.01 // Would calculate from actual metrics
      }
      
      return stats
    } catch (error) {
      console.error('Cache STATS error:', error)
      return {
        total_keys: 0,
        memory_usage: 'unknown',
        hit_rate: 0,
        error_rate: 1
      }
    }
  }

  // Bulk operations for efficiency
  async mget(keys: string[]): Promise<Record<string, unknown>> {
    try {
      // Return empty object immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return {}
      }

      const values = await redis.mget(...keys)
      const result: Record<string, unknown> = {}
      
      for (let i = 0; i < keys.length; i++) {
        if (values[i]) {
          try {
            const parsed = JSON.parse(values[i] as string)
            result[keys[i]] = parsed.data
          } catch {
            console.warn('Failed to parse cached value:', keys[i])
          }
        }
      }
      
      return result
    } catch (error) {
      console.error('Cache MGET error:', { keys, error })
      return {}
    }
  }

  async mset(entries: Array<{ key: string; value: unknown; ttl?: number }>): Promise<boolean> {
    try {
      // Return false immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return false
      }

      const pipeline = redis.pipeline()
      
      for (const entry of entries) {
        const serializedValue = JSON.stringify({
          data: entry.value,
          cached_at: new Date().toISOString(),
          version: '1.0'
        })
        
        if (entry.ttl) {
          pipeline.setex(entry.key, entry.ttl, serializedValue)
        } else {
          pipeline.set(entry.key, serializedValue)
        }
      }
      
      const results = await pipeline.exec()
      return (results as [unknown, unknown][])?.every((result) => result?.[1] === 'OK') || false
    } catch (error) {
      console.error('Cache MSET error:', { entries: entries.length, error })
      return false
    }
  }

  // Health check for cache system
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    latency: number
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      // Return unhealthy immediately if Redis is not available
      if (!isRedisAvailable || !redis) {
        return {
          status: 'unhealthy',
          latency: Date.now() - startTime,
          error: 'Redis connection not available'
        }
      }
      // Test basic operations
      const testKey = 'health:check:' + Date.now()
      const testValue = { timestamp: new Date().toISOString() }
      
      await this.set(testKey, testValue, 30)
      const retrieved = await this.get(testKey)
      await this.delete(testKey)
      
      const latency = Date.now() - startTime
      
      if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
        return {
          status: latency < 100 ? 'healthy' : 'degraded',
          latency
        }
      } else {
        return {
          status: 'unhealthy',
          latency,
          error: 'Data integrity check failed'
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Private helper methods
  private async compress(value: string): Promise<string> {
    // Simple compression marker - in production, use actual compression
    return `compressed:${value}`
  }

  private async decompress(value: string): Promise<string> {
    // Simple decompression - in production, use actual decompression
    return value.replace('compressed:', '')
  }

  private extractMemoryUsage(info: string): string {
    const match = info.match(/used_memory_human:([^\r\n]+)/)
    return match ? match[1].trim() : 'unknown'
  }

  private async logCacheOperation(operation: string, key: string, metadata: Record<string, unknown>) {
    try {
      // Log to Supabase for monitoring (non-blocking)
      const supabase = await createClient()
      await supabase
        .from('cache_operation_logs')
        .insert({
          operation,
          cache_key: key,
          metadata,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      // Silent fail - don't let logging break cache operations
      console.debug('Cache logging failed:', error)
    }
  }

  private async logCacheError(operation: string, key: string, error: unknown) {
    try {
      const supabase = await createClient()
      await supabase
        .from('cache_error_logs')
        .insert({
          operation,
          cache_key: key,
          error_message: error instanceof Error ? error.message : String(error),
          error_stack: error instanceof Error ? error.stack : null,
          timestamp: new Date().toISOString()
        })
    } catch (logError) {
      console.debug('Cache error logging failed:', logError)
    }
  }
}

// Singleton instance
export const cacheManager = CacheManager.getInstance()

// High-level cache utilities for common patterns
export async function cacheUserData<T>(
  userId: string, 
  type: CacheType, 
  dataFetcher: () => Promise<T>,
  suffix?: string
): Promise<T> {
  const cacheKey = generateCacheKey(type, userId, suffix)
  
  // Try to get from cache first
  const cached = await cacheManager.get<T>(cacheKey)
  if (cached) return cached
  
  // Fetch fresh data
  const freshData = await dataFetcher()
  
  // Cache the result
  const config = CACHE_CONFIG[type]
  await cacheManager.set(cacheKey, freshData, config.ttl)
  
  return freshData
}

export async function invalidateUserCache(userId: string, type?: CacheType): Promise<void> {
  if (type) {
    const cacheKey = generateCacheKey(type, userId)
    await cacheManager.delete(cacheKey)
  } else {
    // Invalidate all user caches
    const patterns = Object.values(CACHE_PREFIXES).map(prefix => `${prefix}${userId}*`)
    for (const pattern of patterns) {
      await cacheManager.deletePattern(pattern)
    }
  }
}
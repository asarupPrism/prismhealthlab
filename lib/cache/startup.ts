import 'server-only'
import { cacheInvalidationService } from './invalidation-service'
import { cacheManager } from './redis'

let isInitialized = false

export async function initializeCacheSystem(): Promise<void> {
  if (isInitialized) {
    console.log('Cache system already initialized')
    return
  }

  try {
    console.log('Initializing cache system...')
    
    // Start the cache invalidation processor
    cacheInvalidationService.startProcessor(5000) // Check every 5 seconds
    
    // Perform initial health check
    const health = await cacheManager.healthCheck()
    console.log('Cache health check:', health)
    
    if (health.status === 'unhealthy') {
      console.error('Cache system is unhealthy:', health.error)
      // Continue anyway - the system can work without cache
    }
    
    // Log successful initialization
    console.log('Cache system initialized successfully')
    isInitialized = true
    
    // Set up graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Shutting down cache system...')
      cacheInvalidationService.stopProcessor()
    })
    
    process.on('SIGINT', () => {
      console.log('Shutting down cache system...')
      cacheInvalidationService.stopProcessor()
    })
    
  } catch (error) {
    console.error('Failed to initialize cache system:', error)
    // Don't throw - allow the application to continue without cache
  }
}

// Auto-initialize in server environments
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // Use a timeout to ensure this runs after other imports
  setTimeout(() => {
    initializeCacheSystem().catch(console.error)
  }, 1000)
}
'use client'

import * as Sentry from '@sentry/nextjs'
import { User } from '@supabase/supabase-js'

interface SentryRequestData {
  headers?: Record<string, string>
  query_string?: string
  url?: string
  method?: string
  data?: unknown
}

// Sentry configuration for enterprise monitoring
export function initializeSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Error sampling
    sampleRate: 1.0,
    
    // Session tracking
    // autoSessionTracking: true, // Removed - deprecated in Sentry v8
    
    // Privacy and security settings for healthcare
    beforeSend(event) {
      // Remove sensitive data from error reports
      return sanitizeErrorData(event) as Sentry.ErrorEvent | null
    },
    
    beforeSendTransaction(event) {
      // Remove sensitive data from performance data
      return sanitizeTransactionData(event) as never
    },
    
    // Integrations - Updated for Sentry v8
    integrations: [
      Sentry.browserTracingIntegration({
        // Performance monitoring for key user interactions
      }),
      
      Sentry.replayIntegration({
        // Session replay for debugging (with privacy controls)
        maskAllText: true, // Mask all text for HIPAA compliance
        maskAllInputs: true, // Mask all form inputs
        blockAllMedia: true, // Block images and media
        // sessionSampleRate: 0.1, // 10% of sessions - deprecated
        // errorSampleRate: 1.0, // 100% of error sessions - deprecated
        
        // Privacy settings
        mask: [
          // Additional selectors to mask sensitive content
          '[data-sensitive]',
          '.patient-data',
          '.health-metrics',
          '.payment-info',
          '[data-testid*="sensitive"]'
        ],
        
        block: [
          // Block sensitive elements entirely
          '.phi-data',
          '.ssn-field',
          '.dob-field',
          '[data-phi]'
        ]
      })
    ],
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    
    // Tags for filtering and organization
    initialScope: {
      tags: {
        component: 'patient-portal',
        platform: typeof window !== 'undefined' ? 'web' : 'server'
      }
    }
  })
}

// Sanitize error data to remove PHI and sensitive information
function sanitizeErrorData(event: Sentry.Event): Sentry.Event | null {
  if (!event) return null

  // Remove sensitive data from request data
  if (event.request) {
    event.request = sanitizeRequestData(event.request as SentryRequestData) as never
  }
  
  // Remove sensitive data from extra context
  if (event.extra) {
    event.extra = sanitizeExtraData(event.extra)
  }
  
  // Remove sensitive data from tags
  if (event.tags) {
    delete event.tags.userId
    delete event.tags.email
    delete event.tags.ssn
    delete event.tags.dob
  }
  
  // Sanitize breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
      if (breadcrumb.data) {
        breadcrumb.data = sanitizeExtraData(breadcrumb.data)
      }
      return breadcrumb
    })
  }
  
  // Check if error contains sensitive patterns
  const sensitivePatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{2}\/\d{2}\/\d{4}\b/, // DOB
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{16}\b/, // Credit card
    /bearer\s+[a-zA-Z0-9-._~+/]+=*$/i, // Auth tokens
  ]
  
  let messageContainsSensitiveData = false
  if (event.message) {
    messageContainsSensitiveData = sensitivePatterns.some(pattern => pattern.test(event.message!))
  }
  
  if (messageContainsSensitiveData) {
    event.message = '[REDACTED - Contains sensitive data]'
  }
  
  return event
}

// Sanitize transaction data for performance monitoring
function sanitizeTransactionData(event: Sentry.Event): Sentry.Event | null {
  if (!event) return null
  
  // Remove sensitive data from transaction tags
  if (event.tags) {
    delete event.tags.userId
    delete event.tags.patientId
    delete event.tags.orderId
  }
  
  // Note: spans are handled differently in Sentry v8
  // Span data sanitization is handled at the span level
  
  return event
}

// Sanitize request data
function sanitizeRequestData(request: SentryRequestData): SentryRequestData {
  const sanitized = { ...request }
  
  // Remove sensitive headers
  if (sanitized.headers) {
    delete sanitized.headers.Authorization
    delete sanitized.headers.Cookie
    delete sanitized.headers['X-API-Key']
  }
  
  // Remove sensitive query parameters
  if (sanitized.query_string) {
    const sensitiveParams = ['token', 'key', 'password', 'ssn', 'dob']
    let queryString = sanitized.query_string
    
    sensitiveParams.forEach(param => {
      const regex = new RegExp(`${param}=[^&]*`, 'gi')
      queryString = queryString.replace(regex, `${param}=[REDACTED]`)
    })
    
    sanitized.query_string = queryString
  }
  
  // Remove request body data
  delete sanitized.data
  
  return sanitized
}

// Sanitize extra data
function sanitizeExtraData(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {}
  
  const sanitized = { ...(data as Record<string, unknown>) }
  const sensitiveKeys = [
    'password', 'token', 'key', 'secret', 'auth', 'authorization',
    'ssn', 'dob', 'email', 'phone', 'address', 'name', 'firstName',
    'lastName', 'patientId', 'userId', 'medicalRecordNumber'
  ]
  
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeExtraData(sanitized[key])
    }
  })
  
  return sanitized
}

// Get user-friendly route names for monitoring
// getRouteName function removed - not used

// User context management for monitoring
export function setUserContext(user: User | null) {
  Sentry.setUser(user ? {
    id: user.id,
    // Don't include email or other PII in monitoring
    username: user.id.slice(0, 8), // First 8 chars of UUID
  } : null)
  
  if (user) {
    Sentry.setTag('authenticated', 'true')
  } else {
    Sentry.setTag('authenticated', 'false')
  }
}

// Custom error tracking with context
export function trackError(error: Error, context?: Record<string, unknown>, level: Sentry.SeverityLevel = 'error') {
  Sentry.withScope((scope) => {
    scope.setLevel(level)
    
    if (context) {
      // Sanitize context before adding
      const sanitizedContext = sanitizeExtraData(context)
      Object.keys(sanitizedContext).forEach(key => {
        scope.setExtra(key, sanitizedContext[key])
      })
    }
    
    scope.setTag('source', 'manual_tracking')
    Sentry.captureException(error)
  })
}

// Performance monitoring helpers
export function startTransaction(name: string, operation: string) {
  return Sentry.startSpan({
    name,
    op: operation,
    attributes: {
      component: 'patient-portal'
    }
  }, () => {
    // Transaction span callback
  })
}

// Health check monitoring
export function trackHealthCheck(service: string, status: 'healthy' | 'unhealthy', responseTime?: number) {
  Sentry.addBreadcrumb({
    category: 'health-check',
    message: `${service} health check: ${status}`,
    level: status === 'healthy' ? 'info' : 'warning',
    data: {
      service,
      status,
      responseTime
    }
  })
}

// API call monitoring
export function trackAPICall(
  endpoint: string, 
  method: string, 
  statusCode: number, 
  responseTime: number,
  cached: boolean = false
) {
  const breadcrumb: Sentry.Breadcrumb = {
    category: 'http',
    message: `${method} ${endpoint}`,
    level: statusCode >= 400 ? 'error' : 'info',
    data: {
      method,
      statusCode,
      responseTime,
      cached
    }
  }
  
  // Remove sensitive data from endpoint
  const sanitizedEndpoint = endpoint.replace(/\/[a-f0-9-]{36}(?=\/|$)/gi, '/[USER_ID]')
  breadcrumb.data!.url = sanitizedEndpoint
  
  Sentry.addBreadcrumb(breadcrumb)
  
  // Track slow API calls as performance issues
  if (responseTime > 3000) { // 3 seconds
    Sentry.withScope((scope) => {
      scope.setTag('performance_issue', 'slow_api_call')
      scope.setExtra('endpoint', sanitizedEndpoint)
      scope.setExtra('responseTime', responseTime)
      scope.setLevel('warning')
      
      Sentry.captureMessage(`Slow API call: ${method} ${sanitizedEndpoint} (${responseTime}ms)`)
    })
  }
}

// WebSocket monitoring
export function trackWebSocketEvent(event: string, data?: unknown, error?: Error) {
  if (error) {
    Sentry.withScope((scope) => {
      scope.setTag('websocket_event', event)
      scope.setExtra('event_data', sanitizeExtraData(data))
      Sentry.captureException(error)
    })
  } else {
    Sentry.addBreadcrumb({
      category: 'websocket',
      message: `WebSocket ${event}`,
      level: 'info',
      data: sanitizeExtraData(data)
    })
  }
}

// PWA monitoring
export function trackPWAEvent(event: string, data?: unknown) {
  Sentry.addBreadcrumb({
    category: 'pwa',
    message: `PWA ${event}`,
    level: 'info',
    data: sanitizeExtraData(data)
  })
  
  // Set PWA context
  Sentry.setTag('pwa_enabled', 'true')
  if (data && typeof data === 'object' && 'isStandalone' in data && (data as Record<string, unknown>).isStandalone) {
    Sentry.setTag('pwa_standalone', 'true')
  }
}

// Cache performance monitoring
export function trackCacheEvent(event: 'hit' | 'miss' | 'stale', cacheKey: string, size?: number) {
  Sentry.addBreadcrumb({
    category: 'cache',
    message: `Cache ${event}: ${cacheKey}`,
    level: 'debug',
    data: {
      event,
      cacheKey: sanitizeCacheKey(cacheKey),
      size
    }
  })
}

// Sanitize cache keys to remove sensitive data
function sanitizeCacheKey(key: string): string {
  return key.replace(/[a-f0-9-]{36}/gi, '[USER_ID]')
}

// Accessibility monitoring
export function trackAccessibilityIssue(issue: string, element?: string, severity: 'low' | 'medium' | 'high' = 'medium') {
  Sentry.withScope((scope) => {
    scope.setTag('accessibility_issue', 'true')
    scope.setLevel(severity === 'high' ? 'error' : 'warning')
    scope.setExtra('element', element)
    
    Sentry.captureMessage(`Accessibility issue: ${issue}`)
  })
}

// HIPAA compliance monitoring
export function trackComplianceEvent(event: string, details?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    category: 'compliance',
    message: `HIPAA ${event}`,
    level: 'info',
    data: sanitizeExtraData(details)
  })
}

// Security event monitoring
export function trackSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: Record<string, unknown>) {
  Sentry.withScope((scope) => {
    scope.setTag('security_event', 'true')
    scope.setLevel(severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warning')
    
    if (details) {
      const sanitizedDetails = sanitizeExtraData(details)
      Object.keys(sanitizedDetails).forEach(key => {
        scope.setExtra(key, sanitizedDetails[key])
      })
    }
    
    Sentry.captureMessage(`Security event: ${event}`)
  })
}

// Business metrics tracking
export function trackBusinessMetric(metric: string, value: number, unit?: string, tags?: Record<string, string>) {
  Sentry.addBreadcrumb({
    category: 'business_metric',
    message: `${metric}: ${value}${unit ? ` ${unit}` : ''}`,
    level: 'info',
    data: {
      metric,
      value,
      unit,
      tags: tags ? sanitizeExtraData(tags) : undefined
    }
  })
}
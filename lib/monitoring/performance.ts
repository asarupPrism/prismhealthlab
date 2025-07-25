'use client'

import { trackError, trackBusinessMetric, startTransaction } from './sentry'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  tags?: Record<string, string>
  context?: Record<string, any>
}

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

interface ResourceTiming {
  name: string
  duration: number
  size: number
  cached: boolean
  type: 'script' | 'stylesheet' | 'image' | 'fetch' | 'xmlhttprequest' | 'other'
}

interface UserInteractionMetric {
  type: 'click' | 'scroll' | 'navigation' | 'form_submit' | 'api_call'
  target: string
  duration: number
  successful: boolean
  errorMessage?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isEnabled: boolean = true
  private batchSize: number = 10
  private flushInterval: number = 30000 // 30 seconds
  private observer: PerformanceObserver | null = null
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Initialize Web Vitals monitoring
    this.initWebVitals()
    
    // Initialize resource timing monitoring
    this.initResourceTiming()
    
    // Initialize user interaction monitoring
    this.initUserInteractionMonitoring()
    
    // Initialize navigation timing
    this.initNavigationTiming()
    
    // Initialize memory monitoring
    this.initMemoryMonitoring()
    
    // Start periodic flushing
    this.startPeriodicFlush()
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    
    // Listen for page unload
    window.addEventListener('beforeunload', this.flush.bind(this))
  }

  private initWebVitals() {
    // Dynamic import to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      const reportWebVital = (metric: WebVitalsMetric) => {
        this.recordMetric({
          name: `web_vitals.${metric.name.toLowerCase()}`,
          value: metric.value,
          unit: metric.name === 'CLS' ? 'score' : 'ms',
          timestamp: Date.now(),
          tags: {
            rating: metric.rating,
            metric_id: metric.id
          }
        })

        // Track business impact of poor performance
        if (metric.rating === 'poor') {
          trackBusinessMetric(`poor_${metric.name.toLowerCase()}`, 1, 'count', {
            page: window.location.pathname,
            rating: metric.rating
          })
        }
      }

      // Register all Web Vitals metrics
      onCLS(reportWebVital)
      onFID(reportWebVital)
      onFCP(reportWebVital)
      onLCP(reportWebVital)
      onTTFB(reportWebVital)
      onINP?.(reportWebVital) // INP is newer and might not be available
    }).catch((error) => {
      console.warn('Failed to load web-vitals library:', error)
    })
  }

  private initResourceTiming() {
    if (!('PerformanceObserver' in window)) return

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            this.processResourceTiming(resourceEntry)
          }
        })
      })

      this.observer.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('Failed to initialize resource timing observer:', error)
    }
  }

  private processResourceTiming(entry: PerformanceResourceTiming) {
    const resourceType = this.getResourceType(entry.name, entry.initiatorType)
    const cached = entry.transferSize === 0 && entry.decodedBodySize > 0

    const resource: ResourceTiming = {
      name: this.sanitizeResourceName(entry.name),
      duration: entry.duration,
      size: entry.transferSize || entry.decodedBodySize || 0,
      cached,
      type: resourceType
    }

    this.recordMetric({
      name: `resource.${resourceType}.duration`,
      value: resource.duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: {
        cached: cached.toString(),
        size_bucket: this.getSizeBucket(resource.size)
      }
    })

    // Track large resources
    if (resource.size > 1024 * 1024) { // 1MB
      this.recordMetric({
        name: 'resource.large_resource',
        value: resource.size,
        unit: 'bytes',
        timestamp: Date.now(),
        tags: {
          type: resourceType,
          resource_name: resource.name
        }
      })
    }

    // Track slow resources
    if (resource.duration > 3000) { // 3 seconds
      this.recordMetric({
        name: 'resource.slow_resource',
        value: resource.duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {
          type: resourceType,
          resource_name: resource.name
        }
      })
    }
  }

  private getResourceType(name: string, initiatorType: string): ResourceTiming['type'] {
    if (initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') {
      return initiatorType as 'xmlhttprequest' | 'fetch'
    }
    
    if (name.includes('.js')) return 'script'
    if (name.includes('.css')) return 'stylesheet'
    if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image'
    
    return 'other'
  }

  private sanitizeResourceName(name: string): string {
    // Remove query parameters and sensitive data
    const url = new URL(name, window.location.origin)
    
    // Replace UUIDs with placeholders
    const pathname = url.pathname.replace(/[a-f0-9-]{36}/gi, '[ID]')
    
    return `${url.origin}${pathname}`
  }

  private getSizeBucket(size: number): string {
    if (size < 1024) return 'small' // < 1KB
    if (size < 10240) return 'medium' // < 10KB
    if (size < 102400) return 'large' // < 100KB
    return 'very_large' // >= 100KB
  }

  private initUserInteractionMonitoring() {
    // Click monitoring
    document.addEventListener('click', (event) => {
      const target = this.getEventTarget(event.target as Element)
      const startTime = performance.now()
      
      // Track click duration using requestIdleCallback
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const duration = performance.now() - startTime
          this.recordUserInteraction({
            type: 'click',
            target,
            duration,
            successful: true
          })
        })
      }
    })

    // Form submission monitoring
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      const formName = form.name || form.id || 'unknown_form'
      const startTime = performance.now()
      
      // Monitor form submission completion
      const handleFormComplete = () => {
        const duration = performance.now() - startTime
        this.recordUserInteraction({
          type: 'form_submit',
          target: formName,
          duration,
          successful: true
        })
      }
      
      // Use timeout to detect completion
      setTimeout(handleFormComplete, 100)
    })

    // Scroll performance monitoring
    let scrollTimeout: NodeJS.Timeout
    let scrollStart = 0
    
    document.addEventListener('scroll', () => {
      if (scrollStart === 0) {
        scrollStart = performance.now()
      }
      
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const duration = performance.now() - scrollStart
        this.recordUserInteraction({
          type: 'scroll',
          target: 'page',
          duration,
          successful: true
        })
        scrollStart = 0
      }, 150)
    }, { passive: true })
  }

  private getEventTarget(element: Element | null): string {
    if (!element) return 'unknown'
    
    // Get a meaningful identifier for the element
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ')[0]}`
    if (element.tagName) return element.tagName.toLowerCase()
    
    return 'unknown'
  }

  private recordUserInteraction(interaction: UserInteractionMetric) {
    this.recordMetric({
      name: `interaction.${interaction.type}`,
      value: interaction.duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: {
        target: interaction.target,
        successful: interaction.successful.toString()
      },
      context: {
        errorMessage: interaction.errorMessage
      }
    })
  }

  private initNavigationTiming() {
    // Wait for page load to complete
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        // Track key navigation metrics
        const metrics = {
          'navigation.dns_lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
          'navigation.tcp_connect': navigation.connectEnd - navigation.connectStart,
          'navigation.request': navigation.responseStart - navigation.requestStart,
          'navigation.response': navigation.responseEnd - navigation.responseStart,
          'navigation.dom_processing': navigation.domContentLoadedEventEnd - navigation.responseEnd,
          'navigation.load_complete': navigation.loadEventEnd - navigation.loadEventStart,
          'navigation.total': navigation.loadEventEnd - navigation.navigationStart
        }
        
        Object.entries(metrics).forEach(([name, value]) => {
          if (value > 0) {
            this.recordMetric({
              name,
              value,
              unit: 'ms',
              timestamp: Date.now(),
              tags: {
                navigation_type: navigation.type.toString(),
                page: window.location.pathname
              }
            })
          }
        })
      }
    })
  }

  private initMemoryMonitoring() {
    // Monitor memory usage periodically
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        
        this.recordMetric({
          name: 'memory.used_heap',
          value: memory.usedJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now()
        })
        
        this.recordMetric({
          name: 'memory.total_heap',
          value: memory.totalJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now()
        })
        
        this.recordMetric({
          name: 'memory.heap_limit',
          value: memory.jsHeapSizeLimit,
          unit: 'bytes',
          timestamp: Date.now()
        })
        
        // Track memory pressure
        const memoryPressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        if (memoryPressure > 0.9) {
          trackBusinessMetric('memory_pressure_high', memoryPressure, 'ratio')
        }
      }
    }, 60000) // Every minute
  }

  private recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return
    
    this.metrics.push(metric)
    
    // Auto-flush if batch size is reached
    if (this.metrics.length >= this.batchSize) {
      this.flush()
    }
  }

  private startPeriodicFlush() {
    this.intervalId = setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  private handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      // Flush metrics when page becomes hidden
      this.flush()
    }
  }

  private flush() {
    if (this.metrics.length === 0) return
    
    const metricsToSend = [...this.metrics]
    this.metrics = []
    
    // Send metrics to monitoring service
    this.sendMetrics(metricsToSend)
  }

  private async sendMetrics(metrics: PerformanceMetric[]) {
    try {
      // Send to internal analytics endpoint
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics,
          timestamp: Date.now(),
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId()
        })
      })
      
      // Also track key metrics in Sentry
      metrics.forEach(metric => {
        if (this.isKeyMetric(metric.name)) {
          trackBusinessMetric(metric.name, metric.value, metric.unit, metric.tags)
        }
      })
      
    } catch (error) {
      console.warn('Failed to send performance metrics:', error)
      
      // Store metrics locally for retry
      this.storeMetricsLocally(metrics)
    }
  }

  private isKeyMetric(name: string): boolean {
    const keyMetrics = [
      'web_vitals.cls',
      'web_vitals.fid',
      'web_vitals.lcp',
      'navigation.total',
      'resource.slow_resource',
      'memory_pressure_high'
    ]
    
    return keyMetrics.some(key => name.includes(key))
  }

  private storeMetricsLocally(metrics: PerformanceMetric[]) {
    try {
      const stored = localStorage.getItem('performance_metrics') || '[]'
      const existingMetrics = JSON.parse(stored)
      const combined = [...existingMetrics, ...metrics].slice(-100) // Keep last 100
      
      localStorage.setItem('performance_metrics', JSON.stringify(combined))
    } catch (error) {
      console.warn('Failed to store metrics locally:', error)
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance_session_id')
    
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('performance_session_id', sessionId)
    }
    
    return sessionId
  }

  // Public API
  public trackCustomMetric(name: string, value: number, unit: string = 'count', tags?: Record<string, string>) {
    this.recordMetric({
      name: `custom.${name}`,
      value,
      unit,
      timestamp: Date.now(),
      tags
    })
  }

  public trackPageLoad(pageName: string, loadTime: number) {
    this.recordMetric({
      name: 'page.load_time',
      value: loadTime,
      unit: 'ms',
      timestamp: Date.now(),
      tags: {
        page: pageName
      }
    })
  }

  public trackAPICall(endpoint: string, method: string, status: number, duration: number, cached: boolean = false) {
    this.recordMetric({
      name: 'api.call_duration',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: {
        endpoint: this.sanitizeResourceName(endpoint),
        method,
        status: status.toString(),
        cached: cached.toString(),
        status_class: this.getStatusClass(status)
      }
    })
  }

  private getStatusClass(status: number): string {
    if (status < 300) return 'success'
    if (status < 400) return 'redirect'
    if (status < 500) return 'client_error'
    return 'server_error'
  }

  public trackError(error: Error, context?: Record<string, any>) {
    this.recordMetric({
      name: 'error.count',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        error_type: error.name,
        page: window.location.pathname
      },
      context: {
        message: error.message,
        stack: error.stack,
        ...context
      }
    })
  }

  public destroy() {
    this.isEnabled = false
    
    if (this.observer) {
      this.observer.disconnect()
    }
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    
    // Final flush
    this.flush()
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null

export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return null
  
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  
  return performanceMonitor
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return performanceMonitor
}

// Utility functions for external use
export function trackCustomMetric(name: string, value: number, unit: string = 'count', tags?: Record<string, string>) {
  performanceMonitor?.trackCustomMetric(name, value, unit, tags)
}

export function trackPageLoad(pageName: string, loadTime: number) {
  performanceMonitor?.trackPageLoad(pageName, loadTime)
}

export function trackAPICall(endpoint: string, method: string, status: number, duration: number, cached: boolean = false) {
  performanceMonitor?.trackAPICall(endpoint, method, status, duration, cached)
}

export function trackPerformanceError(error: Error, context?: Record<string, any>) {
  performanceMonitor?.trackError(error, context)
}

// React hook for performance monitoring
import { useEffect, useRef } from 'react'

export function usePerformanceMonitoring(componentName: string) {
  const startTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      const duration = performance.now() - startTime.current
      trackCustomMetric(`component.${componentName}.mount_duration`, duration, 'ms')
    }
  }, [componentName])

  useEffect(() => {
    renderCount.current++
    
    if (renderCount.current > 1) {
      const duration = performance.now() - startTime.current
      trackCustomMetric(`component.${componentName}.render_duration`, duration, 'ms', {
        render_count: renderCount.current.toString()
      })
    }
    
    startTime.current = performance.now()
  })

  return {
    trackRender: (renderType: string) => {
      const duration = performance.now() - startTime.current
      trackCustomMetric(`component.${componentName}.${renderType}`, duration, 'ms')
    },
    
    trackInteraction: (interactionType: string, duration: number) => {
      trackCustomMetric(`component.${componentName}.${interactionType}`, duration, 'ms')
    }
  }
}
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { initializePerformanceMonitoring, trackCustomMetric, trackAPICall, trackPerformanceError } from '@/lib/monitoring/performance'
import { trackError, trackBusinessMetric, setUserContext } from '@/lib/monitoring/sentry'
import { useAuth } from '@/context'

// Hook for automatic performance monitoring setup
export function useMonitoring() {
  const { user } = useAuth()
  const monitoringInitialized = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || monitoringInitialized.current) {
      return
    }

    // Initialize performance monitoring
    const monitor = initializePerformanceMonitoring()
    
    if (monitor) {
      monitoringInitialized.current = true
      
      // Track page load for current route
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      if (loadTime > 0) {
        trackCustomMetric('page.initial_load', loadTime, 'ms', {
          route: window.location.pathname
        })
      }
    }

    return () => {
      if (monitor) {
        monitor.destroy()
        monitoringInitialized.current = false
      }
    }
  }, [])

  // Update user context when user changes
  useEffect(() => {
    setUserContext(user)
  }, [user])

  return {
    trackCustomMetric,
    trackAPICall,
    trackError: trackPerformanceError,
    trackBusinessMetric
  }
}

// Hook for API call monitoring
export function useAPIMonitoring() {
  const trackAPICall = useCallback((
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    cached: boolean = false
  ) => {
    // Track in performance monitoring
    trackAPICall(endpoint, method, status, duration, cached)
    
    // Track business metrics for important endpoints
    if (endpoint.includes('/api/orders') || endpoint.includes('/api/results')) {
      trackBusinessMetric(`api.${endpoint.split('/')[2]}.calls`, 1, 'count', {
        method,
        status: status.toString(),
        cached: cached.toString()
      })
    }
    
    // Track errors
    if (status >= 400) {
      trackBusinessMetric('api.errors', 1, 'count', {
        endpoint,
        status: status.toString()
      })
    }
  }, [])

  return { trackAPICall }
}

// Hook for user interaction monitoring
export function useInteractionMonitoring(componentName: string) {
  const trackInteraction = useCallback((
    interactionType: 'click' | 'scroll' | 'form_submit' | 'navigation',
    target: string,
    duration?: number
  ) => {
    trackCustomMetric(
      `interaction.${componentName}.${interactionType}`,
      duration || 1,
      duration ? 'ms' : 'count',
      { target, component: componentName }
    )

    // Track business-critical interactions
    if (interactionType === 'form_submit' || interactionType === 'navigation') {
      trackBusinessMetric(
        `user.${interactionType}`,
        1,
        'count',
        { component: componentName, target }
      )
    }
  }, [componentName])

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    trackError(error, {
      component: componentName,
      ...context
    })

    trackBusinessMetric('component.errors', 1, 'count', {
      component: componentName,
      error: error.name
    })
  }, [componentName])

  return {
    trackInteraction,
    trackError
  }
}

// Hook for feature usage monitoring
export function useFeatureMonitoring(featureName: string) {
  const featureStartTime = useRef<number>(0)
  const usageStarted = useRef<boolean>(false)

  const startFeatureUsage = useCallback(() => {
    if (usageStarted.current) return
    
    featureStartTime.current = performance.now()
    usageStarted.current = true
    
    trackCustomMetric(`feature.${featureName}.started`, 1, 'count')
    trackBusinessMetric(`feature.usage.${featureName}`, 1, 'count')
  }, [featureName])

  const endFeatureUsage = useCallback((success: boolean = true) => {
    if (!usageStarted.current) return
    
    const duration = performance.now() - featureStartTime.current
    usageStarted.current = false
    
    trackCustomMetric(`feature.${featureName}.duration`, duration, 'ms', {
      success: success.toString()
    })
    
    if (success) {
      trackBusinessMetric(`feature.completed.${featureName}`, 1, 'count')
    } else {
      trackBusinessMetric(`feature.abandoned.${featureName}`, 1, 'count')
    }
  }, [featureName])

  const trackFeatureError = useCallback((error: Error, context?: Record<string, any>) => {
    trackError(error, {
      feature: featureName,
      ...context
    })
    
    trackBusinessMetric(`feature.errors.${featureName}`, 1, 'count', {
      error: error.name
    })
  }, [featureName])

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (usageStarted.current) {
        endFeatureUsage(false) // Mark as abandoned
      }
    }
  }, [endFeatureUsage])

  return {
    startFeatureUsage,
    endFeatureUsage,
    trackFeatureError
  }
}

// Hook for form monitoring
export function useFormMonitoring(formName: string) {
  const formStartTime = useRef<number>(0)
  const fieldInteractions = useRef<Record<string, number>>({})

  const startForm = useCallback(() => {
    formStartTime.current = performance.now()
    fieldInteractions.current = {}
    
    trackCustomMetric(`form.${formName}.started`, 1, 'count')
  }, [formName])

  const trackFieldInteraction = useCallback((fieldName: string) => {
    fieldInteractions.current[fieldName] = (fieldInteractions.current[fieldName] || 0) + 1
    
    trackCustomMetric(`form.${formName}.field_interaction`, 1, 'count', {
      field: fieldName
    })
  }, [formName])

  const trackFormSubmission = useCallback((success: boolean, errorType?: string) => {
    const duration = performance.now() - formStartTime.current
    const totalInteractions = Object.values(fieldInteractions.current).reduce((sum, count) => sum + count, 0)
    
    trackCustomMetric(`form.${formName}.submission`, 1, 'count', {
      success: success.toString(),
      duration: duration.toString(),
      interactions: totalInteractions.toString(),
      error_type: errorType || 'none'
    })
    
    trackCustomMetric(`form.${formName}.duration`, duration, 'ms', {
      success: success.toString()
    })
    
    if (success) {
      trackBusinessMetric(`form.completed.${formName}`, 1, 'count')
    } else {
      trackBusinessMetric(`form.failed.${formName}`, 1, 'count', {
        error_type: errorType || 'none'
      })
    }
  }, [formName])

  const trackFormAbandonment = useCallback((lastField?: string) => {
    const duration = performance.now() - formStartTime.current
    const totalInteractions = Object.values(fieldInteractions.current).reduce((sum, count) => sum + count, 0)
    
    trackCustomMetric(`form.${formName}.abandoned`, 1, 'count', {
      duration: duration.toString(),
      interactions: totalInteractions.toString(),
      last_field: lastField || 'none'
    })
    
    trackBusinessMetric(`form.abandoned.${formName}`, 1, 'count', {
      last_field: lastField || 'none'
    })
  }, [formName])

  return {
    startForm,
    trackFieldInteraction,
    trackFormSubmission,
    trackFormAbandonment
  }
}

// Hook for page monitoring
export function usePageMonitoring(pageName: string) {
  const pageStartTime = useRef<number>(0)
  const interactions = useRef<number>(0)

  useEffect(() => {
    pageStartTime.current = performance.now()
    interactions.current = 0
    
    // Track page view
    trackCustomMetric(`page.${pageName}.view`, 1, 'count')
    trackBusinessMetric(`page.views.${pageName}`, 1, 'count')
    
    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const sessionDuration = performance.now() - pageStartTime.current
        trackCustomMetric(`page.${pageName}.session_duration`, sessionDuration, 'ms', {
          interactions: interactions.current.toString()
        })
      } else {
        pageStartTime.current = performance.now()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Track final session duration
      const sessionDuration = performance.now() - pageStartTime.current
      if (sessionDuration > 1000) { // Only track if session was longer than 1 second
        trackCustomMetric(`page.${pageName}.final_session_duration`, sessionDuration, 'ms', {
          interactions: interactions.current.toString()
        })
      }
    }
  }, [pageName])

  const trackPageInteraction = useCallback(() => {
    interactions.current++
  }, [])

  const trackPageError = useCallback((error: Error, context?: Record<string, any>) => {
    trackError(error, {
      page: pageName,
      ...context
    })
    
    trackBusinessMetric(`page.errors.${pageName}`, 1, 'count', {
      error: error.name
    })
  }, [pageName])

  return {
    trackPageInteraction,
    trackPageError
  }
}

// Hook for checkout funnel monitoring
export function useCheckoutMonitoring() {
  const funnelStep = useRef<string>('')
  const checkoutStartTime = useRef<number>(0)
  const stepTimes = useRef<Record<string, number>>({})

  const startCheckout = useCallback(() => {
    checkoutStartTime.current = performance.now()
    stepTimes.current = {}
    funnelStep.current = 'started'
    
    trackCustomMetric('checkout.funnel.started', 1, 'count')
    trackBusinessMetric('checkout.funnel.started', 1, 'count')
  }, [])

  const trackFunnelStep = useCallback((step: string) => {
    const now = performance.now()
    const stepDuration = now - (stepTimes.current[funnelStep.current] || checkoutStartTime.current)
    
    if (funnelStep.current) {
      trackCustomMetric(`checkout.step.${funnelStep.current}.duration`, stepDuration, 'ms')
    }
    
    stepTimes.current[step] = now
    funnelStep.current = step
    
    trackCustomMetric(`checkout.funnel.${step}`, 1, 'count')
    trackBusinessMetric(`checkout.funnel.${step}`, 1, 'count')
  }, [])

  const trackCheckoutCompletion = useCallback((success: boolean, errorType?: string) => {
    const totalDuration = performance.now() - checkoutStartTime.current
    
    trackCustomMetric('checkout.funnel.completed', 1, 'count', {
      success: success.toString(),
      total_duration: totalDuration.toString(),
      error_type: errorType || 'none'
    })
    
    if (success) {
      trackBusinessMetric('checkout.completed', 1, 'count', {
        duration: Math.round(totalDuration).toString()
      })
    } else {
      trackBusinessMetric('checkout.abandoned', 1, 'count', {
        last_step: funnelStep.current,
        error_type: errorType || 'none'
      })
    }
  }, [])

  return {
    startCheckout,
    trackFunnelStep,
    trackCheckoutCompletion
  }
}
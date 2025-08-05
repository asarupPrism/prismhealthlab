'use client'

import { useEffect } from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

export default function WebVitals() {
  useEffect(() => {
    const sendToAnalytics = (metric: WebVitalMetric) => {
      // Send to analytics service
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        })
      }

      // Send to monitoring API
      fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          timestamp: Date.now(),
          path: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Fail silently to avoid impacting user experience
      })

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', {
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          path: window.location.pathname,
        })
      }
    }

    // Register Web Vitals callbacks
    onCLS(sendToAnalytics)
    onINP(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  }, [])

  return null
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      action: string,
      parameters: {
        event_category: string
        event_label: string
        value: number
        non_interaction: boolean
      }
    ) => void
  }
}
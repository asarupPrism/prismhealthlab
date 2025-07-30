'use client'

/**
 * Viewport Trigger Hook
 * 
 * Uses Intersection Observer to trigger animations/loading only when
 * elements are about to scroll into view. Minimizes client JS for
 * off-screen content.
 */

import { useEffect, useRef, useState } from 'react'

interface UseViewportTriggerOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  enabled?: boolean
}

export function useViewportTrigger({
  threshold = 0.1,
  rootMargin = '100px 0px', // Start loading 100px before element enters viewport
  triggerOnce = true,
  enabled = true,
}: UseViewportTriggerOptions = {}) {
  const [isInView, setIsInView] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!enabled || !elementRef.current) return

    const element = elementRef.current

    // If IntersectionObserver is not supported, trigger immediately
    if (!window.IntersectionObserver) {
      setIsInView(true)
      setHasTriggered(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting

        if (inView && (!hasTriggered || !triggerOnce)) {
          setIsInView(true)
          setHasTriggered(true)
        } else if (!inView && !triggerOnce) {
          setIsInView(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, enabled, hasTriggered])

  return {
    elementRef,
    isInView: enabled ? isInView : true, // If disabled, always return true
    hasTriggered,
  }
}

// Specialized hook for component lazy loading
export function useLazyLoad(enabled = true) {
  const { elementRef, isInView } = useViewportTrigger({
    threshold: 0,
    rootMargin: '200px 0px', // Start loading 200px before entering viewport
    triggerOnce: true,
    enabled,
  })

  return {
    ref: elementRef,
    shouldLoad: isInView,
  }
}

// Hook for animation triggers with performance optimization
export function useAnimationTrigger(options?: UseViewportTriggerOptions) {
  const { elementRef, isInView, hasTriggered } = useViewportTrigger({
    threshold: 0.2,
    rootMargin: '50px 0px',
    triggerOnce: true,
    ...options,
  })

  // Check for reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    ref: elementRef,
    isInView: reducedMotion ? true : isInView, // Skip viewport logic if reduced motion
    hasTriggered,
    reducedMotion,
  }
}
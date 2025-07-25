'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TouchInteractionOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onLongPress?: () => void
  onPinch?: (scale: number) => void
  swipeThreshold?: number
  longPressThreshold?: number
  tapThreshold?: number
  preventScrollOnSwipe?: boolean
  enableHapticFeedback?: boolean
}

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

interface TouchState {
  isActive: boolean
  startPoint: TouchPoint | null
  currentPoint: TouchPoint | null
  gesture: 'none' | 'swipe' | 'tap' | 'longpress' | 'pinch' | 'scroll'
  direction: 'none' | 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
  duration: number
  scale: number
  initialDistance: number
}

export function useTouchInteractions(options: TouchInteractionOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    onPinch,
    swipeThreshold = 50,
    longPressThreshold = 500,
    tapThreshold = 10,
    preventScrollOnSwipe = false,
    enableHapticFeedback = true
  } = options

  const [touchState, setTouchState] = useState<TouchState>({
    isActive: false,
    startPoint: null,
    currentPoint: null,
    gesture: 'none',
    direction: 'none',
    distance: 0,
    velocity: 0,
    duration: 0,
    scale: 1,
    initialDistance: 0
  })

  const longPressTimerRef = useRef<NodeJS.Timeout>()
  const touchesRef = useRef<Touch[]>([])

  // Haptic feedback helper
  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
    if (enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [enableHapticFeedback])

  // Calculate distance between two points
  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint) => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    )
  }, [])

  // Calculate distance between two touches (for pinch)
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }, [])

  // Determine swipe direction
  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint) => {
    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    touchesRef.current = Array.from(event.touches)

    const startPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    setTouchState(prev => ({
      ...prev,
      isActive: true,
      startPoint,
      currentPoint: startPoint,
      gesture: 'none',
      direction: 'none',
      distance: 0,
      velocity: 0,
      duration: 0,
      scale: 1,
      initialDistance: event.touches.length === 2 ? 
        getTouchDistance(event.touches[0], event.touches[1]) : 0
    }))

    // Start long press timer
    if (onLongPress && event.touches.length === 1) {
      longPressTimerRef.current = setTimeout(() => {
        setTouchState(prev => ({ ...prev, gesture: 'longpress' }))
        triggerHaptic([100, 50, 100]) // Double pulse for long press
        onLongPress()
      }, longPressThreshold)
    }
  }, [onLongPress, longPressThreshold, triggerHaptic, getTouchDistance])

  // Handle touch move
  const handleTouchMove = useCallback((event: TouchEvent) => {
    touchesRef.current = Array.from(event.touches)
    
    setTouchState(prev => {
      if (!prev.startPoint || !prev.isActive) return prev

      const touch = event.touches[0]
      const currentPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      }

      const distance = getDistance(prev.startPoint, currentPoint)
      const duration = currentPoint.timestamp - prev.startPoint.timestamp
      const velocity = duration > 0 ? distance / duration : 0

      // Handle pinch gesture
      if (event.touches.length === 2 && prev.initialDistance > 0) {
        const currentDistance = getTouchDistance(event.touches[0], event.touches[1])
        const scale = currentDistance / prev.initialDistance
        
        if (onPinch) {
          onPinch(scale)
        }

        return {
          ...prev,
          currentPoint,
          gesture: 'pinch',
          distance,
          velocity,
          duration,
          scale
        }
      }

      // Determine if this is a swipe gesture
      let gesture = prev.gesture
      let direction = prev.direction

      if (distance > tapThreshold && gesture === 'none') {
        // Clear long press timer once we start moving
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = undefined
        }

        if (distance > swipeThreshold) {
          gesture = 'swipe'
          direction = getSwipeDirection(prev.startPoint, currentPoint)
          
          // Prevent scrolling if enabled and we're swiping horizontally
          if (preventScrollOnSwipe && (direction === 'left' || direction === 'right')) {
            event.preventDefault()
          }
        } else {
          gesture = 'scroll'
        }
      }

      return {
        ...prev,
        currentPoint,
        gesture,
        direction,
        distance,
        velocity,
        duration
      }
    })
  }, [
    getDistance, 
    getTouchDistance, 
    getSwipeDirection, 
    onPinch, 
    swipeThreshold, 
    tapThreshold, 
    preventScrollOnSwipe
  ])

  // Handle touch end
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = undefined
    }

    setTouchState(prev => {
      if (!prev.startPoint || !prev.currentPoint) {
        return { ...prev, isActive: false }
      }

      const { gesture, direction, distance, velocity } = prev

      // Handle completed gestures
      if (gesture === 'swipe' && distance > swipeThreshold) {
        triggerHaptic(75) // Medium haptic for swipe

        switch (direction) {
          case 'left':
            onSwipeLeft?.()
            break
          case 'right':
            onSwipeRight?.()
            break
          case 'up':
            onSwipeUp?.()
            break
          case 'down':
            onSwipeDown?.()
            break
        }
      } else if (gesture === 'none' && distance <= tapThreshold) {
        // This was a tap
        triggerHaptic(50) // Light haptic for tap
        onTap?.()
      }

      return {
        ...prev,
        isActive: false,
        gesture: 'none',
        direction: 'none'
      }
    })

    touchesRef.current = []
  }, [
    swipeThreshold,
    tapThreshold,
    triggerHaptic,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap
  ])

  // Touch event handlers to return
  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd // Treat cancel same as end
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  return {
    touchState,
    touchHandlers,
    isTouch: touchState.isActive,
    gesture: touchState.gesture,
    direction: touchState.direction,
    distance: touchState.distance,
    velocity: touchState.velocity,
    scale: touchState.scale
  }
}

// Hook for detecting device capabilities and preferences
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    hasTouch: false,
    hasHover: false,
    hasPointer: false,
    isHighDensity: false,
    supportsHaptics: false,
    prefersReducedMotion: false,
    prefersHighContrast: false,
    supportsPWA: false,
    isStandalone: false
  })

  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities({
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasHover: window.matchMedia('(hover: hover)').matches,
        hasPointer: window.matchMedia('(pointer: fine)').matches,
        isHighDensity: window.devicePixelRatio > 1.5,
        supportsHaptics: 'vibrate' in navigator,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        supportsPWA: 'serviceWorker' in navigator && 'PushManager' in window,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone === true
      })
    }

    updateCapabilities()

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(hover: hover)'),
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(display-mode: standalone)')
    ]

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updateCapabilities)
    })

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updateCapabilities)
      })
    }
  }, [])

  return capabilities
}

// Hook for responsive breakpoints
export function useResponsiveBreakpoints() {
  const [breakpoint, setBreakpoint] = useState('mobile')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < 640) {
        setBreakpoint('mobile')
      } else if (width < 768) {
        setBreakpoint('mobile-lg')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else if (width < 1280) {
        setBreakpoint('desktop')
      } else {
        setBreakpoint('desktop-lg')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    window.addEventListener('orientationchange', updateBreakpoint)

    return () => {
      window.removeEventListener('resize', updateBreakpoint)
      window.removeEventListener('orientationchange', updateBreakpoint)
    }
  }, [])

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile' || breakpoint === 'mobile-lg',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'desktop-lg',
    isSmallScreen: breakpoint === 'mobile',
    isLargeScreen: breakpoint === 'desktop-lg'
  }
}

// Performance monitoring hook for mobile
export function useMobilePerformance() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    batteryLevel: 1,
    isLowPowerMode: false
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    // FPS monitoring
    const updateFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        
        setMetrics(prev => ({
          ...prev,
          fps,
          renderTime: currentTime - lastTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        }))
        
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(updateFPS)
    }

    updateFPS()

    // Battery API (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setMetrics(prev => ({
            ...prev,
            batteryLevel: battery.level,
            isLowPowerMode: battery.level < 0.2
          }))
        }
        
        updateBattery()
        battery.addEventListener('levelchange', updateBattery)
        battery.addEventListener('chargingchange', updateBattery)
      })
    }

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return metrics
}
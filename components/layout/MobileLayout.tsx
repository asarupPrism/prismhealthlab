'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeviceCapabilities, useResponsiveBreakpoints, useMobilePerformance } from '@/hooks/useTouchInteractions'

interface MobileLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  enablePullToRefresh?: boolean
  enableSafeAreas?: boolean
  optimizePerformance?: boolean
  className?: string
}

interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export default function MobileLayout({
  children,
  // showHeader and showFooter removed - not used in implementation
  enablePullToRefresh = true,
  enableSafeAreas = true,
  optimizePerformance = true,
  className = ''
}: MobileLayoutProps) {
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<unknown>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [pullToRefreshState, setPullToRefreshState] = useState({
    isPulling: false,
    pullDistance: 0,
    threshold: 80
  })

  const layoutRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const scrollPos = useRef<number>(0)

  const capabilities = useDeviceCapabilities()
  const breakpoints = useResponsiveBreakpoints()
  const performance = useMobilePerformance()

  // Detect safe area insets
  useEffect(() => {
    if (!enableSafeAreas) return

    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0')
      })
    }

    // Set CSS custom properties for safe areas
    const style = document.createElement('style')
    style.textContent = `
      :root {
        --sat: env(safe-area-inset-top);
        --sar: env(safe-area-inset-right);
        --sab: env(safe-area-inset-bottom);
        --sal: env(safe-area-inset-left);
      }
    `
    document.head.appendChild(style)

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    window.addEventListener('orientationchange', updateSafeArea)

    return () => {
      window.removeEventListener('resize', updateSafeArea)
      window.removeEventListener('orientationchange', updateSafeArea)
      document.head.removeChild(style)
    }
  }, [enableSafeAreas])

  // Network status monitoring
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event & { prompt?: () => Promise<{ outcome: string }> }) => {
      e.preventDefault()
      setInstallPrompt(e)
      
      // Show install banner if user is on mobile and hasn't installed
      if (breakpoints.isMobile && !capabilities.isStandalone) {
        setShowInstallBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [breakpoints.isMobile, capabilities.isStandalone])

  // Pull-to-refresh implementation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enablePullToRefresh || !breakpoints.isMobile) return

    const scrollElement = layoutRef.current
    if (!scrollElement) return

    scrollPos.current = scrollElement.scrollTop
    
    if (scrollPos.current === 0) {
      touchStartY.current = e.touches[0].clientY
      setPullToRefreshState(prev => ({ ...prev, isPulling: true }))
    }
  }, [enablePullToRefresh, breakpoints.isMobile])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pullToRefreshState.isPulling || !enablePullToRefresh) return

    const currentY = e.touches[0].clientY
    const pullDistance = Math.max(0, currentY - touchStartY.current)
    
    if (pullDistance > 0 && scrollPos.current === 0) {
      e.preventDefault()
      setPullToRefreshState(prev => ({
        ...prev,
        pullDistance: Math.min(pullDistance * 0.5, prev.threshold * 1.5) // Damped pull
      }))
    }
  }, [pullToRefreshState.isPulling, enablePullToRefresh])

  const handleTouchEnd = useCallback(() => {
    if (!pullToRefreshState.isPulling) return

    if (pullToRefreshState.pullDistance >= pullToRefreshState.threshold) {
      // Trigger refresh
      window.location.reload()
      
      // Haptic feedback
      if (capabilities.supportsHaptics) {
        navigator.vibrate([100, 50, 100])
      }
    }

    setPullToRefreshState({
      isPulling: false,
      pullDistance: 0,
      threshold: 80
    })
  }, [pullToRefreshState.isPulling, pullToRefreshState.pullDistance, pullToRefreshState.threshold, capabilities.supportsHaptics])

  // Install PWA handler
  const handleInstallPWA = useCallback(async () => {
    if (!installPrompt || typeof installPrompt !== 'object' || !('prompt' in installPrompt)) return

    const result = await (installPrompt as { prompt: () => Promise<{ outcome: string }> }).prompt()
    
    if (result.outcome === 'accepted') {
      setShowInstallBanner(false)
      setInstallPrompt(null)
    }
  }, [installPrompt])

  // Performance optimization classes
  const getPerformanceClasses = () => {
    if (!optimizePerformance) return ''

    const classes = []

    // Reduce animations on low-end devices
    if (performance.fps < 30 || performance.isLowPowerMode) {
      classes.push('animate-none')
    }

    // Simplify effects on low memory devices
    if (performance.memoryUsage > 50 * 1024 * 1024) { // 50MB
      classes.push('backdrop-blur-none', 'shadow-none')
    }

    return classes.join(' ')
  }

  return (
    <div
      ref={layoutRef}
      className={`
        mobile-layout min-h-screen bg-slate-950 text-white overflow-auto
        ${breakpoints.isMobile ? 'text-base' : 'text-sm'}
        ${getPerformanceClasses()}
        ${className}
      `}
      style={{
        paddingTop: enableSafeAreas ? safeAreaInsets.top : 0,
        paddingRight: enableSafeAreas ? safeAreaInsets.right : 0,
        paddingBottom: enableSafeAreas ? safeAreaInsets.bottom : 0,
        paddingLeft: enableSafeAreas ? safeAreaInsets.left : 0,
        // Prevent overscroll on iOS
        overscrollBehavior: 'contain'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullToRefreshState.isPulling && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 bg-slate-900/95 backdrop-blur-sm"
          initial={{ y: -100 }}
          animate={{ y: Math.min(pullToRefreshState.pullDistance - 100, 0) }}
          style={{
            top: enableSafeAreas ? safeAreaInsets.top : 0
          }}
        >
          <div className="flex items-center gap-3 text-cyan-400">
            <motion.div
              animate={{ 
                rotate: pullToRefreshState.pullDistance >= pullToRefreshState.threshold ? 360 : 0 
              }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            >
              🔄
            </motion.div>
            <span className="text-sm font-medium">
              {pullToRefreshState.pullDistance >= pullToRefreshState.threshold 
                ? 'Release to refresh' 
                : 'Pull to refresh'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-40 bg-amber-600 text-amber-100 px-4 py-2 text-center text-sm"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            style={{
              top: enableSafeAreas ? safeAreaInsets.top : 0
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>You&apos;re offline. Some features may be limited.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA install banner */}
      <AnimatePresence>
        {showInstallBanner && breakpoints.isMobile && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-40 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 p-4"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            style={{
              bottom: enableSafeAreas ? safeAreaInsets.bottom : 0
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Install Prism Health Lab</h3>
                <p className="text-sm text-slate-400">
                  Add to your home screen for quick access and offline features
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={handleInstallPWA}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors"
                >
                  Install
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <main 
        className="flex-1"
        style={{
          minHeight: `calc(100vh - ${
            enableSafeAreas ? `${safeAreaInsets.top + safeAreaInsets.bottom}px` : '0px'
          })`,
          paddingBottom: showInstallBanner ? '120px' : '0px'
        }}
      >
        {children}
      </main>

      {/* Performance monitoring overlay (development only) */}
      {process.env.NODE_ENV === 'development' && breakpoints.isMobile && (
        <div className="fixed top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 text-xs font-mono text-slate-300 pointer-events-none z-50">
          <div>FPS: {performance.fps}</div>
          <div>Battery: {Math.round(performance.batteryLevel * 100)}%</div>
          <div>Memory: {Math.round(performance.memoryUsage / 1024 / 1024)}MB</div>
          <div>Low Power: {performance.isLowPowerMode ? 'Yes' : 'No'}</div>
          <div>Touch: {capabilities.hasTouch ? 'Yes' : 'No'}</div>
          <div>Standalone: {capabilities.isStandalone ? 'Yes' : 'No'}</div>
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {!isOnline && 'You are currently offline'}
        {pullToRefreshState.isPulling && 'Pull to refresh gesture detected'}
        {showInstallBanner && 'Install prompt available'}
      </div>
    </div>
  )
}

// Hook for managing mobile layout state
export function useMobileLayout() {
  const [layoutState, setLayoutState] = useState({
    showHeader: true,
    showFooter: true,
    headerHeight: 0,
    footerHeight: 0,
    contentHeight: 0,
    keyboardHeight: 0,
    isKeyboardOpen: false
  })

  const capabilities = useDeviceCapabilities()
  const breakpoints = useResponsiveBreakpoints()

  useEffect(() => {
    if (!breakpoints.isMobile) return

    // Virtual keyboard detection
    const handleResize = () => {
      if (capabilities.hasTouch) {
        const heightDiff = window.screen.height - (window.visualViewport?.height || window.innerHeight)
        const keyboardHeight = heightDiff > 150 ? heightDiff : 0
        
        setLayoutState(prev => ({
          ...prev,
          keyboardHeight,
          isKeyboardOpen: keyboardHeight > 0,
          contentHeight: (window.visualViewport?.height || window.innerHeight) - 
                        prev.headerHeight - prev.footerHeight
        }))
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      handleResize() // Initial call
    } else {
      window.addEventListener('resize', handleResize)
      handleResize() // Initial call
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [capabilities.hasTouch, breakpoints.isMobile])

  const setHeaderHeight = useCallback((height: number) => {
    setLayoutState(prev => ({ ...prev, headerHeight: height }))
  }, [])

  const setFooterHeight = useCallback((height: number) => {
    setLayoutState(prev => ({ ...prev, footerHeight: height }))
  }, [])

  const toggleHeader = useCallback(() => {
    setLayoutState(prev => ({ ...prev, showHeader: !prev.showHeader }))
  }, [])

  const toggleFooter = useCallback(() => {
    setLayoutState(prev => ({ ...prev, showFooter: !prev.showFooter }))
  }, [])

  return {
    layoutState,
    setHeaderHeight,
    setFooterHeight,
    toggleHeader,
    toggleFooter,
    isMobile: breakpoints.isMobile,
    hasTouch: capabilities.hasTouch
  }
}
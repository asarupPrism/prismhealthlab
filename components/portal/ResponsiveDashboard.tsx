'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import AccessibleAnalyticsDashboard from './AccessibleAnalyticsDashboard'
import VirtualizedPurchaseHistoryDashboard from './VirtualizedPurchaseHistoryDashboard'
// HealthTrendChart import removed - not used

interface ResponsiveDashboardProps {
  userId: string
  className?: string
  defaultView?: 'overview' | 'history' | 'health' | 'appointments'
}

interface ViewportInfo {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  hasTouch: boolean
  isHighDensity: boolean
}

interface GestureState {
  isSwipeEnabled: boolean
  swipeThreshold: number
  activeGesture: string | null
  touchStartX: number
  touchStartY: number
}

const DASHBOARD_VIEWS = [
  { id: 'overview', label: 'Overview', icon: '●', color: 'cyan' },
  { id: 'history', label: 'History', icon: '+', color: 'blue' },
  { id: 'health', label: 'Health', icon: '▲', color: 'emerald' },
  { id: 'appointments', label: 'Appointments', icon: '→', color: 'amber' }
] as const

export default function ResponsiveDashboard({
  userId,
  className = '',
  defaultView = 'overview'
}: ResponsiveDashboardProps) {
  const [currentView, setCurrentView] = useState(defaultView)
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait',
    hasTouch: false,
    isHighDensity: false
  })
  const [gestureState, setGestureState] = useState<GestureState>({
    isSwipeEnabled: true,
    swipeThreshold: 100,
    activeGesture: null,
    touchStartX: 0,
    touchStartY: 0
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [pullToRefreshState, setPullToRefreshState] = useState({
    isPulling: false,
    pullDistance: 0,
    threshold: 80
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  // Motion values for gestures
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

  // Detect viewport characteristics
  const updateViewport = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024
    const isDesktop = width >= 1024
    const orientation = width > height ? 'landscape' : 'portrait'
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isHighDensity = window.devicePixelRatio > 1.5

    setViewport({
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      orientation,
      hasTouch,
      isHighDensity
    })
  }, [])

  useEffect(() => {
    updateViewport()
    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
    }
  }, [updateViewport])

  // Swipe gesture handling
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!gestureState.isSwipeEnabled) return

    const currentIndex = DASHBOARD_VIEWS.findIndex(view => view.id === currentView)
    let newIndex: number

    if (direction === 'left') {
      newIndex = Math.min(currentIndex + 1, DASHBOARD_VIEWS.length - 1)
    } else {
      newIndex = Math.max(currentIndex - 1, 0)
    }

    if (newIndex !== currentIndex) {
      setCurrentView(DASHBOARD_VIEWS[newIndex].id as typeof DASHBOARD_VIEWS[number]['id'])
      
      // Haptic feedback on supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  }, [currentView, gestureState.isSwipeEnabled])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    onSwipeStart: (eventData) => {
      setGestureState(prev => ({
        ...prev,
        activeGesture: 'swipe',
        touchStartX: eventData.initial[0],
        touchStartY: eventData.initial[1]
      }))
      touchStartTimeRef.current = Date.now()
    },
    onSwiping: (eventData) => {
      const deltaX = eventData.deltaX
      x.set(deltaX * 0.5) // Damped movement
    },
    onSwiped: () => {
      x.set(0)
      setGestureState(prev => ({ ...prev, activeGesture: null }))
    },
    trackMouse: !viewport.hasTouch,
    trackTouch: viewport.hasTouch,
    delta: gestureState.swipeThreshold,
    preventScrollOnSwipe: true,
    touchEventOptions: { passive: false }
  })

  // Pull-to-refresh handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setPullToRefreshState(prev => ({
        ...prev,
        isPulling: true,
        touchStartY: e.touches[0].clientY
      }))
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pullToRefreshState.isPulling) return

    const currentY = e.touches[0].clientY
    const pullDistance = Math.max(0, currentY - pullToRefreshState.touchStartY)
    
    if (pullDistance > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault()
      setPullToRefreshState(prev => ({
        ...prev,
        pullDistance: Math.min(pullDistance, prev.threshold * 1.5)
      }))
    }
  }, [pullToRefreshState.isPulling, pullToRefreshState.touchStartY])

  const handleTouchEnd = useCallback(() => {
    if (pullToRefreshState.pullDistance >= pullToRefreshState.threshold) {
      // Trigger refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        window.location.reload()
      }, 1000)

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    }

    setPullToRefreshState({
      isPulling: false,
      pullDistance: 0,
      threshold: 80,
      touchStartY: 0
    })
  }, [pullToRefreshState.pullDistance, pullToRefreshState.threshold])

  // Adaptive component sizing
  const getComponentProps = useMemo(() => {
    const baseProps = {
      width: viewport.isMobile ? viewport.width - 32 : 
             viewport.isTablet ? Math.min(viewport.width - 64, 800) : 
             Math.min(viewport.width - 128, 1200),
      height: viewport.isMobile ? 300 : 
              viewport.isTablet ? 400 : 500
    }

    return {
      chart: {
        ...baseProps,
        height: viewport.isMobile ? 250 : baseProps.height
      },
      dashboard: {
        itemHeight: viewport.isMobile ? 200 : 240,
        containerHeight: viewport.isMobile ? viewport.height - 200 : 600
      }
    }
  }, [viewport])

  // Touch-optimized navigation
  const NavigationTabs = () => (
    <div className={`
      sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50
      ${viewport.isMobile ? 'px-4' : 'px-6'} py-3
    `}>
      {/* Pull-to-refresh indicator */}
      {pullToRefreshState.isPulling && (
        <motion.div
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-cyan-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: pullToRefreshState.pullDistance / pullToRefreshState.threshold,
            y: Math.min(pullToRefreshState.pullDistance * 0.5, 40)
          }}
        >
          <motion.div
            animate={{ rotate: pullToRefreshState.pullDistance >= pullToRefreshState.threshold ? 360 : 0 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          >
            🔄
          </motion.div>
          <span className="text-sm font-medium">
            {pullToRefreshState.pullDistance >= pullToRefreshState.threshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">
          Patient Portal
        </h1>

        {/* Mobile menu button */}
        {viewport.isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            <div className="w-6 h-6 relative">
              <motion.span
                className="absolute w-full h-0.5 bg-current rounded-full"
                style={{ top: '25%' }}
                animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }}
              />
              <motion.span
                className="absolute w-full h-0.5 bg-current rounded-full"
                style={{ top: '50%' }}
                animate={{ opacity: isMenuOpen ? 0 : 1 }}
              />
              <motion.span
                className="absolute w-full h-0.5 bg-current rounded-full"
                style={{ top: '75%' }}
                animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }}
              />
            </div>
          </button>
        )}
      </div>

      {/* Navigation tabs */}
      <AnimatePresence>
        {(viewport.isDesktop || viewport.isTablet || isMenuOpen) && (
          <motion.div
            className={`
              ${viewport.isMobile 
                ? 'absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 p-4' 
                : 'mt-4'
              }
            `}
            initial={viewport.isMobile ? { opacity: 0, y: -20 } : false}
            animate={viewport.isMobile ? { opacity: 1, y: 0 } : false}
            exit={viewport.isMobile ? { opacity: 0, y: -20 } : false}
          >
            <div className={`
              ${viewport.isMobile 
                ? 'grid grid-cols-2 gap-3' 
                : 'flex gap-2'
              }
            `}>
              {DASHBOARD_VIEWS.map((view) => (
                <motion.button
                  key={view.id}
                  onClick={() => {
                    setCurrentView(view.id as typeof view.id)
                    setIsMenuOpen(false)
                  }}
                  className={`
                    ${viewport.isMobile ? 'p-4' : 'px-4 py-2'} 
                    rounded-xl text-sm font-medium transition-all duration-200
                    ${currentView === view.id
                      ? `bg-${view.color}-600 text-white shadow-lg shadow-${view.color}-600/25`
                      : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }
                  `}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: viewport.hasTouch ? 1 : 1.02 }}
                >
                  <div className={`flex items-center gap-2 ${viewport.isMobile ? 'flex-col' : ''}`}>
                    <span className="text-lg">{view.icon}</span>
                    <span>{view.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // Render current view content
  const renderViewContent = () => {
    const baseProps = {
      userId,
      className: "px-4 pb-6"
    }

    switch (currentView) {
      case 'overview':
        return (
          <AccessibleAnalyticsDashboard
            {...baseProps}
            refreshInterval={viewport.isMobile ? 600000 : 300000} // Longer refresh on mobile
          />
        )
      
      case 'history':
        return (
          <VirtualizedPurchaseHistoryDashboard
            {...baseProps}
            itemHeight={getComponentProps.dashboard.itemHeight}
            containerHeight={getComponentProps.dashboard.containerHeight}
            enablePerformanceMode={viewport.isMobile} // Always use performance mode on mobile
          />
        )

      case 'health':
        return (
          <div className="px-4 pb-6 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Health Trends</h2>
              <p className="text-slate-400">Track your biomarkers and health metrics over time</p>
            </div>
            
            {/* This would be populated with actual health data */}
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Health Data Coming Soon</h3>
              <p className="text-slate-400 mb-4">
                Complete your first diagnostic test to see your health trends here
              </p>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                Browse Tests
              </button>
            </div>
          </div>
        )

      case 'appointments':
        return (
          <div className="px-4 pb-6 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Appointments</h2>
              <p className="text-slate-400">Manage your upcoming and past appointments</p>
            </div>
            
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Appointments Scheduled</h3>
              <p className="text-slate-400 mb-4">
                Schedule your first appointment to get started with your health journey
              </p>
              <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
                Schedule Appointment
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`responsive-dashboard min-h-screen bg-slate-950 ${className}`}>
      <NavigationTabs />
      
      <motion.div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ 
          x: viewport.hasTouch ? x : undefined,
          opacity: viewport.hasTouch ? opacity : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...(viewport.hasTouch ? swipeHandlers : {})}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: viewport.isMobile ? 50 : 0, y: viewport.isMobile ? 0 : 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: viewport.isMobile ? -50 : 0, y: viewport.isMobile ? 0 : -20 }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1] // Material Design easing
            }}
            className="min-h-screen"
          >
            {renderViewContent()}
          </motion.div>
        </AnimatePresence>

        {/* Swipe indicator dots */}
        {viewport.isMobile && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2">
            {DASHBOARD_VIEWS.map((view) => (
              <motion.button
                key={view.id}
                onClick={() => setCurrentView(view.id as typeof view.id)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentView === view.id ? 'bg-cyan-400' : 'bg-slate-600'
                }`}
                whileTap={{ scale: 1.2 }}
                aria-label={`Switch to ${view.label} view`}
              />
            ))}
          </div>
        )}

        {/* Touch feedback overlay */}
        {gestureState.activeGesture && viewport.hasTouch && (
          <div className="fixed inset-0 pointer-events-none bg-slate-900/10 backdrop-blur-[1px]" />
        )}
      </motion.div>

      {/* Accessibility announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {`Current view: ${DASHBOARD_VIEWS.find(v => v.id === currentView)?.label}`}
      </div>

      {/* Performance monitoring overlay (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-xs font-mono text-slate-300 pointer-events-none">
          <div>Viewport: {viewport.width}×{viewport.height}</div>
          <div>Device: {viewport.isMobile ? 'Mobile' : viewport.isTablet ? 'Tablet' : 'Desktop'}</div>
          <div>Touch: {viewport.hasTouch ? 'Yes' : 'No'}</div>
          <div>Orientation: {viewport.orientation}</div>
          <div>DPR: {viewport.isHighDensity ? 'High' : 'Standard'}</div>
        </div>
      )}
    </div>
  )
}
'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VirtualizedList, { useVirtualizedList } from '@/components/ui/VirtualizedList'
import VirtualizedPurchaseHistoryCard, { useVirtualizedCardInteractions } from './VirtualizedPurchaseHistoryCard'
import { useRealTimeOrders, WebSocketStatus } from '@/components/providers/WebSocketProvider'
import { PurchaseHistoryTouchCard } from '@/components/ui/TouchOptimizedCard'
import { useResponsiveBreakpoints } from '@/hooks/useTouchInteractions'

interface TestItem {
  test_id: string
  test_name: string
  quantity: number
  price: number
  total: number
  variant_id?: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  location_name?: string
  staff_name?: string
}

interface PurchaseHistoryData {
  orders: Record<string, unknown>[]
  summary: {
    totalOrders: number
    totalSpent: number
    totalTests: number
    avgOrderValue: number
    statusCounts: Record<string, number>
    recentActivity: {
      lastOrderDate?: string
      upcomingAppointments: number
      pendingResults: number
    }
  }
  pagination: {
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

interface FilterState {
  status: string
  dateFrom: string
  dateTo: string
  testCategory: string
  page: number
  limit: number
}

interface RealTimePurchaseHistoryDashboardProps {
  className?: string
  itemHeight?: number
  containerHeight?: number
  enablePerformanceMode?: boolean
  preloadPages?: number
  enableRealTimeUpdates?: boolean
}

export default function RealTimePurchaseHistoryDashboard({ 
  className = '',
  itemHeight = 240,
  containerHeight = 600,
  enablePerformanceMode = true,
  // preloadPages removed - not used
  enableRealTimeUpdates = true
}: RealTimePurchaseHistoryDashboardProps) {
  const [summary, setSummary] = useState<PurchaseHistoryData['summary'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [recentUpdates, setRecentUpdates] = useState<Record<string, unknown>[]>([])
  const [showUpdatesAlert, setShowUpdatesAlert] = useState(false)
  
  const [filters] = useState<FilterState>({
    status: '',
    dateFrom: '',
    dateTo: '',
    testCategory: '',
    page: 1,
    limit: 20
  })

  const breakpoints = useResponsiveBreakpoints()
  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Real-time WebSocket integration
  const { orders: realTimeOrders, isConnected } = useRealTimeOrders()

  // Performance monitoring
  const performanceMetrics = useRef({
    renderCount: 0,
    lastRenderTime: Date.now(),
    averageRenderTime: 0,
    memoryUsage: 0,
    realTimeUpdates: 0
  })

  // Virtualized list hook with real-time data integration
  const {
    items: orders,
    loading,
    hasNextPage,
    error: listError,
    loadMore,
    refresh,
    // addItems, updateItem, removeItem, isEmpty removed - not used
    totalCount
  } = useVirtualizedList({
    pageSize: filters.limit,
    fetchMore: useCallback(async (page: number) => {
      const queryParams = new URLSearchParams({
        ...filters,
        page: page.toString(),
        limit: filters.limit.toString()
      }).toString()

      const response = await fetch(`/api/portal/purchase-history?${queryParams}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch purchase history')
      }

      // Update summary on first page load
      if (page === 1 && result.data.summary) {
        setSummary(result.data.summary)
      }

      return {
        items: result.data.orders || [],
        hasNextPage: result.data.pagination?.hasNext || false
      }
    }, [filters]),
    itemHeight,
    estimatedItemHeight: !enablePerformanceMode
  })

  // Merge real-time updates with fetched data
  const mergedOrders = useMemo(() => {
    if (!enableRealTimeUpdates || realTimeOrders.length === 0) {
      return orders
    }

    const merged = [...orders]
    
    realTimeOrders.forEach(realTimeOrder => {
      const orderData = realTimeOrder as Record<string, unknown>
      const existingIndex = merged.findIndex(order => (order as Record<string, unknown>).id === orderData.id)
      
      if (existingIndex >= 0) {
        // Update existing order
        merged[existingIndex] = { ...(merged[existingIndex] as Record<string, unknown>), ...orderData }
      } else {
        // Add new order at the beginning
        merged.unshift(orderData)
      }
    })

    return merged.sort((a, b) => {
      const aData = a as Record<string, unknown>
      const bData = b as Record<string, unknown>
      return new Date(bData.created_at as string).getTime() - new Date(aData.created_at as string).getTime()
    })
  }, [orders, realTimeOrders, enableRealTimeUpdates])

  // Handle real-time order updates
  useEffect(() => {
    if (!enableRealTimeUpdates || realTimeOrders.length === 0) return

    const newUpdates = realTimeOrders.filter(order => {
      const orderData = order as Record<string, unknown>
      const orderTime = new Date((orderData.updated_at as string) || (orderData.created_at as string)).getTime()
      return orderTime > lastRefresh.getTime()
    })

    if (newUpdates.length > 0) {
      setRecentUpdates(prev => [...newUpdates, ...prev].slice(0, 5))
      setShowUpdatesAlert(true)
      
      // Update performance metrics
      performanceMetrics.current.realTimeUpdates += newUpdates.length

      // Auto-hide alert after 5 seconds
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      updateTimeoutRef.current = setTimeout(() => {
        setShowUpdatesAlert(false)
      }, 5000)
    }
  }, [realTimeOrders, lastRefresh, enableRealTimeUpdates])

  // Card interaction management
  const {
    toggleExpanded,
    setLoading: setCardLoading,
    isExpanded,
    // isLoading renamed to avoid unused variable warning
    clearAll: clearExpandedCards,
    expandedCount
  } = useVirtualizedCardInteractions()

  // Performance monitoring effect
  useEffect(() => {
    if (enablePerformanceMode) {
      const metrics = performanceMetrics.current
      metrics.renderCount++
      const now = Date.now()
      const renderTime = now - metrics.lastRenderTime
      metrics.averageRenderTime = (metrics.averageRenderTime + renderTime) / 2
      metrics.lastRenderTime = now
      
      if ('memory' in performance) {
        metrics.memoryUsage = (performance as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize
      }
    }
  })

  // Handle manual refresh with cache busting
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    
    try {
      clearExpandedCards()
      
      // Trigger cache invalidation
      await fetch('/api/portal/purchase-history', { 
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      await refresh()
      setLastRefresh(new Date())
      setRecentUpdates([])
      setShowUpdatesAlert(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }, [refresh, clearExpandedCards])

  // Handle filter changes with debouncing
  // handleFilterChange removed - not used in current implementation

  // Handle card expansion with loading state
  const handleOrderExpand = useCallback(async (orderId: string) => {
    if (isExpanded(orderId)) {
      toggleExpanded(orderId)
      return
    }

    setCardLoading(orderId, true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      toggleExpanded(orderId)
    } catch (err) {
      console.error('Error expanding order:', err)
    } finally {
      setCardLoading(orderId, false)
    }
  }, [isExpanded, toggleExpanded, setCardLoading])

  // Render optimized item function with touch support
  const renderOrderItem = useCallback((order: Record<string, unknown>, index: number, isVisible: boolean) => {
    if (breakpoints.isMobile) {
      return (
        <PurchaseHistoryTouchCard
          key={order.id as string}
          order={order}
          onExpand={() => handleOrderExpand(order.id as string)}
          onViewDetails={() => window.location.href = `/portal/orders/${order.id}`}
          onViewResults={order.status === 'completed' ? 
            () => window.location.href = `/portal/results?order=${order.id}` : 
            undefined
          }
          className="mb-4"
        />
      )
    }

    return (
      <VirtualizedPurchaseHistoryCard
        key={order.id as string}
        order={order as unknown as {
          id: string
          total_amount: number
          discount_amount: number
          currency: string
          status: string
          billing_info: Record<string, unknown>
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
          order_tests: TestItem[]
          appointments: Appointment[]
        }}
        index={index}
        isVisible={isVisible}
        onExpand={handleOrderExpand}
        lazyLoadImages={enablePerformanceMode}
        deferNonCriticalContent={enablePerformanceMode}
        className="mb-4"
      />
    )
  }, [handleOrderExpand, enablePerformanceMode, breakpoints.isMobile])

  // Error handling
  const displayError = error || listError
  if (displayError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-rose-900/20 border border-rose-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-rose-300">Error Loading Purchase History</h3>
          </div>
          <p className="text-rose-200 mb-4">{displayError}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
        <WebSocketStatus />
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Real-time updates alert */}
      <AnimatePresence>
        {showUpdatesAlert && recentUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="text-emerald-300 font-semibold">Live Updates</h4>
                  <p className="text-emerald-200 text-sm">
                    {recentUpdates.length} order{recentUpdates.length > 1 ? 's' : ''} updated in real-time
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpdatesAlert(false)}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Performance Metrics and Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Purchase History</h2>
          <div className="flex items-center gap-4">
            <p className="text-slate-400">
              Track your diagnostic test orders, appointments, and results
              {enablePerformanceMode && (
                <span className="ml-2 text-xs text-emerald-400">• Performance Mode</span>
              )}
            </p>
            
            {enableRealTimeUpdates && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs text-slate-500">
                  {isConnected ? 'Live updates' : 'Connecting...'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Performance indicators */}
          {enablePerformanceMode && process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-slate-500 font-mono">
              <div>Items: {totalCount}</div>
              <div>Expanded: {expandedCount}</div>
              <div>Renders: {performanceMetrics.current.renderCount}</div>
              <div>RT Updates: {performanceMetrics.current.realTimeUpdates}</div>
            </div>
          )}
          
          <div className="text-xs text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:border-slate-600/50 transition-colors disabled:opacity-50"
          >
            <motion.div
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
            >
              🔄
            </motion.div>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Statistics Overview with Real-time Data */}
      {summary && (
        <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {summary.totalOrders}
              </div>
              <div className="text-sm text-slate-400">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">
                ${summary.totalSpent.toFixed(0)}
              </div>
              <div className="text-sm text-slate-400">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">
                {summary.totalTests}
              </div>
              <div className="text-sm text-slate-400">Tests Ordered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400 mb-1">
                {summary.recentActivity.upcomingAppointments}
              </div>
              <div className="text-sm text-slate-400">Upcoming</div>
            </div>
          </div>
        </div>
      )}

      {/* Virtualized Order List with Real-time Updates */}
      <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Orders ({mergedOrders.length})
            {enableRealTimeUpdates && realTimeOrders.length > 0 && (
              <span className="ml-2 text-sm text-emerald-400">
                ({realTimeOrders.length} live)
              </span>
            )}
          </h3>
          
          {totalCount > 0 && (
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Showing {Math.min(mergedOrders.length, totalCount)} of {totalCount}</span>
              {expandedCount > 0 && (
                <button
                  onClick={clearExpandedCards}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Collapse All ({expandedCount})
                </button>
              )}
            </div>
          )}
        </div>

        <VirtualizedList
          items={mergedOrders as Record<string, unknown>[]}
          itemHeight={itemHeight}
          containerHeight={containerHeight}
          renderItem={renderOrderItem}
          onLoadMore={loadMore}
          hasNextPage={hasNextPage}
          isLoading={loading}
          overscan={enablePerformanceMode ? 3 : 5}
          itemKey={(order) => (order as Record<string, unknown>).id as string}
          estimatedItemHeight={!enablePerformanceMode}
          maintainScrollPosition={true}
          className="rounded-lg border border-slate-700/30"
        />
      </div>

      {/* WebSocket Connection Status */}
      <WebSocketStatus />

      {/* Performance Settings (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Development Settings</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enablePerformanceMode}
                onChange={() => window.location.reload()}
                className="rounded"
              />
              <span className="text-slate-400">Performance Mode</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableRealTimeUpdates}
                onChange={() => window.location.reload()}
                className="rounded"
              />
              <span className="text-slate-400">Real-time Updates</span>
            </label>
            <span className="text-slate-500">
              Avg Render: {Math.round(performanceMetrics.current.averageRenderTime)}ms
            </span>
            {performanceMetrics.current.memoryUsage > 0 && (
              <span className="text-slate-500">
                Memory: {Math.round(performanceMetrics.current.memoryUsage / 1024 / 1024)}MB
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
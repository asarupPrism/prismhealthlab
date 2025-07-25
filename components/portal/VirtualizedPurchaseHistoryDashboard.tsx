'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VirtualizedList, { useVirtualizedList } from '@/components/ui/VirtualizedList'
import VirtualizedPurchaseHistoryCard, { useVirtualizedCardInteractions } from './VirtualizedPurchaseHistoryCard'
import PurchaseStatistics from './PurchaseStatistics'
import PurchaseFilters from './PurchaseFilters'

interface PurchaseHistoryData {
  orders: any[]
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

interface VirtualizedPurchaseHistoryDashboardProps {
  className?: string
  itemHeight?: number
  containerHeight?: number
  enablePerformanceMode?: boolean
  preloadPages?: number
}

export default function VirtualizedPurchaseHistoryDashboard({ 
  className = '',
  itemHeight = 240,
  containerHeight = 600,
  enablePerformanceMode = true,
  preloadPages = 2
}: VirtualizedPurchaseHistoryDashboardProps) {
  const [summary, setSummary] = useState<PurchaseHistoryData['summary'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    dateFrom: '',
    dateTo: '',
    testCategory: '',
    page: 1,
    limit: 20
  })

  // Performance monitoring
  const performanceMetrics = useRef({
    renderCount: 0,
    lastRenderTime: Date.now(),
    averageRenderTime: 0,
    memoryUsage: 0
  })

  // Virtualized list hook with optimized fetching
  const {
    items: orders,
    loading,
    hasNextPage,
    error: listError,
    loadMore,
    refresh,
    addItems,
    updateItem,
    removeItem,
    isEmpty,
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
    estimatedItemHeight: !enablePerformanceMode // Use estimated heights in non-performance mode
  })

  // Card interaction management
  const {
    toggleExpanded,
    setLoading: setCardLoading,
    isExpanded,
    isLoading: isCardLoading,
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
      
      // Monitor memory usage
      if ('memory' in performance) {
        metrics.memoryUsage = (performance as any).memory.usedJSHeapSize
      }
    }
  })

  // Handle manual refresh with cache busting
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    
    try {
      // Clear expanded cards for better performance
      clearExpandedCards()
      
      // Trigger cache invalidation
      await fetch('/api/portal/purchase-history', { 
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      // Refresh data
      await refresh()
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }, [refresh, clearExpandedCards])

  // Handle filter changes with debouncing
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
    
    // Clear expanded cards when filters change
    clearExpandedCards()
  }, [clearExpandedCards])

  // Handle card expansion with loading state
  const handleOrderExpand = useCallback(async (orderId: string) => {
    if (isExpanded(orderId)) {
      toggleExpanded(orderId)
      return
    }

    setCardLoading(orderId, true)
    
    try {
      // Simulate loading detailed data (in real app, fetch additional data)
      await new Promise(resolve => setTimeout(resolve, 300))
      toggleExpanded(orderId)
    } catch (err) {
      console.error('Error expanding order:', err)
    } finally {
      setCardLoading(orderId, false)
    }
  }, [isExpanded, toggleExpanded, setCardLoading])

  // Render optimized item function
  const renderOrderItem = useCallback((order: any, index: number, isVisible: boolean) => {
    return (
      <VirtualizedPurchaseHistoryCard
        key={order.id}
        order={order}
        index={index}
        isVisible={isVisible}
        onExpand={handleOrderExpand}
        lazyLoadImages={enablePerformanceMode}
        deferNonCriticalContent={enablePerformanceMode}
        className="mb-4"
      />
    )
  }, [handleOrderExpand, enablePerformanceMode])

  // Memoized components for better performance
  const statisticsComponent = useMemo(() => {
    if (!summary) return null
    return <PurchaseStatistics summary={summary} />
  }, [summary])

  const filtersComponent = useMemo(() => (
    <PurchaseFilters
      filters={filters}
      onFilterChange={handleFilterChange}
      statusCounts={summary?.statusCounts || {}}
    />
  ), [filters, handleFilterChange, summary?.statusCounts])

  // Loading component
  const loadingComponent = useMemo(() => (
    <div className="flex items-center gap-3 text-slate-400 py-4">
      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm">Loading more orders...</span>
    </div>
  ), [])

  // Empty component
  const emptyComponent = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📋</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">No Orders Found</h3>
      <p className="text-slate-400 mb-6">
        {Object.values(filters).some(v => v) 
          ? 'No orders match your current filters. Try adjusting your search criteria.'
          : "You haven't placed any diagnostic test orders yet."}
      </p>
      <button
        onClick={() => handleFilterChange({
          status: '',
          dateFrom: '',
          dateTo: '',
          testCategory: ''
        })}
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
      >
        Clear Filters
      </button>
    </motion.div>
  ), [filters, handleFilterChange])

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
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header with Performance Metrics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Purchase History</h2>
          <p className="text-slate-400">
            Track your diagnostic test orders, appointments, and results
            {enablePerformanceMode && (
              <span className="ml-2 text-xs text-emerald-400">• Performance Mode</span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Performance indicators */}
          {enablePerformanceMode && process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-slate-500 font-mono">
              <div>Items: {totalCount}</div>
              <div>Expanded: {expandedCount}</div>
              <div>Renders: {performanceMetrics.current.renderCount}</div>
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

      {/* Statistics Overview */}
      {statisticsComponent}

      {/* Filters */}
      {filtersComponent}

      {/* Virtualized Order List */}
      <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Orders ({totalCount})
          </h3>
          
          {totalCount > 0 && (
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Showing {Math.min(orders.length, totalCount)} of {totalCount}</span>
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
          items={orders}
          itemHeight={itemHeight}
          containerHeight={containerHeight}
          renderItem={renderOrderItem}
          onLoadMore={loadMore}
          hasNextPage={hasNextPage}
          isLoading={loading}
          overscan={enablePerformanceMode ? 3 : 5}
          itemKey={(order) => order.id}
          loadingComponent={loadingComponent}
          emptyComponent={emptyComponent}
          estimatedItemHeight={!enablePerformanceMode}
          maintainScrollPosition={true}
          className="rounded-lg border border-slate-700/30"
        />
      </div>

      {/* Performance Settings (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Performance Settings</h4>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enablePerformanceMode}
                onChange={(e) => window.location.reload()} // Simple toggle for demo
                className="rounded"
              />
              <span className="text-slate-400">Performance Mode</span>
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
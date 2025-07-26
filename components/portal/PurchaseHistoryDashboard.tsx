'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PurchaseHistoryCard from './PurchaseHistoryCard'
import PurchaseStatistics from './PurchaseStatistics'
import PurchaseFilters from './PurchaseFilters'

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

interface PurchaseHistoryDashboardProps {
  className?: string
}

export default function PurchaseHistoryDashboard({ 
  className = '' 
}: PurchaseHistoryDashboardProps) {
  const [data, setData] = useState<PurchaseHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    dateFrom: '',
    dateTo: '',
    testCategory: '',
    page: 1,
    limit: 10
  })

  // Fetch purchase history data
  const fetchPurchaseHistory = useCallback(async () => {
    try {
      setError(null)
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/portal/purchase-history?${queryParams}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch purchase history')
      }

      setData(result.data)
    } catch (err) {
      console.error('Error fetching purchase history:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase history')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPurchaseHistory()
  }, [fetchPurchaseHistory])

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Trigger cache invalidation
      await fetch('/api/portal/purchase-history', { method: 'POST' })
      
      // Refetch data
      await fetchPurchaseHistory()
    } catch (err) {
      console.error('Error refreshing data:', err)
    } finally {
      setRefreshing(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle order expansion
  const handleOrderExpand = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId)
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        {/* Loading skeleton */}
        <div className="space-y-6">
          {/* Statistics skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Orders skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-rose-900/20 border border-rose-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-rose-300">Error Loading Purchase History</h3>
          </div>
          <p className="text-rose-200 mb-4">{error}</p>
          <button
            onClick={fetchPurchaseHistory}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { orders, summary, pagination } = data

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Purchase History</h2>
          <p className="text-slate-400">
            Track your diagnostic test orders, appointments, and results
          </p>
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

      {/* Statistics Overview */}
      <PurchaseStatistics summary={summary} />

      {/* Filters */}
      <PurchaseFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        statusCounts={summary.statusCounts}
      />

      {/* Orders List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {orders.length > 0 ? (
            orders.map((order) => (
              <PurchaseHistoryCard
                key={order.id}
                order={order}
                showExpanded={expandedOrderId === order.id}
                onExpand={handleOrderExpand}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
                onClick={() => setFilters({
                  status: '',
                  dateFrom: '',
                  dateTo: '',
                  testCategory: '',
                  page: 1,
                  limit: 10
                })}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevious}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:border-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const page = i + Math.max(1, pagination.page - 2)
              if (page > pagination.totalPages) return null
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === pagination.page
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600/50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:border-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Load More for Mobile */}
      <div className="md:hidden">
        {pagination.hasNext && (
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            className="w-full py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:border-slate-600/50 transition-colors"
          >
            Load More Orders
          </button>
        )}
      </div>
    </div>
  )
}
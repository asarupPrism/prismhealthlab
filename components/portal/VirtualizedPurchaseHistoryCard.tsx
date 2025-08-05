'use client'

import React, { memo, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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

interface PurchaseOrder {
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
}

interface VirtualizedPurchaseHistoryCardProps {
  order: PurchaseOrder
  index: number
  isVisible: boolean
  onExpand?: (orderId: string) => void
  className?: string
  // Performance optimization props
  lazyLoadImages?: boolean
  deferNonCriticalContent?: boolean
}

const statusColors = {
  pending: 'amber',
  processing: 'blue', 
  completed: 'emerald',
  cancelled: 'rose',
  delivered: 'emerald'
} as const

// statusIcons removed - contained emojis which violate style guide

// Memoized subcomponents for better performance
const OrderHeader = memo<{
  order: PurchaseOrder
  statusColor: string
  needsAttention: boolean
}>(({ order, statusColor, needsAttention }) => {
  const orderDate = useMemo(() => new Date(order.created_at), [order.created_at])
  
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-2 h-2 bg-${statusColor}-400 rounded-full animate-pulse`} />
          <h3 className="text-lg font-semibold text-white">
            Order #{order.id.slice(-8).toUpperCase()}
          </h3>
          <div className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor}-900/30 text-${statusColor}-300 border border-${statusColor}-700/50`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{orderDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}</span>
          <span>{order.order_tests?.length || 0} test{(order.order_tests?.length || 0) !== 1 ? 's' : ''}</span>
          {order.appointments?.length > 0 && (
            <span>{order.appointments.length} appointment{order.appointments.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-lg font-semibold text-white">
          ${order.total_amount.toFixed(2)}
        </div>
        {order.discount_amount > 0 && (
          <div className="text-sm text-emerald-400">
            -${order.discount_amount.toFixed(2)} saved
          </div>
        )}
      </div>
      
      {needsAttention && (
        <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50 ml-3" />
      )}
    </div>
  )
})

OrderHeader.displayName = 'OrderHeader'

const QuickSummary = memo<{
  order: PurchaseOrder
  upcomingAppointment?: Appointment
  hasResults: boolean
  isVisible: boolean
  deferNonCriticalContent: boolean
}>(({ order, upcomingAppointment, hasResults, isVisible, deferNonCriticalContent }) => {
  // Defer rendering of non-critical content when not visible
  if (!isVisible && deferNonCriticalContent) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30 animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* Tests Summary */}
      <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
          <span className="text-xs font-medium text-slate-400">TESTS</span>
        </div>
        <div className="text-sm text-white">
          {order.order_tests?.slice(0, 2).map(test => test.test_name).join(', ')}
          {(order.order_tests?.length || 0) > 2 && (
            <span className="text-slate-400"> +{(order.order_tests?.length || 0) - 2} more</span>
          )}
        </div>
      </div>

      {/* Appointment Info */}
      {upcomingAppointment && (
        <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-700/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-amber-400">UPCOMING</span>
          </div>
          <div className="text-sm text-white">
            {new Date(upcomingAppointment.appointment_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })} at {upcomingAppointment.appointment_time}
          </div>
        </div>
      )}

      {/* Results Status */}
      {hasResults && (
        <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-700/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-xs font-medium text-emerald-400">RESULTS</span>
          </div>
          <div className="text-sm text-white">Available</div>
        </div>
      )}
    </div>
  )
})

QuickSummary.displayName = 'QuickSummary'

const ActionButtons = memo<{
  order: PurchaseOrder
  hasResults: boolean
  onExpand?: (orderId: string) => void
}>(({ order, hasResults, onExpand }) => {
  const handleExpand = useCallback(() => {
    onExpand?.(order.id)
  }, [onExpand, order.id])

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={handleExpand}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
        >
          Show Details
          <span className="transform transition-transform">↓</span>
        </button>
        
        <Link
          href={`/portal/orders/${order.id}`}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          View Full Details →
        </Link>
      </div>

      {hasResults && (
        <Link
          href={`/portal/results?order=${order.id}`}
          className="px-3 py-1.5 text-sm font-medium text-emerald-300 bg-emerald-900/20 border border-emerald-700/50 rounded-lg hover:bg-emerald-900/30 transition-colors"
        >
          View Results
        </Link>
      )}
    </div>
  )
})

ActionButtons.displayName = 'ActionButtons'

const VirtualizedPurchaseHistoryCard = memo<VirtualizedPurchaseHistoryCardProps>(({
  order,
  index,
  isVisible,
  onExpand,
  className = '',
  lazyLoadImages = true,
  deferNonCriticalContent = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(!lazyLoadImages)
  
  // Memoized computed values
  const computedValues = useMemo(() => {
    const statusColor = statusColors[order.status as keyof typeof statusColors] || 'slate'
    const upcomingAppointment = order.appointments?.find(apt => 
      new Date(`${apt.appointment_date} ${apt.appointment_time}`) > new Date() &&
      apt.status === 'scheduled'
    )
    const hasResults = order.status === 'completed' && Boolean(order.metadata?.results_available)
    const needsAttention = order.status === 'pending' || !!upcomingAppointment
    
    return {
      statusColor,
      upcomingAppointment,
      hasResults,
      needsAttention
    }
  }, [order.status, order.appointments, order.metadata])

  // Lazy load effect for images/heavy content
  useState(() => {
    if (lazyLoadImages && isVisible && !imageLoaded) {
      // Simulate image loading delay
      const timer = setTimeout(() => setImageLoaded(true), 100)
      return () => clearTimeout(timer)
    }
  })

  // Performance optimization: render minimal version when not visible
  if (!isVisible && deferNonCriticalContent) {
    return (
      <div className={`group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden transition-all duration-300 ${className}`}>
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${computedValues.statusColor}-400 to-${computedValues.statusColor}-600`} />
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      layout={false} // Disable for performance in virtualized list
      className={`group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      data-order-id={order.id}
      data-index={index}
    >
      {/* Status Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${computedValues.statusColor}-400 to-${computedValues.statusColor}-600`} />
      
      <div className="p-6">
        <OrderHeader 
          order={order}
          statusColor={computedValues.statusColor}
          needsAttention={computedValues.needsAttention}
        />

        <QuickSummary 
          order={order}
          upcomingAppointment={computedValues.upcomingAppointment}
          hasResults={computedValues.hasResults}
          isVisible={isVisible}
          deferNonCriticalContent={deferNonCriticalContent}
        />

        <ActionButtons 
          order={order}
          hasResults={computedValues.hasResults}
          onExpand={onExpand}
        />
      </div>

      {/* Performance metrics (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-slate-900/80 rounded px-1 text-xs text-slate-400 font-mono">
          #{index}
        </div>
      )}
    </motion.div>
  )
})

VirtualizedPurchaseHistoryCard.displayName = 'VirtualizedPurchaseHistoryCard'

export default VirtualizedPurchaseHistoryCard

// Hook for managing card interactions
export function useVirtualizedCardInteractions() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map())

  const toggleExpanded = useCallback((orderId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }, [])

  const setLoading = useCallback((orderId: string, loading: boolean) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev)
      if (loading) {
        newMap.set(orderId, true)
      } else {
        newMap.delete(orderId)
      }
      return newMap
    })
  }, [])

  const isExpanded = useCallback((orderId: string) => {
    return expandedCards.has(orderId)
  }, [expandedCards])

  const isLoading = useCallback((orderId: string) => {
    return loadingStates.get(orderId) || false
  }, [loadingStates])

  const clearAll = useCallback(() => {
    setExpandedCards(new Set())
    setLoadingStates(new Map())
  }, [])

  return {
    toggleExpanded,
    setLoading,
    isExpanded,
    isLoading,
    clearAll,
    expandedCount: expandedCards.size
  }
}
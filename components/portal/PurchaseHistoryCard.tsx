'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  billing_info: any
  metadata: any
  created_at: string
  updated_at: string
  order_tests: TestItem[]
  appointments: Appointment[]
}

interface PurchaseHistoryCardProps {
  order: PurchaseOrder
  showExpanded?: boolean
  onExpand?: (orderId: string) => void
  className?: string
}

const statusColors = {
  pending: 'amber',
  processing: 'blue',
  completed: 'emerald',
  cancelled: 'rose',
  delivered: 'emerald'
} as const

const statusIcons = {
  pending: '⏳',
  processing: '🔄',
  completed: '✅',
  cancelled: '❌',
  delivered: '📋'
} as const

export default function PurchaseHistoryCard({ 
  order, 
  showExpanded = false, 
  onExpand,
  className = '' 
}: PurchaseHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(showExpanded)
  
  const statusColor = statusColors[order.status as keyof typeof statusColors] || 'slate'
  const orderDate = new Date(order.created_at)
  const upcomingAppointment = order.appointments?.find(apt => 
    new Date(`${apt.appointment_date} ${apt.appointment_time}`) > new Date() &&
    apt.status === 'scheduled'
  )
  
  const hasResults = order.status === 'completed' && order.metadata?.results_available
  const needsAttention = order.status === 'pending' || upcomingAppointment
  
  const handleToggleExpand = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    
    if (newExpanded && onExpand) {
      onExpand(order.id)
    }
  }

  return (
    <motion.div
      layout
      className={`group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Status Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${statusColor}-400 to-${statusColor}-600`} />
      
      {/* Attention Indicator */}
      {needsAttention && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50" />
      )}

      {/* Main Content */}
      <div className="p-6">
        {/* Header Section */}
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
        </div>

        {/* Quick Summary */}
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleExpand}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              {isExpanded ? 'Show Less' : 'Show Details'}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ↓
              </motion.div>
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

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-6 border-t border-slate-700/50 pt-6"
            >
              {/* Detailed Test List */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  ORDERED TESTS
                </h4>
                <div className="space-y-2">
                  {order.order_tests?.map((test, index) => (
                    <div
                      key={`${test.test_id}-${index}`}
                      className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/30"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{test.test_name}</div>
                        <div className="text-xs text-slate-400">
                          Quantity: {test.quantity} • Test ID: {test.test_id}
                        </div>
                      </div>
                      <div className="text-sm text-white font-mono">
                        ${test.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointments */}
              {order.appointments && order.appointments.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    APPOINTMENTS
                  </h4>
                  <div className="space-y-2">
                    {order.appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/30"
                      >
                        <div>
                          <div className="text-sm font-medium text-white">
                            {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-slate-400">
                            {apt.appointment_time} {apt.location_name && `• ${apt.location_name}`}
                            {apt.staff_name && ` • ${apt.staff_name}`}
                          </div>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full bg-${
                          apt.status === 'completed' ? 'emerald' : 
                          apt.status === 'scheduled' ? 'amber' : 'slate'
                        }-900/30 text-${
                          apt.status === 'completed' ? 'emerald' : 
                          apt.status === 'scheduled' ? 'amber' : 'slate'
                        }-300 border border-${
                          apt.status === 'completed' ? 'emerald' : 
                          apt.status === 'scheduled' ? 'amber' : 'slate'
                        }-700/50`}>
                          {apt.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Subtotal</span>
                  <span className="text-sm text-white font-mono">
                    ${(order.total_amount + order.discount_amount).toFixed(2)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-emerald-400">Discount</span>
                    <span className="text-sm text-emerald-400 font-mono">
                      -${order.discount_amount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-700/50 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-white">Total</span>
                    <span className="text-base font-semibold text-white font-mono">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Order {
  id: string
  swell_order_number?: string
  customer_email: string
  total: number
  status: string
  items?: any[]
  created_at: string
  payment_method?: string
  shipping_address?: any
  billing_address?: any
  appointments?: any[]
}

interface OrderHistoryViewProps {
  orders: Order[]
}

export default function OrderHistoryView({ orders }: OrderHistoryViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus
    const searchMatch = searchTerm === '' || 
      order.swell_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    return statusMatch && searchMatch
  })

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy === 'total') {
      return b.total - a.total
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status)
    }
    return 0
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
      case 'processing':
        return 'bg-amber-500/20 border-amber-400/30 text-amber-300'
      case 'pending':
        return 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
      case 'cancelled':
        return 'bg-rose-500/20 border-rose-400/30 text-rose-300'
      case 'refunded':
        return 'bg-purple-500/20 border-purple-400/30 text-purple-300'
      default:
        return 'bg-slate-500/20 border-slate-400/30 text-slate-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '✓'
      case 'processing':
        return '⟳'
      case 'pending':
        return '◷'
      case 'cancelled':
        return '✕'
      case 'refunded':
        return '↺'
      default:
        return '•'
    }
  }

  const handleDownloadReceipt = (orderId: string) => {
    // This would trigger a receipt download
    console.log('Downloading receipt for order:', orderId)
  }

  const handleReorder = (order: Order) => {
    // This would add items back to cart
    console.log('Reordering items from order:', order.id)
  }

  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          <div className="flex flex-wrap gap-4 flex-1">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900/50 border border-slate-600/50 text-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none"
              >
                <option value="all">All Orders</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900/50 border border-slate-600/50 text-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none"
              >
                <option value="date">By Date</option>
                <option value="total">By Total</option>
                <option value="status">By Status</option>
              </select>
            </div>
          </div>

          {/* New Order Button */}
          <Link
            href="/products"
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25"
          >
            Place New Order
          </Link>
        </div>
      </div>

      {/* Orders List */}
      {sortedOrders.length > 0 ? (
        <div className="space-y-6">
          {sortedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        Order #{order.swell_order_number || order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <span>{formatDate(order.created_at)}</span>
                      <span>•</span>
                      <span>{order.items?.length || 0} items</span>
                      {order.appointments && order.appointments.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400">
                            {order.appointments.length} appointment{order.appointments.length > 1 ? 's' : ''} scheduled
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(order.total)}</p>
                    </div>

                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="p-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-slate-600/60 transition-all duration-300"
                    >
                      <motion.div
                        animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        ▼
                      </motion.div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-slate-700/50"
                  >
                    <div className="p-6 space-y-6">
                      {/* Order Items */}
                      {order.items && order.items.length > 0 && (
                        <div>
                          <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg">
                                <div>
                                  <p className="text-white font-medium">{item.name || 'Test Item'}</p>
                                  <p className="text-slate-400 text-sm">Quantity: {item.quantity || 1}</p>
                                </div>
                                <p className="text-white font-medium">
                                  {formatCurrency(item.price || 0)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            Payment Method
                          </h4>
                          <div className="p-4 bg-slate-900/30 rounded-lg">
                            <p className="text-slate-300">
                              {order.payment_method || 'Credit Card'}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                              Ending in ****1234
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            Order Summary
                          </h4>
                          <div className="p-4 bg-slate-900/30 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Subtotal</span>
                              <span className="text-white">{formatCurrency(order.total * 0.9)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Tax</span>
                              <span className="text-white">{formatCurrency(order.total * 0.1)}</span>
                            </div>
                            <div className="flex justify-between font-medium pt-2 border-t border-slate-700/50">
                              <span className="text-white">Total</span>
                              <span className="text-white">{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700/50">
                        <button
                          onClick={() => handleDownloadReceipt(order.id)}
                          className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-medium rounded-xl hover:bg-cyan-500/30 transition-all duration-300"
                        >
                          Download Receipt
                        </button>
                        
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-medium rounded-xl hover:bg-emerald-500/30 transition-all duration-300"
                        >
                          Reorder Items
                        </button>

                        {order.status === 'processing' && (
                          <button className="px-4 py-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 font-medium rounded-xl hover:bg-amber-500/30 transition-all duration-300">
                            Track Order
                          </button>
                        )}

                        {['completed', 'processing'].includes(order.status) && (
                          <button className="px-4 py-2 bg-rose-500/20 border border-rose-400/30 text-rose-300 font-medium rounded-xl hover:bg-rose-500/30 transition-all duration-300">
                            Report Issue
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-slate-400 rounded"></div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {filterStatus !== 'all' || searchTerm 
              ? 'No orders match your criteria' 
              : 'No orders yet'
            }
          </h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            {filterStatus !== 'all' || searchTerm
              ? 'Try adjusting your filters or search term to see more orders.'
              : 'Start your health journey by ordering your first diagnostic test.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25"
            >
              Browse Tests
            </Link>
            {(filterStatus !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setFilterStatus('all')
                  setSearchTerm('')
                }}
                className="px-8 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:text-white transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Order Tips */}
      <div className="backdrop-blur-sm bg-slate-800/20 border border-slate-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          Order Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-white">Processing Time:</span> Orders are typically processed within 24 hours of placement.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-white">Receipts:</span> Digital receipts are available for all orders and can be downloaded anytime.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-amber-400/20 border border-amber-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-white">Reordering:</span> Quickly reorder previous tests with one click for convenient repeat testing.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-400/20 border border-purple-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-white">Support:</span> Contact our support team for any order-related questions or issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
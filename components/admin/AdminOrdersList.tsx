'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface Order {
  id: string
  number: string
  status: string
  customer_name: string
  customer_email: string
  total: number
  date_created: string
  source: 'swell' | 'supabase'
  items?: { id: string; name: string; quantity: number; price: number }[]
  supabase_data?: Record<string, unknown>
}

interface AdminOrdersListProps {
  orders: Order[]
}

export default function AdminOrdersList({ orders }: AdminOrdersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<'all' | 'swell' | 'supabase'>('all')

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(orders.map(order => order.status)))

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSource = filterSource === 'all' || order.source === filterSource
    
    return matchesSearch && matchesStatus && matchesSource
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
      case 'completed':
      case 'delivered':
        return 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
      case 'pending':
      case 'processing':
        return 'bg-amber-500/20 border-amber-400/30 text-amber-300'
      case 'cancelled':
      case 'canceled':
        return 'bg-rose-500/20 border-rose-400/30 text-rose-300'
      case 'shipped':
      case 'shipping':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-300'
      default:
        return 'bg-slate-500/20 border-slate-400/30 text-slate-300'
    }
  }

  const getSourceColor = (source: 'swell' | 'supabase') => {
    return source === 'swell' 
      ? 'bg-purple-500/20 border-purple-400/30 text-purple-300'
      : 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search orders by number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as 'all' | 'swell' | 'supabase')}
              className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              <option value="all">All Sources</option>
              <option value="swell">Swell E-commerce</option>
              <option value="supabase">Direct Orders</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Order Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      order.source === 'swell' 
                        ? 'bg-gradient-to-br from-purple-400 to-pink-500' 
                        : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                    }`}>
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold text-lg">
                        {order.number}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(order.source)}`}>
                        {order.source.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-1">
                      {order.customer_name || 'Anonymous'} • {order.customer_email}
                    </p>
                    
                    <div className="flex items-center gap-6 text-xs text-slate-400">
                      <span>Created: {formatDate(order.date_created)}</span>
                      <span className="text-white font-semibold">${order.total.toLocaleString()}</span>
                      {order.items && order.items.length > 0 && (
                        <span>{order.items.length} items</span>
                      )}
                      {(() => {
                        const appointments = order.supabase_data?.appointments;
                        return appointments && Array.isArray(appointments) && appointments.length > 0 ? (
                          <span className="text-emerald-300">Has Appointment</span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button className="px-3 py-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300">
                      View Details
                    </button>
                    
                    {order.status === 'pending' && (
                      <button className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25">
                        Process
                      </button>
                    )}
                    
                    {order.source === 'swell' && (
                      <button className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-400 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25">
                        Swell
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 border border-slate-400 rounded-sm"></div>
              </div>
            </div>
            <p className="text-slate-400 mb-4">No orders found matching your search criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setFilterSource('all')
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrderInfo {
  id: string
  total_amount: number
  status: string
  order_tests: Array<{
    test_name: string
    quantity: number
  }>
}

interface LocationInfo {
  name: string
  address: string
  phone: string
  hours: any
}

interface AppointmentWithOrder {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  appointment_type: string
  location_id?: string
  metadata: any
  created_at: string
  updated_at: string
  order: OrderInfo | null
  location_info?: LocationInfo
}

interface AppointmentIntegrationCardProps {
  appointment: AppointmentWithOrder
  onCancel?: (appointmentId: string, reason: string) => void
  onRescheduleRequest?: (appointmentId: string, data: any) => void
  className?: string
}

const statusColors = {
  scheduled: 'amber',
  confirmed: 'blue',
  completed: 'emerald',
  cancelled: 'rose',
  rescheduled: 'orange'
} as const

const statusLabels = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rescheduled: 'Rescheduled'
} as const

export default function AppointmentIntegrationCard({
  appointment,
  onCancel,
  onRescheduleRequest,
  className = ''
}: AppointmentIntegrationCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const statusColor = statusColors[appointment.status as keyof typeof statusColors] || 'slate'
  const appointmentDate = new Date(appointment.appointment_date)
  const now = new Date()
  const isPast = appointmentDate < now
  const isToday = appointmentDate.toDateString() === now.toDateString()
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  const canCancel = appointment.status === 'scheduled' && hoursUntilAppointment > 24
  const canReschedule = appointment.status === 'scheduled' && !appointment.metadata?.reschedule_requested

  const handleCancel = async () => {
    if (!onCancel || !cancelReason.trim()) return
    
    setIsProcessing(true)
    try {
      await onCancel(appointment.id, cancelReason)
      setShowCancelDialog(false)
      setCancelReason('')
    } catch (error) {
      console.error('Cancel error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRescheduleRequest = async () => {
    if (!onRescheduleRequest) return
    
    setIsProcessing(true)
    try {
      await onRescheduleRequest(appointment.id, {
        reason: 'Patient requested reschedule'
      })
    } catch (error) {
      console.error('Reschedule error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (date: Date) => {
    if (isToday) return 'Today'
    if (date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()) {
      return 'Tomorrow'
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <>
      <motion.div
        layout
        className={`group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 ${className}`}
        whileHover={{ scale: 1.01 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Status Indicator Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${statusColor}-400 to-${statusColor}-600`} />
        
        {/* Urgency Indicators */}
        {isToday && appointment.status === 'scheduled' && (
          <div className="absolute top-3 right-3 w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50" />
        )}
        
        {appointment.metadata?.reschedule_requested && (
          <div className="absolute top-3 right-3 w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-lg shadow-orange-400/50" />
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-2 h-2 bg-${statusColor}-400 rounded-full animate-pulse`} />
                <h3 className="text-lg font-semibold text-white">
                  {formatDate(appointmentDate)}
                </h3>
                <div className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor}-900/30 text-${statusColor}-300 border border-${statusColor}-700/50`}>
                  {statusLabels[appointment.status as keyof typeof statusLabels]}
                </div>
              </div>
              
              <div className="text-xl font-bold text-white mb-1">
                {formatTime(appointment.appointment_time)}
              </div>
              
              {appointment.metadata?.location_name && (
                <div className="text-sm text-slate-400">
                  📍 {appointment.metadata.location_name}
                </div>
              )}
            </div>
            
            {/* Actions Button */}
            {(canCancel || canReschedule) && (
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                ⋯
              </button>
            )}
          </div>

          {/* Order Information */}
          {appointment.order && (
            <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span className="text-sm font-medium text-slate-300">ORDER DETAILS</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Order #</span>
                  <span className="text-sm text-white font-mono">
                    {appointment.order.id.slice(-8).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Tests</span>
                  <span className="text-sm text-white">
                    {appointment.order.order_tests.length} test{appointment.order.order_tests.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Total</span>
                  <span className="text-sm text-white font-semibold">
                    ${appointment.order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Test List */}
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="space-y-1">
                  {appointment.order.order_tests.slice(0, 2).map((test, index) => (
                    <div key={index} className="text-xs text-slate-400">
                      • {test.test_name} {test.quantity > 1 && `(${test.quantity})`}
                    </div>
                  ))}
                  {appointment.order.order_tests.length > 2 && (
                    <div className="text-xs text-slate-500">
                      +{appointment.order.order_tests.length - 2} more tests
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Staff Information */}
          {appointment.metadata?.staff_name && (
            <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-xs font-medium text-slate-400">ASSIGNED STAFF</span>
              </div>
              <div className="text-sm text-white">{appointment.metadata.staff_name}</div>
            </div>
          )}

          {/* Special Messages */}
          {appointment.metadata?.reschedule_requested && (
            <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-700/30 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-orange-400">RESCHEDULE REQUESTED</span>
              </div>
              <div className="text-sm text-orange-200">
                Your reschedule request is being processed. We'll contact you soon.
              </div>
            </div>
          )}

          {isToday && appointment.status === 'scheduled' && (
            <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-700/30">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-amber-400">TODAY'S APPOINTMENT</span>
              </div>
              <div className="text-sm text-amber-200">
                Don't forget your appointment today! Please arrive 15 minutes early.
              </div>
            </div>
          )}
        </div>

        {/* Actions Dropdown */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-700/50 bg-slate-900/50"
            >
              <div className="p-4 space-y-2">
                {canReschedule && (
                  <button
                    onClick={handleRescheduleRequest}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-sm text-amber-300 bg-amber-900/20 border border-amber-700/50 rounded-lg hover:bg-amber-900/30 transition-colors disabled:opacity-50"
                  >
                    Request Reschedule
                  </button>
                )}
                
                {canCancel && (
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-sm text-rose-300 bg-rose-900/20 border border-rose-700/50 rounded-lg hover:bg-rose-900/30 transition-colors disabled:opacity-50"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cancel Dialog */}
      <AnimatePresence>
        {showCancelDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCancelDialog(false)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Cancel Appointment
              </h3>
              
              <p className="text-slate-300 mb-4 text-sm">
                Are you sure you want to cancel your appointment on {formatDate(appointmentDate)} at {formatTime(appointment.appointment_time)}?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors resize-none"
                  rows={3}
                  placeholder="Please let us know why you're cancelling..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Appointment'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
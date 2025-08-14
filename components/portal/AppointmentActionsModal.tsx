'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Appointment } from '@/types/shared'

interface AppointmentActionsModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  action: 'reschedule' | 'cancel' | null
  onSuccess: () => void
}

interface AvailableSlot {
  date: string
  time: string
  available: boolean
}

export default function AppointmentActionsModal({ 
  isOpen, 
  onClose, 
  appointment, 
  action,
  onSuccess 
}: AppointmentActionsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Reschedule state
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  
  // Cancel state
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancellationDetails, setCancellationDetails] = useState('')

  useEffect(() => {
    if (isOpen && action === 'reschedule' && appointment) {
      // Set initial date to current appointment date
      setSelectedDate(appointment.scheduled_date)
      setSelectedTime(appointment.scheduled_time || '')
      loadAvailableSlots(appointment.scheduled_date)
    }
  }, [isOpen, action, appointment])

  const loadAvailableSlots = async (date: string) => {
    if (!appointment) return

    try {
      const supabase = createClient()
      
      // Get all appointments for the selected date at the same location
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('scheduled_time, estimated_duration_minutes')
        .eq('scheduled_date', date)
        .eq('location_id', appointment.location_id)
        .neq('id', appointment.id) // Exclude current appointment
        .in('status', ['scheduled', 'confirmed'])

      // Generate time slots from 7 AM to 7 PM
      const slots: AvailableSlot[] = []
      for (let hour = 7; hour < 19; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          
          // Check if slot is available
          const isAvailable = !existingAppointments?.some(apt => {
            const aptStart = apt.scheduled_time
            const aptDuration = apt.estimated_duration_minutes || 30
            const aptEndTime = new Date(`2000-01-01T${aptStart}`)
            aptEndTime.setMinutes(aptEndTime.getMinutes() + aptDuration)
            const aptEnd = aptEndTime.toTimeString().slice(0, 5)
            
            return time >= aptStart && time < aptEnd
          })
          
          slots.push({
            date,
            time,
            available: isAvailable
          })
        }
      }
      
      setAvailableSlots(slots)
    } catch (err) {
      console.error('Error loading available slots:', err)
    }
  }

  const handleReschedule = async () => {
    if (!appointment || !selectedDate || !selectedTime) {
      setError('Please select a new date and time')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      
      // Update appointment
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          status: 'rescheduled',
          updated_at: new Date().toISOString(),
          notes: `Rescheduled from ${appointment.scheduled_date} ${appointment.scheduled_time}`
        })
        .eq('id', appointment.id)

      if (updateError) throw updateError

      // Create notification record
      await supabase
        .from('notifications')
        .insert({
          user_id: appointment.user_id,
          type: 'appointment_rescheduled',
          title: 'Appointment Rescheduled',
          message: `Your appointment has been rescheduled to ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}`,
          read: false
        })

      setSuccess('Appointment rescheduled successfully!')
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule appointment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!appointment || !cancellationReason) {
      setError('Please provide a reason for cancellation')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      
      // Update appointment status
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancellationReason,
          cancellation_details: cancellationDetails || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id)

      if (updateError) throw updateError

      // Create notification record
      await supabase
        .from('notifications')
        .insert({
          user_id: appointment.user_id,
          type: 'appointment_cancelled',
          title: 'Appointment Cancelled',
          message: `Your appointment on ${new Date(appointment.scheduled_date).toLocaleDateString()} has been cancelled`,
          read: false
        })

      setSuccess('Appointment cancelled successfully!')
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedDate('')
    setSelectedTime('')
    setCancellationReason('')
    setCancellationDetails('')
    setError(null)
    setSuccess(null)
    setAvailableSlots([])
    onClose()
  }

  const getNextSevenDays = () => {
    const dates = []
    for (let i = 1; i <= 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  if (!isOpen || !appointment || !action) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[85vh] overflow-hidden backdrop-blur-sm bg-slate-800/95 border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-900/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${
                  action === 'reschedule' 
                    ? 'from-amber-400 to-orange-500' 
                    : 'from-rose-400 to-pink-500'
                } rounded-xl flex items-center justify-center`}>
                  <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {action === 'reschedule' ? 'Reschedule Appointment' : 'Cancel Appointment'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {success && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-rose-500/20 border border-rose-400/30 rounded-xl text-rose-300">
                {error}
              </div>
            )}

            {/* Current Appointment Info */}
            <div className="mb-6 p-4 bg-slate-900/30 rounded-xl">
              <h3 className="text-white font-medium mb-3">Current Appointment</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Date:</span>
                  <span className="text-white ml-2">
                    {new Date(appointment.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Time:</span>
                  <span className="text-white ml-2">{appointment.scheduled_time}</span>
                </div>
                <div>
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white ml-2 capitalize">
                    {appointment.appointment_type?.replace('_', ' ') || 'Blood Draw'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <span className="text-cyan-300 ml-2 capitalize">{appointment.status}</span>
                </div>
              </div>
            </div>

            {action === 'reschedule' ? (
              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select New Date
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {getNextSevenDays().map(date => {
                      const dateObj = new Date(date)
                      const isSelected = selectedDate === date
                      return (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date)
                            loadAvailableSlots(date)
                          }}
                          className={`p-3 rounded-xl border transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                              : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="text-xs uppercase">
                            {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-lg font-bold">
                            {dateObj.getDate()}
                          </div>
                          <div className="text-xs">
                            {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Select New Time
                    </label>
                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map(slot => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-2 text-sm rounded-lg transition-all duration-300 ${
                            selectedTime === slot.time
                              ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300'
                              : slot.available
                                ? 'bg-slate-900/30 border border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
                                : 'bg-slate-900/10 border border-slate-800/30 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300"
                    rows={3}
                    placeholder="Any special requirements or notes..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cancellation Reason */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Reason for Cancellation
                  </label>
                  <select
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 transition-all duration-300"
                  >
                    <option value="">Select a reason</option>
                    <option value="scheduling_conflict">Scheduling Conflict</option>
                    <option value="personal_emergency">Personal Emergency</option>
                    <option value="illness">Illness</option>
                    <option value="travel">Travel</option>
                    <option value="financial">Financial Reasons</option>
                    <option value="no_longer_needed">No Longer Needed</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={cancellationDetails}
                    onChange={(e) => setCancellationDetails(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 transition-all duration-300"
                    rows={3}
                    placeholder="Please provide any additional information..."
                  />
                </div>

                {/* Cancellation Policy */}
                <div className="p-4 bg-rose-500/10 border border-rose-400/30 rounded-xl">
                  <h4 className="text-rose-300 font-medium mb-2">Cancellation Policy</h4>
                  <ul className="space-y-1 text-sm text-rose-200">
                    <li>• Cancellations made less than 24 hours in advance may incur a fee</li>
                    <li>• You can reschedule your appointment instead of cancelling</li>
                    <li>• Refunds will be processed within 5-7 business days</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/50">
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={handleClose}
                className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={action === 'reschedule' ? handleReschedule : handleCancel}
                disabled={isLoading || 
                  (action === 'reschedule' && (!selectedDate || !selectedTime)) ||
                  (action === 'cancel' && !cancellationReason)
                }
                className={`px-6 py-3 bg-gradient-to-r ${
                  action === 'reschedule'
                    ? 'from-amber-500 to-orange-600 shadow-amber-500/25'
                    : 'from-rose-500 to-pink-600 shadow-rose-500/25'
                } text-white font-medium rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Processing...' : action === 'reschedule' ? 'Confirm Reschedule' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
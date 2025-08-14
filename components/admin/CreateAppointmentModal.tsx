'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { StaffMember, Location } from '@/types/admin'

interface Patient {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
}

interface Order {
  id: string
  swell_order_number: string | null
  total: number
  status: string
  customer_email: string
}

interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  staff: StaffMember[]
  locations: Location[]
}

interface AppointmentFormData {
  patientId: string
  orderId: string
  locationId: string
  assignedStaffId: string
  scheduledDate: string
  scheduledTime: string
  appointmentType: 'blood_draw' | 'consultation' | 'follow_up'
  estimatedDurationMinutes: number
  specialInstructions: string
  accessibilityRequirements: string
}

export default function CreateAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  staff,
  locations 
}: CreateAppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [conflicts, setConflicts] = useState<string[]>([])

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    orderId: '',
    locationId: '',
    assignedStaffId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    appointmentType: 'blood_draw',
    estimatedDurationMinutes: 30,
    specialInstructions: '',
    accessibilityRequirements: ''
  })

  // Load patients and orders when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPatients()
      loadOrders()
    }
  }, [isOpen])

  // Check for conflicts when key fields change
  useEffect(() => {
    if (formData.assignedStaffId && formData.locationId && formData.scheduledDate && formData.scheduledTime) {
      checkForConflicts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.assignedStaffId, formData.locationId, formData.scheduledDate, formData.scheduledTime, formData.estimatedDurationMinutes])

  const loadPatients = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, phone')
        .order('created_at', { ascending: false })
        .limit(100)

      setPatients(data || [])
    } catch (err) {
      console.error('Error loading patients:', err)
    }
  }

  const loadOrders = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select('id, swell_order_number, total, status, customer_email')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(50)

      setOrders(data || [])
    } catch (err) {
      console.error('Error loading orders:', err)
    }
  }

  const checkForConflicts = async () => {
    try {
      const supabase = createClient()
      
      // Calculate time range for this appointment
      const startTime = formData.scheduledTime
      const startDateTime = new Date(`${formData.scheduledDate}T${startTime}`)
      const endDateTime = new Date(startDateTime.getTime() + formData.estimatedDurationMinutes * 60000)
      const endTime = endDateTime.toTimeString().slice(0, 5)

      // Check for overlapping appointments
      const { data: overlapping } = await supabase
        .from('appointments')
        .select('*')
        .eq('assigned_staff_id', formData.assignedStaffId)
        .eq('location_id', formData.locationId)
        .eq('scheduled_date', formData.scheduledDate)
        .in('status', ['scheduled', 'confirmed', 'in_progress'])


      const conflictMessages: string[] = []

      // Check for time conflicts
      overlapping?.forEach(apt => {
        const aptStart = apt.scheduled_time
        const aptEndTime = new Date(`${apt.scheduled_date}T${aptStart}`)
        aptEndTime.setMinutes(aptEndTime.getMinutes() + (apt.estimated_duration_minutes || 30))
        const aptEnd = aptEndTime.toTimeString().slice(0, 5)

        // Check if times overlap
        if (
          (startTime >= aptStart && startTime < aptEnd) ||
          (endTime > aptStart && endTime <= aptEnd) ||
          (startTime <= aptStart && endTime >= aptEnd)
        ) {
          conflictMessages.push(
            `Conflict: Staff already has appointment from ${aptStart} to ${aptEnd} (${apt.appointment_number})`
          )
        }
      })

      // Check if appointment is outside business hours
      const location = locations.find(l => l.id === formData.locationId)
      if (location) {
        // This is a simplified check - in real implementation, you'd check actual operating hours
        const hour = parseInt(startTime.split(':')[0])
        if (hour < 7 || hour > 19) {
          conflictMessages.push('Appointment time is outside typical business hours (7 AM - 7 PM)')
        }
      }

      setConflicts(conflictMessages)
    } catch (err) {
      console.error('Error checking conflicts:', err)
    }
  }

  const handleInputChange = (field: keyof AppointmentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const generateAppointmentNumber = () => {
    const date = new Date(formData.scheduledDate)
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `APT${dateStr}${randomNum}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (conflicts.length > 0) {
      setError('Please resolve conflicts before creating the appointment')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const appointmentData = {
        user_id: formData.patientId,
        order_id: formData.orderId || null,
        location_id: formData.locationId,
        assigned_staff_id: formData.assignedStaffId,
        appointment_number: generateAppointmentNumber(),
        appointment_type: formData.appointmentType,
        scheduled_date: formData.scheduledDate,
        scheduled_time: formData.scheduledTime,
        estimated_duration_minutes: formData.estimatedDurationMinutes,
        status: 'scheduled',
        special_instructions: formData.specialInstructions || null,
        accessibility_requirements: formData.accessibilityRequirements || null,
        confirmation_sent: false,
        reminder_sent: false
      }

      const { error: insertError } = await supabase
        .from('appointments')
        .insert(appointmentData)

      if (insertError) throw insertError

      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      patientId: '',
      orderId: '',
      locationId: '',
      assignedStaffId: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      appointmentType: 'blood_draw',
      estimatedDurationMinutes: 30,
      specialInstructions: '',
      accessibilityRequirements: ''
    })
    setError(null)
    setConflicts([])
    onClose()
  }

  if (!isOpen) return null

  const getPatientName = (patient: Patient) => {
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email
  }

  const getStaffName = (staffMember: StaffMember) => {
    return `${staffMember.profiles?.first_name || ''} ${staffMember.profiles?.last_name || ''}`.trim() || staffMember.employee_id
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm bg-slate-800/95 border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-900/50"
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white">Create New Appointment</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 border border-rose-400/30 rounded-xl text-rose-300">
              {error}
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="mb-6 p-4 bg-amber-500/20 border border-amber-400/30 rounded-xl">
              <h4 className="text-amber-300 font-medium mb-2">⚠️ Scheduling Conflicts Detected:</h4>
              <ul className="space-y-1 text-amber-200 text-sm">
                {conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient & Order Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Patient & Order Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Patient
                </label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                >
                  <option value="">Select patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {getPatientName(patient)} ({patient.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Order (Optional)
                </label>
                <select
                  value={formData.orderId}
                  onChange={(e) => handleInputChange('orderId', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                >
                  <option value="">No associated order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.swell_order_number || order.id.slice(0, 8)} - ${order.total} ({order.customer_email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Appointment Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Appointment Type
                </label>
                <select
                  value={formData.appointmentType}
                  onChange={(e) => handleInputChange('appointmentType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                >
                  <option value="blood_draw">Blood Draw</option>
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow Up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>
                <select
                  required
                  value={formData.locationId}
                  onChange={(e) => handleInputChange('locationId', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                >
                  <option value="">Select location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.city}, {location.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Assigned Staff
                </label>
                <select
                  required
                  value={formData.assignedStaffId}
                  onChange={(e) => handleInputChange('assignedStaffId', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                >
                  <option value="">Select staff member</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>
                      {getStaffName(member)} ({member.staff_roles?.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Time
              </label>
              <input
                type="time"
                required
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duration (minutes)
              </label>
              <select
                value={formData.estimatedDurationMinutes}
                onChange={(e) => handleInputChange('estimatedDurationMinutes', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Special Instructions
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                rows={3}
                placeholder="Any special instructions for this appointment..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Accessibility Requirements
              </label>
              <textarea
                value={formData.accessibilityRequirements}
                onChange={(e) => handleInputChange('accessibilityRequirements', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                rows={3}
                placeholder="Wheelchair access, parking needs, etc..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-700/50">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading || conflicts.length > 0}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'

interface TimeSlot {
  id: string
  start: Date
  end: Date
  available: boolean
  staffId?: string
  staffName?: string
}

interface Location {
  id: string
  name: string
  address: string
  phone?: string
  available: boolean
}

interface AppointmentData {
  selectedDate: Date
  selectedTime: string
  timeSlot: TimeSlot
  staffId: string
  staffName: string
  locationId: string
  locationName: string
}

interface CompactAppointmentSchedulerProps {
  onData?: (data: AppointmentData) => void
  className?: string
}

export default function CompactAppointmentScheduler({
  onData,
  className = ''
}: CompactAppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [locationsLoading, setLocationsLoading] = useState(true)

  // Mock staff data
  const mockStaff = useMemo(() => [
    { id: 'staff1', name: 'Dr. Sarah Johnson' },
    { id: 'staff2', name: 'Dr. Michael Chen' },
    { id: 'staff3', name: 'Nurse Lisa Garcia' }
  ], [])

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true)
        const response = await fetch('/api/locations')
        if (response.ok) {
          const data = await response.json()
          setLocations(data.locations || [])
          // Auto-select first location if only one available
          if (data.locations?.length === 1) {
            setSelectedLocation(data.locations[0])
          }
        } else {
          console.error('Failed to fetch locations')
          // Fallback to hardcoded location
          const fallbackLocation = {
            id: 'schaumburg',
            name: 'Prism Health Lab',
            address: '1321 Tower Road, Schaumburg IL 60173',
            available: true
          }
          setLocations([fallbackLocation])
          setSelectedLocation(fallbackLocation)
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
        // Fallback to hardcoded location
        const fallbackLocation = {
          id: 'schaumburg',
          name: 'Prism Health Lab',
          address: '1321 Tower Road, Schaumburg IL 60173',
          available: true
        }
        setLocations([fallbackLocation])
        setSelectedLocation(fallbackLocation)
      } finally {
        setLocationsLoading(false)
      }
    }

    fetchLocations()
  }, [])

  // Generate next 14 days for date selection
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Skip weekends for this demo
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date)
      }
    }
    
    return dates
  }

  // Generate time slots for selected date
  const generateTimeSlots = useCallback((date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startHour = 8 // 8 AM
    const endHour = 17 // 5 PM
    const slotDuration = 30 // 30 minutes
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date)
        slotStart.setHours(hour, minute, 0, 0)
        
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)
        
        // Skip if slot end time exceeds business hours
        if (slotEnd.getHours() >= endHour) break
        
        // Skip past time slots for today
        const now = new Date()
        if (slotStart < now) continue
        
        // Random availability (70% chance)
        const isAvailable = Math.random() > 0.3
        const randomStaff = mockStaff[Math.floor(Math.random() * mockStaff.length)]
        
        slots.push({
          id: `slot-${slotStart.toISOString()}`,
          start: slotStart,
          end: slotEnd,
          available: isAvailable,
          staffId: randomStaff.id,
          staffName: randomStaff.name
        })
      }
    }
    
    return slots.filter(slot => slot.available).slice(0, 8) // Show only 8 available slots
  }, [mockStaff])

  // Load slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setLoading(true)
      setSelectedSlot(null)
      
      // Simulate API call
      setTimeout(() => {
        const slots = generateTimeSlots(selectedDate)
        setAvailableSlots(slots)
        setLoading(false)
      }, 300)
    }
  }, [selectedDate, generateTimeSlots])

  // Notify parent when appointment is selected
  useEffect(() => {
    if (selectedDate && selectedSlot && selectedLocation) {
      const appointmentData: AppointmentData = {
        selectedDate,
        selectedTime: selectedSlot.start.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        timeSlot: selectedSlot,
        staffId: selectedSlot.staffId!,
        staffName: selectedSlot.staffName!,
        locationId: selectedLocation.id,
        locationName: selectedLocation.name
      }
      onData?.(appointmentData)
    }
  }, [selectedDate, selectedSlot, selectedLocation, onData])

  const availableDates = getAvailableDates()

  if (locationsLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-slate-400">Loading locations...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-8 pb-4">
        
        {/* Location Selection */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            Select Location
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {locations.map((location) => {
              const isSelected = selectedLocation?.id === location.id
              
              return (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/60 hover:border-slate-500/60'
                  }`}
                >
                  <div className="font-semibold">{location.name}</div>
                  <div className="text-sm opacity-75 mt-1">
                    {location.address}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Date Selection */}
        {selectedLocation && (
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              Select Date
            </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {availableDates.map((date, index) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString()
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                      : 'backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/60 hover:border-slate-500/60'
                  }`}
                >
                  <div className="text-xs opacity-75">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="font-semibold">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </button>
              )
            })}
          </div>
          </div>
        )}

        {/* Time Slot Selection */}
        {selectedLocation && selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Select Time
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-400">Loading available times...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id
                  const timeString = slot.start.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                  
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'
                          : 'backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/60 hover:border-slate-500/60'
                      }`}
                    >
                      <div className="font-semibold">{timeString}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {slot.staffName}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 text-slate-400">📅</div>
                </div>
                <p className="text-slate-400">No available appointments for this date</p>
                <p className="text-slate-500 text-sm mt-1">Please try another date</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Selected Appointment Summary */}
        {selectedLocation && selectedDate && selectedSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="backdrop-blur-sm bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h4 className="font-medium text-white">Appointment Confirmed</h4>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              <p>
                <span className="text-slate-400">Date:</span>{' '}
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p>
                <span className="text-slate-400">Time:</span>{' '}
                {selectedSlot.start.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
              <p>
                <span className="text-slate-400">Staff:</span> {selectedSlot.staffName}
              </p>
              <p>
                <span className="text-slate-400">Location:</span> {selectedLocation.name}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export type { AppointmentData }
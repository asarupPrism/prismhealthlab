'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimeSlot {
  id: string
  start: Date
  end: Date
  available: boolean
  staffId?: string
  staffName?: string
  locationId?: string
}

interface AppointmentData {
  date: Date
  timeSlot: TimeSlot
  staffId: string
  staffName: string
  locationId: string
  locationName: string
}

interface Location {
  id: string
  name: string
  address: string
  available: boolean
}

interface AppointmentSchedulerProps {
  locations?: Location[]
  onAppointmentSelect?: (appointment: AppointmentData) => void
  onData?: (data: AppointmentData) => void
  minDate?: Date
  maxDate?: Date
  excludeWeekends?: boolean
  businessHours?: {
    start: number // 24-hour format
    end: number   // 24-hour format
  }
  slotDuration?: number // minutes
  className?: string
}

export default function AppointmentScheduler({
  locations = [],
  onAppointmentSelect,
  onData,
  minDate = new Date(),
  maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  excludeWeekends = false,
  businessHours = { start: 8, end: 17 }, // 8 AM to 5 PM
  slotDuration = 30,
  className = ''
}: AppointmentSchedulerProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0)
  const [locationsData, setLocationsData] = useState<Location[]>(locations)
  const [locationsLoading, setLocationsLoading] = useState(locations.length === 0)
  const slotsPerPage = 4 // Number of slots to show at once

  // Fetch locations if none provided
  useEffect(() => {
    if (locations.length === 0) {
      const fetchLocations = async () => {
        try {
          setLocationsLoading(true)
          const response = await fetch('/api/locations')
          if (response.ok) {
            const data = await response.json()
            setLocationsData(data.locations || [])
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
            setLocationsData([fallbackLocation])
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
          setLocationsData([fallbackLocation])
          setSelectedLocation(fallbackLocation)
        } finally {
          setLocationsLoading(false)
        }
      }

      fetchLocations()
    } else {
      setLocationsData(locations)
      setLocationsLoading(false)
    }
  }, [locations])

  // Mock staff data - in real app, this would come from API based on location
  const mockStaff = [
    { id: 'staff-1', name: 'Sarah Chen', title: 'Certified Phlebotomist' },
    { id: 'staff-2', name: 'Michael Rodriguez', title: 'Lab Technician' },
    { id: 'staff-3', name: 'Dr. Emily Watson', title: 'Clinical Specialist' }
  ]

  // Generate available time slots for a given date
  const generateTimeSlots = (date: Date, locationId: string): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startHour = businessHours.start
    const endHour = businessHours.end
    
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
        
        // Randomly assign availability and staff (in real app, this would come from API)
        const isAvailable = Math.random() > 0.3 // 70% availability rate
        const randomStaff = mockStaff[Math.floor(Math.random() * mockStaff.length)]
        
        slots.push({
          id: `${locationId}-${slotStart.toISOString()}`,
          start: slotStart,
          end: slotEnd,
          available: isAvailable,
          staffId: randomStaff.id,
          staffName: randomStaff.name
        })
      }
    }
    
    return slots
  }

  // Load available slots when date or location changes
  const loadAvailableSlots = async (date: Date, location: Location) => {
    setLoading(true)
    setCurrentSlotIndex(0) // Reset carousel to beginning
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In real app, this would be an API call to get availability
      const slots = generateTimeSlots(date, location.id)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error loading time slots:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
    setCurrentSlotIndex(0) // Reset carousel to beginning
    
    if (selectedLocation) {
      loadAvailableSlots(date, selectedLocation)
    }
  }

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setSelectedTimeSlot(null)
    
    if (selectedDate) {
      loadAvailableSlots(selectedDate, location)
    }
  }

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.available || !selectedLocation || !selectedDate) return
    
    setSelectedTimeSlot(slot)
    
    const appointmentData: AppointmentData = {
      date: selectedDate,
      timeSlot: slot,
      staffId: slot.staffId!,
      staffName: slot.staffName!,
      locationId: selectedLocation.id,
      locationName: selectedLocation.name
    }
    
    onAppointmentSelect?.(appointmentData)
    onData?.(appointmentData)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= lastDay || current.getDay() !== 0) {
      const date = new Date(current)
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
      const isDisabled = date < minDate || date > maxDate || 
                        (excludeWeekends && (date.getDay() === 0 || date.getDay() === 6))
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled,
        day: date.getDate()
      })
      
      current.setDate(current.getDate() + 1)
      
      // Limit to 6 weeks maximum
      if (days.length >= 42) break
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Location & Calendar Selection */}
        <div className="space-y-8">
          
          {/* Location Selection */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              Choose Location
            </h3>
            {locationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-400">Loading locations...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {locationsData.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location)}
                  disabled={!location.available}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedLocation?.id === location.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 shadow-lg shadow-cyan-500/10'
                      : location.available
                      ? 'backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/60'
                      : 'bg-slate-800/20 border border-slate-700/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedLocation?.id === location.id
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500'
                        : 'bg-slate-600/50'
                    }`}>
                      <div className="w-5 h-5 bg-white/80 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{location.name}</div>
                      <div className="text-sm text-slate-400">{location.address}</div>
                      {location.available ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-emerald-300 text-xs">Available Today</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                          <span className="text-rose-300 text-xs">Currently Unavailable</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              </div>
            )}
          </div>

          {/* Calendar */}
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Select Date
              </h3>
              
              <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-600/60 transition-all duration-300"
                  >
                    <span className="text-lg">←</span>
                  </button>
                  
                  <h4 className="text-lg font-semibold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-600/60 transition-all duration-300"
                  >
                    <span className="text-lg">→</span>
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                      disabled={day.isDisabled}
                      className={`aspect-square p-2 text-sm rounded-lg transition-all duration-300 ${
                        day.isSelected
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                          : day.isToday
                          ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-400/30 text-emerald-300'
                          : day.isDisabled
                          ? 'text-slate-600 cursor-not-allowed'
                          : day.isCurrentMonth
                          ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                          : 'text-slate-500 hover:bg-slate-700/30'
                      }`}
                    >
                      {day.day}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Time Slot Selection */}
        <div>
          {selectedDate && selectedLocation && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                Available Times
              </h3>
              
              <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <div className="mb-6">
                  <div className="text-white font-medium">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {selectedLocation.name}
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-slate-300">Loading available times...</span>
                  </div>
                ) : (
                  <div>
                    {availableSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <div className="w-6 h-6 bg-slate-500 rounded-lg"></div>
                        </div>
                        <p className="text-slate-400">No available appointments for this date</p>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Carousel Navigation */}
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={() => setCurrentSlotIndex(Math.max(0, currentSlotIndex - slotsPerPage))}
                            disabled={currentSlotIndex === 0}
                            className={`p-3 rounded-xl transition-all duration-300 ${
                              currentSlotIndex === 0
                                ? 'bg-slate-800/30 border border-slate-700/30 text-slate-500 cursor-not-allowed'
                                : 'backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-cyan-400 hover:bg-slate-600/60 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10'
                            }`}
                          >
                            <span className="text-lg font-bold">←</span>
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-slate-300">
                              {Math.min(currentSlotIndex + slotsPerPage, availableSlots.length)} of {availableSlots.length} slots
                            </span>
                          </div>
                          
                          <button
                            onClick={() => setCurrentSlotIndex(Math.min(availableSlots.length - slotsPerPage, currentSlotIndex + slotsPerPage))}
                            disabled={currentSlotIndex + slotsPerPage >= availableSlots.length}
                            className={`p-3 rounded-xl transition-all duration-300 ${
                              currentSlotIndex + slotsPerPage >= availableSlots.length
                                ? 'bg-slate-800/30 border border-slate-700/30 text-slate-500 cursor-not-allowed'
                                : 'backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-cyan-400 hover:bg-slate-600/60 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10'
                            }`}
                          >
                            <span className="text-lg font-bold">→</span>
                          </button>
                        </div>

                        {/* Time Slots Carousel */}
                        <div className="space-y-3">
                          {availableSlots
                            .slice(currentSlotIndex, currentSlotIndex + slotsPerPage)
                            .map((slot) => (
                            <motion.button
                              key={slot.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              onClick={() => handleTimeSlotSelect(slot)}
                              disabled={!slot.available}
                              className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                                selectedTimeSlot?.id === slot.id
                                  ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/50 shadow-lg shadow-emerald-500/10'
                                  : slot.available
                                  ? 'backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-600/70'
                                  : 'bg-slate-800/20 border border-slate-700/30 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    selectedTimeSlot?.id === slot.id
                                      ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                                      : slot.available
                                      ? 'bg-slate-600/50'
                                      : 'bg-slate-700/30'
                                  }`}>
                                    <div className="w-3 h-3 bg-white/80 rounded-full"></div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {formatTime(slot.start)} - {formatTime(slot.end)}
                                    </div>
                                    {slot.staffName && (
                                      <div className="text-sm text-slate-400">
                                        with {slot.staffName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  {slot.available ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                      <span className="text-emerald-300 text-sm">Available</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                      <span className="text-slate-500 text-sm">Booked</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Selected Appointment Summary */}
          {selectedTimeSlot && selectedLocation && selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-8"
            >
              <div className="backdrop-blur-sm bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <h4 className="text-lg font-semibold text-white">Appointment Selected</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-lg">
                    <span className="text-slate-300">Date</span>
                    <span className="text-white font-medium">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-lg">
                    <span className="text-slate-300">Time</span>
                    <span className="text-white font-medium">
                      {formatTime(selectedTimeSlot.start)} - {formatTime(selectedTimeSlot.end)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-lg">
                    <span className="text-slate-300">Location</span>
                    <span className="text-white font-medium">{selectedLocation.name}</span>
                  </div>
                  
                  {selectedTimeSlot.staffName && (
                    <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-lg">
                      <span className="text-slate-300">Staff</span>
                      <span className="text-white font-medium">{selectedTimeSlot.staffName}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export type { AppointmentData, TimeSlot, Location }
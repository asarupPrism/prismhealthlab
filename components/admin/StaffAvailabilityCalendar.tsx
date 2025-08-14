'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface Staff {
  id: string
  employee_id: string
  user_id: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: string | null
  } | null
  staff_roles: {
    name: string
    description: string | null
  } | null
  staff_departments: {
    name: string
  } | null
}

interface Location {
  id: string
  name: string
  location_code: string
  city: string
  state: string
}

interface ExistingAppointment {
  id: string
  scheduled_date: string
  scheduled_time: string
  estimated_duration_minutes: number
  status: string
  assigned_staff_id: string
  location_id: string
}

interface StaffAvailabilityCalendarProps {
  staff: Staff[]
  locations: Location[]
  existingAppointments: ExistingAppointment[]
}

interface AvailabilitySlot {
  staffId: string
  locationId: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export default function StaffAvailabilityCalendar({ 
  staff, 
  locations, 
  existingAppointments 
}: StaffAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [availabilitySlots] = useState<AvailabilitySlot[]>([])
  const [isCreateMode, setIsCreateMode] = useState(false)

  // Generate the next 14 days for quick selection
  const upcomingDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  // Standard working hours
  const timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ]

  // Check if a time slot has existing appointments
  const hasExistingAppointment = (staffId: string, locationId: string, date: string, time: string) => {
    return existingAppointments.some(apt => 
      apt.assigned_staff_id === staffId && 
      apt.location_id === locationId && 
      apt.scheduled_date === date && 
      apt.scheduled_time === time
    )
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStaffName = (staffMember: Staff) => {
    return `${staffMember.profiles?.first_name || ''} ${staffMember.profiles?.last_name || ''}`.trim()
  }

  const filteredStaff = selectedStaff === 'all' ? staff : staff.filter(s => s.id === selectedStaff)

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Staff Availability Calendar</h2>
          <button
            onClick={() => setIsCreateMode(!isCreateMode)}
            className={`ml-auto px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              isCreateMode
                ? 'bg-slate-700/50 border border-slate-600/50 text-slate-300'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'
            }`}
          >
            {isCreateMode ? 'Cancel' : 'Set Availability'}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Staff Member
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
            >
              <option value="all">All Staff</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {getStaffName(member)} ({member.staff_roles?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Date Selection */}
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-300 mb-3">Quick Select:</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {upcomingDates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-300 ${
                  selectedDate === date
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/60'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Availability Grid */}
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          Availability for {formatDate(selectedDate)}
        </h3>

        {isCreateMode && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
            <h4 className="text-emerald-300 font-medium mb-3">Set Staff Availability</h4>
            <p className="text-slate-300 text-sm mb-4">
              Select staff member, location, and time slots to create availability windows.
            </p>
            {/* Availability creation form would go here */}
          </div>
        )}

        <div className="space-y-6">
          {filteredStaff.map(staffMember => {
            const filteredLocations = selectedLocation === 'all' ? locations : locations.filter(l => l.id === selectedLocation)
            
            return (
              <div key={staffMember.id} className="border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{getStaffName(staffMember)}</h4>
                    <p className="text-slate-400 text-sm">{staffMember.staff_roles?.name}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredLocations.map(location => (
                    <div key={location.id} className="border border-slate-700/20 rounded-lg p-3">
                      <h5 className="text-slate-300 font-medium mb-3">{location.name}</h5>
                      
                      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                        {timeSlots.map(time => {
                          const hasAppointment = hasExistingAppointment(staffMember.id, location.id, selectedDate, time)
                          const isAvailable = availabilitySlots.some(slot => 
                            slot.staffId === staffMember.id && 
                            slot.locationId === location.id && 
                            slot.date === selectedDate && 
                            time >= slot.startTime && time < slot.endTime
                          )

                          return (
                            <motion.div
                              key={time}
                              className={`relative p-2 text-xs font-medium rounded-lg text-center cursor-pointer transition-all duration-200 ${
                                hasAppointment 
                                  ? 'bg-rose-500/20 border border-rose-400/30 text-rose-300'
                                  : isAvailable
                                    ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
                                    : 'bg-slate-700/30 border border-slate-600/30 text-slate-400 hover:bg-slate-600/50'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {time}
                              {hasAppointment && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-400 rounded-full"></div>
                              )}
                              {isAvailable && !hasAppointment && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"></div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-400/30 rounded"></div>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500/20 border border-rose-400/30 rounded"></div>
            <span className="text-slate-300">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-700/30 border border-slate-600/30 rounded"></div>
            <span className="text-slate-300">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  )
}
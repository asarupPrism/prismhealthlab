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

interface StaffScheduleListProps {
  staff: Staff[]
  locations: Location[]
}

interface ScheduleEntry {
  id?: string
  staffId: string
  locationId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  isActive: boolean
}

export default function StaffScheduleList({ staff, locations }: StaffScheduleListProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleEntry>>({
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true
  })

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  const getStaffName = (staffMember: Staff) => {
    return `${staffMember.profiles?.first_name || ''} ${staffMember.profiles?.last_name || ''}`.trim()
  }

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId)
    return location?.name || 'Unknown Location'
  }

  const handleAddSchedule = () => {
    if (!newSchedule.staffId || !newSchedule.locationId) return

    const schedule: ScheduleEntry = {
      id: `temp-${Date.now()}`,
      staffId: newSchedule.staffId!,
      locationId: newSchedule.locationId!,
      dayOfWeek: newSchedule.dayOfWeek!,
      startTime: newSchedule.startTime!,
      endTime: newSchedule.endTime!,
      isActive: newSchedule.isActive!
    }

    setSchedules(prev => [...prev, schedule])
    setNewSchedule({
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true
    })
    setIsCreating(false)
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId))
  }

  const staffSchedules = selectedStaff 
    ? schedules.filter(s => s.staffId === selectedStaff)
    : schedules

  const groupedSchedules = staffSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.staffId]) {
      acc[schedule.staffId] = []
    }
    acc[schedule.staffId].push(schedule)
    return acc
  }, {} as Record<string, ScheduleEntry[]>)

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Weekly Staff Schedules</h2>
          </div>
          
          <button
            onClick={() => setIsCreating(!isCreating)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              isCreating
                ? 'bg-slate-700/50 border border-slate-600/50 text-slate-300'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
            }`}
          >
            {isCreating ? 'Cancel' : 'Add Schedule'}
          </button>
        </div>

        {/* Staff Filter */}
        <div className="flex items-center gap-4">
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
          >
            <option value="">All Staff Members</option>
            {staff.map(member => (
              <option key={member.id} value={member.id}>
                {getStaffName(member)} ({member.staff_roles?.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Schedule Form */}
      {isCreating && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="border-b border-slate-700/50 overflow-hidden"
        >
          <div className="p-6 bg-purple-500/5">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Schedule Entry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Staff Member
                </label>
                <select
                  value={newSchedule.staffId || ''}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, staffId: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                >
                  <option value="">Select staff</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>
                      {getStaffName(member)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>
                <select
                  value={newSchedule.locationId || ''}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, locationId: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                >
                  <option value="">Select location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Day of Week
                </label>
                <select
                  value={newSchedule.dayOfWeek || 'monday'}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start
                  </label>
                  <input
                    type="time"
                    value={newSchedule.startTime || '09:00'}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End
                  </label>
                  <input
                    type="time"
                    value={newSchedule.endTime || '17:00'}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                onClick={handleAddSchedule}
                disabled={!newSchedule.staffId || !newSchedule.locationId}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Schedule
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Schedules List */}
      <div className="max-h-96 overflow-y-auto">
        {Object.keys(groupedSchedules).length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {Object.entries(groupedSchedules).map(([staffId, staffSchedules]) => {
              const staffMember = staff.find(s => s.id === staffId)
              if (!staffMember) return null

              return (
                <div key={staffId} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{getStaffName(staffMember)}</h3>
                      <p className="text-slate-400 text-sm">{staffMember.staff_roles?.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffSchedules.map(schedule => (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-slate-900/30 border border-slate-700/30 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium capitalize">
                            {daysOfWeek.find(d => d.value === schedule.dayOfWeek)?.label}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              schedule.isActive ? 'bg-emerald-400' : 'bg-slate-400'
                            }`}></span>
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id!)}
                              className="text-rose-400 hover:text-rose-300 text-sm transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-slate-300">
                          <p><span className="text-slate-400">Time:</span> {schedule.startTime} - {schedule.endTime}</p>
                          <p><span className="text-slate-400">Location:</span> {getLocationName(schedule.locationId)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-500 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                </div>
              </div>
            </div>
            <p className="text-slate-400 mb-4">No schedules configured yet</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              Add First Schedule →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
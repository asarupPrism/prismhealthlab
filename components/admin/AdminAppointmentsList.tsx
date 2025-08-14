'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import CreateAppointmentModal from './CreateAppointmentModal'
import type { Appointment, StaffMember, Location } from '@/types/admin'

interface AdminAppointmentsListProps {
  appointments: Appointment[]
  staff: StaffMember[]
  locations: Location[]
  onRefresh: () => void
}

export default function AdminAppointmentsList({ appointments, staff, locations, onRefresh }: AdminAppointmentsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(appointments.map(apt => apt.status)))

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.appointment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.locations?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    
    const today = new Date().toISOString().split('T')[0]
    const aptDate = appointment.scheduled_date
    const matchesDate = filterDate === 'all' || 
      (filterDate === 'today' && aptDate === today) ||
      (filterDate === 'upcoming' && aptDate >= today) ||
      (filterDate === 'past' && aptDate < today)
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-300'
      case 'in_progress':
        return 'bg-amber-500/20 border-amber-400/30 text-amber-300'
      case 'cancelled':
        return 'bg-rose-500/20 border-rose-400/30 text-rose-300'
      case 'no_show':
        return 'bg-slate-500/20 border-slate-400/30 text-slate-300'
      default:
        return 'bg-slate-500/20 border-slate-400/30 text-slate-300'
    }
  }

  const getAppointmentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'blood_draw':
        return 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
      case 'consultation':
        return 'bg-purple-500/20 border-purple-400/30 text-purple-300'
      case 'follow_up':
        return 'bg-amber-500/20 border-amber-400/30 text-amber-300'
      default:
        return 'bg-slate-500/20 border-slate-400/30 text-slate-300'
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return {
      date: dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">All Appointments</h2>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25"
          >
            New Appointment
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search appointments by patient name, appointment number, or location..."
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
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAppointments.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {filteredAppointments.map((appointment, index) => {
              const dateTime = formatDateTime(appointment.scheduled_date, appointment.scheduled_time)
              
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Appointment Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        appointment.status === 'completed' ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
                        appointment.status === 'in_progress' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                        'bg-gradient-to-br from-blue-400 to-indigo-500'
                      }`}>
                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Appointment Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">
                          {appointment.profiles?.first_name} {appointment.profiles?.last_name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentTypeColor(appointment.appointment_type)}`}>
                          {appointment.appointment_type.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span className="text-slate-300 text-sm">
                            {appointment.appointment_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-slate-300 text-sm">
                            {dateTime.date} at {dateTime.time}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
                        <div>
                          <p><span className="text-slate-300">Location:</span> {appointment.locations?.name}</p>
                          <p><span className="text-slate-300">Address:</span> {appointment.locations?.address_line_1}, {appointment.locations?.city}</p>
                          {appointment.profiles?.email && (
                            <p><span className="text-slate-300">Email:</span> {appointment.profiles.email}</p>
                          )}
                          {appointment.profiles?.phone && (
                            <p><span className="text-slate-300">Phone:</span> {appointment.profiles.phone}</p>
                          )}
                        </div>
                        <div>
                          {appointment.staff && (
                            <p><span className="text-slate-300">Staff:</span> {appointment.staff.profiles?.first_name} {appointment.staff.profiles?.last_name} ({appointment.staff.staff_roles?.name})</p>
                          )}
                          {appointment.orders && (
                            <>
                              <p><span className="text-slate-300">Order:</span> {appointment.orders.swell_order_number || appointment.orders.id.slice(0, 8)}</p>
                              <p><span className="text-slate-300">Total:</span> ${appointment.orders.total.toLocaleString()}</p>
                            </>
                          )}
                          {appointment.checked_in_at && (
                            <p><span className="text-slate-300">Checked In:</span> {new Date(appointment.checked_in_at).toLocaleTimeString()}</p>
                          )}
                        </div>
                      </div>
                      
                      {appointment.special_instructions && (
                        <div className="mt-3 p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                          <p className="text-slate-300 text-sm">
                            <span className="font-medium">Special Instructions:</span> {appointment.special_instructions}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <button className="px-3 py-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300">
                        Edit
                      </button>
                      
                      {appointment.status === 'scheduled' && (
                        <button className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25">
                          Check In
                        </button>
                      )}
                      
                      {appointment.status === 'in_progress' && (
                        <button className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-500/25">
                          Complete
                        </button>
                      )}
                      
                      {['scheduled', 'confirmed'].includes(appointment.status) && (
                        <button className="px-3 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-rose-400 hover:to-red-500 transition-all duration-300 shadow-lg shadow-rose-500/25">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
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
            <p className="text-slate-400 mb-4">No appointments found matching your search criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setFilterDate('all')
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          onRefresh()
        }}
        staff={staff}
        locations={locations}
      />
    </div>
  )
}
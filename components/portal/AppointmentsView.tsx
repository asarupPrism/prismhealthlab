'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AppointmentCard from './AppointmentCard'
import { Appointment } from '@/types/shared'

interface AppointmentsViewProps {
  appointments: Appointment[]
}

export default function AppointmentsView({ appointments }: AppointmentsViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')

  // Filter appointments by status
  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus === 'all') return true
    return appointment.status?.toLowerCase() === filterStatus
  })

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
    }
    if (sortBy === 'status') {
      return (a.status || '').localeCompare(b.status || '')
    }
    return 0
  })

  // Group appointments by status for stats
  const appointmentStats = appointments.reduce((acc, appointment) => {
    const status = appointment.status?.toLowerCase() || 'pending'
    acc[status] = (acc[status] || 0) + 1
    acc.total = (acc.total || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const upcomingCount = appointments.filter(apt => 
    new Date(apt.scheduled_date) > new Date() && 
    apt.status !== 'cancelled' && 
    apt.status !== 'completed'
  ).length

  return (
    <div className="space-y-8">
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-sm bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-cyan-400/20 border border-cyan-400/30 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            </div>
            <span className="text-slate-300 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{appointmentStats.total || 0}</p>
          <p className="text-cyan-300 text-sm">All appointments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-400/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-slate-300 font-medium">Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-white">{upcomingCount}</p>
          <p className="text-emerald-300 text-sm">Scheduled ahead</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="backdrop-blur-sm bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-400/20 border border-amber-400/30 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            </div>
            <span className="text-slate-300 font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">{appointmentStats.completed || 0}</p>
          <p className="text-amber-300 text-sm">Tests finished</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-400/20 border border-purple-400/30 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            </div>
            <span className="text-slate-300 font-medium">This Month</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {appointments.filter(apt => {
              const aptDate = new Date(apt.scheduled_date)
              const now = new Date()
              return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear()
            }).length}
          </p>
          <p className="text-purple-300 text-sm">Current month</p>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm font-medium">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900/50 border border-slate-600/50 text-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 outline-none"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                <option value="status">By Status</option>
              </select>
            </div>
          </div>

          {/* New Appointment Button */}
          <Link
            href="/products"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
          >
            Schedule New Test
          </Link>
        </div>
      </div>

      {/* Appointments List */}
      {sortedAppointments.length > 0 ? (
        <div className="space-y-6">
          {sortedAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <AppointmentCard appointment={appointment} />
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
              <div className="flex items-end space-x-1">
                <div className="w-1 h-2 bg-slate-400 rounded-full"></div>
                <div className="w-1 h-4 bg-slate-400 rounded-full"></div>
                <div className="w-1 h-3 bg-slate-400 rounded-full"></div>
                <div className="w-1 h-5 bg-slate-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {filterStatus === 'all' ? 'No appointments scheduled' : `No ${filterStatus} appointments`}
          </h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            {filterStatus === 'all' 
              ? 'Get started by ordering your first diagnostic test and scheduling an appointment.'
              : `You don't have any ${filterStatus} appointments at the moment.`
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              Browse Diagnostic Tests
            </Link>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="px-8 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:text-white transition-all duration-300"
              >
                View All Appointments
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Quick Tips */}
      <div className="backdrop-blur-sm bg-slate-800/20 border border-slate-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          Appointment Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-white">Preparation:</span> Follow any fasting requirements 8-12 hours before your appointment.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-amber-400/20 border border-amber-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-white">Timing:</span> Arrive 15 minutes early to complete any necessary paperwork.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-white">Results:</span> Most results are available within 24-48 hours after collection.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-400/20 border border-purple-400/30 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-300 text-sm">
                <span className="font-medium text-white">Rescheduling:</span> Need to change your appointment? Contact us at least 24 hours in advance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
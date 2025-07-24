'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Appointment } from '@/types/shared'

interface AppointmentCardProps {
  appointment: Appointment
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.scheduled_date)
  const now = new Date()
  const isToday = appointmentDate.toDateString() === now.toDateString()
  const isTomorrow = appointmentDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'from-emerald-400 to-green-500'
      case 'pending':
        return 'from-amber-400 to-yellow-500'
      case 'completed':
        return 'from-cyan-400 to-blue-500'
      case 'cancelled':
        return 'from-rose-400 to-red-500'
      default:
        return 'from-slate-400 to-slate-500'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      confirmed: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300',
      pending: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
      completed: 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300',
      cancelled: 'bg-rose-500/20 border-rose-400/30 text-rose-300'
    }
    
    return colors[status?.toLowerCase() as keyof typeof colors] || colors.pending
  }

  const getTimeLabel = () => {
    if (isToday) return 'Today'
    if (isTomorrow) return 'Tomorrow'
    return appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getStatusColor(appointment.status)} rounded-xl flex items-center justify-center shadow-lg`}>
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Blood Draw Appointment
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-300 text-sm">{getTimeLabel()}</span>
            </div>
          </div>
        </div>
        
        <span className={`px-3 py-1 border rounded-full text-sm font-medium ${getStatusBadge(appointment.status)}`}>
          {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Pending'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Date & Time */}
        <div className="flex items-center gap-3 bg-slate-900/30 p-3 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">Date & Time</p>
            <p className="text-white font-medium">
              {appointmentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <p className="text-slate-300 text-sm">
              {appointmentDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 bg-slate-900/30 p-3 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">Location</p>
            <p className="text-white font-medium">
              {appointment.locations?.name || 'Prism Health Lab'}
            </p>
            <p className="text-slate-300 text-sm">
              {appointment.staff_name || 'Lab Technician'}
            </p>
          </div>
        </div>
      </div>

      {/* Test Items */}
      {appointment.orders?.items && (
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-3">Tests Included:</p>
          <div className="space-y-2">
            {appointment.orders.items.map((item, index: number) => (
              <div key={index} className="flex items-center justify-between bg-slate-900/20 p-2 rounded-lg">
                <span className="text-slate-300 text-sm">{item.product_name}</span>
                <span className="text-cyan-400 text-sm font-mono">
                  ${item.price?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link 
          href={`/portal/appointments/${appointment.id}`}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 text-center"
        >
          View Details
        </Link>
        
        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <button className="px-4 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-slate-600/60 hover:text-white transition-all duration-300">
            <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-300 rounded-sm"></div>
            </div>
          </button>
        )}
      </div>

      {/* Urgent Notice for Today's Appointments */}
      {isToday && appointment.status === 'confirmed' && (
        <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-amber-300 text-sm font-medium">
              Reminder: Please arrive 15 minutes early
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
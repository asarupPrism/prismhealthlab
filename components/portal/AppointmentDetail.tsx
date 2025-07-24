'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Appointment } from '@/types/shared'

interface AppointmentDetailProps {
  appointment: Appointment
}

export default function AppointmentDetail({ appointment }: AppointmentDetailProps) {
  const [showReschedule, setShowReschedule] = useState(false)
  
  const appointmentDate = new Date(appointment.scheduled_date)
  const now = new Date()
  const isUpcoming = appointmentDate > now
  const isPast = appointmentDate < now
  const isToday = appointmentDate.toDateString() === now.toDateString()

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {
          bg: 'from-emerald-500/20 to-green-500/20',
          border: 'border-emerald-400/30',
          text: 'text-emerald-300',
          dot: 'bg-emerald-400'
        }
      case 'pending':
        return {
          bg: 'from-amber-500/20 to-yellow-500/20',
          border: 'border-amber-400/30',
          text: 'text-amber-300',
          dot: 'bg-amber-400'
        }
      case 'completed':
        return {
          bg: 'from-cyan-500/20 to-blue-500/20',
          border: 'border-cyan-400/30',
          text: 'text-cyan-300',
          dot: 'bg-cyan-400'
        }
      case 'cancelled':
        return {
          bg: 'from-rose-500/20 to-red-500/20',
          border: 'border-rose-400/30',
          text: 'text-rose-300',
          dot: 'bg-rose-400'
        }
      default:
        return {
          bg: 'from-slate-500/20 to-slate-600/20',
          border: 'border-slate-400/30',
          text: 'text-slate-300',
          dot: 'bg-slate-400'
        }
    }
  }

  const statusColors = getStatusColor(appointment.status)

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/portal/appointments"
          className="w-10 h-10 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 rounded-xl flex items-center justify-center hover:bg-slate-600/60 transition-all duration-300"
        >
          <span className="text-slate-300">←</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Appointment Details
          </h1>
          <p className="text-slate-400">
            {appointmentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 bg-gradient-to-br ${statusColors.bg} border ${statusColors.border} rounded-xl`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 ${statusColors.dot} rounded-full animate-pulse`}></div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Pending'}
              </h2>
              <p className={`${statusColors.text} text-sm`}>
                {isToday && 'Today • '}
                {isUpcoming && !isToday && 'Upcoming • '}
                {isPast && 'Past • '}
                {appointmentDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>
          
          {isUpcoming && appointment.status !== 'cancelled' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowReschedule(!showReschedule)}
                className="px-4 py-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg hover:bg-slate-600/60 hover:text-white transition-all duration-300"
              >
                Reschedule
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg hover:from-rose-400 hover:to-red-500 transition-all duration-300">
                Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Appointment Information */}
        <div className="space-y-6">
          
          {/* Date & Time */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              Date & Time
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-white font-medium">
                  {appointmentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="text-white font-medium">
                  {appointmentDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-white font-medium">30 minutes</span>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              Location
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-white font-medium">
                  {appointment.locations?.name || 'Downtown Medical Center'}
                </p>
                <p className="text-slate-400 text-sm">
                  {appointment.locations?.address || '123 Medical Plaza, Downtown'}
                </p>
              </div>
              {appointment.locations?.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <a
                    href={`tel:${appointment.locations.phone}`}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    {appointment.locations.phone}
                  </a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Staff:</span>
                <span className="text-white font-medium">
                  {appointment.staff_name || 'Lab Technician'}
                </span>
              </div>
            </div>
          </div>

          {/* Preparation Instructions */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              Preparation
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium text-sm">Fasting Required</p>
                  <p className="text-slate-400 text-sm">
                    Do not eat or drink anything except water for 8-12 hours before your appointment
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium text-sm">Arrive Early</p>
                  <p className="text-slate-400 text-sm">
                    Please arrive 15 minutes before your scheduled time
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium text-sm">Bring ID</p>
                  <p className="text-slate-400 text-sm">
                    Valid photo identification is required for all appointments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tests and Results */}
        <div className="space-y-6">
          
          {/* Tests Included */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Tests Included
            </h3>
            {appointment.orders?.items ? (
              <div className="space-y-3">
                {appointment.orders.items.map((item: Record<string, unknown>, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{item.product_name}</p>
                      <p className="text-slate-400 text-sm">{item.description || 'Diagnostic blood test'}</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-semibold">
                      ${item.price?.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-white font-bold text-lg">
                      ${appointment.orders.total?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">No test information available</p>
            )}
          </div>

          {/* Test Results */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
              Test Results
            </h3>
            {appointment.test_results && appointment.test_results.length > 0 ? (
              <div className="space-y-3">
                {appointment.test_results.map((result: Record<string, unknown>) => (
                  <div key={result.id} className="p-3 bg-slate-900/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white font-medium">
                        {result.diagnostic_tests?.name || 'Test Result'}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.status === 'normal' ? 'bg-emerald-500/20 text-emerald-300' :
                        result.status === 'elevated' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {result.status || 'Pending'}
                      </span>
                    </div>
                    {result.summary && (
                      <p className="text-slate-400 text-sm">{result.summary}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-500 text-xs">
                        {result.result_date ? new Date(result.result_date).toLocaleDateString() : 'Pending'}
                      </span>
                      <Link
                        href={`/portal/results/${result.id}`}
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-slate-600 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  </div>
                </div>
                <p className="text-slate-400 mb-1">Results not available yet</p>
                <p className="text-slate-500 text-sm">
                  Results will be available 24-48 hours after your appointment
                </p>
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              Need Help?
            </h3>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">
                Have questions about your appointment or need to make changes?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:555-123-4567"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 text-center"
                >
                  Call Support
                </a>
                <a
                  href="mailto:support@prismhealthlab.com"
                  className="flex-1 px-4 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-lg hover:bg-slate-600/60 hover:text-white transition-all duration-300 text-center"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointment Banner */}
      {isToday && appointment.status === 'confirmed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-400/30 rounded-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-400/20 border border-amber-400/30 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Today&apos;s Appointment</h3>
              <p className="text-amber-300">
                Your appointment is today at {appointmentDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}. Please arrive 15 minutes early.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
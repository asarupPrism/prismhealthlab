'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface TestResult {
  id: string
  lab_report_number: string
  result_date: string
  overall_status: string
  patient_notified: boolean
  requires_follow_up: boolean
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: string | null
  } | null
  diagnostic_tests: {
    name: string
    test_code: string
  } | null
  orders: {
    id: string
    swell_order_number: string | null
  } | null
  appointments: {
    id: string
    appointment_number: string
    scheduled_date: string
  } | null
}

interface RecentUploadsProps {
  results: TestResult[]
}

export default function RecentUploads({ results }: RecentUploadsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(results.map(result => result.overall_status)))

  // Filter results
  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.lab_report_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.diagnostic_tests?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || result.overall_status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
      case 'abnormal':
        return 'bg-amber-500/20 border-amber-400/30 text-amber-300'
      case 'critical':
        return 'bg-rose-500/20 border-rose-400/30 text-rose-300'
      case 'pending_review':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-300'
      default:
        return 'bg-slate-500/20 border-slate-400/30 text-slate-300'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPatientName = (result: TestResult) => {
    if (!result.profiles) return 'Unknown Patient'
    return `${result.profiles.first_name || ''} ${result.profiles.last_name || ''}`.trim() || result.profiles.email || 'Unknown Patient'
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Recent Result Uploads</h2>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search results by patient name, report number, or test type..."
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
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing {filteredResults.length} of {results.length} results
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredResults.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {filteredResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Result Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      result.overall_status === 'critical' ? 'bg-gradient-to-br from-rose-400 to-red-500' :
                      result.overall_status === 'abnormal' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                      result.overall_status === 'pending_review' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' :
                      'bg-gradient-to-br from-emerald-400 to-green-500'
                    }`}>
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Result Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">
                        {getPatientName(result)}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.overall_status)}`}>
                        {result.overall_status.toUpperCase().replace('_', ' ')}
                      </span>
                      {result.requires_follow_up && (
                        <span className="px-2 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-medium">
                          FOLLOW-UP REQUIRED
                        </span>
                      )}
                      {result.patient_notified && (
                        <span className="px-2 py-1 bg-green-500/20 border border-green-400/30 text-green-300 rounded-full text-xs font-medium">
                          PATIENT NOTIFIED
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span className="text-slate-300 text-sm font-medium">Report: {result.lab_report_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-slate-300 text-sm">Test: {result.diagnostic_tests?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-slate-300 text-sm">Result Date: {formatDateTime(result.result_date)}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {result.orders && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300 text-sm">Order: {result.orders.swell_order_number || result.orders.id.slice(0, 8)}</span>
                          </div>
                        )}
                        {result.appointments && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            <span className="text-slate-300 text-sm">Appointment: {result.appointments.appointment_number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                          <span className="text-slate-300 text-sm">Uploaded: {formatDateTime(result.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button className="px-3 py-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300">
                      View Report
                    </button>
                    
                    {!result.patient_notified && (
                      <button className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-500/25">
                        Notify Patient
                      </button>
                    )}
                    
                    {result.overall_status === 'critical' && (
                      <button className="px-3 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-rose-400 hover:to-red-500 transition-all duration-300 shadow-lg shadow-rose-500/25">
                        Urgent Action
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
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
            <p className="text-slate-400 mb-4">No results found matching your search criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
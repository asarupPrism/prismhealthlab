'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TestResult } from '@/types/shared'

interface ResultDetailProps {
  result: TestResult
}

export default function ResultDetail({ result }: ResultDetailProps) {
  const [activeTab, setActiveTab] = useState<'values' | 'files' | 'history'>('values')
  
  const resultDate = new Date(result.result_date || result.created_at)
  const appointmentDate = result.appointments?.scheduled_date 
    ? new Date(result.appointments.scheduled_date) 
    : null

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return {
          bg: 'from-emerald-500/20 to-green-500/20',
          border: 'border-emerald-400/30',
          text: 'text-emerald-300',
          dot: 'bg-emerald-400'
        }
      case 'elevated':
      case 'high':
      case 'low':
        return {
          bg: 'from-amber-500/20 to-yellow-500/20',
          border: 'border-amber-400/30',
          text: 'text-amber-300',
          dot: 'bg-amber-400'
        }
      case 'critical':
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

  const statusColors = getStatusColor(result.status)

  const getValueStatus = (value: number, normalRange: { min: number; max: number; unit?: string; reference?: string }) => {
    if (!normalRange) return 'unknown'
    if (value < normalRange.min) return 'low'
    if (value > normalRange.max) return 'high'
    return 'normal'
  }

  const tabs = [
    { id: 'values', label: 'Test Values', icon: '📊' },
    { id: 'files', label: 'Documents', icon: '📄' },
    { id: 'history', label: 'History', icon: '📈' }
  ]

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/portal/results"
          className="w-10 h-10 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 rounded-xl flex items-center justify-center hover:bg-slate-600/60 transition-all duration-300"
        >
          <span className="text-slate-300">←</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            {result.diagnostic_tests?.name || 'Test Result'}
          </h1>
          <p className="text-slate-400">
            {result.diagnostic_tests?.category || 'Blood Work'} • {resultDate.toLocaleDateString('en-US', {
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
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${statusColors.dot} rounded-xl flex items-center justify-center animate-pulse shadow-lg`}>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {result.status?.charAt(0).toUpperCase() + result.status?.slice(1) || 'Pending'}
              </h2>
              <p className={`${statusColors.text} text-sm`}>
                Overall status based on all test values
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-white font-semibold">Result Date</p>
            <p className="text-slate-300 text-sm">
              {resultDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        {result.summary && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <p className="text-white leading-relaxed">{result.summary}</p>
          </div>
        )}
      </motion.div>

      {/* Navigation Tabs */}
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'values' | 'files' | 'history')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon.replace(/[^\w\s]/gi, '')}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Test Values Tab */}
        {activeTab === 'values' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Individual Test Values */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Test Values
              </h3>
              
              {result.test_values ? (
                <div className="space-y-4">
                  {Object.entries(result.test_values).map(([key, value]) => {
                    const normalRange = result.diagnostic_tests?.normal_ranges?.[key]
                    const valueStatus = typeof value === 'object' && value.value !== undefined && typeof value.value === 'number' && normalRange
                      ? getValueStatus(value.value, normalRange)
                      : 'unknown'
                    
                    const valueColors = getStatusColor(valueStatus)
                    
                    return (
                      <div key={key} className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-semibold capitalize">
                            {key.replace(/_/g, ' ')}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 ${valueColors.dot} rounded-full animate-pulse`}></div>
                            <span className={`text-sm font-medium ${valueColors.text}`}>
                              {valueStatus.charAt(0).toUpperCase() + valueStatus.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-slate-400 text-sm">Your Value</p>
                            <p className="text-white font-mono text-lg">
                              {typeof value === 'object' ? value.value : value}
                              {typeof value === 'object' && value.unit ? ` ${value.unit}` : ''}
                            </p>
                          </div>
                          
                          {normalRange && (
                            <div>
                              <p className="text-slate-400 text-sm">Normal Range</p>
                              <p className="text-slate-300 font-mono">
                                {normalRange.min} - {normalRange.max}
                                {normalRange.unit ? ` ${normalRange.unit}` : ''}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-slate-400 text-sm">Reference</p>
                            <p className="text-slate-300 text-sm">
                              {normalRange?.reference || 'Standard adult reference range'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Visual Range Indicator */}
                        {normalRange && typeof value === 'object' && value.value !== undefined && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-slate-400 mb-2">
                              <span>Low</span>
                              <span>Normal Range</span>
                              <span>High</span>
                            </div>
                            <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              {/* Normal range background */}
                              <div 
                                className="absolute h-full bg-emerald-400/30"
                                style={{
                                  left: '25%',
                                  width: '50%'
                                }}
                              />
                              {/* Value indicator */}
                              <div 
                                className={`absolute w-1 h-full ${valueColors.dot} rounded-full shadow-lg`}
                                style={{
                                  left: `${Math.min(Math.max(
                                    typeof value === 'object' && typeof value.value === 'number' && normalRange
                                      ? ((value.value - normalRange.min) / (normalRange.max - normalRange.min)) * 50 + 25
                                      : 50,
                                    2
                                  ), 98)}%`,
                                  transform: 'translateX(-50%)'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-slate-400">No detailed values available</p>
                </div>
              )}
            </div>

            {/* Clinical Interpretation */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Clinical Interpretation
              </h3>
              <div className="p-4 bg-slate-900/20 rounded-lg">
                <p className="text-slate-300 leading-relaxed">
                  {result.interpretation || 
                    'These results show your current health markers compared to standard reference ranges. Values outside the normal range may indicate areas that need attention or monitoring. Always consult with your healthcare provider for proper interpretation and next steps.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              Documents & Reports
            </h3>
            
            {result.result_files && result.result_files.length > 0 ? (
              <div className="space-y-4">
                {result.result_files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                        <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-medium">{file.file_name}</p>
                        <p className="text-slate-400 text-sm">
                          {file.file_type?.toUpperCase() || 'PDF'} Document
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300"
                      >
                        View
                      </a>
                      <a
                        href={file.file_url}
                        download={file.file_name}
                        className="px-4 py-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg hover:bg-slate-600/60 hover:text-white transition-all duration-300"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-sm"></div>
                  </div>
                </div>
                <p className="text-slate-400 mb-2">No documents available</p>
                <p className="text-slate-500 text-sm">
                  PDF reports and additional documents will appear here when available
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Appointment Information */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Collection Details
              </h3>
              {result.appointments ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Collection Date</p>
                      <p className="text-white font-medium">
                        {appointmentDate?.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Location</p>
                      <p className="text-white font-medium">
                        {result.appointments.locations?.name || 'Lab Location'}
                      </p>
                    </div>
                  </div>
                  
                  {result.appointments.orders && (
                    <div className="mt-4 p-4 bg-slate-900/20 rounded-lg">
                      <p className="text-slate-400 text-sm mb-2">Order Details</p>
                      <p className="text-white font-medium">
                        Order #{result.appointments.orders.id} • Total: ${result.appointments.orders.total?.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400">Collection information not available</p>
              )}
            </div>

            {/* Timeline */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Processing Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Sample Collected</p>
                    <p className="text-slate-400 text-sm">
                      {appointmentDate?.toLocaleDateString() || 'Collection date'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Laboratory Processing</p>
                    <p className="text-slate-400 text-sm">24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Results Available</p>
                    <p className="text-slate-400 text-sm">
                      {resultDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {result.reviewed_by && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <div>
                      <p className="text-white font-medium">Reviewed by Medical Team</p>
                      <p className="text-slate-400 text-sm">
                        Dr. {result.reviewed_by}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25">
          Download PDF Report
        </button>
        <button className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25">
          Share with Doctor
        </button>
        <Link
          href="/products"
          className="flex-1 px-6 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:text-white transition-all duration-300 text-center"
        >
          Order Follow-up Tests
        </Link>
      </div>
    </div>
  )
}
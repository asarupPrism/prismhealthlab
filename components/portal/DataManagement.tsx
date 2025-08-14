'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface DataManagementProps {
  userId: string
}

export default function DataManagement({ userId }: DataManagementProps) {
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const dataTypes = [
    { id: 'test_results', name: 'Test Results', description: 'All lab test results and reports' },
    { id: 'appointments', name: 'Appointments', description: 'Appointment history and schedules' },
    { id: 'orders', name: 'Orders', description: 'Order history and receipts' },
    { id: 'profile', name: 'Profile Data', description: 'Personal information and preferences' },
    { id: 'health_trends', name: 'Health Trends', description: 'Analyzed health data and trends' },
    { id: 'documents', name: 'Documents', description: 'Uploaded documents and files' }
  ]

  const handleSelectDataType = (typeId: string) => {
    setSelectedDataTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDataTypes.length === dataTypes.length) {
      setSelectedDataTypes([])
    } else {
      setSelectedDataTypes(dataTypes.map(t => t.id))
    }
  }

  const handleExportData = async () => {
    if (selectedDataTypes.length === 0) {
      setMessage('Please select at least one data type to export')
      return
    }

    setIsExporting(true)
    setMessage(null)

    try {
      // In production, this would trigger a data export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage('Data export initiated. You will receive an email with download links within 24 hours.')
      setSelectedDataTypes([])
    } catch (err) {
      setMessage('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteData = async (dataType: string) => {
    if (!confirm(`Are you sure you want to delete all ${dataType} data? This action cannot be undone.`)) {
      return
    }

    try {
      // In production, this would delete the specified data type
      setMessage(`${dataType} data deletion request submitted. This will be processed within 48 hours.`)
    } catch (err) {
      setMessage('Failed to process deletion request.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30"
    >
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Data Management</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {message && (
          <div className="p-4 bg-cyan-500/20 border border-cyan-400/30 rounded-xl text-cyan-300">
            {message}
          </div>
        )}

        {/* Data Export */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            Export Your Data
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-300 text-sm">Select data to export:</p>
              <button
                onClick={handleSelectAll}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              >
                {selectedDataTypes.length === dataTypes.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            {dataTypes.map(type => (
              <label
                key={type.id}
                className="flex items-center gap-3 p-4 bg-slate-900/30 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedDataTypes.includes(type.id)}
                  onChange={() => handleSelectDataType(type.id)}
                  className="w-4 h-4 text-cyan-400 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50"
                />
                <div className="flex-1">
                  <p className="text-white font-medium">{type.name}</p>
                  <p className="text-slate-400 text-sm">{type.description}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleExportData}
            disabled={isExporting || selectedDataTypes.length === 0}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Processing Export...' : 'Export Selected Data'}
          </button>
        </div>

        {/* Data Deletion */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
            Delete Specific Data
          </h3>
          
          <div className="p-4 bg-rose-500/10 border border-rose-400/30 rounded-xl mb-4">
            <p className="text-rose-300 text-sm">
              ⚠️ Warning: Deleting data is permanent and cannot be undone. Some data may be retained for legal compliance.
            </p>
          </div>

          <div className="space-y-3">
            {dataTypes.map(type => (
              <div
                key={type.id}
                className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl"
              >
                <div>
                  <p className="text-white font-medium">{type.name}</p>
                  <p className="text-slate-400 text-sm">{type.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteData(type.name)}
                  className="px-3 py-1.5 bg-rose-500/20 border border-rose-400/30 text-rose-300 font-medium rounded-lg hover:bg-rose-500/30 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Data Rights */}
        <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            Your Data Rights
          </h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">✓</span>
              <span>Access: Request a copy of all your personal data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">✓</span>
              <span>Portability: Export your data in standard formats</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">✓</span>
              <span>Deletion: Request removal of your personal data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">✓</span>
              <span>Correction: Update or correct inaccurate data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">✓</span>
              <span>Restriction: Limit how we process your data</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
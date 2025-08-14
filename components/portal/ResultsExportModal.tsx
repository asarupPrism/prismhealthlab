'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateSingleResultPDF, generateMultipleResultsPDF, downloadPDF, openPDFInNewTab } from '@/lib/pdf/generateResultsPDF'
import { TestResult } from '@/types/shared'

interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

interface ResultsExportModalProps {
  isOpen: boolean
  onClose: () => void
  results: TestResult[]
  profile: UserProfile
}

export default function ResultsExportModal({ isOpen, onClose, results, profile }: ResultsExportModalProps) {
  const [exportType, setExportType] = useState<'all' | 'selected'>('all')
  const [selectedResults, setSelectedResults] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf')
  const [exportAction, setExportAction] = useState<'download' | 'view'>('download')

  const handleSelectResult = (resultId: string) => {
    setSelectedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    )
  }

  const handleSelectAll = () => {
    if (selectedResults.length === results.length) {
      setSelectedResults([])
    } else {
      setSelectedResults(results.map(r => r.id))
    }
  }

  const handleExport = async () => {
    setIsGenerating(true)

    try {
      const resultsToExport = exportType === 'all' 
        ? results 
        : results.filter(r => selectedResults.includes(r.id))

      if (resultsToExport.length === 0) {
        alert('Please select at least one result to export')
        setIsGenerating(false)
        return
      }

      if (exportFormat === 'pdf') {
        // Generate PDF
        const doc = resultsToExport.length === 1 
          ? generateSingleResultPDF(resultsToExport[0], profile)
          : generateMultipleResultsPDF(resultsToExport, profile)

        const filename = resultsToExport.length === 1
          ? `prism-lab-result-${resultsToExport[0].id.slice(0, 8)}.pdf`
          : `prism-lab-results-${new Date().toISOString().split('T')[0]}.pdf`

        if (exportAction === 'download') {
          downloadPDF(doc, filename)
        } else {
          openPDFInNewTab(doc)
        }
      } else {
        // Generate CSV
        const csvContent = generateCSV(resultsToExport)
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prism-lab-results-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      onClose()
    } catch (error) {
      console.error('Export error:', error)
      alert('An error occurred while exporting results')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCSV = (resultsToExport: TestResult[]) => {
    const headers = ['Test Name', 'Result', 'Unit', 'Status', 'Reference Range', 'Test Date', 'Category']
    const rows = resultsToExport.map(result => [
      result.diagnostic_tests?.name || result.test_name || '',
      result.value || '',
      result.unit || '',
      result.status || '',
      result.reference_range || '',
      result.result_date ? new Date(result.result_date).toLocaleDateString() : '',
      result.diagnostic_tests?.category || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl max-h-[85vh] overflow-hidden backdrop-blur-sm bg-slate-800/95 border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-900/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                  <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white">Export Test Results</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
            {/* Export Options */}
            <div className="space-y-6">
              {/* Export Type */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Select Results
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setExportType('all')}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      exportType === 'all'
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                        : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-medium mb-1">Export All Results</div>
                    <div className="text-sm opacity-75">{results.length} results total</div>
                  </button>
                  <button
                    onClick={() => setExportType('selected')}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      exportType === 'selected'
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                        : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-medium mb-1">Select Specific Results</div>
                    <div className="text-sm opacity-75">{selectedResults.length} selected</div>
                  </button>
                </div>
              </div>

              {/* Results Selection */}
              {exportType === 'selected' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Choose Results to Export</h4>
                    <button
                      onClick={handleSelectAll}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      {selectedResults.length === results.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-900/30 rounded-xl">
                    {results.map(result => (
                      <label
                        key={result.id}
                        className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedResults.includes(result.id)}
                          onChange={() => handleSelectResult(result.id)}
                          className="w-4 h-4 text-cyan-400 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {result.diagnostic_tests?.name || result.test_name || 'Test Result'}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {result.result_date ? new Date(result.result_date).toLocaleDateString() : 'Date not available'}
                            {result.status && ` • ${result.status}`}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Format */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Export Format
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      exportFormat === 'pdf'
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                        : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-medium mb-1">PDF Document</div>
                    <div className="text-sm opacity-75">Professional report format</div>
                  </button>
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      exportFormat === 'csv'
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                        : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-medium mb-1">CSV Spreadsheet</div>
                    <div className="text-sm opacity-75">For data analysis</div>
                  </button>
                </div>
              </div>

              {/* Export Action (PDF only) */}
              {exportFormat === 'pdf' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Export Action
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setExportAction('download')}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        exportAction === 'download'
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                          : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="font-medium mb-1">Download File</div>
                      <div className="text-sm opacity-75">Save to your device</div>
                    </button>
                    <button
                      onClick={() => setExportAction('view')}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        exportAction === 'view'
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                          : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="font-medium mb-1">View in Browser</div>
                      <div className="text-sm opacity-75">Open in new tab</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/50">
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isGenerating || (exportType === 'selected' && selectedResults.length === 0)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : `Export ${exportFormat.toUpperCase()}`}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
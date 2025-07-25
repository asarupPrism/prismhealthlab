'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterState {
  status: string
  dateFrom: string
  dateTo: string
  testCategory: string
  page: number
  limit: number
}

interface PurchaseFiltersProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  statusCounts: Record<string, number>
  className?: string
}

const statusOptions = [
  { value: '', label: 'All Orders', color: 'slate' },
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'emerald' },
  { value: 'cancelled', label: 'Cancelled', color: 'rose' },
  { value: 'delivered', label: 'Delivered', color: 'emerald' }
] as const

const testCategories = [
  { value: '', label: 'All Tests' },
  { value: 'general_health', label: 'General Health' },
  { value: 'cardiovascular', label: 'Cardiovascular' },
  { value: 'metabolic', label: 'Metabolic' },
  { value: 'hormonal', label: 'Hormonal' },
  { value: 'nutritional', label: 'Nutritional' },
  { value: 'immune', label: 'Immune System' },
  { value: 'specialty', label: 'Specialty Tests' }
] as const

const limitOptions = [
  { value: 5, label: '5 per page' },
  { value: 10, label: '10 per page' },
  { value: 20, label: '20 per page' },
  { value: 50, label: '50 per page' }
] as const

export default function PurchaseFilters({
  filters,
  onFilterChange,
  statusCounts,
  className = ''
}: PurchaseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [dateRange, setDateRange] = useState<'all' | 'last30' | 'last90' | 'custom'>('all')

  // Calculate active filter count
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => 
    key !== 'page' && key !== 'limit' && value
  ).length

  // Handle quick date range selection
  const handleDateRangeChange = (range: typeof dateRange) => {
    setDateRange(range)
    
    const now = new Date()
    let dateFrom = ''
    let dateTo = ''
    
    switch (range) {
      case 'last30':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'last90':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'custom':
        // Don't change dates, let user select
        return
      case 'all':
      default:
        dateFrom = ''
        dateTo = ''
        break
    }
    
    onFilterChange({ dateFrom, dateTo })
  }

  // Handle custom date changes
  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    setDateRange('custom')
    onFilterChange({ [field]: value })
  }

  // Clear all filters
  const handleClearFilters = () => {
    setDateRange('all')
    onFilterChange({
      status: '',
      dateFrom: '',
      dateTo: '',
      testCategory: ''
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Toggle Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 px-4 py-2 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:border-slate-600/50 transition-colors"
        >
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{activeFilterCount}</span>
            </div>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ↓
          </motion.div>
        </button>

        {/* Quick Status Tabs */}
        <div className="flex items-center gap-2">
          {statusOptions.slice(0, 4).map((status) => {
            const count = status.value ? statusCounts[status.value] || 0 : Object.values(statusCounts).reduce((a, b) => a + b, 0)
            const isActive = filters.status === status.value
            
            return (
              <button
                key={status.value}
                onClick={() => onFilterChange({ status: status.value })}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? `bg-${status.color}-600/20 border border-${status.color}-700/50 text-${status.color}-300`
                    : 'bg-slate-800/30 border border-slate-700/30 text-slate-400 hover:text-slate-300 hover:border-slate-600/50'
                }`}
              >
                {status.label}
                {count > 0 && (
                  <span className={`ml-1 text-xs ${
                    isActive ? `text-${status.color}-400` : 'text-slate-500'
                  }`}>
                    ({count})
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Order Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange({ status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 text-white rounded-lg focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                      {option.value && statusCounts[option.value] ? ` (${statusCounts[option.value]})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Test Category
                </label>
                <select
                  value={filters.testCategory}
                  onChange={(e) => onFilterChange({ testCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 text-white rounded-lg focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
                >
                  {testCategories.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Per Page */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Results Per Page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => onFilterChange({ limit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 text-white rounded-lg focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
                >
                  {limitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range Section */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Date Range
              </label>
              
              {/* Quick Date Range Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'last30', label: 'Last 30 Days' },
                  { value: 'last90', label: 'Last 90 Days' },
                  { value: 'custom', label: 'Custom Range' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDateRangeChange(option.value as typeof dateRange)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      dateRange === option.value
                        ? 'bg-cyan-600/20 border border-cyan-700/50 text-cyan-300'
                        : 'bg-slate-800/30 border border-slate-700/30 text-slate-400 hover:text-slate-300 hover:border-slate-600/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Inputs */}
              <AnimatePresence>
                {dateRange === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">From Date</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 text-white rounded-lg focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">To Date</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleDateChange('dateTo', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 text-white rounded-lg focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Actions */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                {activeFilterCount > 0 ? (
                  `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied`
                ) : (
                  'No filters applied'
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearFilters}
                  disabled={activeFilterCount === 0}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
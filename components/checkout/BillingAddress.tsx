'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface AddressInfo {
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

interface BillingAddressProps {
  data: AddressInfo
  errors: Record<string, string>
  touchedFields: Set<string>
  onChange: (field: keyof AddressInfo, value: string) => void
  onFieldTouch: (fieldName: string) => void
  isExpanded: boolean
  onToggle: () => void
  onEdit?: () => void
  isComplete?: boolean
}

export default function BillingAddress({
  data,
  errors,
  touchedFields,
  onChange,
  onFieldTouch,
  isExpanded,
  onToggle,
  onEdit,
  isComplete = false
}: BillingAddressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30"
    >
      {/* Section Header */}
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={isComplete ? undefined : onToggle}
      >
        <div className="flex items-center gap-3 border-l-2 border-blue-500/30 pl-4">
          <div className={`w-3 h-3 ${isComplete ? 'bg-emerald-400' : 'bg-blue-400'} rounded-full ${!isComplete ? 'animate-pulse' : ''}`}></div>
          <h3 className="text-lg font-semibold text-white">Billing Address</h3>
        </div>
        <div className="flex items-center gap-3">
          {isComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-medium text-emerald-300 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              Complete
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-medium text-blue-300 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Incomplete
            </motion.div>
          )}
          
          {/* Edit Button for Completed Sections */}
          {isComplete && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="px-3 py-1.5 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300"
            >
              Edit
            </button>
          )}
          
          {!isComplete && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-6 h-6 bg-blue-400/20 border border-blue-400/30 rounded-lg flex items-center justify-center group-hover:bg-blue-400/30 transition-colors"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-blue-400"></div>
                <div className="w-0.5 h-2 bg-blue-400 absolute"></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="space-y-6 pt-6">
        {/* Street Address */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Street Address <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={data.address1}
            onChange={(e) => onChange('address1', e.target.value)}
            onBlur={() => onFieldTouch('address1')}
            className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
              errors.address1 && touchedFields.has('address1')
                ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
            }`}
            placeholder="123 Main Street"
          />
          {errors.address1 && touchedFields.has('address1') && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-rose-400 flex items-center gap-2"
            >
              <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
              </div>
              {errors.address1}
            </motion.div>
          )}
        </div>

        {/* Apartment/Suite (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Apartment, Suite, etc. <span className="text-slate-500 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.address2}
            onChange={(e) => onChange('address2', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60 transition-all duration-300 backdrop-blur-sm"
            placeholder="Apt 4B, Suite 200, etc."
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              City <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange('city', e.target.value)}
              onBlur={() => onFieldTouch('city')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                errors.city && touchedFields.has('city')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
              placeholder="Chicago"
            />
            {errors.city && touchedFields.has('city') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.city}
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              State <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => onChange('state', e.target.value)}
              onBlur={() => onFieldTouch('state')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                errors.state && touchedFields.has('state')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
              placeholder="IL"
              maxLength={2}
            />
            {errors.state && touchedFields.has('state') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.state}
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              ZIP Code <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={data.zip}
              onChange={(e) => onChange('zip', e.target.value)}
              onBlur={() => onFieldTouch('zip')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm font-mono ${
                errors.zip && touchedFields.has('zip')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
              placeholder="60601"
              maxLength={10}
            />
            {errors.zip && touchedFields.has('zip') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.zip}
              </motion.div>
            )}
          </div>
        </div>

        {/* Country Field (Hidden but maintained for compatibility) */}
        <input
          type="hidden"
          value={data.country}
          onChange={(e) => onChange('country', e.target.value)}
        />
        </div>
      </motion.div>
    </motion.div>
  )
}
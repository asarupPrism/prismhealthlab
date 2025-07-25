'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface BillingPersonalInfoProps {
  data: PersonalInfo
  errors: Record<string, string>
  touchedFields: Set<string>
  onChange: (field: keyof PersonalInfo, value: string) => void
  onFieldTouch: (fieldName: string) => void
  isExpanded: boolean
  onToggle: () => void
  onEdit?: () => void
  isComplete?: boolean
}

export default function BillingPersonalInfo({
  data,
  errors,
  touchedFields,
  onChange,
  onFieldTouch,
  isExpanded,
  onToggle,
  onEdit,
  isComplete = false
}: BillingPersonalInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30"
    >
      {/* Section Header */}
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={isComplete ? undefined : onToggle}
      >
        <div className="flex items-center gap-3 border-l-2 border-cyan-500/30 pl-4">
          <div className={`w-3 h-3 ${isComplete ? 'bg-emerald-400' : 'bg-cyan-400'} rounded-full ${!isComplete ? 'animate-pulse' : ''}`}></div>
          <h3 className="text-lg font-semibold text-white">Personal Information</h3>
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
              className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-xs font-medium text-cyan-300 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
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
              className="w-6 h-6 bg-cyan-400/20 border border-cyan-400/30 rounded-lg flex items-center justify-center group-hover:bg-cyan-400/30 transition-colors"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-cyan-400"></div>
                <div className="w-0.5 h-2 bg-cyan-400 absolute"></div>
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
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              First Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              onBlur={() => onFieldTouch('firstName')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                errors.firstName && touchedFields.has('firstName')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && touchedFields.has('firstName') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.firstName}
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Last Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              onBlur={() => onFieldTouch('lastName')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                errors.lastName && touchedFields.has('lastName')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && touchedFields.has('lastName') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.lastName}
              </motion.div>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              onBlur={() => onFieldTouch('email')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                errors.email && touchedFields.has('email')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && touchedFields.has('email') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.email}
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Phone Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              onBlur={() => onFieldTouch('phone')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                errors.phone && touchedFields.has('phone')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && touchedFields.has('phone') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.phone}
              </motion.div>
            )}
          </div>
        </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
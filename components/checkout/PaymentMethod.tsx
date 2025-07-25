'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PaymentInfo {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  nameOnCard: string
  agreeToTerms: boolean
}

interface PaymentMethodProps {
  data: PaymentInfo
  errors: Record<string, string>
  touchedFields: Set<string>
  onChange: (field: keyof PaymentInfo, value: string | boolean) => void
  onFieldTouch: (fieldName: string) => void
  formatCardNumber: (value: string) => string
  isExpanded: boolean
  onToggle: () => void
  onEdit?: () => void
  isComplete?: boolean
}

export default function PaymentMethod({
  data,
  errors,
  touchedFields,
  onChange,
  onFieldTouch,
  formatCardNumber,
  isExpanded,
  onToggle,
  onEdit,
  isComplete = false
}: PaymentMethodProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30"
    >
      {/* Section Header */}
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={isComplete ? undefined : onToggle}
      >
        <div className="flex items-center gap-3 border-l-2 border-emerald-500/30 pl-4">
          <div className={`w-3 h-3 ${isComplete ? 'bg-emerald-400' : 'bg-amber-400'} rounded-full ${!isComplete ? 'animate-pulse' : ''}`}></div>
          <h3 className="text-lg font-semibold text-white">Payment Method</h3>
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
              className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-xs font-medium text-amber-300 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
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
              className={`w-6 h-6 ${isComplete ? 'bg-emerald-400/20 border-emerald-400/30 group-hover:bg-emerald-400/30' : 'bg-amber-400/20 border-amber-400/30 group-hover:bg-amber-400/30'} border rounded-lg flex items-center justify-center transition-colors`}
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <div className={`w-2 h-0.5 ${isComplete ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                <div className={`w-0.5 h-2 ${isComplete ? 'bg-emerald-400' : 'bg-amber-400'} absolute`}></div>
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
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Card Number <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={data.cardNumber}
            onChange={(e) => onChange('cardNumber', formatCardNumber(e.target.value))}
            onBlur={() => onFieldTouch('cardNumber')}
            maxLength={19}
            className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm font-mono ${
              errors.cardNumber && touchedFields.has('cardNumber')
                ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
            }`}
            placeholder="1234 5678 9012 3456"
          />
          {errors.cardNumber && touchedFields.has('cardNumber') && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-rose-400 flex items-center gap-2"
            >
              <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
              </div>
              {errors.cardNumber}
            </motion.div>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Month <span className="text-rose-400">*</span>
            </label>
            <select
              value={data.expiryMonth}
              onChange={(e) => onChange('expiryMonth', e.target.value)}
              onBlur={() => onFieldTouch('expiryMonth')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                errors.expiryMonth && touchedFields.has('expiryMonth')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month.toString().padStart(2, '0')}>
                  {month.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            {errors.expiryMonth && touchedFields.has('expiryMonth') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.expiryMonth}
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Year <span className="text-rose-400">*</span>
            </label>
            <select
              value={data.expiryYear}
              onChange={(e) => onChange('expiryYear', e.target.value)}
              onBlur={() => onFieldTouch('expiryYear')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                errors.expiryYear && touchedFields.has('expiryYear')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
            >
              <option value="">YYYY</option>
              {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.expiryYear && touchedFields.has('expiryYear') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.expiryYear}
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              CVV <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={data.cvv}
              onChange={(e) => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              onBlur={() => onFieldTouch('cvv')}
              className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm font-mono ${
                errors.cvv && touchedFields.has('cvv')
                  ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                  : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
              }`}
              placeholder="123"
              maxLength={4}
            />
            {errors.cvv && touchedFields.has('cvv') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-rose-400 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                </div>
                {errors.cvv}
              </motion.div>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Cardholder Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={data.nameOnCard}
            onChange={(e) => onChange('nameOnCard', e.target.value)}
            onBlur={() => onFieldTouch('nameOnCard')}
            className={`w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
              errors.nameOnCard && touchedFields.has('nameOnCard')
                ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                : 'border-slate-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50 hover:border-slate-500/60'
            }`}
            placeholder="Name as it appears on card"
          />
          {errors.nameOnCard && touchedFields.has('nameOnCard') && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-rose-400 flex items-center gap-2"
            >
              <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
              </div>
              {errors.nameOnCard}
            </motion.div>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.agreeToTerms}
              onChange={(e) => onChange('agreeToTerms', e.target.checked)}
              onBlur={() => onFieldTouch('agreeToTerms')}
              className="mt-1 w-4 h-4 bg-slate-900/50 border border-slate-600/50 rounded focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-0 text-cyan-400"
            />
            <span className="text-sm text-slate-300 leading-relaxed">
              I agree to the{' '}
              <a href="/terms" className="text-cyan-400 hover:text-cyan-300 underline transition-colors">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline transition-colors">
                Privacy Policy
              </a>
              <span className="text-rose-400 ml-1">*</span>
            </span>
          </label>
          {errors.agreeToTerms && touchedFields.has('agreeToTerms') && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-rose-400 flex items-center gap-2"
            >
              <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
              </div>
              {errors.agreeToTerms}
            </motion.div>
          )}
        </div>

        {/* Security Notice */}
        <div className="backdrop-blur-sm bg-slate-900/40 border border-slate-700/40 rounded-xl p-4 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-white">Secure Payment</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
          </p>
        </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
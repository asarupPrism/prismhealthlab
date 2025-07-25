'use client'

import React, { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MedicalFormFieldProps {
  label: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'date' | 'select' | 'textarea'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  success?: string
  hint?: string
  options?: { value: string; label: string }[]
  className?: string
  inputClassName?: string
  rows?: number // for textarea
  autoComplete?: string
  pattern?: string
  maxLength?: number
  icon?: React.ReactNode
}

const MedicalFormField = forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, MedicalFormFieldProps>(
  ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    error,
    success,
    hint,
    options,
    className = '',
    inputClassName = '',
    rows = 3,
    autoComplete,
    pattern,
    maxLength,
    icon
  }, ref) => {
    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)

    // Style configurations
    const baseInputStyles = "w-full px-4 py-3 bg-slate-900/50 border text-white placeholder-slate-400 rounded-xl transition-all duration-300 backdrop-blur-sm font-inherit"
    
    const getInputStyles = () => {
      if (hasError) {
        return `${baseInputStyles} border-rose-500/50 focus:ring-2 focus:ring-rose-400 focus:border-rose-400`
      }
      if (hasSuccess) {
        return `${baseInputStyles} border-emerald-500/50 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400`
      }
      return `${baseInputStyles} border-slate-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 hover:border-slate-500/60`
    }

    const renderInput = () => {
      const inputProps = {
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => onChange(e.target.value),
        placeholder,
        required,
        disabled,
        autoComplete,
        pattern,
        maxLength,
        className: `${getInputStyles()} ${inputClassName}`,
        'aria-invalid': hasError,
        'aria-describedby': error ? `${label}-error` : success ? `${label}-success` : hint ? `${label}-hint` : undefined,
      }

      if (type === 'select' && options) {
        return (
          <select {...inputProps} ref={ref as React.Ref<HTMLSelectElement>}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      }

      if (type === 'textarea') {
        return (
          <textarea
            {...inputProps}
            rows={rows}
            ref={ref as React.Ref<HTMLTextAreaElement>}
          />
        )
      }

      return (
        <input
          {...inputProps}
          type={type}
          ref={ref as React.Ref<HTMLInputElement>}
        />
      )
    }

    return (
      <div className={`space-y-3 ${className}`}>
        {/* Label */}
        <label className="block text-sm font-medium text-slate-300">
          <span className="flex items-center gap-2">
            {icon && (
              <span className="text-slate-400">
                {icon}
              </span>
            )}
            {label}
            {required && (
              <span className="text-rose-400 text-xs">*</span>
            )}
          </span>
        </label>

        {/* Input Field */}
        <div className="relative">
          {renderInput()}
          
          {/* Status Indicator */}
          <AnimatePresence>
            {(hasError || hasSuccess) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {hasError && (
                  <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
                {hasSuccess && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Helper Text */}
        <AnimatePresence>
          {(error || success || hint) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {error && (
                <div id={`${label}-error`} className="flex items-center gap-2 text-rose-400 text-xs">
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/30 rounded flex items-center justify-center">
                    <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                  </div>
                  {error}
                </div>
              )}
              {success && !error && (
                <div id={`${label}-success`} className="flex items-center gap-2 text-emerald-400 text-xs">
                  <div className="w-3 h-3 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  </div>
                  {success}
                </div>
              )}
              {hint && !error && !success && (
                <div id={`${label}-hint`} className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-3 h-3 bg-slate-400/20 border border-slate-400/30 rounded flex items-center justify-center">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  </div>
                  {hint}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

MedicalFormField.displayName = 'MedicalFormField'

export default MedicalFormField
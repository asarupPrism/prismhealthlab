'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface PaymentInfo {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  nameOnCard: string
  agreeToTerms: boolean
}

interface PaymentFormProps {
  onData?: (data: PaymentInfo) => void
  initialData?: Partial<PaymentInfo>
  className?: string
}

export default function PaymentForm({
  onData,
  initialData,
  className = ''
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentInfo>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
    agreeToTerms: false,
    ...initialData
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case 'cardNumber':
        if (!value) return 'Card number is required'
        const cleanCard = String(value).replace(/\s+/g, '')
        if (!/^\d{13,19}$/.test(cleanCard)) return 'Please enter a valid card number'
        return ''
      case 'nameOnCard':
        return !String(value).trim() ? 'Name on card is required' : ''
      case 'expiryMonth':
        if (!value) return 'Expiry month is required'
        const month = parseInt(String(value))
        if (month < 1 || month > 12) return 'Invalid month'
        return ''
      case 'expiryYear':
        if (!value) return 'Expiry year is required'
        const year = parseInt(String(value))
        const currentYear = new Date().getFullYear()
        if (year < currentYear) return 'Card has expired'
        return ''
      case 'cvv':
        if (!value) return 'CVV is required'
        if (!/^\d{3,4}$/.test(String(value))) return 'Please enter a valid CVV'
        return ''
      case 'agreeToTerms':
        return !value ? 'You must agree to the terms and conditions' : ''
      default:
        return ''
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof PaymentInfo])
      if (error) newErrors[key] = error
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatCardNumber = (value: string): string => {
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '')
    
    // Add spaces every 4 digits
    const formatted = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ')
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    let processedValue: string | boolean = value
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked
    } else if (name === 'cardNumber') {
      processedValue = formatCardNumber(value)
    } else if (name === 'cvv') {
      // Only allow digits for CVV
      processedValue = value.replace(/\D/g, '').substring(0, 4)
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    const error = validateField(name, fieldValue)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  // Validate and notify parent when form data changes
  useEffect(() => {
    const isValid = validateForm()
    if (isValid) {
      onData?.(formData)
    }
  }, [formData, onData])

  // Generate year options
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 15 }, (_, i) => currentYear + i)

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
        <div className="space-y-6">
          
          {/* Card Number */}
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-300 mb-3">
              Card Number *
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 font-mono ${
                errors.cardNumber && touched.cardNumber
                  ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
              }`}
            />
            {errors.cardNumber && touched.cardNumber && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm mt-2 flex items-center gap-2"
              >
                <span className="text-xs">✗</span>
                {errors.cardNumber}
              </motion.p>
            )}
          </div>

          {/* Name on Card */}
          <div>
            <label htmlFor="nameOnCard" className="block text-sm font-medium text-slate-300 mb-3">
              Name on Card *
            </label>
            <input
              type="text"
              id="nameOnCard"
              name="nameOnCard"
              value={formData.nameOnCard}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                errors.nameOnCard && touched.nameOnCard
                  ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
              }`}
            />
            {errors.nameOnCard && touched.nameOnCard && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm mt-2 flex items-center gap-2"
              >
                <span className="text-xs">✗</span>
                {errors.nameOnCard}
              </motion.p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="expiryMonth" className="block text-sm font-medium text-slate-300 mb-3">
                Month *
              </label>
              <select
                id="expiryMonth"
                name="expiryMonth"
                value={formData.expiryMonth}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.expiryMonth && touched.expiryMonth
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
              {errors.expiryMonth && touched.expiryMonth && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span className="text-xs">✗</span>
                  {errors.expiryMonth}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="expiryYear" className="block text-sm font-medium text-slate-300 mb-3">
                Year *
              </label>
              <select
                id="expiryYear"
                name="expiryYear"
                value={formData.expiryYear}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.expiryYear && touched.expiryYear
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
              >
                <option value="">YYYY</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.expiryYear && touched.expiryYear && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span className="text-xs">✗</span>
                  {errors.expiryYear}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-slate-300 mb-3">
                CVV *
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="123"
                maxLength={4}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 font-mono ${
                  errors.cvv && touched.cvv
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
              />
              {errors.cvv && touched.cvv && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span className="text-xs">✗</span>
                  {errors.cvv}
                </motion.p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-t border-slate-700/50 pt-6 mt-8">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 w-4 h-4 text-cyan-400 bg-slate-900/50 border-slate-600/50 rounded focus:ring-cyan-400 focus:ring-2 ${
                  errors.agreeToTerms && touched.agreeToTerms ? 'border-rose-500/50' : ''
                }`}
              />
              <label htmlFor="agreeToTerms" className="text-sm text-slate-300 leading-relaxed">
                I agree to the{' '}
                <button 
                  type="button" 
                  className="text-cyan-400 hover:text-cyan-300 underline focus:outline-none"
                  onClick={() => window.open('/terms', '_blank')}
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button 
                  type="button" 
                  className="text-cyan-400 hover:text-cyan-300 underline focus:outline-none"
                  onClick={() => window.open('/privacy', '_blank')}
                >
                  Privacy Policy
                </button>. I authorize the processing of my payment information and understand that all transactions are secure and encrypted.
              </label>
            </div>
            {errors.agreeToTerms && touched.agreeToTerms && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm mt-2 ml-7 flex items-center gap-2"
              >
                <span className="text-xs">✗</span>
                {errors.agreeToTerms}
              </motion.p>
            )}
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-slate-900/30 border border-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-emerald-400 rounded-lg"></div>
                </div>
                <h4 className="text-sm font-semibold text-white">Secure Processing</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your payment is processed using industry-standard 256-bit SSL encryption for maximum security.
              </p>
            </div>

            <div className="p-4 bg-slate-900/30 border border-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-400/30 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-cyan-400 rounded-lg"></div>
                </div>
                <h4 className="text-sm font-semibold text-white">PCI Compliant</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our payment processing meets all PCI DSS requirements for handling credit card information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { PaymentInfo }
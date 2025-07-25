'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface BillingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

interface BillingFormProps {
  onData?: (data: BillingInfo) => void
  initialData?: Partial<BillingInfo>
  className?: string
}

export default function BillingForm({
  onData,
  initialData,
  className = ''
}: BillingFormProps) {
  const [formData, setFormData] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    ...initialData
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        return !value.trim() ? 'First name is required' : ''
      case 'lastName':
        return !value.trim() ? 'Last name is required' : ''
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email'
        return ''
      case 'address1':
        return !value.trim() ? 'Street address is required' : ''
      case 'city':
        return !value.trim() ? 'City is required' : ''
      case 'state':
        return !value.trim() ? 'State is required' : ''
      case 'zip':
        if (!value.trim()) return 'ZIP code is required'
        if (!/^\d{5}(-\d{4})?$/.test(value)) return 'Please enter a valid ZIP code'
        return ''
      default:
        return ''
    }
  }

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof BillingInfo])
      if (error) newErrors[key] = error
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  // Validate and notify parent when form data changes
  useEffect(() => {
    const isValid = validateForm()
    if (isValid) {
      onData?.(formData)
    }
  }, [formData, onData, validateForm])

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-slate-900/50">
        <div className="space-y-6">
          
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-3">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="John"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.firstName && touched.firstName
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
              />
              {errors.firstName && touched.firstName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.firstName}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-3">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Doe"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.lastName && touched.lastName
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
              />
              {errors.lastName && touched.lastName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.lastName}
                </motion.p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-3">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="patient@example.com"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.email && touched.email
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
              />
              {errors.email && touched.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-3">
                Phone Number <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address1" className="block text-sm font-medium text-slate-300 mb-3">
              Street Address *
            </label>
            <input
              type="text"
              id="address1"
              name="address1"
              value={formData.address1}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="123 Main Street"
              className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 mb-3 ${
                errors.address1 && touched.address1
                  ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
              }`}
            />
            {errors.address1 && touched.address1 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm mb-3 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                </div>
                {errors.address1}
              </motion.p>
            )}
            
            <input
              type="text"
              id="address2"
              name="address2"
              value={formData.address2}
              onChange={handleInputChange}
              placeholder="Apartment, suite, etc. (optional)"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-3">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="San Francisco"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.city && touched.city
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
              />
              {errors.city && touched.city && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.city}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-3">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="CA"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.state && touched.state
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
              />
              {errors.state && touched.state && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.state}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-slate-300 mb-3">
                ZIP Code *
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="94102"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.zip && touched.zip
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
              />
              {errors.zip && touched.zip && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.zip}
                </motion.p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-slate-300 mb-3">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="MX">Mexico</option>
            </select>
          </div>

          {/* Security Notice */}
          <div className="mt-8 backdrop-blur-sm bg-slate-900/40 border border-slate-700/40 rounded-xl p-4 shadow-lg shadow-slate-900/30">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  Secure Information Processing
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your billing information is encrypted and processed securely. This information will be used for payment processing and order fulfillment only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { BillingInfo }